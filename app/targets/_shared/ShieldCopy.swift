import Foundation

/// Textos del escudo: espejo de `app/src/shield/copy.ts`. Las extensiones no pueden
/// usar el JS, así que van aquí, en los mismos 5 idiomas. Si cambias uno, cambia el otro.
enum ShieldCopy {
    private enum Lang { case es, en, zh, hi, fr }

    private static let lang: Lang = {
        for code in Locale.preferredLanguages {
            switch code.lowercased().split(whereSeparator: { $0 == "-" || $0 == "_" }).first.map(String.init) {
            case "es": return .es
            case "en": return .en
            case "zh": return .zh
            case "hi": return .hi
            case "fr": return .fr
            default: continue
            }
        }
        return .en
    }()

    private static func tr(es: String, en: String, zh: String, hi: String, fr: String) -> String {
        switch lang {
        case .es: return es
        case .en: return en
        case .zh: return zh
        case .hi: return hi
        case .fr: return fr
        }
    }

    static func title(lumi: String, night: Bool) -> String {
        night
            ? tr(
                es: "\(lumi) ya está dormida… ¿de verdad entramos?",
                en: "\(lumi) is already asleep… are we really going in?",
                zh: "\(lumi)已经睡着了……真的要进去吗？",
                hi: "\(lumi) सो चुकी है… सच में अंदर जाएँ?",
                fr: "\(lumi) dort déjà… on y va vraiment ?")
            : tr(
                es: "\(lumi) se estaba echando la siesta… ¿de verdad entramos?",
                en: "\(lumi) was taking a nap… are we really going in?",
                zh: "\(lumi)正在打盹呢……真的要进去吗？",
                hi: "\(lumi) झपकी ले रही थी… सच में अंदर जाएँ?",
                fr: "\(lumi) faisait la sieste… on y va vraiment ?")
    }

    static func body(night: Bool) -> String {
        night
            ? tr(
                es: "Es su hora de dormir, y también la tuya. Si lo dejas ahora, mañana trae chispas de más.",
                en: "It’s her bedtime, and yours too. If you stop now, she’ll bring extra sparks tomorrow.",
                zh: "到她睡觉的时间了，也到你的了。现在放下，她明天会多带些火花回来。",
                hi: "उसके सोने का समय है, और तुम्हारा भी। अभी छोड़ दो, तो कल वो ज़्यादा चिंगारियाँ लाएगी।",
                fr: "C’est l’heure de dormir pour elle, et pour toi aussi. Si tu arrêtes maintenant, elle rapportera des étincelles en plus demain.")
            : tr(
                es: "Ya habéis pasado de tu hora de hoy. Si lo dejas ahora, mañana se despierta con más luz.",
                en: "You’ve gone past today’s time. If you stop now, she’ll wake up brighter tomorrow.",
                zh: "今天的时间已经用完了。现在放下，她明天醒来会更亮。",
                hi: "आज का समय पूरा हो चुका है। अभी छोड़ दो, तो कल वो और ज़्यादा रोशनी के साथ जागेगी।",
                fr: "Vous avez dépassé ton temps du jour. Si tu arrêtes maintenant, elle se réveillera plus lumineuse demain.")
    }

    static var leave: String {
        tr(es: "Vale, lo dejo", en: "Okay, I’ll stop", zh: "好，我放下", hi: "ठीक है, छोड़ देते हैं", fr: "D’accord, j’arrête")
    }

    static var strictNote: String {
        tr(
            es: "Escudo estricto: hoy no hay ratitos extra. Lo elegiste tú, y Lampi te lo agradece.",
            en: "Strict shield: no extra minutes today. You chose it, and Lampi thanks you.",
            zh: "严格护盾：今天没有额外时间。这是你自己的选择，Lampi 谢谢你。",
            hi: "सख़्त ढाल: आज कोई अतिरिक्त समय नहीं। यह तुमने चुना था, और Lampi तुम्हारा शुक्रिया करती है।",
            fr: "Bouclier strict : pas de minutes en plus aujourd’hui. C’est toi qui l’as choisi, et Lampi t’en remercie.")
    }

    /// `used` = veces que ya se ha pedido hoy, antes de esta.
    static func snooze(used: Int) -> String {
        used == 0
            ? tr(es: "5 min más", en: "5 more min", zh: "再 5 分钟", hi: "5 मिनट और", fr: "5 min de plus")
            : tr(
                es: "Vale… 5 min, pero te espero despierta",
                en: "Okay… 5 min, but I’ll wait up for you",
                zh: "好吧……5 分钟，我醒着等你",
                hi: "ठीक है… 5 मिनट, पर मैं जागकर इंतज़ार करूँगी",
                fr: "D’accord… 5 min, mais je t’attends réveillée")
    }

    static func snoozeNote(used: Int) -> String? {
        switch used {
        case 0:
            return nil
        case 1:
            return tr(
                es: "Hoy ya te he dado un ratito de 5 min. No pasa nada.",
                en: "I already gave you 5 minutes today. That’s okay.",
                zh: "今天已经给过你一次 5 分钟了。没关系。",
                hi: "आज मैं तुम्हें एक बार 5 मिनट दे चुकी हूँ। कोई बात नहीं।",
                fr: "Je t’ai déjà donné 5 minutes aujourd’hui. Ce n’est pas grave.")
        default:
            return tr(
                es: "Hoy ya van \(used) ratitos de 5 min. No pasa nada, aquí sigo.",
                en: "That’s \(used) little 5-minute breaks today. That’s okay, I’m still here.",
                zh: "今天已经有 \(used) 次 5 分钟了。没关系，我还在。",
                hi: "आज \(used) बार 5-5 मिनट हो चुके हैं। कोई बात नहीं, मैं यहीं हूँ।",
                fr: "Ça fait \(used) petites pauses de 5 min aujourd’hui. Pas grave, je suis là.")
        }
    }
}
