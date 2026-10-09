/* Reino de los 33 — Efectos mágicos v3
   Sustituye el contenido antiguo de efectos-magicos.js.
   NO modifica el contador, el RSVP ni el mapa. */
(() => {
  "use strict";
  const main = document.getElementById("reino");
  if (!main) return;
  const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1. Las secciones despiertan solo cuando aparecen en pantalla.
  const secciones = [...main.querySelectorAll(".seccion")];
  if ("IntersectionObserver" in window && !quieto) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("bosque-despierto");
        obs.unobserve(entry.target);
      });
    }, { threshold: .17 });
    secciones.forEach(el => obs.observe(el));
  } else {
    secciones.forEach(el => el.classList.add("bosque-despierto"));
  }

  // 2. Luciérnagas que permanecen en todo el recorrido (sin tapar enlaces).
  const luces = document.createElement("div");
  luces.className = "luciernagas-continuas";
  luces.setAttribute("aria-hidden", "true");
  const cantidad = quieto ? 0 : (window.innerWidth <= 700 ? 22 : 38);
  const frag = document.createDocumentFragment();
  for (let i = 0; i < cantidad; i++) {
    const l = document.createElement("span");
    l.className = "luciernaga-continua" + (i % 3 ? " fria" : "");
    l.style.setProperty("--x", (3 + Math.random() * 94) + "%");
    l.style.setProperty("--y", (3 + Math.random() * 94) + "%");
    l.style.setProperty("--tam", (1.5 + Math.random() * 2.5) + "px");
    l.style.setProperty("--dur", (5 + Math.random() * 7) + "s");
    l.style.setProperty("--delay", (-Math.random() * 12) + "s");
    frag.appendChild(l);
  }
  luces.appendChild(frag);
  document.body.appendChild(luces);

  // 3. Sendero luminoso único, sin enredaderas laterales.
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "sendero-svg");
  svg.setAttribute("viewBox", "0 0 1000 1000");
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true");

  const camino = document.createElementNS(NS, "path");
  camino.setAttribute("class", "trazo-sendero");
  camino.setAttribute("d", "M500 0 C405 75 650 125 510 215 S410 320 525 410 S620 550 492 615 S418 820 510 1000");
  svg.appendChild(camino);
  main.insertBefore(svg, main.firstChild);

  const longitud = camino.getTotalLength();
  camino.style.strokeDasharray = String(longitud);
  camino.style.strokeDashoffset = quieto ? "0" : String(longitud);

  let pending = false;
  const pintarSendero = () => {
    pending = false;
    const top = main.getBoundingClientRect().top + window.scrollY;
    const recorrido = Math.max(1, main.offsetHeight - window.innerHeight * .65);
    const avance = quieto ? 1 : Math.max(0, Math.min(1, (window.scrollY - top + window.innerHeight * .25) / recorrido));
    camino.style.strokeDashoffset = String(longitud * (1 - avance));
  };
  const pedirPintura = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(pintarSendero);
  };
  window.addEventListener("scroll", pedirPintura, { passive: true });
  window.addEventListener("resize", pedirPintura);
  pedirPintura();

  // 4. La pócima exhala burbujas desde el propio frasco SVG.
  const pocion = main.querySelector(".ornamento-pocion");
  if (pocion) {
    const frasco = document.createElement("div");
    frasco.className = "frasco-vivo";
    pocion.parentNode.insertBefore(frasco, pocion);
    frasco.appendChild(pocion);
    if (!quieto) {
      for (let i = 0; i < 5; i++) {
        const burbuja = document.createElement("span");
        burbuja.className = "emanacion-pocion";
        burbuja.style.setProperty("--offset", (35 + 9 * i) + "%");
        burbuja.style.setProperty("--delay", (-i * .7) + "s");
        frasco.appendChild(burbuja);
      }
    }
  }

  // 5. Un único arcano interactivo con su mensaje al revelarse.
  const carta = document.getElementById("cartaTarot");
  const nombre = document.getElementById("tarotNombre");
  const mensaje = document.getElementById("tarotMensaje");
  const imagen = document.getElementById("tarotIlustracion");
  const mensajeIsaac = document.getElementById("mensajeIsaac");
  if (!carta || !nombre || !mensaje || !imagen) return;

  const cartas = [
    { nombre: "La Estrella", slug: "la-estrella", mensaje: "Una luz serena guía tu camino y te recuerda que aún hay magia esperándote." },
    { nombre: "La Luna", slug: "la-luna", mensaje: "Escucha tu intuición: no todo se revela a simple vista." },
    { nombre: "El Sol", slug: "el-sol", mensaje: "La alegría y la calidez se acercan; deja que tu luz encuentre a los demás." },
    { nombre: "La Emperatriz", slug: "la-emperatriz", mensaje: "La belleza y la creatividad florecen a tu alrededor." },
    { nombre: "La Sacerdotisa", slug: "la-sacerdotisa", mensaje: "El conocimiento oculto se mueve en silencio. Confía en lo que sientes." },
    { nombre: "La Rueda de la Fortuna", slug: "la-rueda", mensaje: "El destino gira y abre un nuevo sendero en el bosque." },
    { nombre: "Los Enamorados", slug: "los-enamorados", mensaje: "Los vínculos y decisiones cobran fuerza; el corazón también habla." },
    { nombre: "El Mago", slug: "el-mago", mensaje: "Tienes las herramientas para transformar lo que imaginas en realidad." }
  ];

  // Próximos cinco arcanos: sus lecturas ya están listas.
  // Por ahora permanecen fuera del sorteo porque las cinco imágenes
  // todavía no están publicadas en assets/tarot/. Se integrarán después.
  const cartasPendientes = [
    {
      nombre: "El Loco",
      slug: "el-loco",
      protagonista: "Totopo",
      mensaje: "Una aventura inesperada te llama. Atrévete a dar el primer paso: incluso la patita más pequeña puede descubrir mundos extraordinarios."
    },
    {
      nombre: "La Fuerza",
      slug: "la-fuerza",
      protagonista: "Ónix",
      mensaje: "Tu mayor poder no está en rugir, sino en la ternura con la que enfrentas lo difícil. Confía en tu corazón valiente."
    },
    {
      nombre: "El Emperador",
      slug: "el-emperador",
      protagonista: "Ónix",
      mensaje: "Ha llegado el momento de construir sobre tierra firme. Protege lo que amas, confía en tus decisiones y gobierna tu propio destino."
    },
    {
      nombre: "La Templanza",
      slug: "la-templanza",
      protagonista: "Lana",
      mensaje: "Entre el sol y la luna existe un equilibrio hecho para ti. Deja que la paciencia mezcle tus sueños con la magia del presente."
    },
    {
      nombre: "El Mundo",
      slug: "el-mundo",
      protagonista: "Lana",
      mensaje: "El universo celebra el camino que has recorrido. Un ciclo florece por completo y, tras él, te espera un horizonte lleno de posibilidades."
    }
  ];

  let anterior = -1;
  let girando = false;
  let visible = false;
  const dormir = ms => new Promise(resolve => setTimeout(resolve, ms));

  const azar = () => {
    let i;
    do { i = Math.floor(Math.random() * cartas.length); }
    while (i === anterior && cartas.length > 1);
    anterior = i;
    return cartas[i];
  };

  const revelar = async () => {
    if (girando) return;
    girando = true;
    carta.disabled = true;

    try {
      if (mensajeIsaac) mensajeIsaac.hidden = true;
      if (visible) {
        carta.classList.remove("revelada");
        if (!quieto) await dormir(530);
        visible = false;
      }

      const resultado = azar();
      nombre.textContent = resultado.nombre;
      mensaje.textContent = resultado.mensaje;
      imagen.src = "assets/tarot/" + resultado.slug + ".svg";
      imagen.alt = "Ilustración de " + resultado.nombre;

      if (!quieto) await dormir(75);
      carta.classList.add("revelada");
      visible = true;
      if (!quieto) await dormir(970);
      if (mensajeIsaac) mensajeIsaac.hidden = false;
      carta.setAttribute("aria-label", "Carta revelada: " + resultado.nombre + ". Toca para descubrir otra carta.");
    } finally {
      carta.disabled = false;
      girando = false;
    }
  };

  carta.addEventListener("click", revelar);
})();
