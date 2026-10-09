// =====================================
// APERTURA DEL PORTAL ENCANTADO
// =====================================

const boton = document.getElementById("abrirPortal");
const saltarIntro = document.getElementById("saltarIntro");
const portal = document.getElementById("portal");
const reino = document.getElementById("reino");

const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)");

let portalAbierto = false;

function finalizarApertura() {
  portal.hidden = true;

  document.body.classList.remove("animando-portal");

  document.body.classList.add("reino-aparece");

  window.scrollTo(0, 0);
}

function abrirReino(conAnimacion = true) {
  // Evita activar el hechizo dos veces.
  if (portalAbierto) return;
  portalAbierto = true;

  boton.disabled = true;

  // Preparamos el contenido de fondo.
  reino.hidden = false;

  const animar = conAnimacion && !reducirMovimiento.matches;

  if (!animar) {
    finalizarApertura();
    return;
  }

  document.body.classList.add("animando-portal");

  // Comienza el conjuro.
  portal.classList.add("lanzando");

  // La luz empieza a revelar el sitio.
  setTimeout(() => {
    portal.classList.add("saliendo");
  }, 1050);

  // Finaliza la transición.
  setTimeout(() => {
    finalizarApertura();
  }, 2150);
}

boton.addEventListener("click", () => {
  abrirReino(true);
});

saltarIntro.addEventListener("click", () => {
  abrirReino(false);
});

// Fecha del evento
const fechaEvento = new Date("2026-11-28T15:33:00-06:00").getTime();

function actualizarContador() {
  const ahora = Date.now();
  const diferencia = Math.max(0, fechaEvento - ahora);

  const dias = Math.floor(diferencia / 86400000);
  const horas = Math.floor(diferencia / 3600000) % 24;
  const minutos = Math.floor(diferencia / 60000) % 60;
  const segundos = Math.floor(diferencia / 1000) % 60;

  document.getElementById("dias").textContent = String(dias).padStart(2, "0");
  document.getElementById("horas").textContent = String(horas).padStart(2, "0");
  document.getElementById("minutos").textContent = String(minutos).padStart(
    2,
    "0",
  );
  document.getElementById("segundos").textContent = String(segundos).padStart(
    2,
    "0",
  );
}

actualizarContador();
setInterval(actualizarContador, 1000);

// ===================================
// INVITACIONES INDIVIDUALES
// ===================================

const parametros = new URLSearchParams(window.location.search);

const tokenInvitado = parametros.get("inv");

const marcoRSVP = document.getElementById("formulario-rsvp");

const mensajeSinPase = document.getElementById("sin-pase");

const enlaceDirecto = document.getElementById("abrir-rsvp");

const tokenValido = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(
  tokenInvitado || "",
);

if (tokenValido) {
  const urlBase = marcoRSVP.dataset.appUrl;

  const separador = urlBase.includes("?") ? "&" : "?";

  const urlFormulario =
    urlBase + separador + "inv=" + encodeURIComponent(tokenInvitado);

  marcoRSVP.src = urlFormulario;
  enlaceDirecto.href = urlFormulario;
  enlaceDirecto.hidden = false;
} else {
  marcoRSVP.hidden = true;
  mensajeSinPase.hidden = false;
}

// =====================================
// MAPA EXCLUSIVO PARA INVITADOS
// =====================================

const mapaPrivado = document.getElementById("mapa-privado");

const avisoMapa = document.getElementById("mapa-sin-pase");

if (tokenValido) {
  // Reutilizamos el enlace de Apps Script
  // que ya está configurado en el RSVP.
  const urlMapa = new URL(marcoRSVP.dataset.appUrl);

  urlMapa.searchParams.set("inv", tokenInvitado);

  urlMapa.searchParams.set("vista", "mapa");

  mapaPrivado.src = urlMapa.toString();
  mapaPrivado.hidden = false;
  avisoMapa.hidden = true;
} else {
  mapaPrivado.hidden = true;
  avisoMapa.hidden = false;
}

// =====================================
// LUCIÉRNAGAS DEL BOSQUE
// =====================================

function crearLuciernagas(idContenedor, cantidad) {
  const contenedor = document.getElementById(idContenedor);

  if (!contenedor || reducirMovimiento.matches) {
    return;
  }

  const fragmento = document.createDocumentFragment();

  for (let i = 0; i < cantidad; i++) {
    const luz = document.createElement("span");
    luz.className = "luciernaga";

    const x = 5 + Math.random() * 90;
    const y = 5 + Math.random() * 90;
    const duracion = 4 + Math.random() * 5;
    const retraso = -Math.random() * 8;
    const tamano = 2 + Math.random() * 3;

    luz.style.left = x + "%";
    luz.style.top = y + "%";

    luz.style.setProperty("--dur", duracion + "s");

    luz.style.setProperty("--delay", retraso + "s");

    luz.style.setProperty("--size", tamano + "px");

    fragmento.appendChild(luz);
  }

  contenedor.appendChild(fragmento);
}

crearLuciernagas("luciernagasPortal", 18);
crearLuciernagas("luciernagasHero", 24);
