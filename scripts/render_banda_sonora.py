#!/usr/bin/env python3
"""Renderiza una banda sonora original con instrumentos muestreados.
Usa GeneralUser GS (sonidos de instrumentos grabados) solo durante la
producción. Se distribuye únicamente el MP3 final, nunca el SoundFont.
"""
from __future__ import annotations

import os
import random
import subprocess
from pathlib import Path

import mido

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "danza-luciernagas-cristal.mp3"
MIDI = ROOT / "scripts" / ".banda-sonora.mid"
RAW = ROOT / "scripts" / ".banda-sonora.wav"
SOUNDFONT = Path(os.environ.get("REINO_SF2", "/tmp/GeneralUser-GS.sf2"))
TEMPO = 104
TICKS = 480
BAR = TICKS * 3  # compás de 6/8
BEAT8 = TICKS // 2
BARS = 64
RNG = random.Random(3333)

# Modos luminosos con alguna nota prestada para el misterio nocturno.
CHORDS = [
    [50,57,62,64,66], [55,59,62,66,69],
    [47,54,59,62,66], [45,52,57,61,64],
    [52,59,62,66,71], [55,59,62,66,69],
    [48,55,59,64,66], [45,52,57,61,64],
]
# Llamada reconocible y respuestas que varían en cada escena.
HOOKS = [
    [78,81,83,81,78], [79,81,79,78,76],
    [78,81,83,81,78], [76,78,76,73,76],
    [79,83,81,79,78], [79,81,83,81,79],
    [76,79,83,78,79], [76,73,76,78,74],
]


def jitter(n=8):
    return RNG.randint(-n, n)


def build_track(mid, title, channel, program, pan, volume, reverb=58):
    track = mido.MidiTrack()
    mid.tracks.append(track)
    track.append(mido.MetaMessage("track_name", name=title, time=0))
    msgs = [
        (0, mido.Message("program_change", channel=channel, program=program)),
        (0, mido.Message("control_change", channel=channel, control=7, value=volume)),
        (0, mido.Message("control_change", channel=channel, control=10, value=pan)),
        (0, mido.Message("control_change", channel=channel, control=91, value=reverb)),
    ]
    return track, msgs


def note(events, ch, pitch, at, length, vel, spread=8):
    if vel <= 0:
        return
    at = max(0, int(at + jitter(spread)))
    length = max(35, int(length + jitter(15)))
    v = max(24, min(119, int(vel + RNG.randint(-5, 5))))
    events.append((at, mido.Message("note_on", channel=ch, note=pitch, velocity=v)))
    events.append((at+length, mido.Message("note_off", channel=ch, note=pitch, velocity=0)))


