#!/usr/bin/env python3
"""Create WebP copies of the site's illustrations and update references only after success.
Original PNG files remain in the repository as editable backups.
"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
TAROT = ASSETS / "tarot"


def webp(source, target, max_size=(1000, 1420), quality=82):
    if not source.is_file():
        raise FileNotFoundError(source)
    with Image.open(source) as img:
        img = ImageOps.exif_transpose(img)
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGBA" if "transparency" in img.info else "RGB")
        img.save(target, "WEBP", quality=quality, method=6)
    old = source.stat().st_size
    new = target.stat().st_size
    print(f"{source.relative_to(ROOT)}: {old // 1024} KB -> {new // 1024} KB", flush=True)


cards = sorted(TAROT.glob("*.png"))
if len(cards) != 12:
    raise RuntimeError(f"Se esperaban 12 cartas, se encontraron {len(cards)}")
for card in cards:
    webp(card, card.with_suffix(".webp"), max_size=(1000, 1420), quality=82)

webp(ASSETS / "principe-base.png", ASSETS / "principe-base.webp",
     max_size=(920, 1350), quality=84)
webp(ASSETS / "receta-pocion-antigua.png", ASSETS / "receta-pocion-antigua.webp",
     max_size=(1500, 1600), quality=83)

mapas = list(ASSETS.glob("Mapa*de*Mares*Encantados.png"))
if len(mapas) != 1:
    raise RuntimeError("No se encontró el mapa original único")
webp(mapas[0], ASSETS / "mapa-fantastico.webp",
     max_size=(1600, 1400), quality=82)

def update(filename, pairs):
    path = ROOT / filename
    txt = path.read_text(encoding="utf-8")
    original = txt
    for old, new in pairs:
        if old in txt:
            txt = txt.replace(old, new)
        elif new not in txt:
            raise RuntimeError(f"Falta la referencia {old!r} en {filename}")
    if txt != original:
        path.write_text(txt, encoding="utf-8")
        print("Actualizado:", filename, flush=True)

update("index.html", [
    ('src="assets/principe-base.png"',
     'src="assets/principe-base.webp" decoding="async" fetchpriority="high"'),
    ('src="assets/tarot/la-estrella.png"',
     'src="assets/tarot/la-estrella.webp" loading="lazy" decoding="async"'),
    ('efectos-magicos.js?v=20261009-luces-moviles',
     'efectos-magicos.js?v=20261009-webp'),
    ('sendero.css?v=20261009-lacre',
     'sendero.css?v=20261009-webp'),
])
update("efectos-magicos.js", [
    ('imagen.src = "assets/tarot/" + resultado.slug + ".png";',
     'imagen.src = "assets/tarot/" + resultado.slug + ".webp";')
])
update("sendero.css", [
    ('url("assets/receta-pocion-antigua.png")',
     'url("assets/receta-pocion-antigua.webp")'),
    ('url("assets/Mapa%20Fanta%CC%81stico%20de%20Mares%20Encantados.png")',
     'url("assets/mapa-fantastico.webp")'),
])

for orig in cards:
    if not orig.with_suffix(".webp").is_file():
        raise RuntimeError("Carta no convertida " + str(orig))
print("Optimización terminada, 12 cartas y 3 imágenes grandes en WebP.", flush=True)
