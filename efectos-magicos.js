// Progresivo: si falla el script, la información principal sigue disponible.
(() => {
  const secciones = document.querySelectorAll("main .seccion");
  if (!secciones.length) return;

  const despertar = (el) => el.classList.add("bosque-despierto");
  const menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (menosMovimiento || !("IntersectionObserver" in window)) {
    secciones.forEach(despertar);
    return;
  }

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      despertar(entrada.target);
      observador.unobserve(entrada.target);
    });
  }, { threshold: 0.12 });

  secciones.forEach((seccion) => observador.observe(seccion));
})();
