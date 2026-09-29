# Lumi: ficha de la App Store (borrador)

Textos para App Store Connect, en español. Los límites de caracteres son los de Apple y están comprobados (`python3 tools/check_ficha.py`).

---

## Nombre (máx. 30)

```
Lumi: menos scroll, más luz
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
Cuando sueltas el móvil, Lumi brilla y sale de aventura. Esta noche, quizá te traiga su primera postal.
```

## Descripción (máx. 4000)

```
Lumi es un espíritu de luz que vive contigo todo el día. Cuanto menos scroll, más brilla. Y si te pasas, no te riñe: se echa la siesta.

TU ATENCIÓN ES LUZ
Eliges las apps que más te roban el tiempo y un límite suave para el día. Lumi no cuenta minutos para echártelos en cara: solo brilla más o menos según cómo vaya la cosa. Radiante, contenta, cansada o apagadita.

SALE DE AVENTURA
Mientras le queda luz, Lumi se va de expedición. Por la noche vuelve con una postal, objetos para su colección y alguna criatura amiga. Hay veinte lugares por descubrir, del Bosque de Musgo al Lago de las Lunas.

UN ESCUDO QUE NO CASTIGA
Si abres una app ladrona pasado tu límite, te encuentras a Lumi echándose la siesta: «¿De verdad entramos?». Puedes dejarlo o pedir cinco minutitos más. Fricción con cariño, nunca castigo.

SIN CULPA
Lumi nunca muere ni enferma. Cada día empieza de cero. Las rachas tienen días de descanso. Y el modo noche la deja dormir, para que tú también descanses.

TU PRIVACIDAD, PRIMERO
Lumi usa Tiempo de uso de Apple y solo se entera de cuándo te acercas a tu límite. No ve qué haces dentro de tus apps. Lo que sabe de ti vive en tu iPhone. La cuenta es opcional, sirve para no perderla si cambias de iPhone, y la puedes borrar cuando quieras desde la app.

LO IMPORTANTE ES GRATIS
Tu Lumi y su escudo, el límite diario, las expediciones y postales, el widget y el modo noche son gratis. Siempre.

LUMI PLUS (OPCIONAL)
Para quien quiere ir un poco más lejos: más especies y colores de luz, zonas exclusivas y capítulos de historia, varios horarios y estadísticas, y decoración para su madriguera. Suscripción anual o mensual con 7 días gratis en el plan anual. Se renueva sola hasta que la canceles en Ajustes › tu nombre › Suscripciones, al menos 24 horas antes de la renovación.

Términos: https://<dominio>/terminos.html
Privacidad: https://<dominio>/privacidad.html
```

## Novedades de esta versión (máx. 4000)

```
¡Hola! Soy Lumi. Esta es mi primera versión: suelta el móvil y salgo de aventura ✨
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

```
Lumi es una mascota que ayuda a usar menos las apps que elige el propio usuario. Usa Family Controls con autorización individual (no control parental): el usuario elige sus apps con FamilyActivityPicker, DeviceActivityMonitor avisa al 25/50/75/100 % de su límite diario y ShieldConfiguration muestra a Lumi al abrir una de esas apps pasado el límite. Ningún dato de uso sale del dispositivo.

Para probarlo rápido: en el onboarding, elige Safari como app y pon el límite más bajo (30 min).

La cuenta es opcional (Ajustes › Cuenta) y se puede eliminar desde la app (Ajustes › Cuenta › Eliminar la cuenta). Cuenta de prueba: review@<dominio> / <contraseña>.

Lumi Plus es una suscripción auto-renovable (anual con 7 días gratis y mensual). Todo lo esencial funciona sin pagar.
```

## Pendiente antes de enviar

- [ ] Poner el dominio real en las URLs y en la descripción.
- [ ] Crear la cuenta de prueba en producción y poner su contraseña en las notas.
- [ ] Capturas de 6,9" (1320 × 2868): Hogar, postal nocturna, escudo, Colección y resumen semanal.
- [ ] Comprobar precios finales (la descripción no los pone: los enseña Apple).
