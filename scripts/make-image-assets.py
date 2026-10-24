"""Regenerate logo sizes, favicons and the social image from assets-source/Proteinworkk_logo.png.

Usage (needs Pillow: pip install pillow):  python3 scripts/make-image-assets.py

Only the empty transparent margin is trimmed; the artwork is then resized proportionally with
transparency preserved. The logo is never redrawn, recoloured or stretched.
The social image uses DejaVu Sans for its text; change FONT_BOLD / FONT_REGULAR to use a brand font.
"""
from PIL import Image, ImageDraw, ImageFont

SRC = 'assets-source/Proteinworkk_logo.png'
OUT = 'public/images'
FONT_BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
FONT_REGULAR = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'

src = Image.open(SRC).convert('RGBA')
mark = src.crop(src.split()[3].getbbox())
w, h = mark.size


def sized(height):
    return mark.resize((round(w * height / h), height), Image.LANCZOS)


for height in (44, 88, 176, 512):
    sized(height).save(f'{OUT}/logo-h{height}.png', optimize=True)


def icon(px, name, pad=0.14):
    bg = Image.new('RGBA', (px, px), (248, 248, 241, 255))
    inner = int(px * (1 - 2 * pad))
    m = mark.copy()
    m.thumbnail((inner, inner), Image.LANCZOS)
    bg.alpha_composite(m, ((px - m.width) // 2, (px - m.height) // 2))
    bg.convert('RGB').save(f'{OUT}/{name}', optimize=True)


icon(180, 'apple-touch-icon.png')
icon(192, 'icon-192.png')
icon(512, 'icon-512.png')
icon(32, 'favicon-32.png', 0.06)
Image.open(f'{OUT}/favicon-32.png').save('public/favicon.ico', sizes=[(32, 32)])

W, H = 1200, 630
og = Image.new('RGB', (W, H), (32, 41, 27))
logo = sized(330)
og.paste(logo, (80, (H - logo.height) // 2), logo)
d = ImageDraw.Draw(og)
big, small = ImageFont.truetype(FONT_BOLD, 70), ImageFont.truetype(FONT_REGULAR, 34)
x = 80 + logo.width + 56
d.text((x, 205), 'Proteinworkk', font=big, fill=(248, 248, 241))
d.text((x, 305), 'Strength within reach.', font=small, fill=(210, 211, 90))
d.text((x, 370), 'Online fitness coaching and', font=small, fill=(200, 205, 190))
d.text((x, 415), 'nutrition support, Bengaluru', font=small, fill=(200, 205, 190))
og.save(f'{OUT}/og-default.png', optimize=True)
print('Image assets regenerated.')
