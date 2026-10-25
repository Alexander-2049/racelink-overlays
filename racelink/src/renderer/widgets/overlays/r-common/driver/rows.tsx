import { memo, useMemo, type CSSProperties, type ReactNode } from 'react';
import {
  CarBrand,
  DriverCarClass,
  DriverGear,
  DriverNationality,
  DriverNationalityFlag,
  DriverNumber,
  DriverOfftracks,
  DriverPosition,
  JokerLap,
  LapNumber,
  PitStint,
  PushToPass,
  TireCompounds,
  VirtualEnergy,
} from './badges';
import { cx } from './cx';
import { DriverLicence, DriverName, IratingBadge } from './driver';
import { hexToRgba } from './format';
import type {
  RBackgroundMode,
  RDensity,
  RFlaggedHighlight,
  RRowProps,
  RRowSettings,
  RTheme,
} from './model';
import {
  AverageLapTime,
  DeltaLapTime,
  FastestLapTime,
  LastLapTime,
  PhysicalDistance,
  TimeDistance,
} from './timing';

const upperCaseFormats = new Set(['8', '9', '10', '11']);

type ColumnProps = Readonly<{
  order: number;
  addExtraPaddingWhenFirst?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}>;

/** A column placed by its order number; order 0 or below pushes it to the end. */
export const OrderableColumn = memo(function OrderableColumn({
  order,
  addExtraPaddingWhenFirst,
  fullWidth,
  children,
}: ColumnProps) {
  if (order <= 0) return <div className="OrderableColumn orderInf">{children}</div>;
  return (
    <div
      className={cx(`OrderableColumn order${String(order)}`, {
        extraPadding: order === 1 && addExtraPaddingWhenFirst === true,
        fullWidth,
      })}
    >
      {children}
    </div>
  );
});

const Visible = ({ visible, children }: Readonly<{ visible: boolean; children: ReactNode }>) =>
  visible ? <>{children}</> : null;

type ContainerProps = Readonly<{
  density: RDensity;
  isReference: boolean;
  posIndex: number;
  lastIndex: number;
  opacity: number;
  backgroundMode: RBackgroundMode;
  inactive: boolean;
  settings: RRowSettings;
  highlight: RFlaggedHighlight;
  carClassColor?: string;
  isLapped: boolean;
  isLapping: boolean;
  rowIsEmpty: boolean;
  /** The row ends flush with its panel instead of leaving the right padding. */
  withRightPadding?: boolean;
  children: ReactNode;
}>;

const referenceColors = (settings: RRowSettings) => ({
  isEnabled: settings.ReferenceCarStripedBg,
  stripeColor: settings.ReferenceCarCustomColors ? settings.ReferenceCarStripeColor : '#d8af0f',
  bgColor: settings.ReferenceCarCustomColors ? settings.ReferenceCarBgColor : '#ffda59',
});

const alphaHex = (opacity: number): string =>
  Math.max(100, 100 * opacity + 30)
    .toString(16)
    .slice(0, 2);

