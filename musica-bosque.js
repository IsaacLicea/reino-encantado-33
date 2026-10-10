/* Reino de los 33 — "Luciérnagas al caer la tarde".
   Suite original de fantasía luminosa: arpa pulsada, flauta aérea,
   cuerdas cálidas, coro etéreo y destellos de celesta.
   No necesita audio externo y solo suena al activar el botón. */
(() => {
  "use strict";

  const boton = document.getElementById("musicaReino");
  const estado = document.getElementById("musicaEstado");
  if (!boton || !estado) return;

  const AudioAPI = window.AudioContext || window.webkitAudioContext;
  // Ritmo de 6/8 ligero, como un pequeño vals feérico entre luciérnagas.
  const PULSO = 60 / 92;
  const CORCHEA = PULSO / 2;
  const COMPASES = 48;
  const DURACION_CICLO = COMPASES * 6 * CORCHEA;
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

  // Armonía en Re mayor, con colores de Sol lidio y acordes add9.
  // Evitamos la melancolía del modo menor: la tarde se ilumina poco a poco.
  const armonia = [
    [55, 59, 62, 66, 69],  // Gmaj9
    [50, 57, 62, 64, 66],  // Dadd9
    [45, 52, 57, 59, 64],  // Aadd9
    [47, 54, 59, 62, 66],  // Bm7
    [55, 59, 62, 66, 69],  // Gmaj9
    [54, 57, 62, 64, 69],  // D/F# add9
    [52, 59, 62, 66, 71],  // Em9
    [45, 52, 57, 61, 64]   // Amaj add9
  ];

  // Melodía original con ascensos esperanzadores y pausas para respirar.
  // Paso, altura MIDI, duración en pulsos de negra.
  const motivos = [
    [[.6, 74, 1.30], [3.25, 78, 1.38]],
    [[.45, 76, 1.14], [2.95, 74, 1.48]],
    [[.62, 73, 1.22], [3.25, 76, 1.25]],
    [[.46, 71, 1.25], [3.24, 74, 1.56]],
    [[.60, 78, 1.32], [3.28, 81, 1.28]],
    [[.48, 79, 1.20], [3.12, 78, 1.51]],
    [[.75, 76, 1.20], [3.10, 74, 1.30]],
    [[.52, 73, 1.15], [3.04, 76, 1.52]]
  ];

  // Una pequeña historia musical de 48 compases:
  // 0–7: ocaso cálido; 8–19: despiertan las hadas;
  // 20–35: celebración luminosa; 36–47: cielo estrellado.
  const eventos = [];
  for (let compas = 0; compas < COMPASES; compas++) {
    const acorde = armonia[compas % armonia.length];
    const base = compas * 6;
    const inicio = compas < 8;
    const despertar = compas >= 8 && compas < 20;
    const esplendor = compas >= 20 && compas < 36;
    const noche = compas >= 36;
    const intensidad = inicio ? .72 : esplendor ? 1.02 : noche ? .77 : .91;

    if (compas % 2 === 0 || esplendor) {
      eventos.push({
        pulso: base + .04, tipo: "cuerdas",
        notas: [acorde[1], acorde[2], acorde[3]],
        intensidad: esplendor ? .9 : noche ? .57 : .68
      });
    }
    if (compas % 4 === 0 && compas >= 4) {
      eventos.push({
        pulso: base + .08, tipo: "coro",
        notas: [acorde[2] + 12, acorde[3] + 12],
        intensidad: esplendor ? .88 : .56
      });
    }
    if (esplendor && compas % 4 === 0) {
      eventos.push({
        pulso: base + .17, tipo: "violonchelo",
        nota: acorde[0] - 12, intensidad: .42
      });
    }

    // El arpa tiene un vaivén de 6/8 con ligeras inflexiones humanas.
    const pasos = inicio || noche ?
      [.10, 1.44, 3.06, 4.52] :
      [.10, 1.07, 2.08, 3.13, 4.09, 5.06];
    const patron = [0, 2, 4, 3, 2, 4];
    pasos.forEach((paso, i) => {
      eventos.push({
        pulso: base + paso + ((compas + i) % 3 - 1) * .025,
        tipo: "arpa",
        nota: acorde[patron[i]] + (i === 0 ? 12 : 12),
        intensidad: intensidad * (i === 0 ? 1 : .80),
        paneo: ((compas + i) % 5 - 2) * .13
      });
    });

    if (!inicio || compas === 6) {
      motivos[compas % 8].forEach(([paso, nota, largo], i) => {
        const segundaVoz = esplendor && i === 1 && compas % 4 === 1;
        eventos.push({
          pulso: base + paso,
          tipo: "flauta",
          nota: segundaVoz ? nota + 2 : nota,
          largo,
          intensidad: despertar ? .71 : esplendor ? .94 : noche ? .62 : .49
        });
      });
    }

    // Destellos de celesta: más alegres en el tramo de celebración.
    if (compas % 2 === 1 || esplendor) {
      eventos.push({
        pulso: base + (esplendor ? 2.6 : 4.43),
        tipo: "campanilla",
        nota: acorde[4] + (esplendor ? 12 : 7),
        intensidad: esplendor ? .72 : .52
      });
    }
    if (compas % 4 === 3 && compas < 44) {
      eventos.push({
        pulso: base + 5.24, tipo: "destello",
        nota: acorde[3] + 12,
        intensidad: esplendor ? .9 : .55,
        paneo: compas % 8 < 4 ? -.38 : .38
      });
    }
    if (compas % 8 === 0 || compas === 19 || compas === 35) {
      eventos.push({
        pulso: base + .02, tipo: "brisa",
        intensidad: esplendor ? .53 : .35
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
    const largo = 3.15;
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
    rever.gain.value = .29;
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
    filtro.frequency.value = 5400;
    const salida = audio.createGain();
    salida.gain.value = .185 * intensidad;
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
    filtro.frequency.setValueAtTime(680, cuando);
    filtro.frequency.linearRampToValueAtTime(2060, cuando + 1.25);
    filtro.frequency.linearRampToValueAtTime(930, cuando + duracion);

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
      nivel.gain.value = i === 0 ? .93 : .10;
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
    susurro.gain.value = .0032 * intensidad;
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

  // Coro sin palabras: una capa de luz, no una voz grabada.
  function coroEtéreo(notas, cuando, intensidad) {
    notas.forEach((nota, i) => {
      const duracion = 8.5 * PULSO;
      const salida = audio.createGain();
      salida.gain.setValueAtTime(.0001, cuando);
      salida.gain.linearRampToValueAtTime(.018 * intensidad, cuando + 1.15);
      salida.gain.setValueAtTime(.016 * intensidad, cuando + duracion - 1.4);
      salida.gain.exponentialRampToValueAtTime(.0001, cuando + duracion);
      conectarConPan(salida, i === 0 ? -.4 : .4);
      [1, 2.004].forEach((multiplo, n) => {
        const oscilador = audio.createOscillator();
        const nivel = audio.createGain();
        oscilador.type = "sine";
        oscilador.frequency.value = frecuencia(nota) * multiplo;
        nivel.gain.value = n ? .16 : 1;
        oscilador.connect(nivel);
        nivel.connect(salida);
        oscilador.start(cuando);
        oscilador.stop(cuando + duracion + .01);
      });
    });
  }

  // Pequeñas gotas de luz, un cristal musical con armónicos suaves.
  function destello(nota, cuando, intensidad, paneo) {
    [1, 2.01, 2.99].forEach((multiplo, i) => {
      const oscilador = audio.createOscillator();
      const salida = audio.createGain();
      oscilador.type = "sine";
      oscilador.frequency.value = frecuencia(nota) * multiplo;
      const duracion = i === 0 ? 2.35 : 1.25;
      salida.gain.setValueAtTime(.0001, cuando);
      salida.gain.linearRampToValueAtTime((i ? .006 : .015) * intensidad, cuando + .012);
      salida.gain.exponentialRampToValueAtTime(.0001, cuando + duracion);
      oscilador.connect(salida);
      conectarConPan(salida, paneo);
      oscilador.start(cuando);
      oscilador.stop(cuando + duracion + .02);
    });
  }

  // Susurro del bosque: aire filtrado casi imperceptible que abraza el arpa.
  function brisa(cuando, intensidad) {
    const fuente = audio.createBufferSource();
    fuente.buffer = ruido;
    fuente.loop = true;
    const filtro = audio.createBiquadFilter();
    filtro.type = "bandpass";
    filtro.frequency.value = 850;
    filtro.Q.value = .48;
    const salida = audio.createGain();
    const duracion = 6 * PULSO;
    salida.gain.setValueAtTime(.0001, cuando);
    salida.gain.linearRampToValueAtTime(.006 * intensidad, cuando + 1.0);
    salida.gain.exponentialRampToValueAtTime(.0001, cuando + duracion);
    fuente.connect(filtro);
    filtro.connect(salida);
    conectarConPan(salida, -.18);
    fuente.start(cuando);
    fuente.stop(cuando + duracion + .02);
  }

  function tocar(evento, cuando) {
    if (evento.tipo === "arpa") arpa(evento.nota, cuando, evento.intensidad, evento.paneo);
    else if (evento.tipo === "flauta") flauta(evento.nota, cuando, evento.largo, evento.intensidad);
    else if (evento.tipo === "campanilla") campanilla(evento.nota, cuando, evento.intensidad);
    else if (evento.tipo === "destello") destello(evento.nota, cuando, evento.intensidad, evento.paneo);
    else if (evento.tipo === "brisa") brisa(cuando, evento.intensidad);
    else if (evento.tipo === "coro") coroEtéreo(evento.notas, cuando, evento.intensidad);
    else if (evento.tipo === "cuerdas") {
      evento.notas.forEach((nota, i) =>
        cuerdasSuaves(nota, cuando + i * .05, 4.65 * PULSO, evento.intensidad, (i - 1) * .32)
      );
    } else if (evento.tipo === "violonchelo") {
      cuerdasSuaves(evento.nota, cuando, 7.5 * PULSO, evento.intensidad, -.1);
    }
  }

  function programar() {
    if (!tocando || !audio) return;
    const horizonte = audio.currentTime + .36;
    let revisados = 0;
    while (inicioCiclo + eventos[siguienteEvento].pulso * CORCHEA < horizonte && revisados++ < 400) {
      const evento = eventos[siguienteEvento];
      const cuando = inicioCiclo + evento.pulso * CORCHEA;
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
      tocando ? "Pausar Luciérnagas al caer la tarde" : "Activar Luciérnagas al caer la tarde"
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
      master.gain.linearRampToValueAtTime(.66, audio.currentTime + 1.55);
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
