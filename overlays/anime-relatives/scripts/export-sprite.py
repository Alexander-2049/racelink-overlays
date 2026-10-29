"""Exports the layers of Sutemo's sprite into src/assets/girl/, all on one crop.

python -m pip install psd-tools pillow
python scripts/export-sprite.py "<path to Female Sprite by Sutemo.psd>"
(the sprite: https://sutemo.itch.io/female-character)
"""
import os, sys
from psd_tools import PSDImage
from PIL import Image

def find(group, name):
    for child in group:
        if child.name.strip().lower() == name.strip().lower():
            return child
    raise KeyError(f'{name} not in {group.name}: {[c.name for c in group]}')

def render(layer, size):
    """A layer or group composited alone on a transparent canvas of the document size."""
    def enable(node):
        node.visible = True
        if node.is_group():
            for child in node:
                enable(child)
    enable(layer)
    # a layer inside a hidden group composites as hidden: show its ancestors too
    parent = layer.parent
    while parent is not None and hasattr(parent, 'visible') and parent.kind != 'psdimage':
        parent.visible = True
        parent = parent.parent
    canvas = Image.new('RGBA', size, (0, 0, 0, 0))
    image = layer.composite(viewport=(0, 0, size[0], size[1]), force=True)
    if image is not None:
        canvas.alpha_composite(image.convert('RGBA'))
    return canvas
psd_path = sys.argv[1]
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "assets", "girl")
psd = PSDImage.open(psd_path)
size = psd.size
CROP = (40, 100, 940, 1145)
HEIGHT = 560
scale = HEIGHT / (CROP[3] - CROP[1])
OUT_SIZE = (round((CROP[2] - CROP[0]) * scale), HEIGHT)

colors = {'blonde': ['Blondie', 'Blond'], 'silver': ['Silver'], 'pink': ['Pink'], 'brown': ['Brown'], 'dark': ['Dark']}

def pick(group, names):
    for name in names:
        try:
            return find(group, name)
        except KeyError:
            pass
    raise KeyError(names)

def save(image, rel):
    path = os.path.join(out, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    image.crop(CROP).resize(OUT_SIZE, Image.LANCZOS).save(path, 'WEBP', quality=86, method=6)

def layers(*nodes):
    image = Image.new('RGBA', size, (0, 0, 0, 0))
    for node in nodes:
        image.alpha_composite(render(node, size))
    return image

back = find(psd, 'Hair behind')
front = find(psd, 'Hair front')
backs = {'bob': 'Short Bob', 'long': 'Long Hair / Hime Cut', 'twin': 'Twin Tail', 'short': 'Short Hair'}
fronts = {'bob': 'Short Bob', 'hime': 'Hime Cut', 'long': 'Long Hair', 'twin': 'Twin tail / Short Hair'}
for color, names in colors.items():
    for key, group in backs.items():
        save(layers(pick(find(back, group), names)), f'hair-back/{key}-{color}.webp')
    for key, group in fronts.items():
        save(layers(pick(find(front, group), names)), f'hair-front/{key}-{color}.webp')

save(layers(find(psd, 'Base Body'), find(find(psd, 'Blush'), '1')), 'body.webp')
outfits = {'seifuku1': 'seifuku 1', 'seifuku2': 'seifuku 2', 'dress': 'Summer Dress', 'hoodie': 'Hoodie 1', 'pe': 'PE uniform', 'winter': 'Winter outfit', 'pajama': 'Pajama'}
for key, name in outfits.items():
    save(layers(find(find(psd, 'Costume'), name)), f'outfit/{key}.webp')
faces = {'smile': 'Smile', 'smile2': 'Smile 2', 'delighted': 'Delighted', 'laugh': 'Laugh', 'shocked': 'Shocked', 'sad': 'Sad', 'annoyed': 'Annoyed', 'angry': 'Angry', 'smug': 'Smug'}
for key, name in faces.items():
    save(layers(find(find(psd, 'Expression'), name)), f'face/{key}.webp')
accessories = {'glasses-red': 'Red Glasses', 'glasses-black': 'Black Glasses', 'glasses-round': 'Circle Glasses', 'flower': 'Flower', 'choker': 'Choker'}
for key, name in accessories.items():
    save(layers(find(find(psd, 'Accessories'), name)), f'accessory/{key}.webp')
print(OUT_SIZE)
