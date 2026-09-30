import ExpoModulesCore
import FamilyControls
import ManagedSettings
import ManagedSettingsUI
import SwiftUI
import UIKit
import notify

struct ConfigureOptions: Record {
    @Field var lumiName: String = "Lampi"
    @Field var limitMinutes: Int = 60
    @Field var nightStart: String = "23:00"
    @Field var nightEnd: String = "07:00"
    @Field var strictShield: Bool = false
}

public class LampiScreenTimeModule: Module {
    private var notifyToken: Int32 = NOTIFY_TOKEN_INVALID

    public func definition() -> ModuleDefinition {
        Name("LampiScreenTime")

        Events("onThreshold")

        OnCreate {
            // La extensión monitor avisa por aquí cuando cruza un umbral y la app está abierta.
            notify_register_dispatch(LampiShared.thresholdNotification, &self.notifyToken, DispatchQueue.main) { [weak self] _ in
                self?.sendEvent("onThreshold", ["threshold": LampiShared.threshold])
            }
        }

        OnDestroy {
            if self.notifyToken != NOTIFY_TOKEN_INVALID { notify_cancel(self.notifyToken) }
        }

        Function("authorizationStatus") { () -> String in
            Self.statusName(AuthorizationCenter.shared.authorizationStatus)
        }

        // Autorización individual (no es control parental): el usuario elige sus propias apps.
        AsyncFunction("requestAuthorization") { () async -> String in
            do {
                try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
            } catch {
                // Denegado o cancelado: el estado lo dice.
            }
            return Self.statusName(AuthorizationCenter.shared.authorizationStatus)
        }

        // Abre el FamilyActivityPicker de Apple. Devuelve el resumen, o nil si se cancela.
        AsyncFunction("pickApps") { (title: String, done: String, cancel: String, promise: Promise) in
            DispatchQueue.main.async {
                guard let presenter = self.appContext?.utilities?.currentViewController() else {
                    promise.reject("ERR_NO_VIEW_CONTROLLER", "No hay pantalla desde la que abrir el selector")
                    return
                }
                var host: UIHostingController<PickerScreen>?
                let screen = PickerScreen(
                    initial: LampiShared.loadSelection(),
                    title: title,
                    doneLabel: done,
                    cancelLabel: cancel,
                    onFinish: { selection in
                        host?.dismiss(animated: true) {
                            if let selection {
                                LampiShared.saveSelection(selection)
                                promise.resolve(Self.summary(selection))
                            } else {
                                promise.resolve(nil)
                            }
                        }
                    }
                )
                let controller = UIHostingController(rootView: screen)
                controller.modalPresentationStyle = .fullScreen
                host = controller
                presenter.present(controller, animated: true)
            }
        }

        Function("getSelectionSummary") { () -> [String: Int] in
            Self.summary(LampiShared.loadSelection())
        }

        // Guarda los ajustes en el App Group y reprograma el monitor y el horario de noche.
        AsyncFunction("configure") { (options: ConfigureOptions) in
            LampiShared.saveSettings(
                lumiName: options.lumiName,
                limitMinutes: options.limitMinutes,
                nightStart: options.nightStart,
                nightEnd: options.nightEnd,
                strictShield: options.strictShield
            )
            do {
                try LampiShared.scheduleMonitoring()
            } catch {
                throw Exception(name: "ERR_SCHEDULE", description: error.localizedDescription)
            }
        }

        Function("getThreshold") { () -> Int in
            LampiShared.threshold
        }

        Function("getSnoozesToday") { () -> Int in
            LampiShared.snoozesToday
        }

        Function("stop") {
            LampiShared.stopEverything()
        }

        // Las apps elegidas, con su nombre e icono reales (los tokens son opacos: solo Apple los dibuja).
        View(SelectedAppsView.self) {
            Prop("revision") { (view: SelectedAppsView, _: Int) in
                view.reload()
            }
        }
    }

    private static func statusName(_ status: AuthorizationStatus) -> String {
        switch status {
        case .approved: return "approved"
        case .denied: return "denied"
        default: return "notDetermined"
        }
    }

    private static func summary(_ s: FamilyActivitySelection) -> [String: Int] {
        ["apps": s.applicationTokens.count, "categories": s.categoryTokens.count, "webDomains": s.webDomainTokens.count]
    }
}

struct PickerScreen: View {
    @State var selection: FamilyActivitySelection
    let title: String
    let doneLabel: String
    let cancelLabel: String
    let onFinish: (FamilyActivitySelection?) -> Void

    init(
        initial: FamilyActivitySelection, title: String, doneLabel: String, cancelLabel: String,
        onFinish: @escaping (FamilyActivitySelection?) -> Void
    ) {
        _selection = State(initialValue: initial)
        self.title = title
        self.doneLabel = doneLabel
        self.cancelLabel = cancelLabel
        self.onFinish = onFinish
    }

    var body: some View {
        NavigationView {
            FamilyActivityPicker(selection: $selection)
                .navigationTitle(title)
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button(cancelLabel) { onFinish(nil) }
                    }
                    ToolbarItem(placement: .confirmationAction) {
                        Button(doneLabel) { onFinish(selection) }.bold()
                    }
                }
        }
        .navigationViewStyle(.stack)
    }
}

final class SelectionModel: ObservableObject {
    @Published var selection = LampiShared.loadSelection()
    func reload() { selection = LampiShared.loadSelection() }
}

struct SelectedAppsList: View {
    @ObservedObject var model: SelectionModel

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            ForEach(Array(model.selection.applicationTokens), id: \.self) { token in
                row { Label(token) }
            }
            ForEach(Array(model.selection.categoryTokens), id: \.self) { token in
                row { Label(token) }
            }
            ForEach(Array(model.selection.webDomainTokens), id: \.self) { token in
                row { Label(token) }
            }
            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .environment(\.colorScheme, .dark)
    }

    private func row<Content: View>(@ViewBuilder _ content: () -> Content) -> some View {
        content()
            .labelStyle(.titleAndIcon)
            .font(.body)
            .frame(height: 44, alignment: .leading)
    }
}

final class SelectedAppsView: ExpoView {
    private let model = SelectionModel()
    private lazy var host: UIHostingController<SelectedAppsList> = {
        let controller = UIHostingController(rootView: SelectedAppsList(model: model))
        controller.view.backgroundColor = .clear
        return controller
    }()

    required init(appContext: AppContext? = nil) {
        super.init(appContext: appContext)
        clipsToBounds = true
        addSubview(host.view)
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        host.view.frame = bounds
    }

    func reload() { model.reload() }
}
