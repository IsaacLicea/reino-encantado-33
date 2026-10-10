/* Reino de los 33 — "La danza de las luciérnagas".
   Fantasía instrumental original de 6/8: melodía tarareable,
   pulso de madera, un secreto armónico y luces de arpa y flauta.
   Reproducción voluntaria, sin grabaciones externas. */
(() => {
  "use strict";

  const boton = document.getElementById("musicaReino");
  const estado = document.getElementById("musicaEstado");
  if (!boton || !estado) return;

  const AudioAPI = window.AudioContext || window.webkitAudioContext;
  // Ritmo de 6/8 ligero, como un pequeño vals feérico entre luciérnagas.
  const PULSO = 60 / 104; // 6/8 más vivo y danzante
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


  // Re mayor luminoso. El Cmaj7(#11) crea un destello de misterio
  // antes del acorde de La que nos conduce otra vez a Re.
  const armonia = [
    [50,57,62,64,66], [55,59,62,66,69], [47,54,59,62,66],
    [45,52,57,61,64], [52,59,62,66,71], [55,59,62,66,69],
    [48,55,59,64,66], [45,52,57,61,64]
  ];
  // Tema principal de cinco notas; vuelve con cambios de intensidad.
  const tema = [
    [78,81,78,76,74], [79,81,83,81,78],
    [78,74,76,78,81], [76,73,76,78,81],
    [79,78,76,79,83], [83,81,79,78,76],
    [76,79,83,78,79], [76,73,76,78,74]
  ];
  const eventos = [];
  // Ocaso (0-7), baile (8-15), sendero secreto (16-23),
  // fiesta luminosa (24-39), últimas estrellas (40-47).
  for (let compas = 0; compas < COMPASES; compas++) {
    const acorde = armonia[compas % 8];
    const frase = tema[compas % 8];
    const base = compas * 6;
    const intro = compas < 4;
    const misterio = compas >= 16 && compas < 24;
    const fiesta = compas >= 24 && compas < 40;
    const final = compas >= 40;
    const energia = intro ? .58 : misterio ? .76 : fiesta ? 1 : final ? .72 : .89;

    // Pulso físico y orgánico en dos grupos de tres (no batería electrónica).
    if (!intro) {
      [0.06,3.08].forEach((p,i) => eventos.push({
        pulso:base+p, tipo:"paso", nota:acorde[0]-(i===0?12:0),
        intensidad:energia*(i===0?.83:.66)
      }));
      [1.94,4.9].forEach((p,i) => eventos.push({
        pulso:base+p, tipo:"madera", intensidad:energia*(fiesta?.80:.61),
        paneo:i===0?-.22:.22
      }));
      if (fiesta || misterio) {
        [1.07,2.09,4.06,5.09].forEach((p,i) => eventos.push({
          pulso:base+p, tipo:"hojas", intensidad:misterio?.20:.31,
          paneo:i%2?.2:-.2
        }));
      }
    }
    // Arpa de cuerda física, con síncopas diminutas y paneo suave.
    const notasArpa=[0,2,4,1,3,4];
    const arpegio=intro?[.11,1.6,3.09,4.62]:[.11,1.07,2.05,3.11,4.07,5.07];
    arpegio.forEach((p,i) => eventos.push({
      pulso:base+p+((i+compas)%3-1)*.018, tipo:"arpa",
      nota:acorde[notasArpa[i]]+12,
      intensidad:energia*((i===0||i===3)?1.04:.78),
      paneo:((compas+i)%5-2)*.12
    }));

    // Motivo tarareable: siempre reaparece, primero en susurros,
    // luego con más fuerza. Pausas intencionadas entre frases.
    const ataques=misterio?[.35,1.33,2.28,3.7,4.65]:[.24,1.13,2.14,3.33,4.69];
    const largos=[.38,.46,.51,.58,.85];
    if (!intro || compas>=2) {
      frase.forEach((nota,i) => {
        if (final && i===2 && compas%2===0) return;
        eventos.push({
          pulso:base+ataques[i], tipo:"flauta", nota, largo:largos[i],
          intensidad:(fiesta?.96:misterio?.73:final?.70:.85)*(i===4?1.1:1)
        });
      });
    }
    if (!intro && (fiesta||compas%2===1)) {
      [2.72,5.42].forEach((p,i) => eventos.push({
        pulso:base+p, tipo:"destello", nota:frase[i===0?2:0]+12,
        intensidad:fiesta?.61:misterio?.34:.43, paneo:i===0?-.36:.36
      }));
    }
    // El misterio se sostiene con cuerdas suaves; el clímax las eleva.
    if (compas%2===0 || fiesta) eventos.push({
      pulso:base+.04, tipo:"cuerdas", notas:[acorde[1],acorde[2],acorde[3]],
      intensidad:fiesta?.88:misterio?.54:final?.52:.68
    });
    if (compas%4===0 && compas>=4) eventos.push({
      pulso:base+.08, tipo:"coro", notas:[acorde[2]+12,acorde[3]+12],
      intensidad:fiesta?.75:misterio?.37:.53
    });
    if (fiesta && compas%4===0) eventos.push({
      pulso:base+.13, tipo:"violonchelo",nota:acorde[0]-12,intensidad:.42
    });
    if (compas%2===1 || fiesta) eventos.push({
      pulso:base+(misterio?4.3:2.66), tipo:"campanilla",
      nota:acorde[4]+(fiesta?12:7),
      intensidad:fiesta?.64:misterio?.34:.47
    });
    if (compas%8===0||compas===23||compas===39) eventos.push({
      pulso:base+.02,tipo:"brisa",intensidad:misterio?.45:.3
    });
  }
  eventos.sort((a,b)=>a.pulso-b.pulso);

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
    const duracion = largo * PULSO + .23;
    const salida = audio.createGain();
    const ataque = Math.min(.105, duracion * .24);
    salida.gain.setValueAtTime(.0001, cuando);
    salida.gain.linearRampToValueAtTime(.060 * intensidad, cuando + ataque);
    salida.gain.setValueAtTime(.054 * intensidad, cuando + Math.max(ataque + .04, duracion - .18));
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


  // Dos pisadas sedosas de 6/8, con tono de madera y resonancia cálida.
  function paso(nota, cuando, intensidad) {
    const osc=audio.createOscillator();
    const salida=audio.createGain();
    osc.type="sine";
    const f=Math.max(49,frecuencia(nota));
    osc.frequency.setValueAtTime(f*1.26,cuando);
    osc.frequency.exponentialRampToValueAtTime(f*.8,cuando+.19);
    salida.gain.setValueAtTime(.0001,cuando);
    salida.gain.linearRampToValueAtTime(.060*intensidad,cuando+.013);
    salida.gain.exponentialRampToValueAtTime(.0001,cuando+.29);
    osc.connect(salida);
    conectarConPan(salida,0);
    osc.start(cuando);
    osc.stop(cuando+.31);
  }

  // Golpe apagado que sugiere un tambor de marco hecho a mano.
  function madera(cuando,intensidad,paneo) {
    const osc=audio.createOscillator();
    const salida=audio.createGain();
    osc.type="triangle";
    osc.frequency.setValueAtTime(430,cuando);
    osc.frequency.exponentialRampToValueAtTime(240,cuando+.095);
    salida.gain.setValueAtTime(.0001,cuando);
    salida.gain.linearRampToValueAtTime(.023*intensidad,cuando+.007);
    salida.gain.exponentialRampToValueAtTime(.0001,cuando+.14);
    osc.connect(salida);
    conectarConPan(salida,paneo);
    osc.start(cuando);
    osc.stop(cuando+.15);
  }

  // Hojas de plata: una pulsación suave de aire filtrado.
  function hojas(cuando,intensidad,paneo) {
    const fuente=audio.createBufferSource();
    fuente.buffer=ruido;
    const filtro=audio.createBiquadFilter();
    filtro.type="highpass";
    filtro.frequency.value=2700;
    const salida=audio.createGain();
    salida.gain.setValueAtTime(.0001,cuando);
    salida.gain.linearRampToValueAtTime(.008*intensidad,cuando+.006);
    salida.gain.exponentialRampToValueAtTime(.0001,cuando+.09);
    fuente.connect(filtro);
    filtro.connect(salida);
    conectarConPan(salida,paneo);
    fuente.start(cuando);
    fuente.stop(cuando+.1);
  }

  function tocar(evento, cuando) {
    if (evento.tipo === "arpa") arpa(evento.nota, cuando, evento.intensidad, evento.paneo);
    else if (evento.tipo === "flauta") flauta(evento.nota, cuando, evento.largo, evento.intensidad);
    else if (evento.tipo === "campanilla") campanilla(evento.nota, cuando, evento.intensidad);
    else if (evento.tipo === "destello") destello(evento.nota, cuando, evento.intensidad, evento.paneo);
    else if (evento.tipo === "brisa") brisa(cuando, evento.intensidad);
    else if (evento.tipo === "paso") paso(evento.nota, cuando, evento.intensidad);
    else if (evento.tipo === "madera") madera(cuando, evento.intensidad, evento.paneo);
    else if (evento.tipo === "hojas") hojas(cuando, evento.intensidad, evento.paneo);
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
      tocando ? "Pausar La danza de las luciérnagas" : "Activar La danza de las luciérnagas"
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
