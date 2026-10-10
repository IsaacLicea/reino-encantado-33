#!/usr/bin/env python3
"""Obtiene World_OP2 de PeriTune (2020) bajo CC BY 4.0.

Fuente primaria: enlace MP3 original de la tabla oficial de PeriTune.
Respaldo, solo si falla la primaria: grabación CC del propio compositor
alojada en Wikimedia Commons, donde los primeros 4:08 son World_OP2;
la sección 4:08+ es la variante Music Box y NO debe incorporarse.
"""
from __future__ import annotations
import shutil
import subprocess
import requests
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "peritune-world-op2.mp3"
OFFICIAL = "https://peritune.com/music/PerituneMaterial_World_OP2.mp3"
COMMONS = ("https://upload.wikimedia.org/wikipedia/commons/f/fa/"
           "%E3%80%90%E7%84%A1%E6%96%99%E3%83%95%E3%83%AA%E3%83%BCBGM%E3%80%91"
           "%E7%89%A9%E8%AA%9E%E3%81%AE%E5%A7%8B%E3%81%BE%E3%82%8A"
           "%E3%81%AE%E3%82%88%E3%81%86%E3%81%AA%E5%B9%BB%E6%83%B3"
           "%E7%9A%84%E3%81%AA%E3%83%AF%E3%83%AB%E3%83%84"
           "%E3%80%8CWorld_OP2%E3%80%8D.opus")
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; EnchantedForestInvitation/1.0)"}


def fetch(url: str, destination: Path) -> None:
    with requests.get(url, timeout=(20, 90), headers=HEADERS, stream=True) as response:
        response.raise_for_status()
        destination.parent.mkdir(parents=True, exist_ok=True)
        with destination.open("wb") as stream:
            for part in response.iter_content(chunk_size=512 * 1024):
                if part:
                    stream.write(part)
    print(f"Descarga: {destination.stat().st_size:,} bytes", flush=True)


def duration(filename: Path) -> float:
    cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration",
           "-of", "default=noprint_wrappers=1:nokey=1", str(filename)]
    return float(subprocess.check_output(cmd, text=True).strip())


def main() -> None:
    if not shutil.which("ffprobe") or not shutil.which("ffmpeg"):
        raise RuntimeError("Se necesita FFmpeg + FFprobe")
    tmp = ROOT / "scripts" / ".world-op2-source.opus"
    try:
        try:
            print("Intentando MP3 directo del sitio oficial PeriTune...", flush=True)
            fetch(OFFICIAL, OUTPUT)
            seconds = duration(OUTPUT)
            if not (115 < seconds < 140 and OUTPUT.stat().st_size > 2_000_000):
                raise ValueError(f"MP3 oficial inesperado: {seconds}s")
            print("SOURCE: PeriTune oficial (MP3 intacto)", flush=True)
        except (requests.RequestException, ValueError, subprocess.CalledProcessError, OSError) as exc:
            print(f"Fuente oficial no accesible: {exc}; probando copia CC en Wikimedia Commons", flush=True)
            fetch(COMMONS, tmp)
            source_duration = duration(tmp)
            if not 465 < source_duration < 490 or tmp.stat().st_size < 8_000_000:
                raise ValueError(f"Grabación Commons inesperada: {source_duration}s")
            OUTPUT.parent.mkdir(parents=True, exist_ok=True)
            subprocess.run([
                "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
                "-i", str(tmp), "-t", "248",
                "-af", "afade=t=in:st=0:d=0.15,afade=t=out:st=247.55:d=0.45",
                "-codec:a", "libmp3lame", "-qscale:a", "4", "-ar", "44100",
                str(OUTPUT)
            ], check=True)
            print("SOURCE: Wikimedia Commons, primeros 4:08 extraídos; "
                  "convertido de Opus a MP3 con fundidos cortos", flush=True)

        final_duration = duration(OUTPUT)
        if not 115 < final_duration < 140 or OUTPUT.stat().st_size < 2_000_000:
            raise ValueError("World_OP2 está vacío, mal recortado o truncado")
        print(f"WORLD_OP2_VALIDADO: duration={final_duration:.3f}s; "
              f"bytes={OUTPUT.stat().st_size}", flush=True)
    finally:
        tmp.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
