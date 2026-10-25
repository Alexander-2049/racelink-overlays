import { CAR_ID_TO_CAR_MANUFACTURER } from '../../driver-display/CarManufacturer/carManufacturerMapping';

/** Highlight color behind each car brand logo. */
const brandColors: Readonly<Record<string, string>> = {
  astonmartin: '#339966',
  audi: '#850505',
  bmw: '#359BCD',
  cadillac: '#DF3931',
  chevrolet: '#C0934C',
  dallara: '#FFF200',
  ferrari: '#FF0000',
  ford: '#072650',
  holden: '#97101C',
  kia: '#661D29',
  lotus: '#062E28',
  mazda: '#0080C5',
  mclaren: '#FF8000',
  mercedes: '#03BFB5',
  nissan: '#FF0000',
  pontiac: '#775943',
  porsche: '#9B1613',
  renault: '#FFD900',
  ruf: '#20A95D',
  skipbarber: '#D40000',
  subaru: '#004489',
  toyota: '#DA291C',
  williams: '#00A0DE',
  volkswagen: '#0D4671',
  honda: '#CC0000',
  lamborghini: '#D8A016',
  hpd: '#005A81',
  radical: '#BDFF00',
  tatuus: '#5FAA13',
  formulavee: '#777777',
  redbullracing: '#131C6B',
  racingpoint: '#A3608C',
  alphatauri: '#052239',
  racingbulls: '#6692FF',
  haas: '#781710',
  alfaromeo: '#760300',
  alpine: '#006FBA',
  brawn: '#FFF200',
  bentley: '#335B4C',
  jaguar: '#444B3F',
  ginetta: '#FC8734',
  ktm: '#F27620',
  lexus: '#DFE1E0',
  maserati: '#0C2340',
  hyundai: '#003984',
  buick: '#0059A8',
  oreca: '#214AA5',
  infiniti: '#8A00C2',
  vauxhall: '#AF2101',
  ray: '#EE5A3A',
  ligier: '#001758',
  fiaf4: '#256FB3',
  cupra: '#A5603F',
  norma: '#FECF00',
  acura: '#0012B9',
  saleen: '#CE1141',
  vrc: '#4782D3',
  rss: '#FF0000',
  paugeot: '#1900AF',
  glickenhaus: '#C5E1F4',
  vanwall: '#196E11',
  corvette: '#FFBC00',
  superformulalight: '#ED1C24',
  pagani: '#2166A2',
  lynkandco: '#349584',
  seat: '#FE0036',
  lada: '#697379',
  volvo: '#01528A',
  praga: '#012FA3',
  nsu: '#303390',
  carlsson: '#225874',
  koenigsegg: '#FF6300',
  gumpert: '#ED1C24',
  opel: '#FFAA01',
  crossle: '#0D2ECE',
  aquila: '#F6EC13',
  zakspeed: '#170D86',
  fabcar: '#1ECF01',
  fia: '#011A38',
  ram: '#F2CB05',
  duqueine: '#32CD32',
  genesis: '#E36B2C',
  adess: '#1F4E9C',
  isottafraschini: '#1B3A6B',
  caterham: '#FFCD00',
  iracing: '#2D358E',
  f1default: '#890000',
  accdefault: '#dc0000',
  r3edefault: '#dc0000',
  ams2default: '#dc0000',
  rfactor2default: '#dc0000',
  lmudefault: '#dc0000',
  n_a: '#2D358E',
};

/** Gradient ends of the colored highlight behind a logo. */
export const brandShadowColor = (
  brand: string,
  disabled: boolean,
): { from: string; to: string } => {
  if (disabled) return { from: 'transparent', to: 'transparent' };
  const color = brandColors[brand];
  return color === undefined
    ? { from: '#000000CC', to: '#00000000' }
    : { from: `${color}CC`, to: `${color}00` };
};

const knownBrands = new Set(Object.keys(brandColors));

/** Brand names whose Racelink spelling differs from the brand class names. */
const aliases: Readonly<Record<string, string>> = {
  'aston martin': 'astonmartin',
  'alfa romeo': 'alfaromeo',
  'red bull': 'redbullracing',
  'mercedes-benz': 'mercedes',
  mercedesamg: 'mercedes',
  vw: 'volkswagen',
  peugeot: 'paugeot',
  'lynk & co': 'lynkandco',
  'skip barber': 'skipbarber',
  'racing bulls': 'racingbulls',
  'alpha tauri': 'alphatauri',
  'racing point': 'racingpoint',
};

const normalize = (manufacturer: string): string => {
  const key = manufacturer.trim().toLowerCase();
  const aliased = aliases[key] ?? key.replace(/[\s_-]+/g, '');
  return knownBrands.has(aliased) ? aliased : 'n_a';
};

/**
 * The brand class for a driver. iRacing cars come from the car id;
 * other games report a car name that starts with the brand.
 */
export const carBrandOf = (carId: number | null, carName: string): string => {
  if (carId !== null) {
    const mapped = CAR_ID_TO_CAR_MANUFACTURER[carId]?.manufacturer;
    if (mapped !== undefined && mapped !== 'unknown') return normalize(mapped);
  }
  const first = carName.trim().split(/\s+/)[0] ?? '';
  const two = carName.trim().split(/\s+/).slice(0, 2).join(' ');
  const fromName = normalize(two);
  return fromName === 'n_a' ? normalize(first) : fromName;
};
