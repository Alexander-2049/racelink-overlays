import {
  Activity,
  AlertTriangle,
  Clock,
  Cloud,
  Droplets,
  Fuel,
  Flag,
  Gauge,
  Hash,
  MapPin,
  Thermometer,
  Timer,
  Trophy,
  Users,
  Wind,
  Zap,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { RWidgetId } from '../../../../../shared/contracts/rCatalog/widgets';
import { formatClock, formatLapTime, formatSessionTimer, type WidgetData } from './data';
import { toFixedDown } from '../driver/format';

export type WidgetRender = Readonly<{
  /** Text shown when the slot's title is set to text. */
  text: string;
  /** Icon shown when the slot's title is set to an icon. */
  icon: ReactNode;
  size?: 'small' | 'large';
  className?: string;
  value: ReactNode;
}>;

const iconProps = { size: '1em', strokeWidth: 2, 'aria-hidden': true } as const;
const dash = '-';

const temperature = (celsius: number | null, imperial: boolean): string =>
  celsius === null
    ? '--'
    : `${toFixedDown(imperial ? celsius * 1.8 + 32 : celsius, 0)} ${imperial ? '°F' : '°C'}`;

const speed = (kph: number, imperial: boolean): string =>
  `${toFixedDown(imperial ? kph * 0.621371 : kph, 0)} ${imperial ? 'MPH' : 'KPH'}`;

const wetnessText = (wetness: string | null): string => {
  switch (wetness) {
    case 'dry':
      return 'Dry';
    case 'mostlyDry':
      return 'Mostly dry';
    case 'veryLightlyWet':
    case 'lightlyWet':
      return 'Damp';
    case 'moderatelyWet':
    case 'veryWet':
    case 'extremelyWet':
      return 'Wet';
    default:
      return dash;
  }
};

const gearText = (gear: number): string => (gear < 0 ? 'R' : gear === 0 ? 'N' : String(gear));

/** What each widget draws for the current data. */
export const renderWidget = (id: RWidgetId, data: WidgetData): WidgetRender | null => {
  switch (id) {
    case 'None':
      return null;
    case 'CurrentPosition':
      return {
        text: 'Position',
        icon: <Hash {...iconProps} />,
        size: 'small',
        className: 'CurrentPositionWidget',
        value: data.position ?? dash,
      };
    case 'Speed':
      return {
        text: 'Speed',
        icon: <Gauge {...iconProps} />,
        size: 'small',
        value: speed(data.speedKph, data.imperial),
      };
    case 'Rpm':
      return {
        text: 'RPM',
        icon: <Activity {...iconProps} />,
        size: 'small',
        value: Math.round(data.rpm),
      };
    case 'Gear':
      return {
        text: 'Gear',
        icon: <Zap {...iconProps} />,
        size: 'small',
        value: gearText(data.gear),
      };
    case 'TrackTemp':
      return {
        text: 'TrackTemp',
        icon: <Thermometer {...iconProps} />,
        size: 'small',
        value: temperature(data.trackTempC, data.imperial),
      };
    case 'AirTemp':
      return {
        text: 'AirTemp',
        icon: <Thermometer {...iconProps} />,
        size: 'small',
        value: temperature(data.airTempC, data.imperial),
      };
    case 'WindSpeed': {
      const mps = data.windSpeedMps;
      return {
        text: 'Wind Speed',
        icon: <Wind {...iconProps} />,
        size: 'small',
        value:
          mps === null
            ? '--'
            : data.imperial
              ? `${toFixedDown(mps * 2.23694, 0)} MPH`
              : `${toFixedDown(mps * 3.6, 0)} KPH`,
      };
    }
    case 'RelativeHumidity':
      return {
        text: 'Humidity',
        icon: <Droplets {...iconProps} />,
        size: 'small',
        value:
          data.humidityFraction === null
            ? '--'
            : `${toFixedDown(data.humidityFraction * 100, 0)} %`,
      };
    case 'TrackWetDryStatus':
      return {
        text: 'Track',
        icon: <Cloud {...iconProps} />,
        value: wetnessText(data.trackWetness),
      };
    case 'Sof':
      return {
        text: 'SOF',
        icon: <Trophy {...iconProps} />,
        size: 'small',
        value: data.sof ?? dash,
      };
    case 'Incidents': {
      const limit = data.incidentLimit;
      const text = `${data.incidents === null ? dash : String(data.incidents)}/${limit === null ? dash : String(limit)}`;
      const warning = data.incidents !== null && limit !== null && data.incidents + 4 > limit;
      return {
        text: 'Incidents',
        icon: warning ? (
          <AlertTriangle {...iconProps} color="red" />
        ) : (
          <span className="fa fa-times" />
        ),
        size: 'small',
        value: (
          <>
            {warning && <AlertTriangle size="0.6em" color="red" aria-hidden />}
            <span>{text}</span>
          </>
        ),
      };
    }
    case 'SessionTimer': {
      const timer = formatSessionTimer(data.sessionElapsed, data.sessionRemaining);
      return {
        text: data.sessionTitle.toUpperCase(),
        icon: <>{data.sessionTitle.toUpperCase()}</>,
        className: 'SessionTimerWidget',
        value: (
          <>
            {timer.elapsed === null ? dash : <span>{timer.elapsed}</span>}
            <span className="timeseparator">/</span>
            {timer.remaining === null ? dash : <span>{timer.remaining}</span>}
            {timer.unit}
          </>
        ),
      };
    }
    case 'RemainingSessionTime': {
      const remaining = data.sessionRemaining;
      return {
        text: data.sessionType.toLowerCase(),
        icon: <Timer {...iconProps} />,
        className: 'RemainingSessionTimeWidget',
        value: (
          <div className="RemainingSessionTimeWidgetValue">
            {remaining === null ? (
              <span>-</span>
            ) : (
              <>
                <span>{formatSessionTimer(null, remaining).remaining}</span>
                <span>{remaining < 3600 ? 'm' : 'h'}</span>
              </>
            )}
          </div>
        ),
      };
    }
    case 'LapCounter':
      return {
        text: 'Lap',
        icon: <>Lap</>,
        size: 'small',
        value: (
          <span>
            {data.lap}/{data.lapsTotal !== null && data.lapsTotalCalculated && '~'}
            {data.lapsTotal ?? dash}
          </span>
        ),
      };
    case 'CurrentLapNumber':
      return { text: 'Lap', icon: <Flag {...iconProps} />, size: 'small', value: data.lap };
    case 'RemainingLaps':
      return {
        text: 'Remaining Laps',
        icon: <Flag {...iconProps} />,
        size: 'small',
        value: data.lapsRemaining === null ? dash : `${String(data.lapsRemaining)} laps`,
      };
    case 'TrackTime':
      return {
        text: 'Track time',
        icon: <Clock {...iconProps} />,
        value: formatClock(data.timeOfDaySeconds, false),
      };
    case 'LocalPCTime':
    case 'LocalPCTime12h': {
      const now = new Date();
      return {
        text: 'PC Time',
        icon: <Clock {...iconProps} />,
        value: formatClock(now.getHours() * 3600 + now.getMinutes() * 60, id === 'LocalPCTime12h'),
      };
    }
    case 'LastLapTime':
      return {
        text: 'Last',
        icon: <Timer {...iconProps} />,
        value: (
          <div className="SimpleLapTime">
            <span className="simpleNumber">{formatLapTime(data.lastLapSeconds)}</span>
          </div>
        ),
      };
    case 'FastestLapTime':
      return {
        text: 'Fastest',
        icon: <Timer {...iconProps} />,
        value: (
          <div className="SimpleLapTime">
            <span className="simpleNumber">{formatLapTime(data.bestLapSeconds)}</span>
          </div>
        ),
      };
    case 'CurrentLapTime':
      return {
        text: 'Current',
        icon: <Timer {...iconProps} />,
        value: (
          <div className="SimpleLapTime">
            <span className="simpleNumber">{formatLapTime(data.currentLapSeconds)}</span>
          </div>
        ),
      };
    case 'BrakeBias':
      return {
        text: 'Brake Bias',
        icon: <Gauge {...iconProps} />,
        size: 'small',
        className: 'BrakeBiasWidget',
        value:
          data.brakeBiasFraction === null
            ? dash
            : `${toFixedDown(data.brakeBiasFraction * 100, 1)} %`,
      };
    case 'WaterTemp':
      return {
        text: 'Water temp.',
        icon: <Thermometer {...iconProps} />,
        size: 'small',
        value: temperature(data.waterTempC, data.imperial),
      };
    case 'OilTemp':
      return {
        text: 'Oil Temp',
        icon: <Thermometer {...iconProps} />,
        size: 'small',
        value: temperature(data.oilTempC, data.imperial),
      };
    case 'Abs':
      return {
        text: 'Abs',
        icon: <Activity {...iconProps} />,
        size: 'small',
        value: data.absActive ? 'ON' : 'OFF',
      };
    case 'TractionControl':
      return {
        text: 'TC',
        icon: <Activity {...iconProps} />,
        size: 'small',
        value: data.tractionControl ?? dash,
      };
    case 'Fuel':
      return {
        text: 'Fuel',
        icon: <Fuel {...iconProps} />,
        size: 'small',
        value:
          data.fuelLiters === null
            ? dash
            : data.imperial
              ? `${toFixedDown(data.fuelLiters * 0.264172, 1)} GAL`
              : `${toFixedDown(data.fuelLiters, 1)} L`,
      };
    case 'RemainingFuelLaps':
      return {
        text: 'Fuel laps',
        icon: <Fuel {...iconProps} />,
        size: 'small',
        value: data.fuelLapsRemaining === null ? dash : toFixedDown(data.fuelLapsRemaining, 1),
      };
    case 'PushToPass':
      return {
        text: 'P2P',
        icon: <Zap {...iconProps} />,
        size: 'small',
        value: data.pushToPassCount ?? dash,
      };
    case 'SessionType':
      return { text: 'Session Type', icon: <Flag {...iconProps} />, value: data.sessionType };
    case 'TrackName':
      return {
        text: 'Track',
        icon: <MapPin {...iconProps} />,
        value: data.trackName === '' ? dash : data.trackName,
      };
    case 'CarName':
      return {
        text: 'Car name',
        icon: <Gauge {...iconProps} />,
        className: 'CarNameWidget',
        value: data.carName === '' ? dash : data.carName,
      };
    case 'CarNumber':
      return {
        text: 'Car number',
        icon: <Hash {...iconProps} />,
        size: 'small',
        value: data.carNumber === '' ? dash : `#${data.carNumber}`,
      };
    case 'iRating':
      return {
        text: 'iRating',
        icon: <>iR</>,
        value: data.iRating === null ? dash : `${toFixedDown(data.iRating / 1000, 1)}k`,
      };
    case 'PositionGained': {
      const gained =
        data.startPosition !== null && data.position !== null
          ? data.startPosition - data.position
          : null;
      return {
        text: 'Gained',
        icon: <Trophy {...iconProps} />,
        size: 'small',
        value: gained === null ? dash : gained > 0 ? `+${String(gained)}` : String(gained),
      };
    }
    case 'TotalNumberOfDrivers':
      return { text: 'Drivers', icon: <>Drivers</>, size: 'small', value: data.drivers };
    case 'TotalNumberOfClassDrivers':
      return {
        text: 'Class drivers',
        icon: <Users {...iconProps} />,
        size: 'small',
        value: data.classDrivers,
      };
  }
};
