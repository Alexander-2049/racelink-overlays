import { useEffect, useState, type CSSProperties } from 'react';
import { faces, faceUrl, layersOf, type Face, type Look } from './looks';
import type { Mood } from './mood';

/**
 * What her face does in each mood: faces in turn, each `ms` long; the last
 * one stays when `hold` is set. Idle blinks now and then.
 */
const faceScripts: Readonly<Record<Mood, Readonly<{ faces: readonly Face[]; ms: number; hold?: boolean }>>> = {
  idle: { faces: ['smile'], ms: 0 },
  celebrate: { faces: ['delighted', 'laugh'], ms: 520 },
  shocked: { faces: ['shocked', 'sad'], ms: 1300, hold: true },
  cheer: { faces: ['angry', 'smug'], ms: 460 },
  dance: { faces: ['laugh', 'delighted', 'laugh', 'smile2'], ms: 430 },
};

const blinkEveryMs = 4300;
const blinkMs = 140;

const useFace = (mood: Mood, seed: number): Face => {
  const script = faceScripts[mood];
  const [index, setIndex] = useState(0);
  const [blinking, setBlinking] = useState(false);
  useEffect(() => {
    setIndex(0);
    setBlinking(false);
    if (mood === 'idle') {
      let close = 0;
      const timer = window.setInterval(() => {
        setBlinking(true);
        close = window.setTimeout(() => {
          setBlinking(false);
        }, blinkMs);
      }, blinkEveryMs);
      return () => {
        window.clearInterval(timer);
        window.clearTimeout(close);
      };
    }
    let step = 0;
    const timer = window.setInterval(() => {
      step += 1;
      if (script.hold === true && step >= script.faces.length) {
        window.clearInterval(timer);
        return;
      }
      setIndex(step % script.faces.length);
    }, script.ms);
    return () => {
      window.clearInterval(timer);
    };
  }, [mood, seed, script]);
  if (blinking) return 'smile2';
  // Being overtaken ends sad or annoyed, by turns.
  const face = script.faces[index] ?? 'smile';
  return face === 'sad' && seed % 2 === 1 ? 'annoyed' : face;
};

/** Little manga marks around her: sparkles, sweat, notes, fire. */
function Marks({ mood }: Readonly<{ mood: Mood }>) {
  switch (mood) {
    case 'celebrate':
      return (
        <div className="marks">
          <i className="sparkle s1">✦</i>
          <i className="sparkle s2">✧</i>
          <i className="sparkle s3">✦</i>
        </div>
      );
    case 'shocked':
      return (
        <div className="marks">
          <i className="shock">!?</i>
          <i className="sweat" />
        </div>
      );
    case 'cheer':
      return (
        <div className="marks">
          <i className="pump">!!</i>
          <i className="vein">💢</i>
        </div>
      );
    case 'dance':
      return (
        <div className="marks">
          <i className="note n1">♪</i>
          <i className="note n2">♫</i>
          <i className="note n3">♪</i>
        </div>
      );
    case 'idle':
      return null;
  }
}

type Props = Readonly<{
  look: Look;
  mood: Mood;
  /** Restarts her face script when a new moment comes in the same mood. */
  seed: number;
  bubble: Readonly<{ text: string; japanese: boolean; key: number }> | null;
}>;

/** The mascot girl with her speech bubble. Every face is loaded at once, so they swap without a flicker. */
export function Mascot({ look, mood, seed, bubble }: Props) {
  const face = useFace(mood, seed);
  const { below, above, body } = layersOf(look);
  return (
    <div className={`mascot mood-${mood}`}>
      <div className="mascotMotion" style={{ '--bodyMask': `url(${body})` } as CSSProperties}>
        {below.map((src) => (
          <img key={src} className="girlLayer" src={src} alt="" draggable={false} />
        ))}
        {faces.map((name) => (
          <img
            key={name}
            className={`girlLayer face ${name === face ? 'on' : ''}`}
            src={faceUrl(name)}
            alt=""
            draggable={false}
          />
        ))}
        {above.map((src) => (
          <img key={src} className="girlLayer" src={src} alt="" draggable={false} />
        ))}
        {mood === 'shocked' && <div className="gloom" />}
      </div>
      <Marks mood={mood} />
      {bubble !== null && (
        <div key={bubble.key} className={`bubble ${bubble.japanese ? 'jp' : 'en'}`}>
          {bubble.text}
        </div>
      )}
    </div>
  );
}
