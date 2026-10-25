// Generated from the game's HUD_SingleRace interface package; do not edit.
import type { FengObject } from '../feng';

export type HudObjectName =
  | 'ring'
  | 'ringArc1'
  | 'ringArc2'
  | 'mapBacking'
  | 'mapBackingDisc'
  | 'messages'
  | 'messageIcon'
  | 'messageGlow'
  | 'message'
  | 'messageBody'
  | 'messageText'
  | 'messageShadow'
  | 'rows'
  | 'row0Back'
  | 'row1Back'
  | 'row2Back'
  | 'row3Back'
  | 'row3Number'
  | 'row3Name'
  | 'row2Number'
  | 'row2Name'
  | 'row1Number'
  | 'row1Name'
  | 'row0Number'
  | 'row0Name'
  | 'status'
  | 'positionBacking'
  | 'timeBacking'
  | 'lapBar'
  | 'raceTime'
  | 'timerIcon'
  | 'positionGroup'
  | 'position'
  | 'positionLine'
  | 'racers'
  | 'lapGroup'
  | 'laps'
  | 'lapLabel'
  | 'timerGlow'
  | 'carIcon';

export const hudObjects: Readonly<Record<HudObjectName, FengObject>> = {
  ring: {
    kind: 'group',
    parent: null,
    texture: null,
    text: null,
    color: [255, 255, 255, 255],
    position: [-373.2501, 108.5, 285.84],
    size: [1, 1, 1],
    rotation: [0, 0, 0, 1],
    scripts: { init: { length: 0, chain: null, tracks: {} } },
  },
  ringArc1: {
    kind: 'image',
    parent: 'ring',
    texture: 'meter_backing',
    text: null,
    color: [255, 255, 255, 60],
    position: [32, 31, 100],
    size: [151, 151, 1],
    rotation: [0.342, -0.9397, 0, 0],
    scripts: { init: { length: 0, chain: null, tracks: {} } },
  },
  ringArc2: {
    kind: 'image',
    parent: 'ring',
    texture: 'meter_backing',
    text: null,
    color: [255, 255, 255, 60],
    position: [32.25, 30.5, 100],
    size: [151, 151, 1],
    rotation: [0.9537, 0.3007, 0, 0],
    scripts: { init: { length: 0, chain: null, tracks: {} } },
  },
  mapBacking: {
    kind: 'group',
    parent: null,
    texture: null,
    text: null,
    color: [255, 255, 255, 255],
    position: [-340.9988, 139.0025, 549.9963],
    size: [1, 1, 1],
    rotation: [0, 0, 0, 1],
    scripts: { init: { length: 0, chain: null, tracks: {} } },
  },
  mapBackingDisc: {
    kind: 'image',
    parent: 'mapBacking',
    texture: 'minimap_backing_color',
    text: null,
    color: [0, 0, 0, 200],
    position: [0, 0, 450],
    size: [-136, 136, 0],
    rotation: [0, 0, 0, 1],
    scripts: { init: { length: 0, chain: null, tracks: {} } },
  },
  messages: {
    kind: 'group',
    parent: null,
    texture: null,
    text: null,
    color: [255, 255, 255, 255],
    position: [-6.5, -19.9473, 92.5227],
    size: [1, 1, 1],
    rotation: [0, 0, 0, 1],
    scripts: {
      init: {
        length: 0,
        chain: null,
        tracks: { color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 255] }] } },
      },
      fadein: {
        length: 600,
        chain: null,
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
      fadeout: {
        length: 600,
        chain: null,
        tracks: {
          color: {
            length: 600,
            loop: false,
            keys: [
              { t: 0, v: [255, 255, 255, 255] },
              { t: 600, v: [255, 255, 255, 0] },
            ],
          },
        },
      },
    },
  },
  messageIcon: {
    kind: 'image',
    parent: 'messages',
    texture: 'cops_takenout_icon',
    text: null,
    color: [255, 255, 255, 255],
    position: [6.5, -99.05, 20],
    size: [38, 38, 0],
    rotation: [0, 0, 0, 1],
    scripts: {
      init: {
        length: 0,
        chain: 'hide',
        tracks: {
          color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 255] }] },
          position: { length: 0, loop: false, keys: [{ t: 0, v: [6.5, -99.05, 20] }] },
        },
      },
      s1621060373: {
        length: 2400,
        chain: null,
        tracks: {
          color: {
            length: 2400,
            loop: false,
            keys: [
              { t: 220, v: [255, 255, 255, 255] },
              { t: 2200, v: [255, 255, 255, 255] },
              { t: 2400, v: [255, 255, 255, 0] },
            ],
          },
          position: {
            length: 0,
            loop: false,
            keys: [
              { t: 220, v: [6.5, -99.05, 20] },
              { t: 2200, v: [6.5, -69.05, 20] },
              { t: 2400, v: [6.5, -9.05, 20] },
            ],
          },
        },
      },
      hide: {
        length: 0,
        chain: null,
        tracks: {
          color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 0] }] },
          position: { length: 0, loop: false, keys: [{ t: 0, v: [6.5, -99.05, 20] }] },
        },
      },
      lapIcon: {
        length: 2400,
        chain: null,
        tracks: {
          color: {
            length: 2400,
            loop: false,
            keys: [
              { t: 220, v: [255, 255, 255, 255] },
              { t: 2200, v: [255, 255, 255, 255] },
              { t: 2400, v: [255, 255, 255, 0] },
            ],
          },
          position: {
            length: 0,
            loop: false,
            keys: [
              { t: 220, v: [6.5, -99.05, 20] },
              { t: 2200, v: [6.5, -69.05, 20] },
              { t: 2400, v: [6.5, 98.95, 20] },
            ],
          },
        },
      },
      s331590652: {
        length: 2400,
        chain: null,
        tracks: {
          color: {
            length: 2400,
            loop: false,
            keys: [
              { t: 220, v: [255, 255, 255, 255] },
              { t: 2200, v: [255, 255, 255, 255] },
              { t: 2400, v: [255, 255, 255, 0] },
            ],
          },
          position: {
            length: 0,
            loop: false,
            keys: [
              { t: 220, v: [6.5, -99.05, 20] },
              { t: 2200, v: [6.5, -69.05, 20] },
              { t: 2400, v: [6.5, 98.95, 20] },
            ],
          },
        },
      },
    },
  },
  messageGlow: {
    kind: 'image',
    parent: 'messages',
    texture: 'iconselection_glow',
    text: null,
    color: [255, 174, 64, 180],
    position: [6.5, -98.05, 10],
    size: [34, 34, 0],
    rotation: [0, 0, 0, 1],
    scripts: {
      init: {
        length: 0,
        chain: 'hide',
        tracks: {
          color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 174, 64, 180] }] },
          position: { length: 0, loop: false, keys: [{ t: 0, v: [6.5, -98.05, 10] }] },
          size: { length: 0, loop: false, keys: [{ t: 0, v: [34, 34, 0] }] },
        },
      },
      hide: {
        length: 0,
        chain: null,
        tracks: {
          color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 174, 64, 0] }] },
          position: { length: 0, loop: false, keys: [{ t: 0, v: [6.5, -98.05, 10] }] },
          size: { length: 0, loop: false, keys: [{ t: 0, v: [34, 34, 0] }] },
        },
      },
      pulse: {
        length: 2400,
        chain: null,
        tracks: {
          color: {
            length: 2400,
            loop: false,
            keys: [
              { t: 0, v: [255, 174, 64, 0] },
              { t: 200, v: [255, 174, 64, 180] },
              { t: 220, v: [255, 174, 64, 109] },
              { t: 400, v: [255, 174, 64, 0] },
              { t: 600, v: [255, 174, 64, 180] },
              { t: 800, v: [255, 174, 64, 0] },
              { t: 1000, v: [255, 174, 64, 180] },
              { t: 1200, v: [255, 174, 64, 0] },
              { t: 1400, v: [255, 174, 64, 180] },
              { t: 1600, v: [255, 174, 64, 0] },
              { t: 1800, v: [255, 174, 64, 180] },
              { t: 2000, v: [255, 174, 64, 0] },
              { t: 2200, v: [255, 174, 64, 180] },
              { t: 2400, v: [255, 174, 64, 0] },
            ],
          },
          position: {
            length: 0,
            loop: false,
            keys: [
              { t: 220, v: [6.5, -98.05, 10] },
              { t: 400, v: [6.5, -96.05, 10] },
              { t: 600, v: [6.5, -93.05, 10] },
              { t: 800, v: [6.5, -90.05, 10] },
              { t: 1000, v: [6.5, -87.05, 10] },
              { t: 1200, v: [6.5, -84.05, 10] },
              { t: 1400, v: [6.5, -81.05, 10] },
              { t: 1600, v: [6.5, -78.05, 10] },
              { t: 1800, v: [6.5, -75.05, 10] },
              { t: 2000, v: [6.5, -72.05, 10] },
              { t: 2200, v: [6.5, -69.05, 10] },
              { t: 2400, v: [6.5, -7.05, 10] },
            ],
          },
          size: { length: 0, loop: false, keys: [{ t: 0, v: [48, 48, 0] }] },
        },
      },
      lapGlow: {
        length: 2400,
        chain: null,
        tracks: {
          color: {
            length: 2400,
            loop: false,
            keys: [
              { t: 0, v: [255, 174, 64, 0] },
              { t: 200, v: [255, 174, 64, 180] },
              { t: 220, v: [255, 174, 64, 109] },
              { t: 400, v: [255, 174, 64, 0] },
              { t: 600, v: [255, 174, 64, 180] },
              { t: 800, v: [255, 174, 64, 0] },
              { t: 1000, v: [255, 174, 64, 180] },
              { t: 1200, v: [255, 174, 64, 0] },
              { t: 1400, v: [255, 174, 64, 180] },
              { t: 1600, v: [255, 174, 64, 0] },
              { t: 1800, v: [255, 174, 64, 180] },
              { t: 2000, v: [255, 174, 64, 0] },
              { t: 2200, v: [255, 174, 64, 180] },
              { t: 2400, v: [255, 174, 64, 10] },
            ],
          },
          position: {
            length: 0,
            loop: false,
            keys: [
              { t: 220, v: [6.5, -98.05, 10] },
              { t: 400, v: [6.5, -96.05, 10] },
              { t: 600, v: [6.5, -93.05, 10] },
              { t: 800, v: [6.5, -90.05, 10] },
              { t: 1000, v: [6.5, -87.05, 10] },
              { t: 1200, v: [6.5, -84.05, 10] },
              { t: 1400, v: [6.5, -81.05, 10] },
              { t: 1600, v: [6.5, -78.05, 10] },
              { t: 1800, v: [6.5, -75.05, 10] },
              { t: 2000, v: [6.5, -72.05, 10] },
              { t: 2200, v: [6.5, -69.05, 10] },
              { t: 2400, v: [6.5, 101.95, 10] },
            ],
          },
          size: { length: 0, loop: false, keys: [{ t: 0, v: [48, 48, 0] }] },
        },
      },
    },
  },
  message: {
    kind: 'group',
    parent: 'messages',
    texture: null,
    text: null,
    color: [255, 255, 255, 255],
    position: [6.5, -63.05, 20],
    size: [1, 1, 1],
    rotation: [0, 0, 0, 1],
    scripts: {
      init: {
        length: 0,
        chain: null,
        tracks: {
          color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 255] }] },
          size: { length: 0, loop: false, keys: [{ t: 0, v: [1, 1, 1] }] },
        },
      },
      zoomout: {
        length: 200,
        chain: 'hide',
        tracks: {
          color: {
            length: 200,
            loop: false,
            keys: [
              { t: 0, v: [255, 255, 255, 255] },
              { t: 200, v: [255, 255, 255, 60] },
            ],
          },
          size: {
            length: 200,
            loop: false,
            keys: [
              { t: 0, v: [1, 1, 1] },
              { t: 200, v: [8, 8, 1] },
            ],
          },
        },
      },
      hide: {
        length: 0,
        chain: null,
        tracks: {
          color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 0] }] },
          size: { length: 0, loop: false, keys: [{ t: 0, v: [1, 1, 1] }] },
        },
      },
    },
  },
  messageBody: {
    kind: 'group',
    parent: 'message',
    texture: null,
    text: null,
    color: [255, 255, 255, 255],
    position: [0, -30, 0],
    size: [1, 1, 1],
    rotation: [0, 0, 0, 1],
    scripts: {
      init: {
        length: 0,
        chain: 'hide',
        tracks: {
          color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 255] }] },
          position: { length: 0, loop: false, keys: [{ t: 0, v: [0, -30, 0] }] },
          rotation: { length: 0, loop: false, keys: [{ t: 0, v: [0, 0, 0, 1] }] },
          size: { length: 0, loop: false, keys: [{ t: 0, v: [1, 1, 1] }] },
        },
      },
      hide: {
        length: 0,
        chain: null,
        tracks: {
          color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 0] }] },
          position: { length: 0, loop: false, keys: [{ t: 0, v: [0, -30, 0] }] },
          rotation: { length: 0, loop: false, keys: [{ t: 0, v: [0, 0, 0, 1] }] },
          size: { length: 0, loop: false, keys: [{ t: 0, v: [0.8, 0.8, 1] }] },
        },
      },
      zoomin: {
        length: 2400,
        chain: null,
        tracks: {
          color: {
            length: 2400,
            loop: false,
            keys: [
              { t: 0, v: [255, 255, 255, 120] },
              { t: 20, v: [255, 255, 255, 120] },
              { t: 40, v: [255, 255, 255, 255] },
              { t: 60, v: [255, 255, 255, 255] },
              { t: 100, v: [255, 255, 255, 255] },
              { t: 140, v: [255, 255, 255, 255] },
              { t: 160, v: [255, 255, 255, 255] },
              { t: 200, v: [255, 255, 255, 255] },
              { t: 220, v: [255, 255, 255, 255] },
              { t: 260, v: [255, 255, 255, 255] },
              { t: 280, v: [255, 255, 255, 255] },
              { t: 300, v: [255, 255, 255, 255] },
              { t: 2220, v: [255, 255, 255, 255] },
              { t: 2400, v: [255, 255, 255, 0] },
            ],
          },
          position: {
            length: 2400,
            loop: false,
            keys: [
              { t: 0, v: [0, -30, 0] },
              { t: 20, v: [0, -30, 0] },
              { t: 40, v: [-69, -30, 20] },
              { t: 60, v: [-69, -30, 20] },
              { t: 100, v: [68, -4, 0] },
              { t: 140, v: [68, -4, 0] },
              { t: 160, v: [-39, -43, 0] },
              { t: 200, v: [-39, -43, 0] },
              { t: 220, v: [50, 18, 0] },
              { t: 260, v: [-47, -36, 0] },
              { t: 280, v: [85, 4, 0] },
              { t: 300, v: [0, -30, 0] },
              { t: 2220, v: [0, 1, 0] },
              { t: 2400, v: [0, 129, 0] },
            ],
          },
          rotation: {
            length: 0,
            loop: false,
            keys: [
              { t: 20, v: [0, 0, 0, 1] },
              { t: 40, v: [0, 0, -0.1045, 0.9945] },
              { t: 60, v: [0, 0, -0.1045, 0.9945] },
              { t: 100, v: [0, 0, 0, 1] },
              { t: 140, v: [0, 0, 0, 1] },
              { t: 160, v: [0, 0, 0.0785, 0.9969] },
              { t: 200, v: [0, 0, 0, 1] },
            ],
          },
          size: {
            length: 2400,
            loop: false,
            keys: [
              { t: 0, v: [2, 2, 1] },
              { t: 20, v: [2, 2, 1] },
              { t: 40, v: [0.9, 0.9, 1] },
              { t: 60, v: [0.9, 0.9, 1] },
              { t: 100, v: [0.9, 0.9, 1] },
              { t: 140, v: [0.9, 0.9, 1] },
              { t: 160, v: [0.9, 0.9, 1] },
              { t: 200, v: [0.9, 0.9, 1] },
              { t: 220, v: [1.5, 1.5, 1] },
              { t: 260, v: [1.5, 1.5, 1] },
              { t: 280, v: [1.2, 1.2, 1] },
              { t: 300, v: [0.9, 0.9, 1] },
              { t: 2220, v: [0.9, 0.9, 1] },
              { t: 2400, v: [0.9, 0.9, 1] },
            ],
          },
        },
      },
      appear: {
        length: 0,
        chain: null,
        tracks: {
          color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 255] }] },
          position: { length: 0, loop: false, keys: [{ t: 0, v: [0, -30, 0] }] },
          rotation: { length: 0, loop: false, keys: [{ t: 0, v: [0, 0, 0, 1] }] },
          size: { length: 0, loop: false, keys: [{ t: 0, v: [1, 1, 1] }] },
        },
      },
      splitAhead: {
        length: 3200,
        chain: null,
        tracks: {
          color: {
            length: 3200,
            loop: false,
            keys: [
              { t: 0, v: [194, 242, 64, 0] },
              { t: 500, v: [194, 242, 64, 255] },
              { t: 2700, v: [194, 242, 64, 255] },
              { t: 3200, v: [194, 242, 64, 0] },
            ],
          },
          position: {
            length: 3200,
            loop: false,
            keys: [
              { t: 0, v: [0, -50, 0] },
              { t: 500, v: [0, -30, 0] },
              { t: 2700, v: [0, -30, 0] },
              { t: 3200, v: [0, -50, 0] },
            ],
          },
          rotation: { length: 3200, loop: false, keys: [{ t: 0, v: [0, 0, 0, 1] }] },
          size: { length: 3200, loop: false, keys: [{ t: 0, v: [1, 1, 1] }] },
        },
      },
      s2641607701: {
        length: 3200,
        chain: null,
        tracks: {
          color: {
            length: 3200,
            loop: false,
            keys: [
              { t: 20, v: [255, 255, 255, 0] },
              { t: 40, v: [255, 255, 255, 51] },
              { t: 60, v: [255, 255, 255, 51] },
              { t: 80, v: [255, 255, 255, 102] },
              { t: 100, v: [255, 255, 255, 102] },
              { t: 120, v: [255, 255, 255, 102] },
              { t: 140, v: [255, 255, 255, 102] },
              { t: 160, v: [255, 255, 255, 255] },
              { t: 200, v: [255, 255, 255, 255] },
              { t: 280, v: [255, 255, 255, 255] },
              { t: 360, v: [255, 255, 255, 255] },
              { t: 3000, v: [255, 255, 255, 255] },
              { t: 3200, v: [255, 255, 255, 0] },
            ],
          },
          position: {
            length: 3200,
            loop: false,
            keys: [
              { t: 20, v: [0, 19, 0] },
              { t: 40, v: [0.8, 9.2, 0] },
              { t: 60, v: [0.8, 9.2, 0] },
              { t: 80, v: [205, -54, 0] },
              { t: 100, v: [205, -54, 0] },
              { t: 120, v: [-153, 24, 0] },
              { t: 140, v: [-153, 24, 0] },
              { t: 160, v: [52, -39, 0] },
              { t: 200, v: [4, -30, 0] },
              { t: 280, v: [4, -30, 0] },
              { t: 360, v: [4, -30, 0] },
              { t: 3000, v: [4, -30, 0] },
              { t: 3200, v: [4, 9, 0] },
            ],
          },
          rotation: { length: 3200, loop: false, keys: [{ t: 0, v: [0, 0, 0, 1] }] },
          size: {
            length: 3200,
            loop: false,
            keys: [
              { t: 20, v: [6, 6, 1] },
              { t: 40, v: [5.04, 5.04, 1] },
              { t: 60, v: [5.04, 5.04, 1] },
              { t: 80, v: [3, 3, 1] },
              { t: 100, v: [3, 3, 1] },
              { t: 120, v: [3, 3, 1] },
              { t: 140, v: [3, 3, 1] },
              { t: 160, v: [2, 2, 1] },
              { t: 200, v: [1.2, 1.2, 1] },
              { t: 280, v: [1.25, 1.25, 1] },
              { t: 360, v: [1.2, 1.2, 1] },
              { t: 3000, v: [1.5, 1.5, 1] },
              { t: 3200, v: [8, 8, 1] },
            ],
          },
        },
      },
      s2641607702: {
        length: 3600,
        chain: null,
        tracks: {
          color: {
            length: 3600,
            loop: false,
            keys: [
              { t: 0, v: [255, 255, 255, 0] },
              { t: 200, v: [255, 255, 255, 255] },
              { t: 3400, v: [255, 255, 255, 255] },
              { t: 3600, v: [255, 255, 255, 0] },
            ],
          },
          position: {
            length: 3600,
            loop: false,
            keys: [
              { t: 0, v: [0, -30, 0] },
              { t: 200, v: [0, -30, 0] },
              { t: 3400, v: [181, -30, 0] },
              { t: 3600, v: [459, -30, 0] },
            ],
          },
          rotation: { length: 3600, loop: false, keys: [{ t: 0, v: [0, 0, 0, 1] }] },
          size: {
            length: 3600,
            loop: false,
            keys: [
              { t: 0, v: [0.6, 0.6, 1] },
              { t: 200, v: [1, 1, 1] },
              { t: 3400, v: [1, 1, 1] },
              { t: 3600, v: [1, 1, 1] },
            ],
          },
        },
      },
      s2183029624: {
        length: 1200,
        chain: null,
        tracks: {
          color: {
            length: 1200,
            loop: true,
            keys: [
              { t: 0, v: [194, 242, 66, 255] },
              { t: 600, v: [255, 255, 255, 255] },
              { t: 1200, v: [194, 242, 66, 255] },
            ],
          },
          position: { length: 1200, loop: true, keys: [{ t: 0, v: [0, -30, 0] }] },
          rotation: { length: 1200, loop: true, keys: [{ t: 0, v: [0, 0, 0, 1] }] },
          size: {
            length: 1200,
            loop: true,
            keys: [
              { t: 0, v: [1, 1, 1] },
              { t: 600, v: [1.1, 1.1, 1] },
              { t: 1200, v: [1, 1, 1] },
            ],
          },
        },
      },
      s1333382050: {
        length: 1200,
        chain: null,
        tracks: {
          color: {
            length: 1200,
            loop: true,
            keys: [
              { t: 0, v: [200, 80, 0, 255] },
              { t: 300, v: [255, 255, 255, 255] },
              { t: 600, v: [200, 80, 0, 255] },
              { t: 900, v: [255, 255, 255, 255] },
              { t: 1200, v: [200, 80, 0, 255] },
            ],
          },
          position: { length: 1200, loop: true, keys: [{ t: 0, v: [0, -30, 0] }] },
          rotation: { length: 1200, loop: true, keys: [{ t: 0, v: [0, 0, 0, 1] }] },
          size: {
            length: 1200,
            loop: true,
            keys: [
              { t: 0, v: [1, 1, 1] },
              { t: 300, v: [1.2, 1.2, 1] },
              { t: 600, v: [1, 1, 1] },
              { t: 900, v: [1.2, 1.2, 1] },
              { t: 1200, v: [1, 1, 1] },
            ],
          },
        },
      },
      splitBehind: {
        length: 3200,
        chain: null,
        tracks: {
          color: {
            length: 3200,
            loop: false,
            keys: [
              { t: 0, v: [200, 80, 0, 0] },
              { t: 500, v: [200, 80, 0, 255] },
              { t: 2700, v: [200, 80, 0, 255] },
              { t: 3200, v: [200, 80, 0, 0] },
            ],
          },
          position: {
            length: 3200,
            loop: false,
            keys: [
              { t: 0, v: [0, -50, 0] },
              { t: 500, v: [0, -30, 0] },
              { t: 2700, v: [0, -30, 0] },
              { t: 3200, v: [0, -50, 0] },
            ],
          },
          rotation: { length: 3200, loop: false, keys: [{ t: 0, v: [0, 0, 0, 1] }] },
          size: { length: 3200, loop: false, keys: [{ t: 0, v: [1, 1, 1] }] },
        },
      },
    },
  },
  messageText: {
    kind: 'text',
    parent: 'messageBody',
    texture: null,
    text: { justify: 'center', maxWidth: 335, sample: 'Generic Message\nGoes Here\nAnd Here' },
    color: [230, 230, 230, 255],
    position: [0, 12, 10],
    size: [1.1, 1, 1],
    rotation: [0, 0, 0, 1],
    scripts: { init: { length: 0, chain: null, tracks: {} } },
  },
  messageShadow: {
    kind: 'text',
    parent: 'messageBody',
    texture: null,
    text: { justify: 'center', maxWidth: 335, sample: 'Generic Message\nGoes Here\nAnd Here' },
    color: [0, 0, 0, 255],
    position: [2, 14, 30],
    size: [1.1, 1, 1],
    rotation: [0, 0, 0, 1],
    scripts: { init: { length: 0, chain: null, tracks: {} } },
  },
  rows: {
    kind: 'group',
    parent: null,
    texture: null,
    text: null,
    color: [255, 255, 255, 255],
    position: [352.65, -123.23, 435.91],
    size: [1, 1, 1],
    rotation: [0, 0, 0, 1],
    scripts: {
      init: {
        length: 0,
        chain: null,
        tracks: { color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 255] }] } },
      },
      hide: {
        length: 0,
        chain: null,
        tracks: { color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 0] }] } },
      },
    },
  },
  row0Back: {
    kind: 'image',
    parent: 'rows',
    texture: 'basepoly',
    text: null,
    color: [255, 255, 255, 80],
    position: [-24, -20, 200],
    size: [175, 18, 0],
    rotation: [0, 0, 0, 1],
    scripts: {
      init: {
        length: 0,
        chain: null,
        tracks: { color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 80] }] } },
      },
      highlight: {
        length: 1200,
        chain: null,
        tracks: {
          color: {
            length: 1200,
            loop: true,
            keys: [
              { t: 0, v: [255, 174, 64, 80] },
              { t: 600, v: [255, 174, 64, 160] },
              { t: 1200, v: [255, 174, 64, 80] },
            ],
          },
        },
      },
    },
  },
  row1Back: {
    kind: 'image',
    parent: 'rows',
    texture: 'basepoly',
    text: null,
    color: [255, 255, 255, 80],
    position: [-24, -2, 200],
    size: [175, 18, 0],
    rotation: [0, 0, 0, 1],
    scripts: {
      init: {
        length: 0,
        chain: null,
        tracks: { color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 80] }] } },
      },
      highlight: {
        length: 1200,
        chain: null,
        tracks: {
          color: {
            length: 1200,
            loop: true,
            keys: [
              { t: 0, v: [255, 174, 64, 80] },
              { t: 600, v: [255, 174, 64, 160] },
              { t: 1200, v: [255, 174, 64, 80] },
            ],
          },
        },
      },
    },
  },
  row2Back: {
    kind: 'image',
    parent: 'rows',
    texture: 'basepoly',
    text: null,
    color: [255, 255, 255, 80],
    position: [-24, 16, 200],
    size: [175, 18, 0],
    rotation: [0, 0, 0, 1],
    scripts: {
      init: {
        length: 0,
        chain: null,
        tracks: { color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 80] }] } },
      },
      highlight: {
        length: 1200,
        chain: null,
        tracks: {
          color: {
            length: 1200,
            loop: true,
            keys: [
              { t: 0, v: [255, 174, 64, 80] },
              { t: 600, v: [255, 174, 64, 160] },
              { t: 1200, v: [255, 174, 64, 80] },
            ],
          },
        },
      },
    },
  },
  row3Back: {
    kind: 'image',
    parent: 'rows',
    texture: 'basepoly',
    text: null,
    color: [255, 255, 255, 80],
    position: [-24, 34, 200],
    size: [175, 18, 0],
    rotation: [0, 0, 0, 1],
    scripts: {
      init: {
        length: 0,
        chain: null,
        tracks: { color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 80] }] } },
      },
      highlight: {
        length: 1200,
        chain: null,
        tracks: {
          color: {
            length: 1200,
            loop: true,
            keys: [
              { t: 0, v: [255, 174, 64, 80] },
              { t: 600, v: [255, 174, 64, 160] },
              { t: 1200, v: [255, 174, 64, 80] },
            ],
          },
        },
      },
    },
  },
  row3Number: {
    kind: 'text',
    parent: 'rows',
    texture: null,
    text: { justify: 'left', maxWidth: 0, sample: '4' },
    color: [0, 0, 0, 255],
    position: [-110, 27, 100],
    size: [0.75, 0.65, 0],
    rotation: [0, 0, 0, 1],
    scripts: {
      init: {
        length: 0,
        chain: null,
        tracks: {
          position: { length: 0, loop: false, keys: [{ t: 0, v: [-110, 27, 100] }] },
          size: { length: 0, loop: false, keys: [{ t: 0, v: [0.75, 0.65, 0] }] },
        },
      },
      appear: {
        length: 160,
        chain: null,
        tracks: {
          position: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [-110, 37, 100] },
              { t: 160, v: [-110, 27, 100] },
            ],
          },
          size: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [0.75, 0.1, 0] },
              { t: 160, v: [0.75, 0.65, 0] },
            ],
          },
        },
      },
      disappear: {
        length: 160,
        chain: null,
        tracks: {
          position: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [-110, 27, 100] },
              { t: 160, v: [-110, 29, 100] },
            ],
          },
          size: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [0.75, 0.65, 0] },
              { t: 160, v: [0.75, 0.1, 0] },
            ],
          },
        },
      },
    },
  },
  row3Name: {
    kind: 'text',
    parent: 'rows',
    texture: null,
    text: { justify: 'right', maxWidth: 260, sample: 'WWWWWWWWWWWWW' },
    color: [0, 0, 0, 255],
    position: [58, 27, 100],
    size: [0.6, 0.65, 0],
    rotation: [0, 0, 0, 1],
    scripts: {
      init: {
        length: 0,
        chain: null,
        tracks: {
          position: { length: 0, loop: false, keys: [{ t: 0, v: [58, 27, 100] }] },
          size: { length: 0, loop: false, keys: [{ t: 0, v: [0.6, 0.65, 0] }] },
        },
      },
      disappear: {
        length: 160,
        chain: null,
        tracks: {
          position: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [58, 27, 100] },
              { t: 160, v: [58, 29, 100] },
            ],
          },
          size: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [0.6, 0.6, 0] },
              { t: 160, v: [0.6, 0.05, 0] },
            ],
          },
        },
      },
      appear: {
        length: 160,
        chain: null,
        tracks: {
          position: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [58, 37, 100] },
              { t: 160, v: [58, 27, 100] },
            ],
          },
          size: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [0.6, 0.05, 0] },
              { t: 160, v: [0.6, 0.6, 0] },
            ],
          },
        },
      },
    },
  },
  row2Number: {
    kind: 'text',
    parent: 'rows',
    texture: null,
    text: { justify: 'left', maxWidth: 0, sample: '3' },
    color: [0, 0, 0, 255],
    position: [-110, 9, 100],
    size: [0.75, 0.65, 0],
    rotation: [0, 0, 0, 1],
    scripts: {
      init: {
        length: 0,
        chain: null,
        tracks: {
          position: { length: 0, loop: false, keys: [{ t: 0, v: [-110, 9, 100] }] },
          size: { length: 0, loop: false, keys: [{ t: 0, v: [0.75, 0.65, 0] }] },
        },
      },
      appear: {
        length: 160,
        chain: null,
        tracks: {
          position: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [-110, 19, 100] },
              { t: 160, v: [-110, 9, 100] },
            ],
          },
          size: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [0.75, 0.1, 0] },
              { t: 160, v: [0.75, 0.65, 0] },
            ],
          },
        },
      },
      disappear: {
        length: 160,
        chain: null,
        tracks: {
          position: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [-110, 9, 100] },
              { t: 160, v: [-110, 11, 100] },
            ],
          },
          size: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [0.75, 0.65, 0] },
              { t: 160, v: [0.75, 0.1, 0] },
            ],
          },
        },
      },
    },
  },
  row2Name: {
    kind: 'text',
    parent: 'rows',
    texture: null,
    text: { justify: 'right', maxWidth: 260, sample: 'WWWWWWWWWWWWW' },
    color: [0, 0, 0, 255],
    position: [58, 9, 100],
    size: [0.6, 0.65, 0],
    rotation: [0, 0, 0, 1],
    scripts: {
      init: {
        length: 0,
        chain: null,
        tracks: {
          position: { length: 0, loop: false, keys: [{ t: 0, v: [58, 9, 100] }] },
          size: { length: 0, loop: false, keys: [{ t: 0, v: [0.6, 0.65, 0] }] },
        },
      },
      appear: {
        length: 160,
        chain: null,
        tracks: {
          position: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [58, 19, 100] },
              { t: 160, v: [58, 9, 100] },
            ],
          },
          size: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [0.6, 0.05, 0] },
              { t: 160, v: [0.6, 0.6, 0] },
            ],
          },
        },
      },
      disappear: {
        length: 160,
        chain: null,
        tracks: {
          position: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [58, 9, 100] },
              { t: 160, v: [58, 11, 100] },
            ],
          },
          size: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [0.6, 0.6, 0] },
              { t: 160, v: [0.6, 0.05, 0] },
            ],
          },
        },
      },
    },
  },
  row1Number: {
    kind: 'text',
    parent: 'rows',
    texture: null,
    text: { justify: 'left', maxWidth: 0, sample: '2' },
    color: [0, 0, 0, 255],
    position: [-110, -9, 100],
    size: [0.75, 0.65, 0],
    rotation: [0, 0, 0, 1],
    scripts: {
      init: {
        length: 0,
        chain: null,
        tracks: {
          position: { length: 0, loop: false, keys: [{ t: 0, v: [-110, -9, 100] }] },
          size: { length: 0, loop: false, keys: [{ t: 0, v: [0.75, 0.65, 0] }] },
        },
      },
      appear: {
        length: 160,
        chain: null,
        tracks: {
          position: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [-110, 1, 100] },
              { t: 160, v: [-110, -9, 100] },
            ],
          },
          size: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [0.75, 0.1, 0] },
              { t: 160, v: [0.75, 0.65, 0] },
            ],
          },
        },
      },
      disappear: {
        length: 160,
        chain: null,
        tracks: {
          position: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [-110, -9, 100] },
              { t: 160, v: [-110, -7, 100] },
            ],
          },
          size: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [0.75, 0.65, 0] },
              { t: 160, v: [0.75, 0.1, 0] },
            ],
          },
        },
      },
    },
  },
  row1Name: {
    kind: 'text',
    parent: 'rows',
    texture: null,
    text: { justify: 'right', maxWidth: 260, sample: 'WWWWWWWWWWWWW' },
    color: [0, 0, 0, 255],
    position: [58, -9, 100],
    size: [0.6, 0.65, 0],
    rotation: [0, 0, 0, 1],
    scripts: {
      init: {
        length: 0,
        chain: null,
        tracks: {
          position: { length: 0, loop: false, keys: [{ t: 0, v: [58, -9, 100] }] },
          size: { length: 0, loop: false, keys: [{ t: 0, v: [0.6, 0.65, 0] }] },
        },
      },
      appear: {
        length: 160,
        chain: null,
        tracks: {
          position: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [58, 1, 100] },
              { t: 160, v: [58, -9, 100] },
            ],
          },
          size: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [0.6, 0.05, 0] },
              { t: 160, v: [0.6, 0.6, 0] },
            ],
          },
        },
      },
      disappear: {
        length: 160,
        chain: null,
        tracks: {
          position: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [58, -9, 100] },
              { t: 160, v: [58, -7, 100] },
            ],
          },
          size: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [0.6, 0.6, 0] },
              { t: 160, v: [0.6, 0.05, 0] },
            ],
          },
        },
      },
    },
  },
  row0Number: {
    kind: 'text',
    parent: 'rows',
    texture: null,
    text: { justify: 'left', maxWidth: 0, sample: '1' },
    color: [0, 0, 0, 255],
    position: [-110, -27, 100],
    size: [0.75, 0.65, 0],
    rotation: [0, 0, 0, 1],
    scripts: {
      init: {
        length: 0,
        chain: null,
        tracks: {
          position: { length: 0, loop: false, keys: [{ t: 0, v: [-110, -27, 100] }] },
          size: { length: 0, loop: false, keys: [{ t: 0, v: [0.75, 0.65, 0] }] },
        },
      },
      appear: {
        length: 160,
        chain: null,
        tracks: {
          position: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [-110, -17, 100] },
              { t: 160, v: [-110, -27, 100] },
            ],
          },
          size: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [0.75, 0.1, 0] },
              { t: 160, v: [0.75, 0.65, 0] },
            ],
          },
        },
      },
      disappear: {
        length: 160,
        chain: null,
        tracks: {
          position: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [-110, -27, 100] },
              { t: 160, v: [-110, -25, 100] },
            ],
          },
          size: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [0.75, 0.65, 0] },
              { t: 160, v: [0.75, 0.1, 0] },
            ],
          },
        },
      },
    },
  },
  row0Name: {
    kind: 'text',
    parent: 'rows',
    texture: null,
    text: { justify: 'right', maxWidth: 260, sample: 'WWWWWWWWWWWWW' },
    color: [0, 0, 0, 255],
    position: [58, -27, 100],
    size: [0.6, 0.65, 0],
    rotation: [0, 0, 0, 1],
    scripts: {
      init: {
        length: 0,
        chain: null,
        tracks: {
          position: { length: 0, loop: false, keys: [{ t: 0, v: [58, -27, 100] }] },
          size: { length: 0, loop: false, keys: [{ t: 0, v: [0.6, 0.65, 0] }] },
        },
      },
      appear: {
        length: 160,
        chain: null,
        tracks: {
          position: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [58, -17, 100] },
              { t: 160, v: [58, -27, 100] },
            ],
          },
          size: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [0.6, 0.05, 0] },
              { t: 160, v: [0.6, 0.6, 0] },
            ],
          },
        },
      },
      disappear: {
        length: 160,
        chain: null,
        tracks: {
          position: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [58, -27, 100] },
              { t: 160, v: [58, -25, 100] },
            ],
          },
          size: {
            length: 160,
            loop: false,
            keys: [
              { t: 0, v: [0.6, 0.6, 0] },
              { t: 160, v: [0.6, 0.05, 0] },
            ],
          },
        },
      },
    },
  },
  status: {
    kind: 'group',
    parent: null,
    texture: null,
    text: null,
    color: [255, 255, 255, 255],
    position: [322.65, -186.23, 435.91],
    size: [1, 1, 1],
    rotation: [0, 0, 0, 1],
    scripts: { init: { length: 0, chain: null, tracks: {} } },
  },
  positionBacking: {
    kind: 'image',
    parent: 'status',
    texture: 'position_backing',
    text: null,
    color: [255, 255, 255, 180],
    position: [-57, 1, 200],
    size: [64, 62, 0],
    rotation: [0, 0, 0, 1],
    scripts: { init: { length: 0, chain: null, tracks: {} } },
  },
  timeBacking: {
    kind: 'image',
    parent: 'status',
    texture: 'time_backing',
    text: null,
    color: [255, 255, 255, 180],
    position: [41, -13, 199],
    size: [128, 32, 0],
    rotation: [0, 0, 0, 1],
    scripts: { init: { length: 0, chain: null, tracks: {} } },
  },
  lapBar: {
    kind: 'image',
    parent: 'status',
    texture: 'basepoly',
    text: null,
    color: [0, 0, 0, 100],
    position: [35.35, 18.23, 199],
    size: [117, 26, 0],
    rotation: [0, 0, 0, 1],
    scripts: { init: { length: 0, chain: null, tracks: {} } },
  },
  raceTime: {
    kind: 'text',
    parent: 'status',
    texture: null,
    text: { justify: 'right', maxWidth: 120, sample: '00:00.00' },
    color: [255, 195, 115, 255],
    position: [89, -19, 100],
    size: [0.7, 0.7, 1],
    rotation: [0, 0, 0, 1],
    scripts: {
      init: {
        length: 0,
        chain: null,
        tracks: { color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 195, 115, 255] }] } },
      },
      pulse: {
        length: 2400,
        chain: 'init',
        tracks: {
          color: {
            length: 2400,
            loop: true,
            keys: [
              { t: 0, v: [255, 195, 115, 255] },
              { t: 200, v: [255, 255, 255, 255] },
              { t: 400, v: [255, 195, 115, 255] },
              { t: 600, v: [255, 255, 255, 255] },
              { t: 800, v: [255, 195, 115, 255] },
              { t: 1000, v: [255, 255, 255, 255] },
              { t: 1200, v: [255, 195, 115, 255] },
              { t: 1400, v: [255, 255, 255, 255] },
              { t: 1600, v: [255, 195, 115, 255] },
              { t: 1800, v: [255, 255, 255, 255] },
              { t: 2000, v: [255, 195, 115, 255] },
              { t: 2200, v: [255, 255, 255, 255] },
              { t: 2400, v: [255, 195, 115, 255] },
            ],
          },
        },
      },
    },
  },
  timerIcon: {
    kind: 'image',
    parent: 'status',
    texture: 'timer_icon',
    text: null,
    color: [255, 195, 115, 255],
    position: [-7, -11, 50],
    size: [32, 32, 0],
    rotation: [0, 0, 0, 1],
    scripts: {
      init: {
        length: 0,
        chain: null,
        tracks: { color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 195, 115, 255] }] } },
      },
      pulse: {
        length: 2400,
        chain: 'init',
        tracks: {
          color: {
            length: 2400,
            loop: true,
            keys: [
              { t: 0, v: [255, 195, 115, 255] },
              { t: 200, v: [255, 255, 255, 255] },
              { t: 400, v: [255, 195, 115, 255] },
              { t: 600, v: [255, 255, 255, 255] },
              { t: 800, v: [255, 195, 115, 255] },
              { t: 1000, v: [255, 255, 255, 255] },
              { t: 1200, v: [255, 195, 115, 255] },
              { t: 1400, v: [255, 255, 255, 255] },
              { t: 1600, v: [255, 195, 115, 255] },
              { t: 1800, v: [255, 255, 255, 255] },
              { t: 2000, v: [255, 195, 115, 255] },
              { t: 2200, v: [255, 255, 255, 255] },
              { t: 2400, v: [255, 195, 115, 255] },
            ],
          },
        },
      },
    },
  },
  positionGroup: {
    kind: 'group',
    parent: 'status',
    texture: null,
    text: null,
    color: [255, 255, 255, 255],
    position: [-56.67, -5, 20],
    size: [1, 1, 1],
    rotation: [0, 0, 0, 1],
    scripts: {
      init: {
        length: 0,
        chain: null,
        tracks: {
          color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 255] }] },
          position: { length: 0, loop: false, keys: [{ t: 0, v: [-56.67, -5, 20] }] },
        },
      },
      hide: {
        length: 0,
        chain: null,
        tracks: {
          color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 255, 255, 0] }] },
          position: { length: 0, loop: false, keys: [{ t: 0, v: [-56.6667, -5, -184] }] },
        },
      },
    },
  },
  position: {
    kind: 'text',
    parent: 'positionGroup',
    texture: null,
    text: { justify: 'left', maxWidth: 0, sample: '8' },
    color: [255, 195, 115, 255],
    position: [-1, -18, 20],
    size: [1.2, 1.1, 1],
    rotation: [0, 0, 0, 1],
    scripts: { init: { length: 0, chain: null, tracks: {} } },
  },
  positionLine: {
    kind: 'image',
    parent: 'positionGroup',
    texture: 'basepoly',
    text: null,
    color: [230, 230, 230, 255],
    position: [6.67, 9, 20],
    size: [2, 32, 0],
    rotation: [0, 0, 0.7071, 0.7071],
    scripts: { init: { length: 0, chain: null, tracks: {} } },
  },
  racers: {
    kind: 'text',
    parent: 'positionGroup',
    texture: null,
    text: { justify: 'left', maxWidth: 0, sample: '8' },
    color: [230, 230, 230, 255],
    position: [-1, 11, 20],
    size: [1.2, 1.1, 1],
    rotation: [0, 0, 0, 1],
    scripts: { init: { length: 0, chain: null, tracks: {} } },
  },
  lapGroup: {
    kind: 'group',
    parent: 'status',
    texture: null,
    text: null,
    color: [255, 255, 255, 255],
    position: [37.35, 14.23, 20],
    size: [1, 1, 1],
    rotation: [0, 0, 0, 1],
    scripts: { init: { length: 0, chain: null, tracks: {} } },
  },
  laps: {
    kind: 'text',
    parent: 'lapGroup',
    texture: null,
    text: { justify: 'right', maxWidth: 61, sample: '100% ' },
    color: [255, 255, 255, 255],
    position: [53, -3, 20],
    size: [0.6, 0.65, 0],
    rotation: [0, 0, 0, 1],
    scripts: { init: { length: 0, chain: null, tracks: {} } },
  },
  lapLabel: {
    kind: 'text',
    parent: 'lapGroup',
    texture: null,
    text: { justify: 'left', maxWidth: 108, sample: 'COMPLETE' },
    color: [255, 255, 255, 255],
    position: [-54, -3, 20],
    size: [0.6, 0.65, 0],
    rotation: [0, 0, 0, 1],
    scripts: { init: { length: 0, chain: null, tracks: {} } },
  },
  timerGlow: {
    kind: 'image',
    parent: null,
    texture: 'iconselection_glow',
    text: null,
    color: [255, 174, 64, 120],
    position: [316, -197, 15.91],
    size: [32, 32, 0],
    rotation: [0, 0, 0, 1],
    scripts: {
      init: {
        length: 0,
        chain: 'hide',
        tracks: { color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 174, 64, 120] }] } },
      },
      hide: {
        length: 0,
        chain: null,
        tracks: { color: { length: 0, loop: false, keys: [{ t: 0, v: [255, 174, 64, 0] }] } },
      },
      pulse: {
        length: 2400,
        chain: 'hide',
        tracks: {
          color: {
            length: 2400,
            loop: false,
            keys: [
              { t: 0, v: [255, 174, 64, 0] },
              { t: 200, v: [255, 174, 64, 120] },
              { t: 400, v: [255, 174, 64, 0] },
              { t: 600, v: [255, 174, 64, 120] },
              { t: 800, v: [255, 174, 64, 0] },
              { t: 1000, v: [255, 174, 64, 120] },
              { t: 1200, v: [255, 174, 64, 0] },
              { t: 1400, v: [255, 174, 64, 120] },
              { t: 1600, v: [255, 174, 64, 0] },
              { t: 1800, v: [255, 174, 64, 120] },
              { t: 2000, v: [255, 174, 64, 0] },
              { t: 2200, v: [255, 174, 64, 120] },
              { t: 2400, v: [255, 174, 64, 0] },
            ],
          },
        },
      },
    },
  },
  carIcon: {
    kind: 'image',
    parent: null,
    texture: 'minimap_icon_car',
    text: null,
    color: [194, 242, 66, 255],
    position: [-12, 363, 40],
    size: [14, 16, 2],
    rotation: [0, 0, 0, 1],
    scripts: { init: { length: 0, chain: null, tracks: {} } },
  },
};
