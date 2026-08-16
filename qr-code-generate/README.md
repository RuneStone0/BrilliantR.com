# QR Code Generator

Generates QR codes linking to brilliantr.com with the diamond logo embedded in the center.

## Setup

```bash
pip3 install qrcode[pil] pillow
```

## Usage

```bash
# Default: encodes https://brilliantr.com, saves to qr-code.png
python3 generate_qr.py

# Custom URL and output file (positional or -u/--url-flag both work)
python3 generate_qr.py "https://brilliantr.com/#contact" -o qr-contact.png
python3 generate_qr.py -u "https://brilliantr.com/#contact" -o qr-contact.png

# Use a different logo variant (see website/logos/)
python3 generate_qr.py --logo ../website/logos/diamond-black.png

# Custom color, no logo
python3 generate_qr.py --color "#0A0A0A" --no-logo
```

Run `python3 generate_qr.py --help` for all options.
