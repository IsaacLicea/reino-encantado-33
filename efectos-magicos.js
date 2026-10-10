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
  const cantidad = quieto ? 0 : (window.innerWidth <= 700 ? 12 : 38);
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
  {
    nombre: "La Estrella",
    slug: "la-estrella",
    mensaje: "Una luz serena guía tus patitas por el camino correcto. Incluso en la noche más tranquila, siempre hay magia esperándote."
  },
  {
    nombre: "La Luna",
    slug: "la-luna",
    mensaje: "Confía en tu olfato y en tu intuición perruna: no todo se revela a simple vista, pero tu corazón sabe por dónde ir."
  },
  {
    nombre: "El Sol",
    slug: "el-sol",
    mensaje: "La alegría te envuelve como un rayo tibio sobre el lomito. Es momento de correr, brillar y contagiar tu luz a los demás."
  },
  {
    nombre: "La Emperatriz",
    slug: "la-emperatriz",
    mensaje: "La dulzura, la belleza y el cariño florecen a tu alrededor. Tu presencia convierte cualquier rincón en un jardín encantado."
  },
  {
    nombre: "La Sacerdotisa",
    slug: "la-sacerdotisa",
    mensaje: "Hay sabiduría en tu silencio y magia en tu mirada. Escucha con calma esa voz interior que mueve tus patitas con certeza."
  },
  {
    nombre: "Los Enamorados",
    slug: "los-enamorados",
    mensaje: "Los lazos del corazón se hacen más fuertes. Déjate guiar por el amor, la lealtad y esa alegría de estar con quienes más quieres."
  },
  {
    nombre: "El Mago",
    slug: "el-mago",
    mensaje: "Tienes dentro de ti la chispa para transformar lo cotidiano en algo extraordinario. Con valentía, ternura y un toque de magia, todo es posible."
  },
  {
    nombre: "El Loco",
    slug: "el-loco",
    mensaje: "Una aventura inesperada mueve tu colita. Atrévete a dar el primer paso: hasta las patitas más pequeñas pueden descubrir mundos enormes."
  },
  {
    nombre: "La Fuerza",
    slug: "la-fuerza",
    mensaje: "Tu verdadero poder está en el corazón noble con el que enfrentas la vida. La ternura también puede ser valiente, firme y luminosa."
  },
  {
    nombre: "El Emperador",
    slug: "el-emperador",
    mensaje: "Es tiempo de cuidar tu reino, proteger lo que amas y mantenerte firme como guardián leal. Tu presencia inspira seguridad y confianza."
  },
  {
    nombre: "La Templanza",
    slug: "la-templanza",
    mensaje: "Entre juegos, siestas y estrellas, todo encuentra su equilibrio. La paciencia y la calma mezclarán tu magia con el momento perfecto."
  },
  {
    nombre: "El Mundo",
    slug: "el-mundo",
    mensaje: "El universo celebra cada huellita de tu camino. Un ciclo se completa con alegría y frente a ti se abre un horizonte inmenso y brillante."
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
      imagen.src = "assets/tarot/" + resultado.slug + ".webp";
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

     // 6. Hada voladora por todo el reino, dejando destellos.
  if (!quieto) {
    const capaHada = document.createElement("div");
    capaHada.className = "capa-hada-magica";
    capaHada.setAttribute("aria-hidden", "true");
    main.appendChild(capaHada);

    const hada = document.createElement("div");
    hada.className = "hada-voladora";
    capaHada.appendChild(hada);

    let ultimoX = 0;
    let ultimoDestello = 0;

    const crearDestello = (x, y) => {
      const destello = document.createElement("span");
      destello.className = "destello-hada";
      destello.style.left = `${x}px`;
      destello.style.top = `${y}px`;
      destello.style.setProperty("--dx", `${(Math.random() - 0.5) * 18}px`);
      destello.style.setProperty("--dy", `${-10 - Math.random() * 16}px`);
      destello.style.setProperty("--duracion", `${1 + Math.random() * 0.55}s`);
      capaHada.appendChild(destello);

      destello.addEventListener(
        "animationend",
        () => destello.remove(),
        { once: true }
      );
    };

    const animarHada = (ts) => {
      if (main.hidden || main.clientWidth < 60 || main.scrollHeight < 120) {
        requestAnimationFrame(animarHada);
        return;
      }

      const t = ts / 1000;
      const vh = Math.max(window.innerHeight, 480);

      const rect = main.getBoundingClientRect();
      const topDoc = rect.top + window.scrollY;

      const ancho = Math.max(main.clientWidth, 320);
      const alto = Math.max(main.scrollHeight, vh);

      const x = Math.max(
        28,
        Math.min(
          ancho - 28,
          ancho * 0.16 +
            ((Math.sin(t * 0.34) + 1) / 2) * (ancho * 0.68) +
            Math.sin(t * 1.45) * 18
        )
      );

      const yBase = (window.scrollY - topDoc) + vh * 0.14;

      const y = Math.max(
        26,
        Math.min(
          alto - 40,
          yBase +
            ((Math.sin(t * 0.23 + 1.2) + 1) / 2) * (vh * 0.62) +
            Math.cos(t * 1.12) * 12
        )
      );

      const haciaDerecha = x >= ultimoX;
      const inclinacion = Math.sin(t * 1.7) * 8;

      hada.style.transform =
        `translate(${x}px, ${y}px) scaleX(${haciaDerecha ? 1 : -1}) rotate(${inclinacion}deg)`;

      if (ts - ultimoDestello > 120) {
        crearDestello(x + (haciaDerecha ? 6 : 20), y + 16);

        if (Math.random() > 0.55) {
          crearDestello(x + 12, y + 8);
        }

        ultimoDestello = ts;
      }

      ultimoX = x;
      requestAnimationFrame(animarHada);
    };

    requestAnimationFrame(animarHada);
  }
   
})();


// Desdoblar el mapa al llegar a él, sin dejarlo invisible en iPhone.
const mapaEscena = document.getElementById("mapaEscena");
if (mapaEscena) {
  const movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (movimientoReducido || !("IntersectionObserver" in window)) {
    mapaEscena.classList.add("activo");
  } else {
    const obsMapa = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting)) {
        mapaEscena.classList.add("activo");
        obsMapa.disconnect();
      }
    }, { threshold: 0.12 });
    obsMapa.observe(mapaEscena);
  }
}
