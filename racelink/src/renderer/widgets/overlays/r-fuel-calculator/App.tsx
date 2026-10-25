import { useMemo } from 'react';
import {
  fuelStrategies,
  type FuelStrategyId,
} from '../../../../shared/contracts/rCatalog/fuel-calculator';
import type { FuelTelemetry } from '../../../../shared/overlay-api/fields/timing';
import type { TelemetryTopic } from '../../../../shared/overlay-api/telemetry';
import { useRacingOverlay } from '../model/useRacingOverlay';
import { cx } from '../r-common/driver/cx';
import { RContainer } from '../r-common/RContainer';
import { bool, num, readGeneral, str } from '../r-common/rSettings';
import { useFitFont } from '../r-common/useFitFont';

const topics: readonly TelemetryTopic[] = ['connection', 'session', 'fuel'];

type Calculator = NonNullable<FuelTelemetry['calculator']>;
type Strategy = NonNullable<Calculator['strategies']['allLaps']>;
type WindowStatus = 'NA' | 'CLOSED' | 'OPEN' | 'PITTED' | 'SOON';

/** Fixed decimals that round toward minus infinity. */
const toFixedDown = (value: number, places: number): string => {
  const scale = 10 ** places;
  return (Math.floor(value * scale) / scale).toFixed(places);
};

/** `HH:mm:ss` of a duration, as moment formats it (wrapping at a day). */
const toHHMMSS = (seconds: number): string => {
  const total = Math.floor(Math.abs(seconds)) % 86400;
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
};

/** A value or a dash: zero and missing values both show "-". */
const shown = (value: number | null | undefined, places: number): string =>
  value === null || value === undefined || value === 0 ? '-' : toFixedDown(value, places);

type Unit = Readonly<{ symbol: string; perLiter: number }>;

type MetricRow = Readonly<{
  id: FuelStrategyId;
  label: string;
  color: string;
  strategy: Strategy | null;
}>;

function FuelLevel({
  level,
  capacity,
  unit,
  places,
  showBar,
  showValue,
}: Readonly<{
  level: number;
  capacity: number | null;
  unit: Unit;
  places: number;
  showBar: boolean;
  showValue: boolean;
}>) {
  if (!showBar && !showValue) return null;
  const amount = level * unit.perLiter;
  const share = capacity !== null && capacity > 0 ? Math.min(1, level / capacity) : 0;
  return (
    <div className="fuellevelComponent">
      <div className="fuelLevelBarContainer show">
        {showBar && (
          <>
            <div className="bracketContainer">
              <div className="progressbar">
                <div
                  className="progress"
                  style={{ width: `${String(Number((100 * share).toFixed(1)))}%` }}
                />{' '}
                {showValue && (
                  <div className="currentFuelValue">
                    {amount.toFixed(places)} {unit.symbol}
                  </div>
                )}
              </div>
            </div>
            <div className="fuelpercentages">
              <div className="percentageMarker">E</div>
              <div className="percentageMarker">
                {capacity === null ? '-' : Math.round(capacity * unit.perLiter)}
                {unit.symbol}
              </div>
            </div>
          </>
        )}
        {!showBar && showValue && (
          <div className="currentFuelValue">
            {amount.toFixed(places)} {unit.symbol}
          </div>
        )}
      </div>
    </div>
  );
}

type FuelWindow = Readonly<{
  status: WindowStatus;
  currentLap: number;
  maxLaps: number;
  first: number;
  last: number;
  amount: number;
}>;

function PitWindowStatus({
  window: fuelWindow,
  unit,
}: Readonly<{ window: FuelWindow; unit: Unit }>) {
  const pitted = fuelWindow.status === 'PITTED';
  const amount = fuelWindow.amount > 0 ? Number((fuelWindow.amount * unit.perLiter).toFixed(1)) : 0;
  return (
    <div className={`pitWindowStatus fuelwindow_${fuelWindow.status}`}>
      <div className="pitWindowStatusIndicator">
        <span className="pitStatusLabel">{fuelWindow.status}</span>
        {fuelWindow.last > 0 && (
          <span className="lapToPit">
            L{fuelWindow.first}-{fuelWindow.last}
          </span>
        )}
      </div>
      {!pitted && (
        <div className="pitWindowRefuelIndicator">
          {amount > 0 ? (
            <span>
              +{amount}
              {unit.symbol}
            </span>
          ) : (
            <span>-</span>
          )}
        </div>
      )}
      {pitted && (
        <div className="pitWindowRefuelIndicator">
          <span>fueled</span>
        </div>
      )}
    </div>
  );
}

