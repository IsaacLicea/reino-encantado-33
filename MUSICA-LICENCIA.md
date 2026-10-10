# Música licenciada — Reino de los 33

## Canción deseada

- **Título:** Fairy Dance of Moon Magic
- **Artistas:** Celestial Aeon Project y Tales From The Dream World
- **Fonograma:** ©/℗ 2025 Ouranio Recordings (según plataformas musicales).
- **Enlace oficial de escucha:** https://soundcloud.com/mattipaalanen/fairy-dance-of-moon-magic
- **Estado:** **pendiente de licencia**. SoundCloud indica «all-rights-reserved». No subir, descargar de servicios de streaming, copiar ni distribuir esta grabación sin una autorización adecuada.

## Contacto

- Ouranio Recordings: label@ouraniorecordings.com — https://ouraniorecordings.com/contact/
- Gestión de Celestial Aeon Project: alex@ouraniorecordings.com — https://ouraniorecordings.com/celestial-aeon-project/

Solicitar confirmación escrita de que quien responda puede autorizar tanto **la grabación/fonograma** como **la composición musical**; si faltara algún derecho, pedir que indique el contacto correspondiente.

## Qué permiso solicitar

Uso **personal y no comercial** de la canción completa como música de fondo en una invitación web de cumpleaños hospedada en **GitHub Pages**, con usuarios que abren el sitio desde WhatsApp, botón voluntario de reproducción y pausa, repetición en bucle, acceso desde cualquier país y alojamiento público del archivo MP3 (que técnicamente puede descargarse). Solicitar un **archivo MP3 autorizado para alojamiento**, las condiciones económicas si las hubiera, crédito obligatorio y plazo de uso hasta después del evento del 28 de noviembre de 2026. No basta con comprar la canción para consumo personal ni con enlazar a una muestra previa.

## Preparación técnica completada

El reproductor sigue siendo el botón flotante de oro viejo. Lee desde `index.html`:

```html
data-audio-src="assets/danza-luciernagas-cristal.mp3"
data-audio-title="La danza de las luciérnagas"
```

Mientras el permiso esté pendiente, **la invitación conserva nuestra banda sonora original** y no busca ni reproduce la canción protegida.

### Cuando llegue el permiso y el MP3 oficial

1. Guardar copia de la licencia/concesión escrita y revisar expresamente que permita alojamiento público en GitHub Pages (master y composición).
2. Cargar el MP3 **aportado por el titular o descargado de una fuente que él autorice** como `assets/fairy-dance-of-moon-magic-licensed.mp3`.
3. En `index.html`, cambiar `data-audio-src` a `assets/fairy-dance-of-moon-magic-licensed.mp3` y `data-audio-title` a `Fairy Dance of Moon Magic`. Actualizar el texto visible del botón, créditos y condiciones de la licencia si es necesario. **El JavaScript no requiere cambios.**
4. Probar el enlace público con Safari en iPhone y escritorio, la reproducción voluntaria, el bucle y la pausa al ocultar la pestaña.
5. Si el permiso prohíbe subir un MP3 a un repositorio público, **no alojarlo en GitHub Pages**; acordar otro método de distribución/autorización.

**Nunca asumir autorización por aparecer en Apple Music, Spotify o SoundCloud.**
