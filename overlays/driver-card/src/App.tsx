import { assetUrls } from '@racelink/overlay';
import { useState, type CSSProperties } from 'react';
import { cardOf, helmetUrl, pickDriver, type Design } from './driver';
import { useOverlay, type Overlay } from './useOverlay';

/** A picture that hides itself when it does not load. */
function Picture({ src, className, alt }: Readonly<{ src: string; className: string; alt: string }>) {
  const [failed, setFailed] = useState<string | null>(null);
  if (failed === src) return null;
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      draggable={false}
      onError={() => {
        setFailed(src);
      }}
    />
  );
}

/**
 * The first of `sources` that loads; the next one when a picture fails (the
 * pictures iRacing draws need iRacing running), `fallback` after the last.
 */
function FirstPicture({
  sources,
  className,
  fallback = null,
}: Readonly<{ sources: readonly string[]; className: string; fallback?: React.ReactNode }>) {
  const [failed, setFailed] = useState<readonly string[]>([]);
  const src = sources.find((source) => !failed.includes(source));
  if (src === undefined) return <>{fallback}</>;
  return (
    <img
      className={className}
      src={src}
      alt=""
      draggable={false}
      onError={() => {
        setFailed((list) => [...list, src]);
      }}
    />
  );
}

/** A sports car seen from the side, facing right (viewBox 0 0 400 112). */
const BODY =
  'M8 80C8 68 14 62 30 60L98 53C120 35 152 23 198 21C238 19 264 27 292 43L352 53C376 57 392 65 394 77V87C394 91 390 94 386 94H352A31 31 0 0 0 290 94H120A31 31 0 0 0 58 94H16C10 94 8 90 8 86Z';
const GLASS = 'M124 52C142 38 166 30 198 29C228 28 248 34 268 46L262 52H130Z';
const WHEELS = [89, 321] as const;

/**
 * The car: its custom paint (the side cut from the template, with number and
 * decals) laid into a car's shape, or the shape in the colours picked in iRacing.
 */
function Car({
  side,
  design,
  accent,
}: Readonly<{ side: string | null; design: Design | null; accent: string }>) {
  const [failed, setFailed] = useState<string | null>(null);
  const paint = side !== null && failed !== side ? side : null;
  const [main, second, third] = design?.colors ?? [];
  return (
    <svg className="dc-car" viewBox="0 0 400 112" aria-hidden="true">
      <defs>
        <clipPath id="dc-body">
          <path d={BODY} />
        </clipPath>
        <linearGradient id="dc-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.25" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <g clipPath="url(#dc-body)">
        {paint ? (
          <image
            href={paint}
            x="0"
            y="14"
            width="400"
            height="84"
            preserveAspectRatio="xMidYMid slice"
            onError={() => {
              setFailed(paint);
            }}
          />
        ) : (
          <>
            <rect width="400" height="112" fill={main ?? accent} />
            <path d="M0 64C120 54 260 54 400 62V74C260 66 120 66 0 76Z" fill={second ?? '#111'} />
            <path d="M0 80C120 70 260 70 400 78V82C260 74 120 74 0 84Z" fill={third ?? '#fff'} />
          </>
        )}
        <rect width="400" height="112" fill="url(#dc-shade)" />
      </g>
      <path d={GLASS} fill="#0b0e13" fillOpacity="0.82" />
      <path d={BODY} fill="none" stroke="#0b0e13" strokeOpacity="0.7" strokeWidth="2" />
      {WHEELS.map((x) => (
        <g key={x}>
          <circle cx={x} cy="92" r="24" fill="#16191d" />
          <circle cx={x} cy="92" r="13" fill="#5b616a" />
          <circle cx={x} cy="92" r="4" fill="#16191d" />
        </g>
      ))}
    </svg>
  );
}

export default function App({ overlay }: Readonly<{ overlay: Overlay }>) {
  const { telemetry, settings } = useOverlay(overlay, 10);
  const driver = pickDriver(telemetry.drivers, settings.driver);
  if (!driver) return null;
  const card = cardOf(driver);
  const opacity = settings.plate ? Math.min(1, Math.max(0, settings.opacity)) : 0;
  const helmets = [card.renderHelmetUrl, helmetUrl(card.helmet)].filter(
    (url): url is string => url !== null,
  );
  return (
    <section
      key={card.carIdx}
      className={`dc${settings.plate ? ' has-plate' : ''}`}
      style={{ '--dc-alpha': String(opacity), '--dc-class': card.classColor } as CSSProperties}
    >
      {settings.showHelmet && <FirstPicture className="dc-helmet" sources={helmets} />}
      <div className="dc-body">
        <div className="dc-line">
          {settings.showFlag && card.countryCode !== null && (
            <Picture
              className="dc-flag"
              src={assetUrls.flag(card.countryCode)}
              alt={card.countryName ?? card.countryCode}
            />
          )}
          <span className="dc-number">#{card.carNumber}</span>
          <strong className="dc-name" title={card.name}>
            {card.name}
          </strong>
        </div>
        {settings.showCar && (
          <FirstPicture
            className="dc-render"
            sources={card.renderCarUrl ? [card.renderCarUrl] : []}
            fallback={<Car side={card.carSideUrl} design={card.car} accent={card.classColor} />}
          />
        )}
      </div>
    </section>
  );
}
