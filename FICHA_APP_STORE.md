# Lampi: ficha de la App Store (borrador)

Textos para App Store Connect, en español. Los límites de caracteres son los de Apple y están comprobados (`python3 tools/check_ficha.py`).

> **Estado:** nombre, subtítulo y palabras clave de abajo están **propuestos para la 1.0.2**
> y todavía no están aplicados en App Store Connect. Van atados a versión y la 1.0.1
> está en revisión, así que esos tres campos están bloqueados hasta que Apple resuelva.
> El **texto promocional** no va atado a versión: ese se puede aplicar hoy.
> Los valores que sirve la tienda ahora mismo quedan apuntados en cada apartado.

---

## Nombre (máx. 30)

```
Lampi: menos pantalla, más luz
```

Vivo hoy en la tienda: `Lampi: menos scroll, más luz` (28/30).
Mete `pantalla` en el campo de más peso y solo cede `scroll`, que no rinde: con `scroll`
en el nombre Lampi es la 99.ª de su propia búsqueda. Solo afecta a la ficha en español;
las demás localizaciones (`ficha/*.md`) mantienen su nombre.

## Subtítulo (máx. 30)

```
Deja el móvil sin castigarte
```

Vivo hoy en la tienda: `Mascota para soltar el móvil` (28/30), optimizado para
`soltar el movil` — una consulta que devuelve **un solo resultado en toda la tienda**.
El nuevo recoge `dejar` y dice la diferencia real del producto.

## Palabras clave (máx. 100, separadas por comas, sin espacios)

```
tiempo,pantalla,adiccion,dejar,bloquear,apps,detox,digital,limite,habitos,bienestar,descanso,enfoque
```

Vivo hoy en la tienda:
`tiempo de pantalla,mascota,bloqueador,apps,scroll,hábitos,concentración,bienestar digital,descanso` (98/100).

No hace falta repetir palabras del nombre ni del subtítulo: Apple ya las indexa. El campo
vivo gastaba 13 caracteres en `mascota` y `scroll`, que ya estaban cubiertos. Con eso
recuperado entran `adiccion`, `dejar`, `detox` y `limite`.

**Consecuencia pendiente de decidir:** al cambiar el subtítulo, `mascota` desaparece de
todos los campos indexados. Alternativa, si se prefiere conservarla a costa de `descanso`:
`tiempo,pantalla,adiccion,dejar,bloquear,apps,detox,digital,limite,habitos,bienestar,enfoque,mascota`
(99/100).

## Texto promocional (máx. 170; se puede cambiar sin nueva versión)

```
Cuanto menos scroll, más brilla Lampi. Eliges tus apps ladronas y un límite suave para el día. Si te pasas, no te riñe: se echa la siesta. Fricción con cariño.
```

Vivo hoy en la tienda: `Cuando sueltas el móvil, Lampi brilla y sale de aventura. Esta
noche, quizá te traiga su primera postal.` (104/170). No está indexado: su trabajo es
convertir a quien ya ha llegado a la ficha, no atraer búsquedas.

## Descripción (máx. 4000)

```
Lampi es un espíritu de luz que vive contigo todo el día. Cuanto menos scroll, más brilla. Y si te pasas, no te riñe: se echa la siesta.

TU ATENCIÓN ES LUZ
Eliges las apps que más te roban el tiempo y un límite suave para el día. Lampi no cuenta minutos para echártelos en cara: solo brilla más o menos según cómo vaya la cosa. Radiante, contenta, cansada o apagadita.

SALE DE AVENTURA
Mientras le queda luz, Lampi se va de expedición. Por la noche vuelve con una postal, objetos para su colección y alguna criatura amiga. Hay veinte lugares por descubrir, del Bosque de Musgo al Lago de las Lunas.

UN ESCUDO QUE NO CASTIGA
Si abres una app ladrona pasado tu límite, te encuentras a Lampi echándose la siesta: «¿De verdad entramos?». Puedes dejarlo o pedir cinco minutitos más. Fricción con cariño, nunca castigo.

SIN CULPA
Lampi nunca muere ni enferma. Cada día empieza de cero. Las rachas tienen días de descanso. Y el modo noche la deja dormir, para que tú también descanses.

TU PRIVACIDAD, PRIMERO
Lampi usa Tiempo de uso de Apple y solo se entera de cuándo te acercas a tu límite. No ve qué haces dentro de tus apps. Sin cuenta, lo que sabe de ti vive en tu iPhone: qué apps eliges y cuánto las usas no salen de ahí nunca. La cuenta es opcional: sirve para no perderla si cambias de iPhone, y la puedes borrar cuando quieras desde la app.

LO IMPORTANTE ES GRATIS
Tu Lampi y su escudo, el límite diario, las expediciones y postales y el modo noche son gratis.

LAMPI PLUS (OPCIONAL)
Para quien quiere ir un poco más lejos: zonas exclusivas con sus propias historias, un escudo estricto sin «5 min más» y tus números de siempre (racha más larga, lugares, objetos y amigos). Suscripción anual o mensual con 7 días gratis en el plan anual. Se renueva sola hasta que la canceles en Ajustes › tu nombre › Suscripciones, al menos 24 horas antes de la renovación.

Términos: https://lampi.es/terminos.html
Privacidad: https://lampi.es/privacidad.html
Términos de uso (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

## Novedades de esta versión (máx. 4000)

Para la **1.0.2**. Incluye también lo que iba en la 1.0.1 (el armario), porque la 1.0.1
no llegó a publicarse: si acaba saliendo antes, quita la primera línea.

```
Soy Lampi y traigo unas cuantas cosas nuevas ✨

