// Progresivo: si falla el script, la información principal sigue disponible.
(() => {
  const secciones = document.querySelectorAll("main .seccion");
  if (!secciones.length) return;

  const despertar = (el) => el.classList.add("bosque-despierto");
  const menosMovimiento = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (menosMovimiento || !("IntersectionObserver" in window)) {
    secciones.forEach(despertar);
    return;
  }

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        despertar(entrada.target);
        observador.unobserve(entrada.target);
      });
    },
    { threshold: 0.12 },
  );

  secciones.forEach((seccion) => observador.observe(seccion));
})();

(() => {
  const carta = document.getElementById("cartaTarot");
  const nombre = document.getElementById("tarotNombre");
  const mensaje = document.getElementById("tarotMensaje");
  const ayuda = document.getElementById("tarotAyuda");
  const mensajeIsaac = document.getElementById("mensajeIsaac");
  const otraCarta = document.getElementById("otraCarta");

  if (!carta || !nombre || !mensaje) return;

  const cartas = [
    {
      nombre: "La Estrella",
      mensaje:
        "Una luz serena guía tu camino y te recuerda que aún hay magia esperándote.",
    },
    {
      nombre: "La Luna",
      mensaje:
        "Escucha tu intuición: no todo se revela a simple vista, pero el bosque sí susurra respuestas.",
    },
    {
      nombre: "El Sol",
      mensaje:
        "La celebración, la alegría y la calidez se acercan. Tu energía ilumina a quienes te rodean.",
    },
    {
      nombre: "La Emperatriz",
      mensaje:
        "Abundancia, belleza y creatividad florecen a tu alrededor como un jardín encantado.",
    },
    {
      nombre: "La Sacerdotisa",
      mensaje:
        "El conocimiento oculto se mueve en silencio. Confía en lo que sientes aunque aún no tenga forma.",
    },
    {
      nombre: "La Rueda de la Fortuna",
      mensaje:
        "El destino gira y trae cambios. Algo nuevo puede revelarse cuando menos lo esperes.",
    },
    {
      nombre: "Los Enamorados",
      mensaje:
        "Los vínculos, decisiones y afinidades se vuelven protagonistas. El corazón también habla.",
    },
    {
      nombre: "El Mago",
      mensaje:
        "Tienes el poder de transformar tu realidad; lo que imaginas puede tomar forma.",
    },
  ];

  let indiceActual = -1;

  function elegirCarta() {
    let idx;
    do {
      idx = Math.floor(Math.random() * cartas.length);
    } while (cartas.length > 1 && idx === indiceActual);

    indiceActual = idx;
    return cartas[idx];
  }

  function revelarCarta() {
    carta.disabled = true;
    carta.classList.remove("revelada");

    setTimeout(() => {
      const resultado = elegirCarta();
      nombre.textContent = resultado.nombre;
      mensaje.textContent = resultado.mensaje;

      carta.classList.add("revelada");
      mensajeIsaac.hidden = false;
      ayuda.textContent =
        "Tu carta ha sido revelada. Si quieres, consulta otra.";
      carta.disabled = false;
    }, 220);
  }

  carta.addEventListener("click", revelarCarta);

  if (otraCarta) {
    otraCarta.addEventListener("click", revelarCarta);
  }
})();
