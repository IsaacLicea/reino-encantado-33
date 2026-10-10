#!/usr/bin/env python3
"""Genera un JPEG ligero para tarjetas WhatsApp/OG desde la imagen existente.

Preserva la composición original: NO recorta, no cambia el diseño ni su texto.
La imagen PNG de alta calidad permanece como respaldo.
"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "og-reino-33.png"
TARGET = ROOT / "assets" / "og-reino-33-wa-v2.jpg"
MAX_EDGE = 1200


def main():
    if not SOURCE.is_file():
        raise FileNotFoundError(SOURCE)
    with Image.open(SOURCE) as original:
        im = ImageOps.exif_transpose(original)
        old_size = im.size
        if im.mode in ("RGBA", "LA") or "transparency" in im.info:
            rgba = im.convert("RGBA")
            background = Image.new("RGBA", rgba.size, (10, 22, 36, 255))
            background.alpha_composite(rgba)
            im = background.convert("RGB")
        else:
            im = im.convert("RGB")
        im.thumbnail((MAX_EDGE, MAX_EDGE), Image.Resampling.LANCZOS)
        target_size = im.size
        if min(im.size) < 200:
            raise RuntimeError("Imagen OG demasiado pequeña para una vista previa")
        # 4:4:4 mantiene más nítida la tipografía pequeña que 4:2:0.
        for quality in (87, 84, 81, 78):
            im.save(
                TARGET,
                "JPEG",
                optimize=True,
                progressive=True,
                quality=quality,
                subsampling=0,
            )
            if TARGET.stat().st_size <= 950_000:
                break
    old_bytes = SOURCE.stat().st_size
    new_bytes = TARGET.stat().st_size
    print(f"OG original: {old_size[0]}x{old_size[1]} {old_bytes:,} bytes", flush=True)
    print(f"OG WhatsApp: {target_size[0]}x{target_size[1]} {new_bytes:,} bytes", flush=True)
    print(f"AHORRO_OG={100*(1-new_bytes/old_bytes):.1f}%", flush=True)
    if new_bytes > 1_300_000:
        raise RuntimeError("La imagen sigue siendo demasiado grande para vista previa")
    if new_bytes >= old_bytes:
        raise RuntimeError("La salida no reduce el peso")
    with Image.open(TARGET) as check:
        check.verify()


if __name__ == "__main__":
    main()