const lapsPerPage = 40;

function FuelWindowLapVisualizer({ window: fuelWindow }: Readonly<{ window: FuelWindow }>) {
  const laps = Math.ceil(Math.max(fuelWindow.maxLaps, 0));
  const page = lapsPerPage * (Math.ceil(fuelWindow.currentLap / lapsPerPage) - 1);
  const shownLaps = Array.from({ length: laps }, (_, index) => index + 1).slice(
    Math.max(0, page),
    Math.max(0, page) + lapsPerPage,
  );
  return (
    <div className="fuelWindowLapVisualizer">
      <div className="fuelWindoWTitle">
        <span>pit</span>
      </div>
      <div className="fuelWindoWLapBars">
        {shownLaps.map((lap) => {
          const inWindow = lap >= fuelWindow.first && lap <= fuelWindow.last;
          const type = inWindow
            ? lap === fuelWindow.currentLap
              ? 'CURRENT_PIT'
              : 'PIT'
            : lap === fuelWindow.currentLap
              ? 'CURRENT'
              : 'DEFAULT';
          return <div key={lap} className={`fuelLapBar ${type}`} />;
        })}
        {Array.from({ length: lapsPerPage - shownLaps.length }, (_, index) => (
          <div key={`empty${String(index)}`} className="fuelLapBar EMPTY" />
        ))}
      </div>
    </div>
  );
}

function RemainingWithFuel({
  title,
  value,
  target,
  lessThanTwoLaps,
  showTarget,
  format,
  empty,
}: Readonly<{
  title: string;
  value: number | null;
  target: number | null;
  lessThanTwoLaps: boolean;
  showTarget: boolean;
  format: (value: number) => string;
  empty: string;
}>) {
  const known = value !== null && value >= 0;
  return (
    <div
      className={cx('timeRemainingWithFuel', {
        highlightedBorderStyle: true,
        lessThanTwoLapsRemaining: lessThanTwoLaps,
      })}
    >
      <div className="title">{title}</div>
      <div className="value">
        <span>{known ? format(value) : empty}</span>
      </div>
      {showTarget && (
        <div
          className={cx('target-value', {
            positive: target !== null && target > 0,
            negative: target !== null && target < 0,
            neutral: target === null,
          })}
        >
          {target === null ? empty : `${target > 0 ? '+' : '-'}${format(Math.abs(target))}`}
        </div>
      )}
    </div>
  );
}

const historyFormat = (value: number, places: number): string => value.toFixed(places);

