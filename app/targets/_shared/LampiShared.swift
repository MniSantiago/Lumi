import DeviceActivity
import FamilyControls
import Foundation
import ManagedSettings
import notify

/// Todo lo que comparten la app (módulo `lampi-screen-time`) y las tres extensiones
/// (monitor, escudo y acción del escudo). Vive en `targets/_shared`; el módulo lo
/// enlaza con un symlink, así que hay una sola copia.
///
/// Las extensiones corren en otro proceso: lo único que tienen en común con la app
/// es el App Group, por eso todo el estado pasa por `defaults`.
enum LampiShared {
    static let appGroup = "group.com.gonzalez.lampi"
    static let defaults = UserDefaults(suiteName: appGroup) ?? .standard
    static let store = ManagedSettingsStore(named: .init("lumi"))

    static let dailyActivity = DeviceActivityName("lumi.daily")
    static let nightActivity = DeviceActivityName("lumi.night")
    static let snoozePrefix = "lumi.snooze."
    static let thresholds = [25, 50, 75, 100]

    private enum Key {
        static let selection = "selection"
        static let lumiName = "lumiName"
        static let limitMinutes = "limitMinutes"
        static let nightStart = "nightStart"
        static let nightEnd = "nightEnd"
        static let strict = "strictShield"
        static let threshold = "threshold"
        static let thresholdDay = "thresholdDay"
        static let snoozeCount = "snoozeCount"
        static let snoozeDay = "snoozeDay"
        static let snoozes = "snoozes"
        static let nightActive = "nightActive"
    }

    // MARK: - Ajustes que escribe la app

    static var lumiName: String { defaults.string(forKey: Key.lumiName) ?? "Lampi" }
    static var limitMinutes: Int {
        let v = defaults.integer(forKey: Key.limitMinutes)
        return v > 0 ? v : 60
    }
    static var nightStart: String { defaults.string(forKey: Key.nightStart) ?? "23:00" }
    static var nightEnd: String { defaults.string(forKey: Key.nightEnd) ?? "07:00" }
    static var strictShield: Bool { defaults.bool(forKey: Key.strict) }

    static func saveSettings(lumiName: String, limitMinutes: Int, nightStart: String, nightEnd: String, strictShield: Bool) {
        defaults.set(lumiName, forKey: Key.lumiName)
        defaults.set(limitMinutes, forKey: Key.limitMinutes)
        defaults.set(nightStart, forKey: Key.nightStart)
        defaults.set(nightEnd, forKey: Key.nightEnd)
        defaults.set(strictShield, forKey: Key.strict)
    }

    // MARK: - Selección (las apps ladronas que eligió el usuario)

    static func loadSelection() -> FamilyActivitySelection {
        guard let data = defaults.data(forKey: Key.selection),
              let selection = try? JSONDecoder().decode(FamilyActivitySelection.self, from: data)
        else { return FamilyActivitySelection() }
        return selection
    }

    static func saveSelection(_ selection: FamilyActivitySelection) {
        defaults.set(try? JSONEncoder().encode(selection), forKey: Key.selection)
    }

    static func hasItems(_ s: FamilyActivitySelection) -> Bool {
        !(s.applicationTokens.isEmpty && s.categoryTokens.isEmpty && s.webDomainTokens.isEmpty)
    }

    // MARK: - Día y umbral

    static func dayKey(_ date: Date = Date()) -> String {
        let c = Calendar.current.dateComponents([.year, .month, .day], from: date)
        return String(format: "%04d-%02d-%02d", c.year ?? 0, c.month ?? 0, c.day ?? 0)
    }

    /// Último umbral (0/25/50/75/100) cruzado hoy. Cada día empieza de cero.
    static var threshold: Int {
        defaults.string(forKey: Key.thresholdDay) == dayKey() ? defaults.integer(forKey: Key.threshold) : 0
    }

