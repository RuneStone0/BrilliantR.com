#!/usr/bin/env python3
"""Generate a QR code linking to brilliantr.com with the diamond logo centered on top.

Usage:
    python3 generate_qr.py [URL] [-o OUTPUT] [--logo LOGO_PATH] [--color HEX] [--size PX]

Examples:
    python3 generate_qr.py
    python3 generate_qr.py https://brilliantr.com/#contact -o qr-contact.png
    python3 generate_qr.py -u https://brilliantr.com/#contact -o qr-contact.png
    python3 generate_qr.py --logo ../website/logos/diamond-black.png --color "#0A0A0A"
"""

import argparse
import sys
from pathlib import Path

try:
    import qrcode
    from qrcode.constants import ERROR_CORRECT_H
    from PIL import Image
except ImportError:
    sys.exit(
        "Missing dependencies. Install them with:\n"
        "    pip3 install qrcode[pil] pillow"
    )

SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_URL = "https://brilliantr.com"
DEFAULT_LOGO = SCRIPT_DIR.parent / "website" / "logos" / "icon-diamond-black.png"
DEFAULT_OUTPUT = SCRIPT_DIR / "qr-code.png"


def generate_qr(
    url: str,
    output: Path,
    logo_path: Path,
    fill_color: str = "black",
    back_color: str = "white",
    box_size: int = 12,
    logo_size_ratio: float = 0.28,
) -> Path:
    qr = qrcode.QRCode(
        # High error correction (~30% recoverable) so the logo can cover
        # the center without breaking scannability.
        error_correction=ERROR_CORRECT_H,
        box_size=box_size,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color=fill_color, back_color=back_color).convert("RGB")

    if logo_path and logo_path.exists():
        logo = Image.open(logo_path).convert("RGBA")

        qr_width, qr_height = img.size
        logo_target = int(min(qr_width, qr_height) * logo_size_ratio)
        logo.thumbnail((logo_target, logo_target), Image.LANCZOS)

        # White backing plate behind the logo so it stays legible against
        # the QR pattern, with a small padding border.
        pad = int(logo.size[0] * 0.12)
        plate_size = (logo.size[0] + pad * 2, logo.size[1] + pad * 2)
        plate = Image.new("RGBA", plate_size, back_color)
        plate.paste(logo, (pad, pad), logo)

        pos = ((qr_width - plate.size[0]) // 2, (qr_height - plate.size[1]) // 2)
        img.paste(plate, pos, plate)
    elif logo_path:
        print(f"Warning: logo not found at {logo_path}, generating QR without a logo.")

    output.parent.mkdir(parents=True, exist_ok=True)
    img.save(output)
    return output


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("url", nargs="?", default=None, help=f"URL to encode (default: {DEFAULT_URL})")
    parser.add_argument("-u", "--url-flag", dest="url_flag", default=None, help="Same as the positional URL argument, provided as a named flag")
    parser.add_argument("-o", "--output", type=Path, default=DEFAULT_OUTPUT, help="Output PNG path (default: qr-codes/qr-code.png)")
    parser.add_argument("--logo", type=Path, default=DEFAULT_LOGO, help="Path to logo image (default: website/logos/icon-diamond-black.png)")
    parser.add_argument("--no-logo", action="store_true", help="Generate a plain QR code without a logo")
    parser.add_argument("--color", default="black", help="QR foreground color, e.g. black or #0A0A0A (default: black)")
    parser.add_argument("--background", default="white", help="QR background color (default: white)")
    parser.add_argument("--size", type=int, default=12, help="Box size / pixel scale of each QR module (default: 12)")
    args = parser.parse_args()

    url = args.url or args.url_flag or DEFAULT_URL
    logo_path = None if args.no_logo else args.logo

    output = generate_qr(
        url=url,
        output=args.output,
        logo_path=logo_path,
        fill_color=args.color,
        back_color=args.background,
        box_size=args.size,
    )
    print(f"QR code for '{url}' saved to {output}")


if __name__ == "__main__":
    main()
