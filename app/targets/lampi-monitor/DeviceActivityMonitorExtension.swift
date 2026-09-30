import DeviceActivity
import Foundation

/// Cuenta el uso de las apps ladronas y decide cuándo sale el escudo.
/// iOS solo avisa al cruzar umbrales (25/50/75/100 % del límite), nunca da minutos.
class DeviceActivityMonitorExtension: DeviceActivityMonitor {
    override func intervalDidStart(for activity: DeviceActivityName) {
        super.intervalDidStart(for: activity)
        switch activity {
        case LampiShared.dailyActivity:
            // Cada día empieza de cero: sin umbral y sin ratitos extra pendientes.
            LampiShared.setThreshold(0)
            LampiShared.endAllSnoozes()
            LampiShared.refreshShield()
        case LampiShared.nightActivity:
            LampiShared.nightActive = true
            LampiShared.refreshShield(night: true)
        default:
            break
        }
    }

    override func intervalDidEnd(for activity: DeviceActivityName) {
        super.intervalDidEnd(for: activity)
        if activity == LampiShared.nightActivity {
            LampiShared.nightActive = false
            LampiShared.refreshShield(night: false)
        } else if activity.rawValue.hasPrefix(LampiShared.snoozePrefix) {
            // Se acabó el día sin gastar el ratito: se cierra.
            LampiShared.endSnooze(activity.rawValue)
            LampiShared.refreshShield()
        }
    }

    override func eventDidReachThreshold(_ event: DeviceActivityEvent.Name, activity: DeviceActivityName) {
        super.eventDidReachThreshold(event, activity: activity)

        if activity.rawValue.hasPrefix(LampiShared.snoozePrefix) {
            // Gastó los 5 minutos: la app vuelve a taparse.
            LampiShared.endSnooze(activity.rawValue)
            LampiShared.refreshShield()
            return
        }

        guard activity == LampiShared.dailyActivity,
              event.rawValue.hasPrefix("t"),
              let pct = Int(event.rawValue.dropFirst())
        else { return }
        LampiShared.setThreshold(max(LampiShared.threshold, pct))
        if pct >= 100 { LampiShared.refreshShield() }
    }
}
