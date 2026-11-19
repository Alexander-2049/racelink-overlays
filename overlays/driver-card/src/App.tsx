import { assetUrls } from '@racelink/overlay';
import { useState, type CSSProperties } from 'react';
import demoCar from './assets/demo-car.png';
import demoHelmet from './assets/demo-helmet.png';
import { cardOf, pickDriver, type Card } from './driver';
import { useOverlay, type Overlay } from './useOverlay';

/**
 * A picture with a spinner while it loads. iRacing draws its pictures on
 * first use (a fraction of a second); one that does not load shows nothing.
 */
function LoadingPicture({
  src,
  className,
  alt = '',
}: Readonly<{ src: string | null; className: string; alt?: string }>) {
  const [state, setState] = useState<Readonly<{ src: string | null; status: 'loading' | 'done' | 'failed' }>>({
    src,
    status: 'loading',
  });
  // A new picture starts loading again.
  const status = state.src === src ? state.status : 'loading';
  if (src === null || status === 'failed') return null;
  return (
    <span className={`dc-picture ${className}${status === 'loading' ? ' is-loading' : ''}`}>
      {status === 'loading' && <i className="dc-spinner" aria-hidden="true" />}
      <img
        src={src}
        alt={alt}
        draggable={false}
        onLoad={() => {
          setState({ src, status: 'done' });
        }}
        onError={() => {
          setState({ src, status: 'failed' });
        }}
      />
    </span>
  );
}

export default function App({ overlay }: Readonly<{ overlay: Overlay }>) {
  const { telemetry, settings, status } = useOverlay(overlay, 10);
  const driver = pickDriver(telemetry.drivers, settings.driver);
  if (!driver) return null;
  // The demo shows Aleksandrs Ahilcenoks with his helmet and car from a race at
  // Summit Point, drawn by iRacing: demo drivers have no iRacing pictures.
  const card: Card =
    status === 'demo'
      ? {
          ...cardOf(driver),
          name: 'Aleksandrs Ahilcenoks',
          carNumber: '20',
          countryCode: 'lv',
          countryName: 'Latvia',
          carUrl: demoCar,
          helmetUrl: demoHelmet,
        }
      : cardOf(driver);
  const helmet = card.helmetUrl;
  const car = card.carUrl;
  const opacity = settings.plate ? Math.min(1, Math.max(0, settings.opacity)) : 0;
  return (
    <section
      className={`dc${settings.plate ? ' has-plate' : ''}`}
      style={{ '--dc-alpha': String(opacity), '--dc-class': card.classColor } as CSSProperties}
    >
      {settings.showHelmet && <LoadingPicture className="dc-helmet" src={helmet} />}
      <div className="dc-body">
        <div className="dc-line">
          {settings.showFlag && card.countryCode !== null && (
            <LoadingPicture
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
        {settings.showCar && <LoadingPicture className="dc-car" src={car} />}
      </div>
    </section>
  );
}