/** The Lumina theme's row shell: translucent base, class color, flagged-car tint. */
function LuminaRowContainer(props: ContainerProps) {
  const reference = referenceColors(props.settings);
  const style = useMemo((): CSSProperties => {
    if (props.rowIsEmpty) return {};
    let opacity = props.opacity;
    if (props.backgroundMode === 'light') opacity = 0.6 * props.opacity;
    else if (props.backgroundMode === 'none') opacity = 0;
    const base = '#121215';
    const lapped = '#1D4185';
    const lapping = '#991B1B';
    let rowColor = base;
    let flagged = '#ffffff';
    let flaggedAlpha = 0.7;
    if (props.isLapped) {
      flagged = lapped;
      rowColor = lapped;
      opacity = props.backgroundMode === 'normal' ? props.opacity : 0.5 * props.opacity;
    } else if (props.isLapping) {
      flagged = lapping;
      rowColor = lapping;
      opacity = props.backgroundMode === 'normal' ? props.opacity : 0.5 * props.opacity;
    } else flaggedAlpha = 0;
    const baseColor = props.highlight === 'FULL_ROW' ? rowColor : base;
    return {
      '--baseBgColor': hexToRgba(baseColor, opacity),
      '--carClassBgColor': hexToRgba(props.carClassColor ?? '', 0.5),
      '--bgOpacity': props.opacity,
      '--flaggedCarColor': hexToRgba(flagged, flaggedAlpha),
      '--referenceCarStripeColor': `${reference.stripeColor}4C`,
      '--referenceCarBgColor': `${reference.bgColor}${alphaHex(props.opacity)}`,
      '--referenceCarBgColorSide': reference.bgColor,
    } as CSSProperties;
  }, [props, reference.bgColor, reference.stripeColor]);
  const className = cx('luminaRowCont', {
    isReferenceBg: props.isReference,
    ReferenceCarStripedBgEnabled: reference.isEnabled,
    ReferenceCarStripedBgDisabled: !reference.isEnabled,
    withCarClassColors: props.carClassColor !== undefined && props.carClassColor !== '',
    isFirstRow: props.posIndex === 0,
    isLastRow: props.lastIndex === props.posIndex,
    densityCompact: props.density === 'COMPACT',
    densityComfortable: props.density === 'COMFORTABLE',
    densityCosy: props.density === 'COZY',
    withLeftPadding: false,
    withRightPadding: props.withRightPadding !== false,
    isEmpty: props.rowIsEmpty,
    isLapped: props.isLapped,
    isInactive: props.inactive,
    flaggedCarHighlightRowEnd: !props.isReference && props.highlight === 'ROW_END',
    opacity0: props.opacity === 0,
  });
  if (props.rowIsEmpty) return <div className={className} style={style} />;
  return (
    <div className={className} style={style}>
      <div className="bottomShadow" />
      {props.children}
    </div>
  );
}

/** The Classic theme's row shell. */
function ClassicRowContainer(props: ContainerProps) {
  const reference = referenceColors(props.settings);
  const className = cx('classicRowCont', {
    isReferenceBg: props.isReference,
    isFirst: props.posIndex === 0,
    ReferenceCarStripedBgEnabled: reference.isEnabled,
    ReferenceCarStripedBgDisabled: !reference.isEnabled,
    withRightPadding: props.withRightPadding !== false,
  });
  const style = useMemo((): CSSProperties => {
    let background = '';
    if (props.settings.BackgroundSeparation && props.posIndex % 2 === 0) {
      background = `rgba(255, 255, 255, ${String(0.12 * props.opacity)})`;
    }
    return {
      background: props.isReference ? '' : background,
      '--referenceCarStripeColor': `${reference.stripeColor}4C`,
      '--referenceCarBgColor': `${reference.bgColor}${alphaHex(props.opacity)}`,
      '--referenceCarBgColorSide': reference.bgColor,
    } as CSSProperties;
  }, [
    props.settings.BackgroundSeparation,
    props.posIndex,
    props.opacity,
    props.isReference,
    reference.bgColor,
    reference.stripeColor,
  ]);
  if (props.rowIsEmpty) return <div className={className} />;
  return (
    <div className={className} style={style}>
      {props.children}
    </div>
  );
}

const orderMapOf = (settings: RRowSettings, keys: readonly string[]): Map<string, number> => {
  const map = new Map<string, number>();
  keys.forEach((key, index) => {
    const order = settings.ColumnOrder[index];
    if (order !== undefined && order !== 0) map.set(key, order);
  });
  return map;
};

/** Whether `key` is the first visible column going left to right. */
const firstToShow = (settings: RRowSettings, keys: readonly string[]): Map<string, boolean> => {
  const placed: [number, number][] = [];
  keys.forEach((_, index) => {
    const order = settings.ColumnOrder[index];
    if (order !== undefined && order !== 0) placed.push([order, index]);
  });
  placed.sort((a, b) => a[0] - b[0]);
  const result = new Map<string, boolean>();
  let found = false;
  const flags = settings as unknown as Readonly<Record<string, unknown>>;
  for (const [, index] of placed) {
    const key = keys[index];
    if (key === undefined) continue;
    const on = flags[key] === true;
    result.set(key, on && !found);
    if (on) found = true;
  }
  return result;
};

const pitRows = (props: RRowProps) => ({
  showPitEntry: props.position.showPitEntry,
  showPitLap: props.settings.ShowPitLap,
  showPitTime: props.settings.ShowPitTime,
  showOutLap: props.settings.ShowOutLap,
  pitEntry: props.position.pitEntry,
});