/** Fuel Calculator: fuel level, strategies, pit window and the history of fuel used. */
export default function App() {
  const overlay = useRacingOverlay(topics, 4);
  const { values } = overlay.settings;
  const { fuel, session } = overlay.telemetry;
  const calculator = fuel.calculator;
  const places = Math.round(num(values, 'DecimalCount', 1));
  const margin = num(values, 'RefuelAdditionalFuelInLaps', 1.2);
  const strategyId =
    fuelStrategies.find(
      (strategy) => strategy.id === str(values, 'RefuelingStrategy', 'Last10Average'),
    )?.id ?? 'Last10Average';
  const unit: Unit =
    fuel.displayUnit === 'kilograms' && fuel.kgPerLiter !== null
      ? { symbol: 'kg', perLiter: fuel.kgPerLiter }
      : session.displayUnits === 'imperial'
        ? { symbol: 'gal', perLiter: 0.264172 }
        : { symbol: 'L', perLiter: 1 };

  const rows: readonly MetricRow[] = fuelStrategies
    .filter((strategy) =>
      bool(
        values,
        `Show${strategy.id}`,
        strategy.id === 'AllLapsAverage' ||
          strategy.id === 'HighestLap' ||
          strategy.id === 'LowestLap',
      ),
    )
    .map((strategy) => ({
      id: strategy.id,
      label: strategy.short,
      color: str(values, `${strategy.id}Color`, '#ffffff'),
      strategy: calculator?.strategies[strategy.field] ?? null,
    }));
  const columns = {
    usage: bool(values, 'ShowAverageFuel', true),
    laps: bool(values, 'ShowLaps', true),
    pits: bool(values, 'ShowTotalPitstops', false),
    refuel: bool(values, 'ShowRefuel', true),
    totalRefuel: bool(values, 'ShowTotalRefuel', false),
    finish: bool(values, 'ShowFuelAtEnd', true),
  };
  const show = {
    title: bool(values, 'ShowTitle', true),
    windowStatus: bool(values, 'ShowFuelWindowStatus', false),
    windowBar: bool(values, 'ShowFuelWindowBar', false),
    history: bool(values, 'ShowFuelHistory', true),
    time: bool(values, 'ShowTimeRemainingUntilEmpty', false),
    timeTarget: bool(values, 'ShowTimeRemainingUntilEmptyTarget', true),
    laps: bool(values, 'ShowLapsRemainingUntilEmpty', false),
    lapsTarget: bool(values, 'ShowLapsRemainingUntilEmptyTarget', true),
    bar: bool(values, 'ShowFuelBar', true),
    fuel: bool(values, 'ShowFuel', true),
  };
  const [fontSize, fit] = useFitFont(
    'height',
    `${String(rows.length)}:${Object.values(columns).join()}:${Object.values(show).join()}`,
  );
  const general = { ...readGeneral(values), fontSize };

  const chosen =
    calculator?.strategies[
      fuelStrategies.find((strategy) => strategy.id === strategyId)?.field ?? 'last10'
    ] ?? null;
  const fuelWindow: FuelWindow = useMemo(() => {
    const plan = chosen?.window ?? null;
    const status: WindowStatus = plan === null ? 'NA' : (plan.status.toUpperCase() as WindowStatus);
    return {
      status,
      currentLap: (calculator?.lapsCompleted ?? 0) + 1,
      maxLaps: calculator?.raceLaps ?? 0,
      first: plan?.firstLap ?? 0,
      last: plan?.lastLap ?? 0,
      amount:
        plan === null
          ? 0
          : plan.status === 'pitted'
            ? plan.refuelLiters
            : plan.refuelLiters + margin * (chosen?.perLapLiters ?? 0),
    };
  }, [chosen, calculator, margin]);

  const allLapsAverage = calculator?.strategies.allLaps?.perLapLiters ?? 0;
  const lessThanTwoLaps = (calculator?.strategies.last5?.lapsRemaining ?? 0) < 2;
  const anyRow = rows.length > 0;
  let historyRows = rows.length;
  if (historyRows > 0) historyRows += 1;
  if (show.windowBar) historyRows += 1;
  const history = calculator?.history ?? [];
  const recent = history.slice(Math.max(0, history.length - historyRows)).reverse();
  const withMargin = (liters: number | null | undefined, strategy: Strategy) =>
    liters === null || liters === undefined
      ? null
      : (liters + margin * strategy.perLapLiters) * unit.perLiter;

  const level = (
    <FuelLevel
      level={fuel.levelLiters}
      capacity={fuel.capacityLiters}
      unit={unit}
      places={places}
      showBar={show.bar}
      showValue={show.fuel}
    />
  );

  return (
    <div ref={fit} className="rFit">
      <RContainer
        general={{ ...general, showTitle: false }}
        title="fuel calculator"
        titlePlacement="top"
        className={cx('FuelCalculatorOverlay', { showTitle: show.title })}
        disableTitle
        disableBackgroundColor
      >
        <div className="FuelCalculatorOverlayInner">
          <div
            className="leftContent"
            style={{
              backgroundColor: `rgba(0, 0, 0, ${String(general.opacity)})`,
              borderColor: general.titleColor,
            }}
          >
            <div className="fuelcalc_content">
              <div className="overlay_title">
                <span>fuel calculator</span>
              </div>
              {!show.windowStatus && level}
              {show.windowStatus && (
                <div className="fuelAndPitWindowStatusContainer">
                  <PitWindowStatus window={fuelWindow} unit={unit} />
                  <div className="gap8px" />
                  {level}
                </div>
              )}
              {anyRow && (
                <div className="fuelMetricsContainer">
                  <div className="fuelMetricTitle">
                    <div className="fuelMetricStrategyLabel"> </div>
                    <div className="fuelStrategyMetrics">
                      {columns.usage && (
                        <div className="fuelMetricStrategyValue">
                          <span>Usage</span>
                        </div>
                      )}
                      {columns.laps && (
                        <div className="fuelMetricStrategyValue">
                          <span>Laps</span>
                        </div>
                      )}
                      {columns.pits && (
                        <div className="fuelMetricStrategyValue">
                          <span>Pits</span>
                        </div>
                      )}
                      {columns.refuel && (
                        <div className="fuelMetricStrategyValue">
                          <span>Refuel</span>
                        </div>
                      )}
                      {columns.totalRefuel && (
                        <div className="fuelMetricStrategyValue">
                          <span>T.Refuel</span>
                        </div>
                      )}
                      {columns.finish && (
                        <div className="fuelMetricStrategyValue">
                          <span>Finish</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {rows.map((row, index) => {
                    const { strategy } = row;
                    const color = { color: row.color };
                    const cell = (text: string) => (
                      <div className="fuelMetricStrategyValue">
                        <span style={color}>{text}</span>
                      </div>
                    );
                    return (
                      <div
                        key={row.id}
                        className={`fuelMetricStrategy ${index % 2 === 1 ? 'odd' : 'even'}`}
                      >
                        <div className="fuelMetricStrategyLabel">
                          <span style={color}>
                            {row.label}
                            {row.id === strategyId && '*'}
                          </span>
                        </div>
                        <div className="fuelStrategyMetrics">
                          {columns.usage &&
                            cell(shown(strategy && strategy.perLapLiters * unit.perLiter, places))}
                          {columns.laps && cell(shown(strategy?.lapsRemaining, 1))}
                          {columns.pits && cell(shown(strategy?.stops, 1))}
                          {columns.refuel &&
                            cell(
                              shown(
                                strategy && withMargin(strategy.refuelLiters, strategy),
                                places,
                              ),
                            )}
                          {columns.totalRefuel &&
                            cell(
                              shown(
                                strategy && withMargin(strategy.totalRefuelLiters, strategy),
                                places,
                              ),
                            )}
                          {columns.finish &&
                            cell(
                              shown(
                                strategy?.litersAtFinish === null ||
                                  strategy?.litersAtFinish === undefined
                                  ? null
                                  : strategy.litersAtFinish * unit.perLiter,
                                places,
                              ),
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {show.windowBar && <FuelWindowLapVisualizer window={fuelWindow} />}
              {show.time && (
                <div className="timeRemainingUntilEmptyContainer">
                  <RemainingWithFuel
                    title="time until empty"
                    value={chosen?.timeRemainingSeconds ?? null}
                    target={chosen?.targetSeconds ?? null}
                    lessThanTwoLaps={lessThanTwoLaps}
                    showTarget={show.timeTarget}
                    format={toHHMMSS}
                    empty="--:--:--"
                  />
                </div>
              )}
              {show.laps && (
                <div className="timeRemainingUntilEmptyContainer">
                  <RemainingWithFuel
                    title="laps until empty"
                    value={chosen?.lapsRemaining ?? null}
                    target={chosen?.targetLaps ?? null}
                    lessThanTwoLaps={lessThanTwoLaps}
                    showTarget={show.lapsTarget}
                    format={(value) => toFixedDown(value, 1)}
                    empty="--"
                  />
                </div>
              )}
            </div>
          </div>
          {historyRows > 0 && (
            <div
              className={cx('rightContent', { show: show.history })}
              style={{
                backgroundColor: `rgba(0, 0, 0, ${String(num(values, 'FuelHistoryOpacity', 0.5))})`,
              }}
            >
              <div className="fuelUsedHistoryEntry headerColumn">
                <div className="colValue leftAlign">
                  <span>lap</span>
                </div>
                <div className="colValue centerAlign">
                  <span>used</span>
                </div>
                <div className="colValue rightAlign">
                  <span>diff</span>
                </div>
              </div>
              <div className={`fuelUsedHistoryContainer historyRows_${String(historyRows)}`}>
                {recent.map((entry) => {
                  const session = entry.isCurrentSession ? 'current' : 'pastsession';
                  const invalid = !entry.isClean;
                  const diff = (entry.usedLiters - allLapsAverage) * unit.perLiter;
                  return (
                    <div
                      key={`${session}-${String(entry.lapNumber)}`}
                      className={`fuelUsedHistoryEntry ${session}${invalid ? 'invalid-lap' : ''}`}
                    >
                      <div className="colValue leftAlign fuelUsedHistoryEntry_lap">
                        <span>{entry.lapNumber}</span>
                        {invalid && <span className="invalid-dot" />}
                      </div>
                      <div className="colValue centerAlign fuelUsedHistoryEntry_fuelused">
                        <span>
                          {entry.usedLiters
                            ? historyFormat(entry.usedLiters * unit.perLiter, Math.min(3, places))
                            : '-'}
                        </span>
                      </div>
                      <div className="colValue rightAlign fuelUsedHistoryEntry_fuelused">
                        <span>
                          {invalid
                            ? '-'
                            : entry.usedLiters
                              ? historyFormat(diff, Math.min(3, places))
                              : '-'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </RContainer>
    </div>
  );
}