    /// Notificación Darwin: la extensión avisa a la app (si está abierta) de que el umbral cambió.
    static let thresholdNotification = "com.gonzalez.lampi.threshold"

    static func setThreshold(_ value: Int) {
        defaults.set(value, forKey: Key.threshold)
        defaults.set(dayKey(), forKey: Key.thresholdDay)
        notify_post(thresholdNotification)
    }

    static var limitReachedToday: Bool { threshold >= 100 }

    // MARK: - Horario de noche

    private static func minutes(_ hhmm: String) -> Int {
        let parts = hhmm.split(separator: ":").compactMap { Int($0) }
        return parts.count == 2 ? parts[0] * 60 + parts[1] : 0
    }

    static func parts(_ hhmm: String) -> (hour: Int, minute: Int) {
        let m = minutes(hhmm)
        return (m / 60, m % 60)
    }

    static func isNight(at date: Date = Date()) -> Bool {
        let c = Calendar.current.dateComponents([.hour, .minute], from: date)
        let now = (c.hour ?? 0) * 60 + (c.minute ?? 0)
        let start = minutes(nightStart)
        let end = minutes(nightEnd)
        if start == end { return false }
        return start < end ? (now >= start && now < end) : (now >= start || now < end)
    }

    /// Las devoluciones de llamada del sistema pueden llegar unos segundos antes o
    /// después del borde, así que la extensión sabe si arranca o termina la noche.
    static var nightActive: Bool {
        get { defaults.bool(forKey: Key.nightActive) }
        set { defaults.set(newValue, forKey: Key.nightActive) }
    }

    // MARK: - «5 min más»

    struct Snooze: Codable {
        /// "app", "category" o "web".
        var kind: String
        var token: Data
    }

    private static var snoozes: [String: Snooze] {
        get {
            guard let data = defaults.data(forKey: Key.snoozes),
                  let value = try? JSONDecoder().decode([String: Snooze].self, from: data)
            else { return [:] }
            return value
        }
        set { defaults.set(try? JSONEncoder().encode(newValue), forKey: Key.snoozes) }
    }

    /// Cuántas veces se ha pedido «5 min más» hoy (vuelve a cero cada día).
    static var snoozesToday: Int {
        defaults.string(forKey: Key.snoozeDay) == dayKey() ? defaults.integer(forKey: Key.snoozeCount) : 0
    }

    /// Quita el escudo de un elemento hasta que se usen 5 minutos más. Devuelve cuántas van hoy.
    @discardableResult
    static func grantSnooze(
        kind: String,
        token: Data,
        applications: Set<ApplicationToken> = [],
        categories: Set<ActivityCategoryToken> = [],
        webDomains: Set<WebDomainToken> = []
    ) -> Int {
        let count = snoozesToday + 1
        defaults.set(count, forKey: Key.snoozeCount)
        defaults.set(dayKey(), forKey: Key.snoozeDay)

        let name = "\(snoozePrefix)\(UUID().uuidString)"
        snoozes[name] = Snooze(kind: kind, token: token)
        refreshShield()

        // Un horario de todo el día: los 5 minutos son de uso, no de reloj. La
        // extensión monitor vuelve a tapar la app cuando se gastan.
        let schedule = DeviceActivitySchedule(
            intervalStart: DateComponents(hour: 0, minute: 0),
            intervalEnd: DateComponents(hour: 23, minute: 59),
            repeats: false
        )
        let event = DeviceActivityEvent(
            applications: applications,
            categories: categories,
            webDomains: webDomains,
            threshold: DateComponents(minute: 5)
        )
        do {
            try DeviceActivityCenter().startMonitoring(
                DeviceActivityName(name), during: schedule, events: [DeviceActivityEvent.Name("snoozeEnd"): event]
            )
        } catch {
            // Sin monitor no habría quién volviera a tapar la app: mejor no dar el ratito.
            snoozes[name] = nil
            refreshShield()
        }
        return count
    }