/** The columns the two themes share, in the order of the `ColumnOrder` setting. */
function RowColumns({
  props,
  theme,
  order,
  first,
}: Readonly<{
  props: RRowProps;
  theme: 'classic' | 'lumina';
  order: (key: string) => number;
  first: (key: string) => boolean;
}>) {
  const { position, settings } = props;
  const classic = theme === 'classic';
  const pad = classic ? first('ShowDriverName') : true;
  const legacy = classic ? true : undefined;
  const nameSize = classic ? '16' : '19';
  const hasPit = pitRows(props);
  const lapped = settings.FlaggedCarsHighlight === 'DRIVERNAME' && position.carIsLapped;
  const lapping = settings.FlaggedCarsHighlight === 'DRIVERNAME' && position.carIsLapping;
  const inactive = classic ? position.carOnPitRoad : position.driverIsNotPresent;
  const carNumberBeforeClass =
    settings.ShowDriverNumber && order('ShowCarClass') + 1 === order('ShowDriverNumber');
  const sizeFor = (modern: string, simple: string) => (classic ? simple : modern);
  return (
    <>
      <Visible visible={settings.ShowDriverCarBrand}>
        <OrderableColumn order={order('ShowDriverCarBrand')}>
          <CarBrand
            carBrand={position.carBrand}
            isColored={settings.BrandColorIsColored}
            highlight={settings.BrandColorHighlight}
          />
        </OrderableColumn>
      </Visible>
      {!classic && (
        <Visible visible={settings.ShowCarClass}>
          <OrderableColumn order={order('ShowCarClass')}>
            <DriverCarClass
              visible
              carClassColor={position.carClassColor}
              carIsReference={position.carIsReference}
              theme="leaned"
            >
              {carNumberBeforeClass && (
                <DriverNumber
                  showDriverNumber={settings.ShowDriverNumber}
                  carOnPitRoad={position.carOnPitRoad}
                  carIsLapped={position.carIsLapped}
                  carIsLapping={position.carIsLapping}
                  driverNumber={position.driverNumber}
                  driverNumberMaxLetters={position.driverNumberMaxLetters}
                  carClassColor={position.carClassColor}
                  isCarClassEnabled={settings.ShowCarClass}
                  isRadioOn={false}
                  disableHashmark
                  theme="modern"
                />
              )}
            </DriverCarClass>
          </OrderableColumn>
        </Visible>
      )}
      <Visible
        visible={
          settings.ShowDriverNumber &&
          (classic
            ? !settings.ShowCarClass || order('ShowCarClass') + 1 !== order('ShowDriverNumber')
            : !carNumberBeforeClass)
        }
      >
        <OrderableColumn order={order('ShowDriverNumber')}>
          <DriverNumber
            showDriverNumber
            carOnPitRoad={position.carOnPitRoad}
            carIsLapped={position.carIsLapped}
            carIsLapping={position.carIsLapping}
            driverNumber={position.driverNumber}
            driverNumberMaxLetters={position.driverNumberMaxLetters}
            carClassColor={position.carClassColor}
            isCarClassEnabled={settings.ShowCarClass}
            isRadioOn={false}
            theme={classic ? 'simple' : 'modern'}
          />
        </OrderableColumn>
      </Visible>
      <Visible visible={settings.ShowTireCompounds}>
        <OrderableColumn order={order('ShowTireCompounds')}>
          <TireCompounds
            visible
            tireCount={settings.NumberOfTireCompoundsToShow}
            tireCompoundsHistory={position.tireCompoundsHistory}
            showLaps={settings.ShowLapsCompletedOnTireCompounds}
            size={classic ? undefined : '24'}
          />
        </OrderableColumn>
      </Visible>
      <Visible visible={settings.ShowDriverNationalityFlagBadge}>
        <OrderableColumn order={order('ShowDriverNationalityFlagBadge')}>
          <DriverNationalityFlag
            visible={classic ? settings.ShowDriverNationalityFlagBadge : true}
            nationalityCountryCode={position.nationality?.countryCode}
            inactive={false}
          />
        </OrderableColumn>
      </Visible>
      <Visible visible={settings.ShowDriverName}>
        <OrderableColumn
          order={order('ShowDriverName')}
          addExtraPaddingWhenFirst={classic ? first('ShowDriverName') : true}
          fullWidth
        >
          <DriverName
            carOnPitRoad={classic ? position.carOnPitRoad : false}
            carIsLapped={classic ? position.carIsLapped : lapped}
            carIsLapping={classic ? position.carIsLapping : lapping}
            carIsReference={position.carIsReference}
            driverName={position.driverName}
            secondaryDriverName={position.secondaryDriverName}
            driverNameWidth={settings.NameWidth}
            isRadioOn={classic ? position.isRadioOn : false}
            isOutLap={position.isOutLap}
            driverNote={settings.ShowDriverNote ? position.driverNote : null}
            driverNoteColor={settings.DriverNoteColor}
            driverTagsEnabled={settings.IsDriverTagEnabled}
            driverTags={position.driverTags}
            driverTagSize={settings.DriverTagSize}
            driverFlag={position.driverFlag}
            driverFlagEnabled={settings.ShowDriverFlag && settings.DriverFlagSide === 'aftername'}
            pitEntry={hasPit.pitEntry}
            showPitLap={hasPit.showPitLap}
            showPitTime={hasPit.showPitTime}
            showOutLap={hasPit.showOutLap}
            pitBadgeSizing={classic ? undefined : '19'}
            upperCaseAll={upperCaseFormats.has(settings.DriverNameFormat)}
            nameSizing={
              classic ? 'nameNormal' : settings.Density === 'COMPACT' ? 'nameNormal' : 'nameLarge'
            }
          />
        </OrderableColumn>
      </Visible>
      <Visible visible={settings.ShowCurrentStint}>
        <OrderableColumn order={order('ShowCurrentStint')} addExtraPaddingWhenFirst={pad}>
          <PitStint
            type="current"
            lapsCompleted={position.pitEntry?.numberOfLapsSinceLastPitted}
            color={settings.CurrentStintColor}
            size={sizeFor('19', '16')}
          />
        </OrderableColumn>
      </Visible>
      <Visible visible={settings.ShowCompletedStint}>
        <OrderableColumn order={order('ShowCompletedStint')} addExtraPaddingWhenFirst={pad}>
          <PitStint
            type="completed"
            lapsCompleted={position.pitEntry?.lastStint?.numberOfLapsCompleted}
            stintNumber={position.pitEntry?.lastStint?.stintNumber}
            color={settings.CompletedStintColor}
            size={sizeFor('19', '16')}
          />
        </OrderableColumn>
      </Visible>
      <Visible visible={settings.ShowDriverNationalityText}>
        <OrderableColumn order={order('ShowDriverNationalityText')} addExtraPaddingWhenFirst={pad}>
          <DriverNationality
            visible
            carOnPitRoad={false}
            carIsLapped={false}
            carIsLapping={false}
            inactive={false}
            carIsReference={position.carIsReference}
            driverNationality={position.nationality}
            size={nameSize}
          />
        </OrderableColumn>
      </Visible>
      <Visible visible={settings.ShowJokerLap}>
        <OrderableColumn order={order('ShowJokerLap')} addExtraPaddingWhenFirst={pad}>
          <JokerLap visible isCompleted={position.jokerLapsCompleted > 0} />
        </OrderableColumn>
      </Visible>
      <Visible visible={settings.ShowPushToPass}>
        <OrderableColumn order={order('ShowPushToPass')} addExtraPaddingWhenFirst={pad}>
          <PushToPass visible value={position.pushToPass} size={sizeFor('21', '19')} />
        </OrderableColumn>
      </Visible>
      <Visible visible={settings.ShowLicence || settings.ShowSafetyRating}>
        <OrderableColumn order={order('ShowLicence')} addExtraPaddingWhenFirst={pad}>
          <DriverLicence
            showLicence={settings.ShowLicence}
            showSafetyRating={settings.ShowSafetyRating}
            driverLicence={position.driverLicence}
            inactive={position.carOnPitRoad}
            size={sizeFor('19', '17')}
          />
        </OrderableColumn>
      </Visible>
      <Visible visible={settings.ShowIrating || settings.ShowIratingGain}>
        <OrderableColumn order={order('ShowIrating')} addExtraPaddingWhenFirst={pad}>
          <IratingBadge
            showIrating={settings.ShowIrating}
            showIratingGain={settings.ShowIratingGain}
            showIratingDelta={position.showIratingDelta}
            inactive={classic ? position.carOnPitRoad : position.driverIsNotPresent}
            irating={position.irating}
            iratingDelta={position.iratingDelta}
            showIratingRawNumber={settings.IratingFormat === 'NUMBER'}
            showIratingInKNoDec={settings.IratingFormat === 'NUMBERINKNODEC'}
            size={sizeFor('19', '16')}
          />
        </OrderableColumn>
      </Visible>
      <Visible visible={settings.ShowFastestLapTime}>
        <OrderableColumn order={order('ShowFastestLapTime')}>
          <FastestLapTime
            visible
            carIsReference={position.carIsReference}
            inactive={inactive}
            value={position.fastestLapTime}
            driverIdx={position.driverIdx}
            highlightedBackgroundOpacity={settings.HighlightedLapTimeOpacity}
            decimals={settings.FastestLapTimeDecimals}
            dropMinute={settings.DropFastestLapTimeMinute}
            legacy={legacy}
            align="center"
          />
        </OrderableColumn>
      </Visible>
      <Visible visible={settings.ShowLastLapTime}>
        <OrderableColumn order={order('ShowLastLapTime')}>
          <LastLapTime
            visible
            carIsReference={position.carIsReference}
            inactive={inactive}
            value={position.lastLapTime}
            driverIdx={position.driverIdx}
            highlightedBackgroundOpacity={settings.HighlightedLapTimeOpacity}
            decimals={settings.LastLapTimeDecimals}
            dropMinute={settings.DropLastLapTimeMinute}
            legacy={legacy}
            align="center"
          />
        </OrderableColumn>
      </Visible>
      <Visible visible={settings.ShowLast5LapTimeAvg}>
        <OrderableColumn order={order('ShowLast5LapTimeAvg')}>
          <AverageLapTime
            visible
            value={position.last5LapTimeAvg}
            inactive={classic ? position.carOnPitRoad : false}
            carIsReference={position.carIsReference}
            driverIdx={position.driverIdx}
            highlightedBackgroundOpacity={settings.HighlightedLapTimeOpacity}
            decimals={settings.Last5LapTimeAvgDecimals}
            dropMinute={settings.DropLast5LapMinute}
            legacy={legacy}
            align="center"
          />
        </OrderableColumn>
      </Visible>
      <Visible visible={settings.ShowLast10LapTimeAvg}>
        <OrderableColumn order={order('ShowLast10LapTimeAvg')}>
          <AverageLapTime
            visible
            value={position.last10LapTimeAvg}
            inactive={classic ? position.carOnPitRoad : false}
            carIsReference={position.carIsReference}
            driverIdx={position.driverIdx}
            highlightedBackgroundOpacity={settings.HighlightedLapTimeOpacity}
            decimals={settings.Last10LapTimeAvgDecimals}
            dropMinute={settings.DropLast10LapMinute}
            legacy={legacy}
            align="center"
          />
        </OrderableColumn>
      </Visible>
      <Visible visible={settings.ShowLapNumber}>
        <OrderableColumn order={order('ShowLapNumber')}>
          <LapNumber
            visible
            lapNumber={position.lapNumber}
            legacy={legacy}
            columnDigits={props.columnDigits}
          />
        </OrderableColumn>
      </Visible>
      <Visible visible={settings.ShowLapDelta}>
        <OrderableColumn order={order('ShowLapDelta')} addExtraPaddingWhenFirst={pad}>
          <DeltaLapTime
            visible
            value={position.lapDelta}
            count={settings.LapDeltaCount}
            carIsReference={position.carIsReference}
            highlightedBackgroundOpacity={settings.HighlightedLapTimeOpacity}
            legacy={legacy}
          />
        </OrderableColumn>
      </Visible>
      <Visible visible={settings.ShowDriverOfftracks}>
        <OrderableColumn order={order('ShowDriverOfftracks')}>
          <DriverOfftracks
            visible
            count={position.offTrackCount}
            inactive={classic ? position.carOnPitRoad : false}
            disableAnim={settings.DisableOfftrackAnim}
            driverIdx={position.driverIdx}
            alignText="center"
            legacy={legacy}
          />
        </OrderableColumn>
      </Visible>
      <Visible visible={settings.ShowVirtualEnergy}>
        <OrderableColumn order={order('ShowVirtualEnergy')}>
          <VirtualEnergy
            visible
            value={position.virtualEnergy}
            hideBattery={settings.NRG_HideBattery}
            hidePctNumber={settings.NRG_HidePctNumber}
            hidePctSign={settings.NRG_HidePctSign}
            whiteOnly={settings.NRG_BatteryWhiteOnly}
            batterySize={settings.NRG_BatterySize}
            legacy={legacy}
          />
        </OrderableColumn>
      </Visible>
      <Visible visible={settings.ShowTimeDistance}>
        <OrderableColumn order={order('ShowTimeDistance')}>
          <TimeDistance
            visible
            value={position.distanceInTime}
            carOnPitRoad={classic ? position.carOnPitRoad : false}
            carIsLapped={classic ? position.carIsLapped : lapped}
            carIsLapping={classic ? position.carIsLapping : lapping}
            timeDecimals={settings.TimeDistanceDecimals}
            textSize={classic || settings.Density === 'COMPACT' ? undefined : 'large'}
            legacy={legacy}
          />
        </OrderableColumn>
      </Visible>
      <Visible visible={settings.ShowPhysicalDistance}>
        <OrderableColumn order={order('ShowPhysicalDistance')}>
          <PhysicalDistance
            visible
            value={position.distanceInPhysical}
            carOnPitRoad={classic ? position.carOnPitRoad : false}
            carIsLapped={classic ? position.carIsLapped : lapped}
            carIsLapping={classic ? position.carIsLapping : lapping}
            legacy={legacy}
          />
        </OrderableColumn>
      </Visible>
      <Visible visible={settings.ShowDriverGear}>
        <OrderableColumn order={order('ShowDriverGear')}>
          <DriverGear isEnabled gear={position.gear} legacy={legacy} />
        </OrderableColumn>
      </Visible>
    </>
  );
}

