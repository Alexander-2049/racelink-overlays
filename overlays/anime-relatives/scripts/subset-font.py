"""Rebuilds src/fonts/dela-gothic-one-subset.woff2 with the glyphs src/phrases.ts uses.

python -m pip install fonttools brotli
python scripts/subset-font.py <path to DelaGothicOne-Regular.ttf>
(the font: https://github.com/google/fonts/tree/main/ofl/delagothicone, SIL OFL 1.1)
"""
import pathlib, sys
from fontTools import subset

root = pathlib.Path(__file__).resolve().parent.parent
phrases = (root / 'src' / 'phrases.ts').read_text(encoding='utf-8')
glyphs = sorted({c for c in phrases if ord(c) > 0x7e} | {chr(c) for c in range(0x20, 0x7f)})
options = subset.Options()
options.flavor = 'woff2'
options.layout_features = ['*']
font = subset.load_font(sys.argv[1], options)
subsetter = subset.Subsetter(options)
subsetter.populate(text=''.join(glyphs))
subsetter.subset(font)
out = root / 'src' / 'fonts' / 'dela-gothic-one-subset.woff2'
subset.save_font(font, str(out), options)
print(out, out.stat().st_size, 'bytes,', len(glyphs), 'glyphs')
