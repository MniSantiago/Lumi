import ManagedSettings
import ManagedSettingsUI
import UIKit

/// El escudo ES Lampi (BRIEF.md): fricción emocional, nunca castigo.
class ShieldConfigurationExtension: ShieldConfigurationDataSource {
    override func configuration(shielding application: Application) -> ShieldConfiguration {
        make()
    }

    override func configuration(shielding application: Application, in category: ActivityCategory) -> ShieldConfiguration {
        make()
    }

    override func configuration(shielding webDomain: WebDomain) -> ShieldConfiguration {
        make()
    }

    override func configuration(shielding webDomain: WebDomain, in category: ActivityCategory) -> ShieldConfiguration {
        make()
    }

    private func make() -> ShieldConfiguration {
        let night = LampiShared.isNight() || LampiShared.nightActive
        let lumi = LampiShared.lumiName
        let used = LampiShared.snoozesToday
        let strict = LampiShared.strictShield

        var subtitle = ShieldCopy.body(night: night)
        if strict {
            subtitle += "\n\n" + ShieldCopy.strictNote
        } else if let note = ShieldCopy.snoozeNote(used: used) {
            subtitle += "\n\n" + note
        }

        let ink = UIColor(red: 0.96, green: 0.94, blue: 1, alpha: 1)
        return ShieldConfiguration(
            backgroundBlurStyle: .systemUltraThinMaterialDark,
            backgroundColor: UIColor(red: 0.075, green: 0.067, blue: 0.18, alpha: 0.92),
            icon: UIImage(named: "lumi-dormida"),
            title: ShieldConfiguration.Label(text: ShieldCopy.title(lumi: lumi, night: night), color: ink),
            subtitle: ShieldConfiguration.Label(text: subtitle, color: ink.withAlphaComponent(0.75)),
            primaryButtonLabel: ShieldConfiguration.Label(text: ShieldCopy.leave, color: UIColor(red: 0.075, green: 0.067, blue: 0.18, alpha: 1)),
            primaryButtonBackgroundColor: UIColor(red: 1, green: 0.84, blue: 0.5, alpha: 1),
            secondaryButtonLabel: strict
                ? nil
                : ShieldConfiguration.Label(text: ShieldCopy.snooze(used: used), color: ink.withAlphaComponent(0.85))
        )
    }
}
