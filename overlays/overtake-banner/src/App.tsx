import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  OvertakeTracker,
  Preloader,
  Presenter,
  splitCarName,
} from '../../../racelink/src/renderer/widgets/overlays/overtake-banner/overtake';
import demoCar from './assets/demo-car.png';
import { carPictureOf, frameOf } from './detect';
import { useOverlay, type Overlay } from './useOverlay';

/** Asks for a picture so iRacing draws it now; done on load, error or after a few seconds. */
const loadPicture = (url: string): Promise<void> =>
  new Promise((resolve) => {
    const image = new Image();
    const done = (): void => {
      window.clearTimeout(timer);
      image.onload = null;
      image.onerror = null;
      resolve();
    };
    const timer = window.setTimeout(done, 8000);
    image.onload = done;
    image.onerror = done;
    image.src = url;
  });

const demoDrivers = [
  { name: 'Aleksandrs Ahilcenoks', number: '20', car: 'BMW M4 GT3 EVO', className: 'GT3', position: 6 },
  { name: 'Mika Hakola', number: '14', car: 'Ferrari 296 GT3', className: 'GT3', position: 7 },
  { name: 'Eva Lindqvist', number: '68', car: 'Aston Martin Vantage GT3 EVO', className: 'GT3', position: 8 },
];

type Card = Readonly<{
  name: string;
  number: string;
  className: string;
  position: number | null;
  classColor: string;
  picture: string | null;
  brand: string;
  model: string;
}>;

export default function App({ overlay }: Readonly<{ overlay: Overlay }>) {
  const { telemetry, settings, status } = useOverlay(overlay, 12);
  const tracker = useRef(new OvertakeTracker());
  const presenter = useRef(new Presenter());
  const preloader = useRef(new Preloader(loadPicture, 2));
  const [now, setNow] = useState(() => performance.now());
  const [demoStep, setDemoStep] = useState(0);
  const isDemo = status === 'demo';

  useEffect(() => {
    presenter.current.setOptions({
      displayMs: settings.displaySeconds * 1000,
      maxQueue: settings.maxQueue,
    });
  }, [settings.displaySeconds, settings.maxQueue]);

  // Every driver's car is requested as soon as it is known, so iRacing has drawn
  // it by the time the banner needs it.
  useEffect(() => {
    if (isDemo) return;
    preloader.current.request(telemetry.drivers.map(carPictureOf));
  }, [telemetry.drivers, isDemo]);

  // Passes.
  useEffect(() => {
    if (isDemo) return;
    const t = performance.now();
    const frame = frameOf(telemetry, settings);
    tracker.current.setOptions({ cooldownMs: settings.cooldownSeconds * 1000 });
    for (const carIdx of tracker.current.update(t, frame.samples, frame.active)) {
      presenter.current.push(carIdx, t);
    }
  }, [telemetry, settings, isDemo]);

  // The demo passes a car every few seconds.
  useEffect(() => {
    if (!isDemo) return;
    const timer = window.setInterval(() => {
      setDemoStep((n) => n + 1);
    }, 7000);
    presenter.current.push(100, performance.now());
    return () => {
      window.clearInterval(timer);
    };
  }, [isDemo]);
  useEffect(() => {
    if (isDemo && demoStep > 0) presenter.current.push(100 + demoStep, performance.now());
  }, [demoStep, isDemo]);

  // Time moves the banner in and out.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(performance.now());
    }, 100);
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const view = presenter.current.view(now);
  const card = ((): Card | null => {
    if (!view) return null;
    if (isDemo) {
      const d = demoDrivers[(view.pass.carIdx - 100) % demoDrivers.length] ?? demoDrivers[0];
      if (!d) return null;
      return { ...d, ...splitCarName(d.car), picture: demoCar, classColor: '#ff5a4d' };
    }
    const driver = telemetry.drivers.find((x) => x.carIdx === view.pass.carIdx);
    if (!driver) return null;
    return {
      name: driver.name,
      number: driver.carNumber,
      className: driver.className,
      position: driver.position,
      classColor: driver.classColor,
      picture: carPictureOf(driver),
      ...splitCarName(driver.carName),
    };
  })();

  if (!view || !card) return null;
  const hasText = settings.showBrand || settings.showModel || settings.showName;
  const style = {
    '--ob-panel': settings.panelColor,
    '--ob-alpha': String(settings.panelOpacity),
    '--ob-text': settings.textColor,
    '--ob-class': card.classColor,
  } as CSSProperties;
  const meta = [
    settings.showClass && card.className !== '' ? card.className : null,
    settings.showPosition && card.position !== null ? `P${String(card.position)}` : null,
  ].filter((x): x is string => x !== null);
  return (
    <div className={`ob ob-${settings.align}`} style={style}>
      <section
        key={view.pass.id}
        className={`ob-banner ob-${view.phase}${settings.classStripe ? ' has-stripe' : ''}`}
        data-side={settings.align === 'left' ? 'left' : 'right'}
      >
        <div className="ob-panel">
          {hasText && (
            <div className="ob-text">
              {settings.showBrand && card.brand !== '' && <span className="ob-brand">{card.brand}</span>}
              {settings.showModel && card.model !== '' && <span className="ob-model">{card.model}</span>}
              {settings.showName && (
                <span className="ob-name">
                  {settings.showNumber && <b className="ob-number">{card.number}</b>}
                  {card.name}
                </span>
              )}
              {!settings.showName && settings.showNumber && (
                <span className="ob-name">
                  <b className="ob-number">{card.number}</b>
                </span>
              )}
              {meta.length > 0 && <span className="ob-meta">{meta.join(' · ')}</span>}
            </div>
          )}
        </div>
        {settings.showCar && card.picture !== null && (
          <img
            className={`ob-car${settings.mirrorCar ? ' is-mirrored' : ''}`}
            src={card.picture}
            alt=""
            draggable={false}
          />
        )}
      </section>
    </div>
  );
}
