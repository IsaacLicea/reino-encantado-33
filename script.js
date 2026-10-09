const boton = document.getElementById("abrirPortal");
const portal = document.getElementById("portal");
const reino = document.getElementById("reino");

boton.addEventListener("click", () => {
  reino.hidden = false;
  portal.style.opacity = "0";
  portal.style.pointerEvents = "none";

  setTimeout(() => {
    portal.hidden = true;
  }, 1300);
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
