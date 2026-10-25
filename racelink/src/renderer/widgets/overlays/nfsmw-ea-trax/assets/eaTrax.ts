// Generated from the game's EA_TRAX interface package; do not edit.
import type { SceneObject } from '../types';

export const objects: readonly SceneObject[] = [
  {
    kind: 'timer',
    parent: null,
    texture: null,
    role: null,
    color: [0, 0, 0, 255],
    position: [266, -269, 100],
    size: [1, 1, 1],
    rotation: [0, 0, 0],
    scripts: {
      init: {
        length: 0,
        tracks: { color: { length: 0, loop: false, keys: [{ t: 0, v: [0, 0, 0, 255] }] } },
      },
      hide: {
        length: 0,
        tracks: { color: { length: 0, loop: false, keys: [{ t: 0, v: [0, 0, 0, 0] }] } },
      },
    },
  },
  {
    kind: 'group',
    parent: null,
    texture: null,
    role: null,
    color: [255, 255, 255, 255],
    position: [-203, -191, 146],
    size: [1, 1, 1],
    rotation: [0, 0, 0],
    scripts: {
      init: {
        length: 0,
        tracks: { position: { length: 0, loop: false, keys: [{ t: 0, v: [-203, -191, 146] }] } },
      },
    },
  },
  {
    kind: 'group',
    parent: 1,
    texture: null,
    role: null,
    color: [255, 255, 255, 255],
    position: [0, 0, 0],
    size: [1, 1, 1],
    rotation: [0, 0, 0],
    scripts: {
      init: {
        length: 0,
        tracks: { position: { length: 0, loop: false, keys: [{ t: 0, v: [0, 0, 0] }] } },
      },
    },
  },
  {
    kind: 'image',
    parent: 2,
    texture: 'trax_base',
    role: null,
    color: [255, 255, 255, 255],
    position: [60, 0, 163],
    size: [252, 64, 0],
    rotation: [0, 0, 0],
    scripts: {
      init: {
        length: 0,
        tracks: {
          color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 255] }] },
          position: { length: 0, loop: false, keys: [{ t: 0, v: [60, 0, 163] }] },
          size: { length: 0, loop: false, keys: [{ t: 0, v: [252, 64, 0] }] },
        },
      },
      extendMedium: {
        length: 1200,
        tracks: {
          color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 255] }] },
          position: {
            length: 1200,
            loop: false,
            keys: [
              { t: 1000, v: [-65, 0, 163] },
              { t: 1160, v: [60, 0, 163] },
            ],
          },
          size: {
            length: 1200,
            loop: false,
            keys: [
              { t: 1000, v: [0, 64, 0] },
              { t: 1160, v: [250, 64, 0] },
            ],
          },
        },
      },
      extendLong: {
        length: 1200,
        tracks: {
          color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 255] }] },
          position: {
            length: 1200,
            loop: false,
            keys: [
              { t: 1000, v: [-65, 0, 163] },
              { t: 1160, v: [94, 0, 163] },
            ],
          },
          size: {
            length: 1200,
            loop: false,
            keys: [
              { t: 1000, v: [0, 64, 0] },
              { t: 1160, v: [320, 64, 0] },
            ],
          },
        },
      },
      extendShort: {
        length: 1200,
        tracks: {
          color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 255] }] },
          position: {
            length: 1200,
            loop: false,
            keys: [
              { t: 1000, v: [-65, 0, 163] },
              { t: 1160, v: [34, 0, 163] },
            ],
          },
          size: {
            length: 1200,
            loop: false,
            keys: [
              { t: 1000, v: [0, 64, 0] },
              { t: 1160, v: [200, 64, 0] },
            ],
          },
        },
      },
      retractLong: {
        length: 1200,
        tracks: {
          color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 255] }] },
          position: {
            length: 1200,
            loop: false,
            keys: [
              { t: 200, v: [94, 0, 163] },
              { t: 360, v: [-65, 0, 163] },
            ],
          },
          size: {
            length: 1200,
            loop: false,
            keys: [
              { t: 200, v: [320, 64, 0] },
              { t: 360, v: [0, 64, 0] },
            ],
          },
        },
      },
      retractMedium: {
        length: 1200,
        tracks: {
          color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 255] }] },
          position: {
            length: 1200,
            loop: false,
            keys: [
              { t: 200, v: [60, 0, 163] },
              { t: 360, v: [-65, 0, 163] },
            ],
          },
          size: {
            length: 1200,
            loop: false,
            keys: [
              { t: 200, v: [250, 64, 0] },
              { t: 360, v: [0, 64, 0] },
            ],
          },
        },
      },
      retractShort: {
        length: 1200,
        tracks: {
          color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 255] }] },
          position: {
            length: 1200,
            loop: false,
            keys: [
              { t: 200, v: [34, 0, 163] },
              { t: 360, v: [-65, 0, 163] },
            ],
          },
          size: {
            length: 1200,
            loop: false,
            keys: [
              { t: 200, v: [200, 64, 0] },
              { t: 360, v: [0, 64, 0] },
            ],
          },
        },
      },
      hide: {
        length: 0,
        tracks: {
          color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 0] }] },
          position: { length: 0, loop: false, keys: [{ t: 0, v: [60, 0, 163] }] },
          size: { length: 0, loop: false, keys: [{ t: 0, v: [252, 64, 0] }] },
        },
      },
    },
  },
  {
    kind: 'image',
    parent: 2,
    texture: 'trax_tab',
    role: null,
    color: [255, 255, 255, 255],
    position: [201, 0, -47],
    size: [32, 62, 0],
    rotation: [0, 0, 0],
    scripts: {
      init: {
        length: 0,
        tracks: {
          color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 255] }] },
          position: { length: 0, loop: false, keys: [{ t: 0, v: [201, 0, -47] }] },
        },
      },
      extendMedium: {
        length: 1200,
        tracks: {
          color: {
            length: 0,
            loop: false,
            keys: [
              { t: 980, v: [255, 255, 255, 0] },
              { t: 1000, v: [255, 255, 255, 255] },
            ],
          },
          position: {
            length: 1200,
            loop: false,
            keys: [
              { t: 1000, v: [-49, 0, 143] },
              { t: 1160, v: [201, 0, -47] },
            ],
          },
        },
      },
      extendShort: {
        length: 1200,
        tracks: {
          color: {
            length: 1200,
            loop: false,
            keys: [
              { t: 980, v: [255, 255, 255, 0] },
              { t: 1000, v: [255, 255, 255, 255] },
              { t: 1160, v: [255, 255, 255, 255] },
            ],
          },
          position: {
            length: 1200,
            loop: false,
            keys: [
              { t: 980, v: [-49, 0, -47] },
              { t: 1000, v: [-49, 0, 143] },
              { t: 1160, v: [150, 0, -47] },
            ],
          },
        },
      },
      extendLong: {
        length: 1200,
        tracks: {
          color: {
            length: 1200,
            loop: false,
            keys: [
              { t: 980, v: [255, 255, 255, 0] },
              { t: 1000, v: [255, 255, 255, 255] },
            ],
          },
          position: {
            length: 1200,
            loop: false,
            keys: [
              { t: 980, v: [270, 0, -47] },
              { t: 1000, v: [-49, 0, 133] },
              { t: 1160, v: [270, 0, -47] },
            ],
          },
        },
      },
      retractLong: {
        length: 1200,
        tracks: {
          color: {
            length: 1200,
            loop: false,
            keys: [
              { t: 200, v: [255, 255, 255, 255] },
              { t: 360, v: [255, 255, 255, 255] },
              { t: 380, v: [255, 255, 255, 0] },
            ],
          },
          position: {
            length: 1200,
            loop: false,
            keys: [
              { t: 200, v: [270, 0, -47] },
              { t: 360, v: [-49, 0, 133] },
              { t: 380, v: [270, 0, -47] },
            ],
          },
        },
      },
      retractMedium: {
        length: 1200,
        tracks: {
          color: {
            length: 0,
            loop: false,
            keys: [
              { t: 200, v: [255, 255, 255, 255] },
              { t: 360, v: [255, 255, 255, 255] },
              { t: 380, v: [255, 255, 255, 0] },
            ],
          },
          position: {
            length: 1200,
            loop: false,
            keys: [
              { t: 200, v: [201, 0, -47] },
              { t: 360, v: [-49, 0, 143] },
            ],
          },
        },
      },
      retractShort: {
        length: 1200,
        tracks: {
          color: {
            length: 1200,
            loop: false,
            keys: [
              { t: 200, v: [255, 255, 255, 255] },
              { t: 360, v: [255, 255, 255, 255] },
              { t: 380, v: [255, 255, 255, 0] },
            ],
          },
          position: {
            length: 1200,
            loop: false,
            keys: [
              { t: 200, v: [150, 0, -47] },
              { t: 360, v: [-49, 0, 143] },
              { t: 380, v: [-49, 0, -47] },
            ],
          },
        },
      },
      hide: {
        length: 0,
        tracks: {
          color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 0] }] },
          position: { length: 0, loop: false, keys: [{ t: 0, v: [201, 0, -47] }] },
        },
      },
    },
  },
  {
    kind: 'group',
    parent: 2,
    texture: null,
    role: null,
    color: [255, 255, 255, 255],
    position: [-24, -8, -47],
    size: [1, 1, 1],
    rotation: [0, 0, 0],
    scripts: {
      init: {
        length: 0,
        tracks: { color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 255] }] } },
      },
      appear: {
        length: 1200,
        tracks: {
          color: {
            length: 1200,
            loop: false,
            keys: [
              { t: 1140, v: [255, 255, 255, 0] },
              { t: 1160, v: [255, 255, 255, 255] },
            ],
          },
        },
      },
      disappear: {
        length: 200,
        tracks: {
          color: {
            length: 200,
            loop: false,
            keys: [
              { t: 0, v: [255, 255, 255, 255] },
              { t: 200, v: [255, 255, 255, 0] },
            ],
          },
        },
      },
      hide: {
        length: 0,
        tracks: { color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 0] }] } },
      },
    },
  },
  {
    kind: 'text',
    parent: 5,
    texture: null,
    role: 'title',
    color: [255, 255, 255, 255],
    position: [-1, -16, -1],
    size: [0.8, 0.8, 1],
    rotation: [0, 0, 0],
    scripts: { init: { length: 0, tracks: {} } },
  },
  {
    kind: 'text',
    parent: 5,
    texture: null,
    role: 'artist',
    color: [180, 180, 140, 255],
    position: [-1, 0, -1],
    size: [0.75, 0.75, 1],
    rotation: [0, 0, 0],
    scripts: { init: { length: 0, tracks: {} } },
  },
  {
    kind: 'text',
    parent: 5,
    texture: null,
    role: 'album',
    color: [180, 180, 140, 255],
    position: [-1, 15, -1],
    size: [0.75, 0.75, 1],
    rotation: [0, 0, 0],
    scripts: { init: { length: 0, tracks: {} } },
  },
  {
    kind: 'group',
    parent: 2,
    texture: null,
    role: null,
    color: [255, 255, 255, 255],
    position: [-66, 0, 23],
    size: [1, 1, 1],
    rotation: [0, 0, 0],
    scripts: {
      init: {
        length: 0,
        tracks: { color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 255] }] } },
      },
      appear: {
        length: 1200,
        tracks: {
          color: {
            length: 1200,
            loop: false,
            keys: [
              { t: 620, v: [255, 255, 255, 0] },
              { t: 900, v: [255, 255, 255, 255] },
            ],
          },
        },
      },
      disappear: {
        length: 1200,
        tracks: {
          color: {
            length: 1200,
            loop: false,
            keys: [
              { t: 360, v: [255, 255, 255, 255] },
              { t: 600, v: [255, 255, 255, 0] },
            ],
          },
        },
      },
      hide: {
        length: 0,
        tracks: { color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 0] }] } },
      },
    },
  },
  {
    kind: 'image',
    parent: 9,
    texture: 'ea',
    role: null,
    color: [255, 255, 255, 255],
    position: [0, -1, -70],
    size: [50, 25, 0],
    rotation: [0, 0, 0],
    scripts: {
      init: {
        length: 0,
        tracks: {
          color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 255] }] },
          size: { length: 0, loop: false, keys: [{ t: 0, v: [50, 25, 0] }] },
        },
      },
      appear: {
        length: 1200,
        tracks: {
          color: {
            length: 1200,
            loop: false,
            keys: [
              { t: 800, v: [255, 255, 255, 0] },
              { t: 1000, v: [255, 255, 255, 255] },
            ],
          },
          size: {
            length: 1200,
            loop: false,
            keys: [
              { t: 800, v: [140, 70, 0] },
              { t: 1000, v: [50, 25, 0] },
            ],
          },
        },
      },
      disappear: {
        length: 1200,
        tracks: {
          color: {
            length: 1200,
            loop: false,
            keys: [
              { t: 360, v: [255, 255, 255, 255] },
              { t: 1200, v: [255, 255, 255, 0] },
            ],
          },
          size: {
            length: 1200,
            loop: false,
            keys: [
              { t: 360, v: [50, 25, 0] },
              { t: 1200, v: [140, 70, 0] },
            ],
          },
        },
      },
      hide: {
        length: 0,
        tracks: {
          color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 0] }] },
          size: { length: 0, loop: false, keys: [{ t: 0, v: [50, 25, 0] }] },
        },
      },
    },
  },
  {
    kind: 'image',
    parent: 9,
    texture: 'inner_stripes',
    role: null,
    color: [40, 40, 40, 255],
    position: [0, 0, 30],
    size: [52, 52, 0],
    rotation: [0, 0, 0],
    scripts: {
      init: {
        length: 0,
        tracks: { color: { length: 0, loop: false, keys: [{ t: 0, v: [40, 40, 40, 255] }] } },
      },
      flash: {
        length: 1200,
        tracks: {
          color: {
            length: 1200,
            loop: false,
            keys: [
              { t: 980, v: [0, 0, 0, 0] },
              { t: 1000, v: [220, 220, 220, 255] },
              { t: 1200, v: [40, 40, 40, 255] },
            ],
          },
        },
      },
      hide: {
        length: 0,
        tracks: { color: { length: 0, loop: false, keys: [{ t: 0, v: [40, 40, 40, 0] }] } },
      },
    },
  },
  {
    kind: 'image',
    parent: 9,
    texture: 'black_circle_base',
    role: null,
    color: [255, 255, 255, 255],
    position: [0, 0, 100],
    size: [53, 53, 0],
    rotation: [0, 0, 0],
    scripts: { init: { length: 0, tracks: {} } },
  },
  {
    kind: 'image',
    parent: 9,
    texture: 'black_ring',
    role: null,
    color: [255, 255, 255, 255],
    position: [0, 0, 111],
    size: [64, 64, 0],
    rotation: [0, 0, 0],
    scripts: { init: { length: 0, tracks: {} } },
  },
  {
    kind: 'group',
    parent: 2,
    texture: null,
    role: null,
    color: [255, 255, 255, 255],
    position: [-66, 0, -47],
    size: [0.9, 0.9, 1],
    rotation: [0, 0, 0],
    scripts: {
      init: {
        length: 0,
        tracks: { color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 255] }] } },
      },
      appear: {
        length: 600,
        tracks: {
          color: {
            length: 600,
            loop: false,
            keys: [
              { t: 0, v: [255, 255, 255, 0] },
              { t: 600, v: [255, 255, 255, 255] },
            ],
          },
        },
      },
      hide: {
        length: 0,
        tracks: { color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 0] }] } },
      },
      disappear: {
        length: 1600,
        tracks: {
          color: {
            length: 1600,
            loop: false,
            keys: [
              { t: 900, v: [255, 255, 255, 255] },
              { t: 1600, v: [255, 255, 255, 0] },
            ],
          },
        },
      },
    },
  },
  {
    kind: 'image',
    parent: 14,
    texture: 'outter_ring',
    role: null,
    color: [255, 195, 115, 255],
    position: [0, 0, 70],
    size: [74, 74, 0],
    rotation: [0, 0, -1],
    scripts: {
      init: {
        length: 0,
        tracks: {
          position: { length: 0, loop: false, keys: [{ t: 0, v: [0, 0, 70] }] },
          rotation: { length: 0, loop: false, keys: [{ t: 0, v: [0, 0, -1] }] },
        },
      },
      animate: {
        length: 2800,
        tracks: {
          position: { length: 2800, loop: false, keys: [{ t: 0, v: [0, 0, 3] }] },
          rotation: {
            length: 2800,
            loop: true,
            keys: [
              { t: 0, v: [0, 0, -1] },
              { t: 1400, v: [0, 0, 0] },
              { t: 2800, v: [0, 0, -1.00000032584137] },
            ],
          },
        },
      },
    },
  },
];
