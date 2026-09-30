import Foundation
import DeviceActivity
import FamilyControls
import ManagedSettings

/// Los dos botones del escudo. «Vale, lo dejo» cierra la app; «5 min más» quita el
/// escudo de esa app hasta que se gasten 5 minutos de uso (`LampiShared.grantSnooze`).
class ShieldActionExtension: ShieldActionDelegate {
    override func handle(action: ShieldAction, for application: ApplicationToken, completionHandler: @escaping (ShieldActionResponse) -> Void) {
        respond(action, kind: "app", token: try? JSONEncoder().encode(application), apps: [application], completionHandler)
    }

    override func handle(action: ShieldAction, for webDomain: WebDomainToken, completionHandler: @escaping (ShieldActionResponse) -> Void) {
        respond(action, kind: "web", token: try? JSONEncoder().encode(webDomain), webs: [webDomain], completionHandler)
    }

    override func handle(action: ShieldAction, for category: ActivityCategoryToken, completionHandler: @escaping (ShieldActionResponse) -> Void) {
        respond(action, kind: "category", token: try? JSONEncoder().encode(category), categories: [category], completionHandler)
    }

    private func respond(
        _ action: ShieldAction,
        kind: String,
        token: Data?,
        apps: Set<ApplicationToken> = [],
        categories: Set<ActivityCategoryToken> = [],
        webs: Set<WebDomainToken> = [],
        _ completionHandler: @escaping (ShieldActionResponse) -> Void
    ) {
        switch action {
        case .primaryButtonPressed:
            completionHandler(.close)
        case .secondaryButtonPressed:
            // Con el escudo estricto (Plus) el botón ni se enseña; esto es solo por si acaso.
            guard !LampiShared.strictShield, let token else { return completionHandler(.close) }
            LampiShared.grantSnooze(kind: kind, token: token, applications: apps, categories: categories, webDomains: webs)
            completionHandler(.close)
        @unknown default:
            completionHandler(.close)
        }
    }
}