• El armario está más cómodo: pruebas el accesorio antes de gastar chispas, y me cambias de look desde el Hogar.
• Cerrar un capítulo ya se nota: te lo cuento como el momento que es.
• Un día de descanso no te rompe la racha. Ahora te lo digo donde hacía falta: en Progreso y en la postal de la noche siguiente.
• Con Lampi Plus, la Capa de estrellas es tuya desde el primer minuto, y los lugares de Plus se pueden alcanzar dentro de los 7 días de prueba.
• Medición anónima de por dónde se atasca la gente dentro de la app. Qué apps eliges y cuánto las usas no salen nunca de tu iPhone.
```

### Versión anterior (1.0, publicada el 8 de octubre)

```
¡Hola! Soy Lampi. Esta es mi primera versión: suelta el móvil y salgo de aventura ✨
```

## URLs

| Campo | Valor |
|---|---|
| URL de soporte (obligatoria) | `https://lampi.es/ayuda.html` |
| URL de marketing | `https://lampi.es/` |
| URL de la política de privacidad (obligatoria) | `https://lampi.es/privacidad.html` |

## Categoría y clasificación

- **Categoría principal:** Productividad. **Secundaria:** Estilo de vida.
  Propuesto; vivo hoy es el orden inverso (principal Estilo de vida). Es cambiar el orden
  de dos categorías que ya están declaradas, no añadir ninguna. Afecta a las listas de la
  tienda, no a la búsqueda, así que el impacto es menor. Sin verificar si App Store Connect
  deja cambiarlo con la 1.0.1 en revisión.
- **Clasificación por edad:** 4+ (sin contenido sensible, sin compras fuera de la app, sin chat).

## Notas para la revisión

En inglés, que es lo que lee el equipo de revisión de Apple (pegar tal cual en App Store Connect › Información para la revisión › Notas):

```
Lampi is a pet that helps people use the apps they choose less. It uses Family Controls with individual authorization (not parental control): the user picks their own apps with FamilyActivityPicker, DeviceActivityMonitor reports when they reach 25/50/75/100% of their daily limit, and ShieldConfiguration shows Lampi when one of those apps is opened past the limit. The apps are also shielded during the user's night hours (23:00-07:00 by default). The shield always offers "5 more min" unless the user turned on the optional strict shield (Lampi Plus). Screen Time data never leaves the device: which apps the user picked, the limit they set and their actual usage are all read and kept on-device. The app does send anonymous product-analytics events (PostHog, EU-hosted) recording which steps of the app were reached — never any Screen Time content. This is declared in the privacy policy and in the app's privacy manifest (ProductInteraction, not linked to identity, not used for tracking).

To test it quickly: during onboarding, pick Safari and the lowest limit (30 min). To see the night shield without waiting, go to Settings > Limit and night and move "Goes to sleep" to a few minutes from now.

The account is optional (Settings > Account) and can be deleted in the app (Settings > Account > Delete account). Demo account: review@<domain> / <password>.

Lampi Plus is an auto-renewable subscription (yearly with a 7-day free trial, and monthly). Everything essential works without paying.

The app is available in Spanish, English, Simplified Chinese, Hindi and French, following the device language.
```

Referencia en español: Lampi usa Family Controls para el propio usuario (no control parental); el escudo sale al pasar el límite y en el horario de noche, siempre con «5 min más» salvo con el escudo estricto (Plus). La cuenta es opcional y se borra desde la app. Plus: anual con 7 días gratis y mensual.

## Pendiente antes de enviar

- [x] Poner el dominio real en las URLs y en la descripción. Es `lampi.es`, ya puesto en los cinco idiomas.
- [ ] Crear la cuenta de prueba en producción y poner su contraseña en las notas.
- [ ] Capturas de 6,9" (1320 × 2868): Hogar, postal nocturna, escudo, Colección y resumen semanal. Con titular en cada idioma: `sh landing/tools/capturas.sh` (ver `APP_STORE.md` §5).
- [ ] Comprobar precios finales (la descripción no los pone: los enseña Apple).