const signatures = new WeakMap<object, string>();
const signatureOf = (value: object): string => {
  let signature = signatures.get(value);
  if (signature === undefined) {
    signature = JSON.stringify(value);
    signatures.set(value, signature);
  }
  return signature;
};

/**
 * Rows are rebuilt from telemetry many times a second, and most rows do not
 * change between two updates. Comparing what a row shows keeps it from rendering.
 */
const sameRow = (previous: RRowProps, next: RRowProps): boolean =>
  previous.posIndex === next.posIndex &&
  previous.lastIndex === next.lastIndex &&
  previous.columnDigits === next.columnDigits &&
  previous.backgroundMode === next.backgroundMode &&
  previous.ColumnOrderKeys === next.ColumnOrderKeys &&
  (previous.position === next.position ||
    signatureOf(previous.position) === signatureOf(next.position)) &&
  (previous.settings === next.settings ||
    signatureOf(previous.settings) === signatureOf(next.settings));

/** One driver row, in the Classic or the Lumina theme. */
export const ClassicRow = memo(function ClassicRow(props: RRowProps) {
  const { position, settings } = props;
  const order = useMemo(
    () => orderMapOf(settings, props.ColumnOrderKeys),
    [settings, props.ColumnOrderKeys],
  );
  const firsts = useMemo(
    () => firstToShow(settings, props.ColumnOrderKeys),
    [settings, props.ColumnOrderKeys],
  );
  const orderOf = (key: string): number => order.get(key) ?? -1;
  const first = (key: string): boolean => firsts.get(key) ?? false;
  const classOnLeft = settings.ShowCarClass && first('ShowCarClass');
  return (
    <ClassicRowContainer
      density={settings.Density}
      isReference={position.carIsReference}
      posIndex={props.posIndex}
      lastIndex={props.lastIndex}
      opacity={settings.Opacity}
      backgroundMode={props.backgroundMode}
      inactive={position.driverIsNotPresent || position.carOnPitRoad}
      settings={settings}
      highlight={settings.FlaggedCarsHighlight}
      carClassColor={position.carClassColor}
      isLapped={position.carIsLapped}
      isLapping={position.carIsLapping}
      rowIsEmpty={position.rowIsEmpty}
    >
      {!classOnLeft && (
        <>
          <DriverPosition
            visible={settings.ShowPosition}
            position={position.position}
            carIsLapped={position.carIsLapped}
            carIsLapping={position.carIsLapping}
            carOnPitRoad={position.carOnPitRoad}
            carIsReference={position.carIsReference}
          />
          <Visible visible={settings.ShowCarClass}>
            <OrderableColumn order={orderOf('ShowCarClass')}>
              <DriverCarClass
                visible
                carClassColor={position.carClassColor}
                carIsReference={position.carIsReference}
                theme="simple"
              />
              {settings.ShowDriverNumber &&
                orderOf('ShowCarClass') + 1 === orderOf('ShowDriverNumber') && (
                  <DriverNumber
                    showDriverNumber={settings.ShowDriverNumber}
                    carOnPitRoad={position.carOnPitRoad}
                    carIsLapped={position.carIsLapped}
                    carIsLapping={position.carIsLapping}
                    driverNumber={position.driverNumber}
                    driverNumberMaxLetters={position.driverNumberMaxLetters}
                    carClassColor={position.carClassColor}
                    isCarClassEnabled={settings.ShowCarClass}
                    isRadioOn={false}
                    theme="simple"
                  />
                )}
            </OrderableColumn>
          </Visible>
        </>
      )}
      <Visible visible={classOnLeft}>
        <OrderableColumn order={999}>
          <DriverPosition
            visible={settings.ShowPosition}
            position={position.position}
            carIsLapped={position.carIsLapped}
            carIsLapping={position.carIsLapping}
            carOnPitRoad={position.carOnPitRoad}
            carIsReference={position.carIsReference}
          />
          <DriverCarClass
            visible
            carClassColor={position.carClassColor}
            carIsReference={position.carIsReference}
            theme="simple"
          />
          {settings.ShowDriverNumber &&
            orderOf('ShowCarClass') + 1 === orderOf('ShowDriverNumber') && (
              <DriverNumber
                showDriverNumber={settings.ShowDriverNumber}
                carOnPitRoad={position.carOnPitRoad}
                carIsLapped={position.carIsLapped}
                carIsLapping={position.carIsLapping}
                driverNumber={position.driverNumber}
                driverNumberMaxLetters={position.driverNumberMaxLetters}
                carClassColor={position.carClassColor}
                isCarClassEnabled={settings.ShowCarClass}
                isRadioOn={false}
                theme="simple"
              />
            )}
        </OrderableColumn>
      </Visible>
      <RowColumns props={props} theme="classic" order={orderOf} first={first} />
    </ClassicRowContainer>
  );
}, sameRow);

