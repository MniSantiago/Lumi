# Lampi: ficha de la App Store (borrador)

Textos para App Store Connect, en español. Los límites de caracteres son los de Apple y están comprobados (`python3 tools/check_ficha.py`).

---

## Nombre (máx. 30)

```
Lampi: menos scroll, más luz
```

## Subtítulo (máx. 30)

```
Mascota para soltar el móvil
```

## Palabras clave (máx. 100, separadas por comas, sin espacios)

```
tiempo de pantalla,mascota,bloqueador,apps,scroll,hábitos,concentración,bienestar digital,descanso
```

No hace falta repetir palabras del nombre ni del subtítulo: Apple ya las indexa.

## Texto promocional (máx. 170; se puede cambiar sin nueva versión)

```
Cuando sueltas el móvil, Lampi brilla y sale de aventura. Esta noche, quizá te traiga su primera postal.
```

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
Lampi usa Tiempo de uso de Apple y solo se entera de cuándo te acercas a tu límite. No ve qué haces dentro de tus apps. Lo que sabe de ti vive en tu iPhone. La cuenta es opcional, sirve para no perderla si cambias de iPhone, y la puedes borrar cuando quieras desde la app.

LO IMPORTANTE ES GRATIS
Tu Lampi y su escudo, el límite diario, las expediciones y postales, el widget y el modo noche son gratis. Siempre.

LAMPI PLUS (OPCIONAL)
Para quien quiere ir un poco más lejos: zonas exclusivas con sus propias historias, un escudo estricto sin «5 min más» y tus números de siempre (racha más larga, lugares, objetos y amigos). Suscripción anual o mensual con 7 días gratis en el plan anual. Se renueva sola hasta que la canceles en Ajustes › tu nombre › Suscripciones, al menos 24 horas antes de la renovación.

Términos: https://<dominio>/terminos.html
Privacidad: https://<dominio>/privacidad.html
Términos de uso (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

## Novedades de esta versión (máx. 4000)

```
¡Hola! Soy Lampi. Esta es mi primera versión: suelta el móvil y salgo de aventura ✨
```

## URLs

| Campo | Valor |
|---|---|
| URL de soporte (obligatoria) | `https://<dominio>/ayuda.html` |
| URL de marketing | `https://<dominio>/` |
| URL de la política de privacidad (obligatoria) | `https://<dominio>/privacidad.html` |

## Categoría y clasificación

- **Categoría principal:** Estilo de vida. **Secundaria:** Salud y forma física.
- **Clasificación por edad:** 4+ (sin contenido sensible, sin compras fuera de la app, sin chat).

## Notas para la revisión

En inglés, que es lo que lee el equipo de revisión de Apple (pegar tal cual en App Store Connect › Información para la revisión › Notas):

```
Lampi is a pet that helps people use the apps they choose less. It uses Family Controls with individual authorization (not parental control): the user picks their own apps with FamilyActivityPicker, DeviceActivityMonitor reports when they reach 25/50/75/100% of their daily limit, and ShieldConfiguration shows Lampi when one of those apps is opened past the limit. The apps are also shielded during the user's night hours (23:00-07:00 by default). The shield always offers "5 more min" unless the user turned on the optional strict shield (Lampi Plus). No usage data leaves the device.

To test it quickly: during onboarding, pick Safari and the lowest limit (30 min). To see the night shield without waiting, go to Settings > Limit and night and move "Goes to sleep" to a few minutes from now.

The account is optional (Settings > Account) and can be deleted in the app (Settings > Account > Delete account). Demo account: review@<domain> / <password>.

Lampi Plus is an auto-renewable subscription (yearly with a 7-day free trial, and monthly). Everything essential works without paying.

The app is available in Spanish, English, Simplified Chinese, Hindi and French, following the device language.
```

Referencia en español: Lampi usa Family Controls para el propio usuario (no control parental); el escudo sale al pasar el límite y en el horario de noche, siempre con «5 min más» salvo con el escudo estricto (Plus). La cuenta es opcional y se borra desde la app. Plus: anual con 7 días gratis y mensual.

## Pendiente antes de enviar

- [ ] Poner el dominio real en las URLs y en la descripción.
- [ ] Crear la cuenta de prueba en producción y poner su contraseña en las notas.
- [ ] Capturas de 6,9" (1320 × 2868): Hogar, postal nocturna, escudo, Colección y resumen semanal. Con titular en cada idioma: `sh landing/tools/capturas.sh` (ver `APP_STORE.md` §5).
- [ ] Comprobar precios finales (la descripción no los pone: los enseña Apple).
