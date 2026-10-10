#!/usr/bin/env python3
"""Validación básica del sitio estático y la tarjeta de WhatsApp.

Ejecución: python scripts/auditar_invitacion.py
No modifica archivos; detecta errores antes de publicar.
"""
from __future__ import annotations

import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://isaaclicea.github.io/reino-encantado-33/"
WEB_FILES = ("styles.css", "sendero.css", "efectos-magicos.css", "musica-bosque.css",
             "script.js", "efectos-magicos.js", "musica-bosque.js")


class Document(HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta: dict[str, list[str]] = {}
        self.urls: list[str] = []
        self.scripts: list[str] = []
        self.styles: list[str] = []
        self.alts: list[str] = []

    def handle_starttag(self, tag: str, attrs):
        a = dict(attrs)
        if tag == "meta":
            key = a.get("property") or a.get("name")
            if key:
                self.meta.setdefault(key, []).append(a.get("content", ""))
        for field in ("src", "href", "data-audio-src"):
            value = a.get(field)
            if value:
                self.urls.append(value)
        if tag == "img":
            self.alts.append(a.get("alt", ""))


def main():
    doc = Document()
    doc.feed((ROOT / "index.html").read_text(encoding="utf-8"))
    errors = []

    def expect(ok, message):
        if not ok:
            errors.append(message)

    for key in ("og:title", "og:description", "og:image", "og:url",
                "og:image:type", "og:image:width", "og:image:height",
                "og:image:alt", "twitter:image", "twitter:title"):
        expect(len(doc.meta.get(key, [])) == 1, f"Se requiere 1 {key}, encontradas {len(doc.meta.get(key, []))}")
    asset_url = BASE + "assets/og-reino-33-wa-v2.jpg"
    expect(doc.meta.get("og:image") == [asset_url], "OG preview no corresponde al JPEG versionado")
    expect(doc.meta.get("twitter:image") == [asset_url], "Twitter preview no coincide con OG")
    expect(doc.meta.get("og:image:type") == ["image/jpeg"], "MIME OG incorrecto")
    expect(doc.meta.get("og:url") == [BASE], "URL OG no coincide con la URL pública")
    expect(doc.meta.get("og:title") == ["Isaac celebra su cumpleaños 33"], "Título OG inesperado")

    image_path = ROOT / "assets" / "og-reino-33-wa-v2.jpg"
    expect(image_path.exists(), "No existe el JPG de WhatsApp")
    if image_path.exists():
        with Image.open(image_path) as pic:
            w, h = pic.size
            expect(pic.format == "JPEG", "La imagen social no es JPEG")
            expect(min(w, h) >= 600, "Vista previa de resolución demasiado baja")
            expect(doc.meta.get("og:image:width") == [str(w)], "Ancho de OG incorrecto")
            expect(doc.meta.get("og:image:height") == [str(h)], "Alto de OG incorrecto")
            pic.verify()
        size = image_path.stat().st_size
        expect(size < 900_000, "Vista previa OG pesa demasiado")
        print(f"Imagen WhatsApp validada: {w}x{h}, {size:,} bytes")

    # Revisa referencias literales locales en HTML y CSS; no incluye URLs creadas
    # dinámicamente por JavaScript (tarot, formularios y mapa).
    source = (ROOT / "index.html").read_text(encoding="utf-8")
    for filename in WEB_FILES[:4]:
        source += "\n" + (ROOT / filename).read_text(encoding="utf-8")
    source_without_comments = re.sub(r"/\*.*?\*/", "", source, flags=re.S)
    refs = set(re.findall(r"""(?:src|href|data-audio-src)=["']([^"']+)""", source_without_comments))
    refs |= set(re.findall(r"""url\(["']?([^)"']+)""", source_without_comments))
    for value in sorted(refs):
        if value.startswith(("https:", "http:", "data:", "#", "//", "mailto:")):
            continue
        relative = unquote(value.split("?", 1)[0].split("#", 1)[0])
        expect((ROOT / relative).is_file(), f"Recurso local no encontrado: {relative}")

    # La obra musical no necesita descargarse antes de hacer clic.
    expect((ROOT / "assets/peritune-world-op2.mp3").is_file(), "Falta la pista musical")
    expect((ROOT / "assets/bosque-nocturno-movil.webp").is_file(), "Falta fondo móvil")
    expect((ROOT / "assets/bosque-nocturno-desktop.webp").is_file(), "Falta fondo escritorio")

    if errors:
        print("\nERRORES EN AUDITORÍA:")
        for error in errors:
            print(" -", error)
        raise SystemExit(1)
    print(f"Auditoría OK: {len(refs)} enlaces literales locales y externos, OG único y recursos presentes")


if __name__ == "__main__":
    main()
