/* Sonidos originales del Reino de los 33. Web Audio: sin MP3 adicionales.
   Ambos se activan exclusivamente con un clic del visitante. */
(() => {
  "use strict";
  const AudioAPI = window.AudioContext || window.webkitAudioContext;
  let ctx;

  function comenzar(componer, duracion, volumen) {
    if (!AudioAPI) return;
    try {
      if (!ctx || ctx.state === "closed") ctx = new AudioAPI();
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      const t = ctx.currentTime + 0.015;
      const salida = ctx.createGain();
      salida.gain.value = volumen;
      salida.connect(ctx.destination);
      componer(ctx, salida, t);
      setTimeout(() => { try { salida.disconnect(); } catch {} }, (duracion + 0.5) * 1000);
    } catch {
      // Sin audio, las animaciones continúan normalmente.
    }
  }

  function volumen(ctx, salida, t, duracion, ataque, intensidad) {
    const v = ctx.createGain();
    v.gain.setValueAtTime(0.0001, t);
    v.gain.exponentialRampToValueAtTime(intensidad, t + ataque);
    v.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
    v.connect(salida);
    return v;
  }

  function viento(ctx, salida, t, duracion, inicio, cima, final, intensidad, ataque) {
    const n = Math.ceil(ctx.sampleRate * duracion);
    const buffer = ctx.createBuffer(1, n, ctx.sampleRate);
    const canal = buffer.getChannelData(0);
    for (let i = 0; i < n; i++) canal[i] = Math.random() * 2 - 1;
    const fuente = ctx.createBufferSource();
    fuente.buffer = buffer;
    const filtro = ctx.createBiquadFilter();
    filtro.type = "bandpass";
    filtro.Q.value = 0.72;
    filtro.frequency.setValueAtTime(inicio, t);
    filtro.frequency.exponentialRampToValueAtTime(cima, t + duracion * 0.59);
    filtro.frequency.exponentialRampToValueAtTime(final, t + duracion);
    fuente.connect(filtro);
    filtro.connect(volumen(ctx, salida, t, duracion, ataque, intensidad));
    fuente.start(t);
    fuente.stop(t + duracion);
  }

  function aura(ctx, salida, t, duracion, notas, intensidad, ataque) {
    notas.forEach((nota, i) => {
      const voz = ctx.createOscillator();
      voz.type = i % 2 ? "triangle" : "sine";
      voz.frequency.setValueAtTime(nota * 0.985, t);
      voz.frequency.exponentialRampToValueAtTime(nota, t + duracion * 0.47);
      const env = volumen(ctx, salida, t, duracion, ataque, intensidad / Math.sqrt(notas.length));
      voz.connect(env);
      voz.start(t);
      voz.stop(t + duracion);
    });
  }

  function sello(ctx, salida, t, duracion, intensidad) {
    const grave = ctx.createOscillator();
    grave.type = "sine";
    grave.frequency.setValueAtTime(175, t);
    grave.frequency.exponentialRampToValueAtTime(67, t + duracion);
    grave.connect(volumen(ctx, salida, t, duracion, 0.028, intensidad));
    grave.start(t);
    grave.stop(t + duracion);
  }

  function abrirPortal() {
    comenzar((ctx, salida, t) => {
      // Crescendo del vórtice hasta el destello del segundo 1.05.
      viento(ctx, salida, t, 1.88, 230, 2250, 620, 0.82, 0.65);
      aura(ctx, salida, t + 0.12, 2.08, [146.83, 220, 293.66, 440], 0.34, 0.72);
      viento(ctx, salida, t + 0.73, 0.9, 450, 3250, 800, 0.36, 0.30);
      sello(ctx, salida, t + 1.05, 0.8, 0.44);
    }, 2.25, 0.23);
  }

  function girarTarot() {
    comenzar((ctx, salida, t) => {
      // El giro original se conserva. Sin campanitas: ahora hay una
      // revelación teatral, de acorde velado y sello de energía.
      viento(ctx, salida, t, 0.62, 450, 2100, 780, 0.69, 0.12);
      aura(ctx, salida, t + 0.42, 1.05, [174.61, 207.65, 261.63, 349.23], 0.33, 0.17);
      sello(ctx, salida, t + 0.55, 0.67, 0.31);
      viento(ctx, salida, t + 0.49, 0.50, 300, 1500, 420, 0.27, 0.13);
    }, 1.48, 0.22);
  }

  window.SonidosDelReino = Object.freeze({ abrirPortal, girarTarot });
})();