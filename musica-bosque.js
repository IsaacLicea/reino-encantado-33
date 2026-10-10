/* Reino de los 33 — "El susurro del bosque".
   Banda sonora original con instrumentos modelados con Web Audio:
   arpa de cuerda pulsada, flauta con aire, cuerdas suaves y campanillas.
   No hay reproducción automática, ni audio externo, ni anuncios. */
(() => {
  "use strict";

  const boton = document.getElementById("musicaReino");
  const estado = document.getElementById("musicaEstado");
  if (!boton || !estado) return;

  const AudioAPI = window.AudioContext || window.webkitAudioContext;
  const PULSO = 60 / 74;
  const COMPASES = 32;
  const DURACION_CICLO = COMPASES * 4 * PULSO;
  const frecuencia = nota => 440 * Math.pow(2, (nota - 69) / 12);

  let audio = null;
  let bus = null;
  let master = null;
  let tocando = false;
  let intervalo = null;
  let apagarDespues = null;
  let inicioCiclo = 0;
  let siguienteEvento = 0;
  let ruido = null;
  const cuerdas = new Map();

  // Armonía original en re menor/dórico: antiguos caminos y bosque luminoso.
  const armonia = [
    [50, 53, 57, 64], [46, 53, 57, 62],
    [41, 53, 57, 60], [48, 55, 60, 62],
    [43, 50, 58, 62], [46, 53, 57, 62],
    [41, 53, 57, 60], [45, 52, 57, 62]
  ];
  // Motivo melódico compuesto para la invitación: sin muestras ni obras ajenas.
  const melodia = [
    [[0.48, 69, 1.45], [2.34, 72, 1.26]],
    [[0.42, 74, 1.68], [2.43, 72, 1.22]],
    [[0.38, 69, 1.42], [2.35, 67, 1.18]],
    [[0.45, 67, 1.35], [2.25, 64, 1.55]],
    [[0.4, 70, 1.53], [2.34, 74, 1.2]],
    [[0.5, 72, 1.5], [2.3, 74, 1.32]],
    [[0.44, 76, 1.48], [2.38, 72, 1.22]],
    [[0.4, 69, 1.5], [2.38, 74, 1.44]]
  ];

  // Cuatro movimientos: despertar, encuentro, vuelo y regreso al claro.
  const eventos = [];
  for (let compas = 0; compas < COMPASES; compas++) {
    const acorde = armonia[compas % 8];
    const base = compas * 4;
    const apertura = compas < 4;
    const esplendor = compas >= 16 && compas < 25;
    const despedida = compas >= 28;
    const energia = apertura ? 0.63 : esplendor ? 1.02 : despedida ? 0.63 : 0.84;

    if (compas >= 2 && !despedida || compas === 28 || compas === 30) {
      eventos.push({
        pulso: base, tipo: "cuerdas", notas: acorde.slice(1),
        intensidad: esplendor ? 1.0 : 0.73
      });
    }
    if (esplendor && compas % 2 === 0) {
      eventos.push({ pulso: base + 0.1, tipo: "violonchelo", nota: acorde[0] - 12 });
    }

    const arpegio = [0, 2, 3, 1, 2, 3];
    const pasos = apertura || despedida ?
      [0.10, 1.11, 2.10, 3.12] :
      [0.10, 0.79, 1.54, 2.21, 2.93, 3.55];
    pasos.forEach((paso, i) => {
      eventos.push({
        pulso: base + paso, tipo: "arpa",
        nota: acorde[arpegio[i]] + 12,
        intensidad: energia * (i === 0 ? 1.0 : 0.84),
        paneo: ((compas + i) % 5 - 2) * .16
      });
    });

    if (!apertura && !despedida || compas === 28 || compas === 30) {
      melodia[compas % 8].forEach(([paso, nota, largo], i) => {
        let registro = nota;
        if (esplendor && i === 1 && compas % 4 === 2) registro += 2;
        eventos.push({
          pulso: base + paso, tipo: "flauta", nota: registro,
          largo, intensidad: esplendor ? .94 : despedida ? .56 : .75
        });
      });
    }
    if (compas % 2 === 1 && compas < 29) {
      eventos.push({
        pulso: base + 3.3, tipo: "campanilla",
        nota: acorde[2] + (esplendor ? 24 : 19),
        intensidad: esplendor ? .85 : .53
      });
    }
  }
  eventos.sort((a, b) => a.pulso - b.pulso);

  function conectarConPan(nodo, paneo) {
    if (audio.createStereoPanner) {
      const panner = audio.createStereoPanner();
      panner.pan.value = paneo;
      nodo.connect(panner);
      panner.connect(bus);
    } else {
      nodo.connect(bus);
    }
  }

  function crearReverberacion() {
    const largo = 2.55;
    const cantidad = Math.floor(audio.sampleRate * largo);
    const impulso = audio.createBuffer(2, cantidad, audio.sampleRate);
    let semilla = 58124;
    for (let canal = 0; canal < 2; canal++) {
      const muestras = impulso.getChannelData(canal);
      let previo = 0;
      for (let i = 0; i < cantidad; i++) {
        semilla = (1664525 * semilla + 1013904223) >>> 0;
        const azar = (semilla / 4294967296) * 2 - 1;
        previo = previo * .13 + azar * .87;
        muestras[i] = previo * .54 * Math.pow(1 - i / cantidad, 2.9);
      }
    }
    const sala = audio.createConvolver();
    sala.buffer = impulso;
    return sala;
  }

  function iniciarSonido() {
    audio = new AudioAPI();
    bus = audio.createGain();
    const seco = audio.createGain();
    const rever = audio.createGain();
    const sala = crearReverberacion();
    const compresor = audio.createDynamicsCompressor();
    master = audio.createGain();

    seco.gain.value = .79;
    rever.gain.value = .23;
    compresor.threshold.value = -25;
    compresor.knee.value = 18;
    compresor.ratio.value = 2.8;
    compresor.attack.value = .012;
    compresor.release.value = .33;
    master.gain.value = .0001;

    bus.connect(seco);
    bus.connect(sala);
    seco.connect(compresor);
    sala.connect(rever);
    rever.connect(compresor);
    compresor.connect(master);
    master.connect(audio.destination);

    // El aire de la flauta usa ruido filtrado muy tenue, no sonidos grabados.
    const tamaño = Math.floor(audio.sampleRate * 1.1);
    ruido = audio.createBuffer(1, tamaño, audio.sampleRate);
    const datos = ruido.getChannelData(0);
    let semilla = 31981;
    for (let i = 0; i < tamaño; i++) {
      semilla = (1103515245 * semilla + 12345) >>> 0;
      datos[i] = (semilla / 4294967296) * 2 - 1;
    }
  }

  // Síntesis física de una cuerda real: resonancia por realimentación
  // y atenuación natural de armónicos (Karplus-Strong).
  function muestraArpa(nota) {
    if (cuerdas.has(nota)) return cuerdas.get(nota);
    const sr = audio.sampleRate;
    const longitud = Math.floor(sr * 3.1);
    const muestra = audio.createBuffer(1, longitud, sr);
    const datos = muestra.getChannelData(0);
    const periodo = Math.max(12, Math.round(sr / frecuencia(nota)));
    const anillo = new Float32Array(periodo);
    let semilla = (nota * 131071 + 81) >>> 0;
    for (let i = 0; i < periodo; i++) {
      semilla = (1664525 * semilla + 1013904223) >>> 0;
      const azar = semilla / 4294967296 * 2 - 1;
      anillo[i] = .46 * azar + .18 * Math.sin(i / periodo * Math.PI * 2);
    }
    const perdida = nota > 76 ? .9944 : .9965;
    let indice = 0;
    for (let i = 0; i < longitud; i++) {
      const actual = anillo[indice];
      const proximo = anillo[(indice + 1) % periodo];
      datos[i] = actual * Math.exp(-i / sr * .38);
      anillo[indice] = ((actual + proximo) * .5) * perdida;
      indice++;
      if (indice === periodo) indice = 0;
    }
    cuerdas.set(nota, muestra);
    return muestra;
  }

  function arpa(nota, cuando, intensidad = 1, paneo = 0) {
    const fuente = audio.createBufferSource();
    fuente.buffer = muestraArpa(nota);
    fuente.playbackRate.value = 1 + (Math.random() - .5) * .003;
    const filtro = audio.createBiquadFilter();
    filtro.type = "lowpass";
    filtro.frequency.value = 4600;
    const salida = audio.createGain();
    salida.gain.value = .20 * intensidad;
    fuente.connect(filtro);
    filtro.connect(salida);
    conectarConPan(salida, paneo);
    fuente.start(cuando);
    fuente.stop(cuando + 3.05);
  }

  // Arco suave: dos osciladores con vibración y filtro que florece.
  function cuerdasSuaves(nota, cuando, duracion, intensidad, paneo = 0) {
    const filtro = audio.createBiquadFilter();
    filtro.type = "lowpass";
    filtro.Q.value = .43;
    filtro.frequency.setValueAtTime(520, cuando);
    filtro.frequency.linearRampToValueAtTime(1680, cuando + 1.8);
    filtro.frequency.linearRampToValueAtTime(760, cuando + duracion);

    const ganancia = audio.createGain();
    ganancia.gain.setValueAtTime(.0001, cuando);
    ganancia.gain.linearRampToValueAtTime(.025 * intensidad, cuando + Math.min(1.25, duracion * .35));
    ganancia.gain.setValueAtTime(.023 * intensidad, cuando + Math.max(1.28, duracion - .95));
    ganancia.gain.exponentialRampToValueAtTime(.0001, cuando + duracion);
    filtro.connect(ganancia);
    conectarConPan(ganancia, paneo);

    [["triangle", 0], ["sawtooth", 5.2]].forEach(([onda, cents], i) => {
      const oscilador = audio.createOscillator();
      const nivel = audio.createGain();
      oscilador.type = onda;
      oscilador.frequency.value = frecuencia(nota);
      oscilador.detune.value = cents;
      nivel.gain.value = i === 0 ? .87 : .21;
      oscilador.connect(nivel);
      nivel.connect(filtro);
      oscilador.start(cuando);
      oscilador.stop(cuando + duracion + .025);
    });
  }

  function flauta(nota, cuando, largo, intensidad) {
    const duracion = largo * PULSO + .5;
    const salida = audio.createGain();
    const ataque = Math.min(.31, duracion * .26);
    salida.gain.setValueAtTime(.0001, cuando);
    salida.gain.linearRampToValueAtTime(.060 * intensidad, cuando + ataque);
    salida.gain.setValueAtTime(.054 * intensidad, cuando + Math.max(ataque + .05, duracion - .42));
    salida.gain.exponentialRampToValueAtTime(.0001, cuando + duracion);
    conectarConPan(salida, .12);

    [1, 2].forEach((multiplo, i) => {
      const oscilador = audio.createOscillator();
      const nivel = audio.createGain();
      oscilador.type = "sine";
      oscilador.frequency.value = frecuencia(nota) * multiplo;
      nivel.gain.value = i ? .16 : 1;
      oscilador.connect(nivel);
      nivel.connect(salida);
      oscilador.start(cuando);
      oscilador.stop(cuando + duracion + .01);
      if (!i) {
        const lfo = audio.createOscillator();
        const vibracion = audio.createGain();
        lfo.type = "sine";
        lfo.frequency.value = 4.5 + (nota % 4) * .18;
        vibracion.gain.value = frecuencia(nota) * .002;
        lfo.connect(vibracion);
        vibracion.connect(oscilador.frequency);
        lfo.start(cuando);
        lfo.stop(cuando + duracion + .01);
      }
    });

    const aire = audio.createBufferSource();
    aire.buffer = ruido;
    aire.loop = true;
    const filtro = audio.createBiquadFilter();
    filtro.type = "bandpass";
    filtro.frequency.value = frecuencia(nota) * 1.55;
    filtro.Q.value = .55;
    const susurro = audio.createGain();
    susurro.gain.value = .0035 * intensidad;
    aire.connect(filtro);
    filtro.connect(susurro);
    susurro.connect(salida);
    aire.start(cuando);
    aire.stop(cuando + duracion + .02);
  }

  function campanilla(nota, cuando, intensidad) {
    [1, 2.03, 3.91].forEach((multiplo, i) => {
      const oscilador = audio.createOscillator();
      const salida = audio.createGain();
      oscilador.type = "sine";
      oscilador.frequency.value = frecuencia(nota) * multiplo;
      salida.gain.setValueAtTime(.0001, cuando);
      salida.gain.linearRampToValueAtTime((i ? .011 : .027) * intensidad, cuando + .007);
      salida.gain.exponentialRampToValueAtTime(.0001, cuando + (i ? 1.2 : 2.3));
      oscilador.connect(salida);
      conectarConPan(salida, -.26);
      oscilador.start(cuando);
      oscilador.stop(cuando + (i ? 1.25 : 2.35));
    });
  }

  function tocar(evento, cuando) {
    if (evento.tipo === "arpa") arpa(evento.nota, cuando, evento.intensidad, evento.paneo);
    else if (evento.tipo === "flauta") flauta(evento.nota, cuando, evento.largo, evento.intensidad);
    else if (evento.tipo === "campanilla") campanilla(evento.nota, cuando, evento.intensidad);
    else if (evento.tipo === "cuerdas") {
      evento.notas.forEach((nota, i) =>
        cuerdasSuaves(nota, cuando + i * .07, 4.5 * PULSO, evento.intensidad, (i - 1) * .3)
      );
    } else if (evento.tipo === "violonchelo") {
      cuerdasSuaves(evento.nota, cuando, 7.5 * PULSO, .66, -.1);
    }
  }

  function programar() {
    if (!tocando || !audio) return;
    const horizonte = audio.currentTime + .36;
    let revisados = 0;
    while (inicioCiclo + eventos[siguienteEvento].pulso * PULSO < horizonte && revisados++ < 400) {
      const evento = eventos[siguienteEvento];
      const cuando = inicioCiclo + evento.pulso * PULSO;
      if (cuando >= audio.currentTime + .005) {
        tocar(evento, cuando);
      }
      siguienteEvento++;
      if (siguienteEvento === eventos.length) {
        siguienteEvento = 0;
        inicioCiclo += DURACION_CICLO;
      }
    }
  }

  function reflejarEstado() {
    boton.classList.toggle("sonando", tocando);
    boton.setAttribute("aria-pressed", String(tocando));
    boton.setAttribute(
      "aria-label",
      tocando ? "Pausar la sinfonía del bosque" : "Activar la sinfonía del bosque"
    );
    estado.textContent = tocando ? "Pausar música" : "Activar música";
  }

  async function iniciar() {
    if (!AudioAPI) {
      estado.textContent = "Audio no disponible";
      boton.disabled = true;
      return;
    }
    try {
      if (apagarDespues !== null) {
        clearTimeout(apagarDespues);
        apagarDespues = null;
      }
      if (!audio) iniciarSonido();
      await audio.resume();
      tocando = true;
      inicioCiclo = audio.currentTime + .07;
      siguienteEvento = 0;
      master.gain.cancelScheduledValues(audio.currentTime);
      master.gain.setValueAtTime(Math.max(.0001, master.gain.value), audio.currentTime);
      master.gain.linearRampToValueAtTime(.72, audio.currentTime + 1.55);
      programar();
      intervalo = setInterval(programar, 95);
      reflejarEstado();
    } catch (error) {
      tocando = false;
      if (intervalo !== null) {
        clearInterval(intervalo);
        intervalo = null;
      }
      estado.textContent = "No se pudo iniciar";
      boton.setAttribute("aria-pressed", "false");
    }
  }

  function detener() {
    tocando = false;
    if (intervalo !== null) {
      clearInterval(intervalo);
      intervalo = null;
    }
    if (audio && master) {
      const ahora = audio.currentTime;
      master.gain.cancelScheduledValues(ahora);
      master.gain.setValueAtTime(Math.max(.0001, master.gain.value), ahora);
      master.gain.exponentialRampToValueAtTime(.0001, ahora + .65);
      apagarDespues = setTimeout(() => {
        if (!tocando && audio && audio.state === "running") audio.suspend();
        apagarDespues = null;
      }, 850);
    }
    reflejarEstado();
  }

  boton.addEventListener("click", () => {
    if (tocando) detener();
    else iniciar();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && tocando) detener();
  });
  if (!AudioAPI) {
    boton.disabled = true;
    estado.textContent = "Audio no disponible";
  }
})();