export const LuminaRow = memo(function LuminaRow(props: RRowProps) {
  const { position, settings } = props;
  const order = useMemo(
    () => orderMapOf(settings, props.ColumnOrderKeys),
    [settings, props.ColumnOrderKeys],
  );
  const orderOf = (key: string): number => order.get(key) ?? -1;
  const flagsPosition =
    settings.FlaggedCarsHighlight === 'FULL_ROW' || settings.FlaggedCarsHighlight === 'POSITION';
  return (
    <LuminaRowContainer
      density={settings.Density}
      isReference={position.carIsReference}
      posIndex={props.posIndex}
      lastIndex={props.lastIndex}
      opacity={settings.Opacity}
      backgroundMode={props.backgroundMode}
      inactive={position.driverIsNotPresent || position.carOnPitRoad}
      settings={settings}
      highlight={settings.FlaggedCarsHighlight}
      carClassColor={settings.ShowCarClassBgColor ? position.carClassColor : undefined}
      isLapped={position.carIsLapped}
      isLapping={position.carIsLapping}
      rowIsEmpty={position.rowIsEmpty}
    >
      <DriverPosition
        visible={settings.ShowPosition}
        position={position.position}
        carIsLapped={flagsPosition && position.carIsLapped}
        carIsLapping={flagsPosition && position.carIsLapping}
        carOnPitRoad={position.carOnPitRoad}
        carIsReference={position.carIsReference}
        isRadioOn={position.isRadioOn}
        theme="modern"
      />
      <RowColumns props={props} theme="lumina" order={orderOf} first={() => false} />
    </LuminaRowContainer>
  );
}, sameRow);

/** A driver row in the theme the settings choose. */
export function DriverRow(props: RRowProps & Readonly<{ theme: 'CLASSIC' | 'LUMINA' }>) {
  const { theme, ...row } = props;
  return theme === 'LUMINA' ? <LuminaRow {...row} /> : <ClassicRow {...row} />;
}

/** The row panel of a theme, for rows that bring their own content (the Standings side columns). */
export function RowShell(props: ContainerProps & Readonly<{ theme: RTheme }>) {
  const { theme, ...container } = props;
  return theme === 'LUMINA' ? (
    <LuminaRowContainer {...container} />
  ) : (
    <ClassicRowContainer {...container} />
  );
}
