#!/usr/bin/env python3
"""Prepara Wonder6 de PeriTune (2019), CC BY 4.0, para la invitación.

PeriTune confirma la canción y licencia: https://peritune.com/blog/2019/01/19/wonder6/
Su recopilación oficial Sparkling_Forest coloca Wonder6 entre 30:54 y 34:21.
La grabación compartida en Wikimedia Commons procede del video de PeriTune.
La pista ha sido EXTRAÍDA y RECODIFICADA (adaptación declarada en créditos).
"""
from pathlib import Path
import shutil
import subprocess
import requests

ROOT = Path(__file__).resolve().parents[1]
TMP = ROOT / "scripts" / ".sparkling-forest-source.opus"
DEST = ROOT / "assets" / "peritune-wonder6.mp3"

SOURCE = (
    "https://upload.wikimedia.org/wikipedia/commons/c/cf/"
    "%E3%80%90%E7%84%A1%E6%96%99%E3%83%95%E3%83%AA%E3%83%BCBGM%E3%80%91"
    "%E5%B9%BB%E6%83%B3%E7%9A%84%E3%81%AA%E6%A3%AE%E3%81%AE"
    "%E9%9F%B3%E6%A5%BD%E7%B4%A0%E6%9D%90%E9%9B%86"
    "%E3%80%8CSparkling_Forest%E3%80%8D.opus"
)
# Source tracklist timestamps: Wonder6 starts 30:54; Glimmering_Woods starts 34:21.
START_SECONDS = 30 * 60 + 54
DURATION_SECONDS = 207

def main():
    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        raise RuntimeError("FFmpeg and FFprobe required")
    print("Fetching CC-licensed PeriTune Sparkling_Forest source from Wikimedia Commons", flush=True)
    with requests.get(
        SOURCE, stream=True, timeout=(20, 80),
        headers={"User-Agent": "ReinoEncantado33-Wonder6-CCBY4.0/1.0 (noncommercial invitation)"}
    ) as r:
        r.raise_for_status()
        TMP.parent.mkdir(parents=True, exist_ok=True)
        downloaded = 0
        with TMP.open("wb") as output:
            for chunk in r.iter_content(chunk_size=512 * 1024):
                if chunk:
                    downloaded += len(chunk)
                    output.write(chunk)
        print(f"Downloaded original compilation: {downloaded:,} bytes", flush=True)
    if TMP.stat().st_size < 50_000_000:
        raise RuntimeError("Expected original ~93 MB recording, download is incomplete")
    DEST.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run([
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
        "-ss", str(START_SECONDS), "-t", str(DURATION_SECONDS),
        "-i", str(TMP),
        "-af", "afade=t=in:st=0:d=0.2,afade=t=out:st=206.5:d=0.5",
        "-codec:a", "libmp3lame", "-qscale:a", "4",
        "-ar", "44100", str(DEST)
    ], check=True)
    out = subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries",
        "format=duration,size", "-of", "default=noprint_wrappers=1",
        str(DEST)
    ], text=True)
    print("Wonder6 extracted:", out, flush=True)
    if DEST.stat().st_size < 2_000_000:
        raise RuntimeError("Unexpectedly small Wonder6 MP3")
    # Keep the repo lightweight; publish only the licensed excerpt.
    TMP.unlink(missing_ok=True)

if __name__ == "__main__":
    main()
