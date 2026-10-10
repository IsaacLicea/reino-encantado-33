/* Reino de los 33 — La danza de las luciérnagas.
   Reproduce la mezcla original de instrumentos muestreados.
   El audio se descarga solo después de que el visitante pulsa "Activar".
   Se conserva la versión sintetizada anterior en scripts/ como respaldo. */
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

  const pista = new AudioAPI("assets/danza-luciernagas-cinematica.mp3");
  pista.preload = "none";
  pista.loop = true;
  pista.volume = 0.66;
  let cargando = false;
  let sonando = false;

  function mostrarEstado() {
    boton.classList.toggle("sonando", sonando);
    boton.setAttribute("aria-pressed", String(sonando));
    boton.setAttribute("aria-label",
      sonando ? "Pausar La danza de las luciérnagas" : "Activar La danza de las luciérnagas"
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
        boton.setAttribute("aria-label", "Activar La danza de las luciérnagas");
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
