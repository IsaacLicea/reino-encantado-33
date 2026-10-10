/* Reino de los 33 — Reproductor de música de fondo.
   La pista y su nombre se configuran en los atributos data-audio-* del
   botón #musicaReino en index.html. No cargar música sin licencia.
   El audio se descarga solo después de pulsar "Activar". */
(() => {
  "use strict";

  const boton = document.getElementById("musicaReino");
  const estado = document.getElementById("musicaEstado");
  if (!boton || !estado) return;

  const AudioAPI = window.Audio;
  if (typeof AudioAPI !== "function") {
    boton.disabled = true;
    estado.textContent = "Audio no disponible";
    return;
  }

  // El origen de la pista se cambia solamente tras obtener permiso del
  // titular para alojar y reproducir el audio públicamente en GitHub Pages.
  const ruta = boton.getAttribute("data-audio-src") || "assets/danza-luciernagas-cristal.mp3";
  const titulo = boton.getAttribute("data-audio-title") || "La danza de las luciérnagas";
  const pista = new AudioAPI(ruta);
  pista.preload = "none";
  pista.loop = true;
  pista.volume = 0.66;
  let cargando = false;
  let sonando = false;

  function mostrarEstado() {
    boton.classList.toggle("sonando", sonando);
    boton.setAttribute("aria-pressed", String(sonando));
    boton.setAttribute("aria-label",
      sonando ? "Pausar " + titulo : "Activar " + titulo
    );
    if (!cargando) {
      estado.textContent = sonando ? "Pausar música" : "Activar música";
    }
  }

  async function activar() {
    if (cargando) return;
    cargando = true;
    boton.disabled = true;
    estado.textContent = "Despertando la música…";
    try {
      // play() se solicita en el gesto del usuario, compatible con iPhone.
      await pista.play();
      sonando = true;
    } catch (error) {
      sonando = false;
      estado.textContent = "No se pudo cargar la música";
    } finally {
      cargando = false;
      boton.disabled = false;
      if (sonando) mostrarEstado();
      else {
        boton.classList.remove("sonando");
        boton.setAttribute("aria-pressed", "false");
        boton.setAttribute("aria-label", "Activar " + titulo);
      }
    }
  }

  function pausar() {
    pista.pause();
    sonando = false;
    mostrarEstado();
  }

  boton.addEventListener("click", () => {
    if (sonando) pausar();
    else activar();
  });

  pista.addEventListener("waiting", () => {
    if (sonando) estado.textContent = "Afinando las arpas…";
  });
  pista.addEventListener("playing", () => {
    if (sonando) mostrarEstado();
  });
  pista.addEventListener("error", () => {
    if (!sonando) return;
    pausar();
    estado.textContent = "Error al cargar la música";
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && sonando) pausar();
  });

  mostrarEstado();
})();