    static func endSnooze(_ name: String) {
        var current = snoozes
        current[name] = nil
        snoozes = current
        DeviceActivityCenter().stopMonitoring([DeviceActivityName(name)])
    }

    static func endAllSnoozes() {
        let names = snoozes.keys.map { DeviceActivityName($0) }
        snoozes = [:]
        if !names.isEmpty { DeviceActivityCenter().stopMonitoring(names) }
    }

    // MARK: - Escudo

    /// Pone o quita el escudo según toque: noche, o límite de hoy alcanzado.
    /// `night` lo pasa la extensión cuando sabe con seguridad si empieza o termina la noche.
    static func refreshShield(night: Bool? = nil) {
        let selection = loadSelection()
        let shielded = (night ?? (nightActive || isNight())) || limitReachedToday
        guard shielded, hasItems(selection) else {
            store.clearAllSettings()
            return
        }

        var apps = selection.applicationTokens
        var categories = selection.categoryTokens
        var webs = selection.webDomainTokens
        var exceptions = Set<ApplicationToken>()
        let decoder = JSONDecoder()
        for snooze in snoozes.values {
            switch snooze.kind {
            case "app":
                if let t = try? decoder.decode(ApplicationToken.self, from: snooze.token) {
                    apps.remove(t)
                    exceptions.insert(t)
                }
            case "category":
                if let t = try? decoder.decode(ActivityCategoryToken.self, from: snooze.token) { categories.remove(t) }
            case "web":
                if let t = try? decoder.decode(WebDomainToken.self, from: snooze.token) { webs.remove(t) }
            default:
                break
            }
        }
        store.shield.applications = apps.isEmpty ? nil : apps
        store.shield.applicationCategories = categories.isEmpty ? nil : .specific(categories, except: exceptions)
        store.shield.webDomains = webs.isEmpty ? nil : webs
    }

    // MARK: - Programar la vigilancia

    /// (Re)programa el conteo del día y el horario de noche. Se llama al elegir apps y
    /// al cambiar el límite o la noche. Lanza si la app no tiene permiso.
    static func scheduleMonitoring() throws {
        let center = DeviceActivityCenter()
        center.stopMonitoring([dailyActivity, nightActivity])

        let selection = loadSelection()
        guard hasItems(selection) else {
            refreshShield()
            return
        }

        // Umbrales al 25/50/75/100 % del límite. iOS no da los minutos exactos, solo avisa.
        var events: [DeviceActivityEvent.Name: DeviceActivityEvent] = [:]
        for pct in thresholds {
            let total = max(1, Int((Double(limitMinutes) * Double(pct) / 100).rounded()))
            events[DeviceActivityEvent.Name("t\(pct)")] = DeviceActivityEvent(
                applications: selection.applicationTokens,
                categories: selection.categoryTokens,
                webDomains: selection.webDomainTokens,
                threshold: DateComponents(hour: total / 60, minute: total % 60)
            )
        }
        try center.startMonitoring(
            dailyActivity,
            during: DeviceActivitySchedule(
                intervalStart: DateComponents(hour: 0, minute: 0),
                intervalEnd: DateComponents(hour: 23, minute: 59),
                repeats: true
            ),
            events: events
        )

        let start = parts(nightStart)
        let end = parts(nightEnd)
        if nightStart != nightEnd {
            try center.startMonitoring(
                nightActivity,
                during: DeviceActivitySchedule(
                    intervalStart: DateComponents(hour: start.hour, minute: start.minute),
                    intervalEnd: DateComponents(hour: end.hour, minute: end.minute),
                    repeats: true
                )
            )
        }
        nightActive = isNight()
        refreshShield()
    }

    static func stopEverything() {
        DeviceActivityCenter().stopMonitoring()
        store.clearAllSettings()
        endAllSnoozes()
        setThreshold(0)
    }
}