def main():
    if not SOUNDFONT.is_file():
        raise FileNotFoundError(f"Falta biblioteca de instrumentos: {SOUNDFONT}")
    mid = mido.MidiFile(ticks_per_beat=TICKS)
    conductor = mido.MidiTrack()
    mid.tracks.append(conductor)
    conductor.append(mido.MetaMessage("track_name", name="Luciérnagas: suite original", time=0))
    conductor.append(mido.MetaMessage("set_tempo", tempo=mido.bpm2tempo(TEMPO), time=0))
    conductor.append(mido.MetaMessage("time_signature", numerator=6, denominator=8, time=0))

    # GM programs zero-indexados. GeneralUser GS patch 92 = Bowed Glass.
    # Usamos ese timbre como voz principal de armónica de cristal,
    # con ataques puntuales de vibráfono muestreado para dar nitidez
    # sin devolver la melodía al sonido de sintetizador puro.
    definitions = [
        ("Arpa acústica", 0, 46, 42, 91, 56),
        ("Armónica de cristal", 1, 92, 73, 101, 95),
        ("Cuerdas de cámara", 2, 48, 38, 72, 71),
        ("Violín contrapunto", 3, 40, 90, 70, 62),
        ("Celesta", 4, 8, 92, 73, 77),
        ("Glockenspiel", 5, 9, 31, 68, 79),
        ("Pizzicato de cuerdas", 6, 45, 82, 77, 44),
        ("Cristal grave de contrapunto", 7, 92, 51, 68, 91),
        ("Coro etéreo", 8, 52, 62, 52, 85),
        ("Violonchelo", 10, 42, 39, 78, 62),
        ("Vibráfono en armónicos", 11, 11, 83, 45, 86),
    ]
    tracks = {}
    for title, ch, gm, pan, volume, reverb in definitions:
        tr, events = build_track(mid, title, ch, gm, pan, volume, reverb)
        tracks[title] = (ch, tr, events)

    drums = mido.MidiTrack()
    mid.tracks.append(drums)
    percussion = [(0, mido.Message("control_change", channel=9, control=7, value=75)),
                  (0, mido.Message("control_change", channel=9, control=10, value=64))]

    def play(title, pitch, pos, dur, velocity, spread=8):
        ch, _, ev = tracks[title]
        note(ev, ch, pitch, pos, dur, velocity, spread=spread)

    def drum(pitch, pos, length, velocity):
        note(percussion, 9, pitch, pos, length, velocity, spread=5)

    for bar in range(BARS):
        chord = CHORDS[bar % 8]
        melody = HOOKS[bar % 8]
        start = bar * BAR
        intro = bar < 8
        secret = 24 <= bar < 32
        bloom = 32 <= bar < 56
        outro = bar >= 56
        section = 0.6 if intro else 0.78 if secret else 1.0 if bloom else 0.76
        if outro:
            section = 0.70

        # Arpa real muestreada: cada nota varía en acento y duración.
        figure = [0, 2, 4, 1, 3, 4]
        accents = [1.0, .76, .68, .92, .68, .79]
        for i, idx in enumerate(figure):
            offset = i*BEAT8 + (8 if i%2 else 0)
            play("Arpa acústica", chord[idx]+12, start+offset,
                 BEAT8*(1.8 if i in (0,3) else 1.25),
                 (76 if bloom else 65)*section*accents[i], 10)

        # La melodía ahora nace de copas de cristal frotadas, no de una flauta.
        # Uniendo suavemente notas y añadiendo un armónico de vibráfono,
        # la línea se siente continua, delicada y misteriosa.
        if bar >= 4:
            attacks = [0.12, 1.04, 2.03, 3.18, 4.60]
            durations = [1.12, 1.10, 1.20, 1.12, 1.66]
            for i, p in enumerate(melody):
                if outro and i == 2 and bar%2 == 0:
                    continue
                pos = start + attacks[i]*BEAT8
                pitch = p - (12 if intro else 0)
                play("Armónica de cristal", pitch, pos, durations[i]*BEAT8,
                     (84 if bloom else 74 if not secret else 69)*section, 5)
                # Luz en cada primera y última nota del motivo: refuerzo suave,
                # no otra melodía que compita con el timbre de cristal.
                if i in (0,4) and (bar%2==0 or bloom):
                    play("Vibráfono en armónicos", pitch+12, pos+15,
                         BEAT8*.80, (35 if bloom else 29)*section, 6)
                if bloom and bar%2==0 and i in (0,2,4):
                    play("Violín contrapunto", p-12, pos+23, durations[i]*BEAT8*1.25,
                         44 + 5*section, 15)

        # Cuerdas: voicings abiertos que crecen y respiran.
        if bar%2==0 or bloom:
            for i, p in enumerate(chord[1:4]):
                play("Cuerdas de cámara", p, start+32*i, BAR*(2.05 if bar%2==0 else 1.05),
                     52*section + 6*i, 9)

        # Coro suave y resonancias graves de cristal en el sendero secreto.
        if bar%4==0 and bar>=8:
            for i, p in enumerate(chord[2:4]):
                play("Coro etéreo", p+12, start+80+45*i, BAR*2.25,
                     (44 if bloom else 36)*section, 12)
        if secret or (bar>=56 and bar%2==1):
            play("Cristal grave de contrapunto", melody[bar%5]-12,
                 start+2*BEAT8, BEAT8*3.0, 49*section, 8)

        # Bajo y pizzicato dan movimiento continuo sin sonido de videojuego.
        if not intro:
            play("Violonchelo", chord[0]-12, start, BEAT8*4.1,
                 (56 if bloom else 49)*section, 6)
            for idx, pos in enumerate([0, 3, 4.5]):
                play("Pizzicato de cuerdas", chord[[0,2,1][idx]],
                     start+pos*BEAT8, BEAT8*.86, 53*section, 5)

        # Celesta con respuestas claras; glockenspiel marca la magia.
        if bar%2==1 or bloom:
            for i, pos in enumerate([2.1, 5.0]):
                play("Celesta", chord[3+i]+12, start+pos*BEAT8,
                     BEAT8*1.45, (56 if bloom else 48)*section, 8)
        if bar%4==3:
            for i, pos in enumerate([3.65,4.55,5.25]):
                play("Glockenspiel", [chord[2],chord[3],chord[4]][i]+24,
                     start+pos*BEAT8, BEAT8*.74, (55 if bloom else 42)*section, 6)

        # Pandero y pandereta reales del kit acústico: notas 54/83.
        if bar>=6:
            accents = [(0,62),(1,39),(2,46),(3,59),(4,38),(5,47)]
            if secret:
                accents = [(0,43),(2,33),(3,45),(5,32)]
            if intro or outro:
                accents = [(0,46),(3,43),(5,32)]
            for pos,v in accents:
                drum(54, start+pos*BEAT8, 43, int(v*section))
            if bloom:
                for pos in [1.05,2.08,4.08,5.1]:
                    drum(83,start+pos*BEAT8,45, int(37*section))
            # frame drum suave y acentos de pasos.
            for pos,v in [(0,49),(3,43)]:
                drum(64,start+pos*BEAT8,70,int(v*section))
            for pos in (2.0,5.0):
                drum(37,start+pos*BEAT8,65,int(30*section))

    for title,(ch,tr,events) in tracks.items():
        events.sort(key=lambda item:(item[0], 0 if item[1].type == "note_off" else 1))
        previous=0
        for tick,msg in events:
            tr.append(msg.copy(time=max(0,tick-previous)))
            previous=tick
        tr.append(mido.MetaMessage("end_of_track", time=0))
    percussion.sort(key=lambda item:(item[0], 0 if item[1].type=="note_off" else 1))
    last=0
    for tick,msg in percussion:
        drums.append(msg.copy(time=max(0,tick-last)))
        last=tick
    drums.append(mido.MetaMessage("end_of_track",time=0))

    OUTPUT.parent.mkdir(exist_ok=True, parents=True)
    mid.save(str(MIDI))
    # FluidSynth toca muestras de instrumentos grabados en estudio;
    # FFmpeg mezcla reverberación y normaliza la banda sonora.
    subprocess.run([
        "fluidsynth","-ni","-g","0.62","-r","44100",
        "-F",str(RAW),str(SOUNDFONT),str(MIDI)
    ], check=True)
    subprocess.run([
        "ffmpeg","-y","-hide_banner","-loglevel","error",
        "-i",str(RAW),
        "-af","atrim=duration=112.0,asetpts=PTS-STARTPTS,highpass=f=45,lowpass=f=14500,aecho=0.72:0.25:65|155:0.13|0.11,acompressor=threshold=0.50:ratio=2.0:attack=18:release=200,loudnorm=I=-19:TP=-1.5:LRA=10,afade=t=in:st=0:d=0.55,afade=t=out:st=109.8:d=2.2",
        "-codec:a","libmp3lame","-qscale:a","4",
        "-ar","44100",str(OUTPUT)
    ],check=True)
    if OUTPUT.stat().st_size < 400_000:
        raise RuntimeError("El archivo de audio quedó demasiado pequeño")
    print(f"Banda sonora exportada: {OUTPUT} ({OUTPUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
