#!/usr/bin/env python3
"""Download PeriTune Wonder6 from PeriTune's official page only.

This script is used during the build, not by visitors. No unverified mirrors.
PeriTune Wonder6 (2019): CC BY 4.0; original:
https://peritune.com/blog/2019/01/19/wonder6/
"""
from __future__ import annotations
import html
import io
import re
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
PAGE = "https://peritune.com/blog/2019/01/19/wonder6/"
DEST = ROOT / "assets" / "peritune-wonder6.mp3"
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; Wonder6 Licensed BGM Build/1.0)"}

def allowed(url: str) -> bool:
    p = urlparse(url)
    return p.scheme == "https" and (p.hostname == "peritune.com" or
                                        (p.hostname or "").endswith(".peritune.com"))

def discover():
    response = requests.get(PAGE, timeout=35, headers=HEADERS)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    urls = set()
    for element in soup.find_all(True):
        for attr in ("href", "src", "data-src", "data-url", "download"):
            u = element.get(attr)
            if isinstance(u, str) and ("wonder6" in u.lower() or
                (re.search(r"\.(?:mp3|zip)(?:\?|$)", u, re.I) and "peritune" in u.lower())):
                urls.add(urljoin(PAGE, html.unescape(u).replace("\\/", "/")))
    for match in re.findall(r"https?://[^\s<>]+", response.text):
        u = html.unescape(match).replace("\\/", "/")
        if "wonder6" in u.lower() and ("mp3" in u.lower() or "zip" in u.lower()):
            urls.add(u)
    # Old PeriTune files often follow this stable uploads naming convention.
    urls.add("https://peritune.com/wp-content/uploads/2019/01/PerituneMaterial_Wonder6.mp3")
    cleaned = sorted({u.split("#")[0] for u in urls if allowed(u)})
    print("Official-site candidate links:", *cleaned[:30], sep="\n- ", flush=True)
    archives = [x for x in cleaned if ".zip" in x.lower() and "loop" in x.lower()]
    others = [x for x in cleaned if ".mp3" in x.lower() and "wonder6" in x.lower()]
    archives += [x for x in cleaned if ".zip" in x.lower() and x not in archives]
    return archives + others

def download():
    for url in discover():
        try:
            print(f"Trying authorized source: {url}", flush=True)
            resp = requests.get(url, timeout=95, headers=HEADERS)
            if resp.status_code != 200:
                print("Status:", resp.status_code, flush=True)
                continue
            if len(resp.content) < 450_000:
                print("Too short to be a full song", len(resp.content), flush=True)
                continue
            if ".zip" in url.lower() or resp.content.startswith(b"PK"):
                with zipfile.ZipFile(io.BytesIO(resp.content)) as package:
                    names = [n for n in package.namelist() if
                             n.lower().endswith(".mp3") and "wonder6" in n.lower()]
                    if not names:
                        print("ZIP had no Wonder6 MP3", flush=True)
                        continue
                    chosen = sorted(names, key=lambda n: ("loop" not in n.lower(), len(n)))[0]
                    payload = package.read(chosen)
                    print("Found authorized loop MP3:", chosen, flush=True)
            else:
                payload = resp.content
            if not (payload.startswith(b"ID3") or payload[:2] in
                   (b"\\xff\\xfb", b"\\xff\\xf3", b"\\xff\\xf2")):
                print("Not a recognizable MP3 header", flush=True)
                continue
            DEST.parent.mkdir(parents=True, exist_ok=True)
            DEST.write_bytes(payload)
            subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                            "format=duration,size", "-of", "default=noprint_wrappers=1",
                            str(DEST)], check=True)
            print(f"Verified Wonder6 MP3, bytes={len(payload)}", flush=True)
            return
        except (requests.RequestException, OSError, zipfile.BadZipFile,
                subprocess.CalledProcessError) as err:
            print(f"Download candidate failed: {type(err).__name__}: {err}", flush=True)
    raise RuntimeError("Could not verify an official Wonder6 MP3. Do not publish a placeholder.")

if __name__ == "__main__":
    download()
