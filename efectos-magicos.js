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

  // 3. Sendero central y enredaderas laterales, dibujados según el scroll.
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "sendero-svg");
  svg.setAttribute("viewBox", "0 0 1000 1000");
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true");
  const crearPath = (d, clase) => {
    const p = document.createElementNS(NS, "path");
    p.setAttribute("class", clase);
    p.setAttribute("d", d);
    svg.appendChild(p);
    return p;
  };
  const trazos = [
    crearPath("M500 0 C405 75 650 125 510 215 S410 320 525 410 S620 550 492 615 S418 820 510 1000", "trazo-sendero"),
    crearPath("M48 0 C92 70 17 100 53 190 S96 310 55 390 S20 590 73 685 S35 830 62 1000", "trazo-rama"),
    crearPath("M952 0 C905 75 987 145 942 220 S905 365 962 450 S980 650 931 715 S984 875 945 1000", "trazo-rama")
  ];
  const longitudes = trazos.map(p => {
    const len = p.getTotalLength();
    p.style.strokeDasharray = String(len);
    p.style.strokeDashoffset = quieto ? "0" : String(len);
    return len;
  });
  const brotes = [];
  for (let i = 1; i <= 18; i++) {
    const y = i * 51;
    const izquierda = i % 2 === 0;
    const x = izquierda ? (i % 4 ? 54 : 75) : (i % 3 ? 942 : 918);
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", "brote");
    g.setAttribute("transform", `translate(${x} ${y}) rotate(${izquierda ? -35 : 35})`);
    const leaf = document.createElementNS(NS, "path");
    leaf.setAttribute("d", "M0 0 Q-11 -14 0 -24 Q13 -12 0 0Z M0 0 Q12 5 20 -7 Q7 -8 0 0Z");
    g.appendChild(leaf);
    svg.appendChild(g);
    brotes.push({ el: g, at: i / 19 });
  }
  main.insertBefore(svg, main.firstChild);

  let pending = false;
  const pintarSendero = () => {
    pending = false;
    const top = main.getBoundingClientRect().top + window.scrollY;
    const recorrido = Math.max(1, main.offsetHeight - window.innerHeight * .65);
    const avance = quieto ? 1 : Math.max(0, Math.min(1, (window.scrollY - top + window.innerHeight * .25) / recorrido));
    trazos.forEach((p, i) => { p.style.strokeDashoffset = String(longitudes[i] * (1 - avance)); });
    brotes.forEach(({el, at}) => el.classList.toggle("nacido", quieto || avance >= at));
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

  // 5. Tarot de ocho arcanos ilustrados y reverso 3D real.
  const carta = document.getElementById("cartaTarot");
  const nombre = document.getElementById("tarotNombre");
  const mensaje = document.getElementById("tarotMensaje");
  const imagen = document.getElementById("tarotIlustracion");
  const ayuda = document.getElementById("tarotAyuda");
  const mensajeIsaac = document.getElementById("mensajeIsaac");
  const otraCarta = document.getElementById("otraCarta");
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
  let anterior = -1;
  let girando = false;
  let visible = false;
  const dormir = ms => new Promise(res => setTimeout(res, ms));
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
    mensajeIsaac.hidden = true;
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
    mensajeIsaac.hidden = false;
    ayuda.textContent = "Tu arcano ha sido revelado.";
    carta.setAttribute("aria-label", "Carta revelada: " + resultado.nombre);
    carta.disabled = false;
    girando = false;
  };
  carta.addEventListener("click", revelar);
  if (otraCarta) otraCarta.addEventListener("click", revelar);
})();
