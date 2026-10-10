/* Reino de los 33 — Música instrumental original generada con Web Audio.
   No requiere archivos externos, ni reproduce sonido sin interacción. */
(() => {
  "use strict";

  const boton = document.getElementById("musicaReino");
  const estado = document.getElementById("musicaEstado");
  if (!boton || !estado) return;

  const AudioAPI = window.AudioContext || window.webkitAudioContext;
  const TIEMPO = 60 / 76; // 76 pulsos/min: lento y tranquilo
  const PULSOS_CICLO = 32; // Ocho compases, bucle sin saltos

  let audio = null;
  let bus = null;
  let volumen = null;
  let tocando = false;
  let intervalo = null;
  let suspenderDespues = null;
  let comienzo = 0;
  let indice = 0;

  // Acordes suaves de aire celta/fantasía, escritos para esta invitación.
  const acordes = [
    [50, 53, 57, 60], [46, 53, 57, 62],
    [41, 53, 57, 60], [48, 52, 55, 62],
    [50, 53, 57, 60], [46, 53, 57, 62],
    [41, 53, 57, 60], [48, 52, 55, 62]
  ];

  // Melodía original en notas MIDI; nunca usa audio de terceros.
  const canto = [
    [69, 72], [74, 72], [69, 67], [67, 64],
    [65, 69], [72, 74], [76, 72], [69, 74]
  ];

  const eventos = [];
  acordes.forEach((acorde, compas) => {
    const base = compas * 4;
    eventos.push({ pulso: base, tipo: "nube", notas: acorde });
    [0, 0.78, 1.55, 2.35, 3.12].forEach((salto, j) => {
      const indiceNota = [0, 2, 3, 1, 2][j];
      eventos.push({ pulso: base + salto, tipo: "arpa", nota: acorde[indiceNota] + 12 });
    });
    eventos.push({ pulso: base + 0.12, tipo: "flauta", nota: canto[compas][0], largo: 1.6 });
    eventos.push({ pulso: base + 2.24, tipo: "flauta", nota: canto[compas][1], largo: 1.26 });
    eventos.push({ pulso: base + 3.55, tipo: "campana", nota: acorde[2] + 24 });
  });
  eventos.sort((a, b) => a.pulso - b.pulso);

  const frecuencia = nota => 440 * Math.pow(2, (nota - 69) / 12);

  function crearSala() {
    const segundos = 1.7;
    const tamano = Math.floor(audio.sampleRate * segundos);
    const respuesta = audio.createBuffer(2, tamano, audio.sampleRate);
    let semilla = 3298;
    for (let canal = 0; canal < 2; canal++) {
      const datos = respuesta.getChannelData(canal);
      for (let i = 0; i < tamano; i++) {
        semilla = (1664525 * semilla + 1013904223) >>> 0;
        const aleatorio = semilla / 4294967296 * 2 - 1;
        datos[i] = aleatorio * Math.pow(1 - i / tamano, 2.9) * 0.56;
      }
    }
    const reverb = audio.createConvolver();
    reverb.buffer = respuesta;
    return reverb;
  }

  function prepararAudio() {
    audio = new AudioAPI();
    bus = audio.createGain();
    const seco = audio.createGain();
    const eco = audio.createGain();
    const sala = crearSala();
    const compresor = audio.createDynamicsCompressor();
    volumen = audio.createGain();

    seco.gain.value = 0.8;
    eco.gain.value = 0.19;
    compresor.threshold.value = -22;
    compresor.ratio.value = 2.8;
    compresor.attack.value = 0.008;
    compresor.release.value = 0.24;
    volumen.gain.value = 0.0001;

    bus.connect(seco);
    bus.connect(sala);
    seco.connect(compresor);
    sala.connect(eco);
    eco.connect(compresor);
    compresor.connect(volumen);
    volumen.connect(audio.destination);
  }

  function voz(nota, instante, duracion, forma, intensidad, ataque = 0.035) {
    const cuando = Math.max(audio.currentTime + 0.004, instante);
    const envolvente = audio.createGain();
    const oscilador = audio.createOscillator();
    oscilador.type = forma;
    oscilador.frequency.setValueAtTime(frecuencia(nota), cuando);
    envolvente.gain.setValueAtTime(0.0001, cuando);
    envolvente.gain.linearRampToValueAtTime(intensidad, cuando + ataque);
    envolvente.gain.exponentialRampToValueAtTime(0.0001, cuando + duracion);
    oscilador.connect(envolvente);
    envolvente.connect(bus);
    oscilador.start(cuando);
    oscilador.stop(cuando + duracion + 0.02);
  }

  function nube(acorde, cuando) {
    acorde.forEach((nota, i) => {
      const instante = cuando + i * 0.035;
      voz(nota, instante, 4.6 * TIEMPO, "sine", 0.014, 0.72);
    });
  }

  function arpa(nota, cuando) {
    voz(nota, cuando, 2.15, "triangle", 0.061, 0.012);
    voz(nota + 12, cuando, 1.26, "sine", 0.011, 0.014);
  }

  function flauta(nota, cuando, largo) {
    const duracion = largo * TIEMPO + 0.52;
    voz(nota, cuando, duracion, "sine", 0.044, 0.22);
    voz(nota + 12, cuando + 0.05, duracion - 0.18, "sine", 0.008, 0.23);
  }

  function campana(nota, cuando) {
    voz(nota, cuando, 2.5, "sine", 0.026, 0.008);
    voz(nota + 19, cuando, 1.4, "sine", 0.006, 0.006);
  }

  function programarSonidos() {
    if (!tocando || !audio) return;
    const horizonte = audio.currentTime + 0.42;

    while (comienzo + eventos[indice].pulso * TIEMPO < horizonte) {
      const evento = eventos[indice];
      const cuando = comienzo + evento.pulso * TIEMPO;

      if (cuando >= audio.currentTime - 0.1) {
        if (evento.tipo === "nube") nube(evento.notas, cuando);
        if (evento.tipo === "arpa") arpa(evento.nota, cuando);
        if (evento.tipo === "flauta") flauta(evento.nota, cuando, evento.largo);
        if (evento.tipo === "campana") campana(evento.nota, cuando);
      }

      indice++;
      if (indice === eventos.length) {
        indice = 0;
        comienzo += PULSOS_CICLO * TIEMPO;
      }
    }
  }

  function actualizarBoton() {
    boton.classList.toggle("sonando", tocando);
    boton.setAttribute("aria-pressed", String(tocando));
    boton.setAttribute(
      "aria-label",
      tocando ? "Pausar la melodía del reino" : "Activar la melodía del reino"
    );
    estado.textContent = tocando ? "Pausar música" : "Activar música";
  }

  async function activar() {
    if (!AudioAPI) {
      estado.textContent = "Audio no disponible";
      boton.disabled = true;
      return;
    }
    try {
      if (suspenderDespues !== null) {
        clearTimeout(suspenderDespues);
        suspenderDespues = null;
      }
      if (!audio) prepararAudio();
      await audio.resume();
      comienzo = audio.currentTime + 0.08;
      indice = 0;
      tocando = true;
      volumen.gain.cancelScheduledValues(audio.currentTime);
      volumen.gain.setValueAtTime(Math.max(0.0001, volumen.gain.value), audio.currentTime);
      volumen.gain.linearRampToValueAtTime(0.7, audio.currentTime + 1.1);
      programarSonidos();
      intervalo = setInterval(programarSonidos, 110);
      actualizarBoton();
    } catch (error) {
      tocando = false;
      estado.textContent = "No se pudo iniciar";
      boton.setAttribute("aria-pressed", "false");
    }
  }

  function pausar() {
    tocando = false;
    if (intervalo !== null) {
      clearInterval(intervalo);
      intervalo = null;
    }
    if (audio && volumen) {
      const ahora = audio.currentTime;
      volumen.gain.cancelScheduledValues(ahora);
      volumen.gain.setValueAtTime(Math.max(0.0001, volumen.gain.value), ahora);
      volumen.gain.exponentialRampToValueAtTime(0.0001, ahora + 0.48);
      suspenderDespues = setTimeout(() => {
        if (!tocando && audio && audio.state === "running") audio.suspend();
        suspenderDespues = null;
      }, 700);
    }
    actualizarBoton();
  }

  boton.addEventListener("click", () => {
    if (tocando) pausar();
    else activar();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && tocando) pausar();
  });

  if (!AudioAPI) {
    boton.disabled = true;
    estado.textContent = "Audio no disponible";
  }
})();
