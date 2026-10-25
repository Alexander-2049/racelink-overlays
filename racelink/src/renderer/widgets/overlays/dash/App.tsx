import { useMemo, type CSSProperties } from 'react';
import { useOverlayConnection } from './overlay/useOverlayConnection';
import type { DashboardBox, DashboardRealtime, DashSettings } from './overlay/types';
import type { OverlaySettingsState } from '../model/overlaySettingsState';

type ColumnTone = 'green' | 'yellow' | 'orange' | 'red';

const DEFAULT_SETTINGS: DashSettings = {
  showGreen: true,
  showYellow: true,
  showOrange: true,
  showRed: true,
  backgroundOpacity: 60,
};

const EMPTY_BOX: DashboardBox = {
  visible: false,
  label: 'N/A',
  value: '',
  highlight: 0,
  fill: false,
  blink: false,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const formatNumber = (value: number | null | undefined, digits: number) =>
  typeof value === 'number' && Number.isFinite(value) ? value.toFixed(digits) : '';

const formatInteger = (value: number | null | undefined) =>
  typeof value === 'number' && Number.isFinite(value) ? String(Math.round(value)) : '';

const formatArb = (value: number | null | undefined, mode: string | null | undefined) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '';
  }
  return mode === 'p' ? `P${String(value + 1)}` : String(value);
};

const formatDiffPair = (base: number | null | undefined, offset: number | null | undefined) => {
  if (typeof offset !== 'number' || !Number.isFinite(offset)) {
    return '';
  }
  if (typeof base === 'number' && Number.isFinite(base)) {
    return `${String(base)} - ${String(offset)}`;
  }
  return String(offset);
};

const buildSettings = (overlaySettings: OverlaySettingsState | null): DashSettings => {
  const values = overlaySettings?.values ?? {};
  return {
    showGreen:
      typeof values.showGreen === 'boolean' ? values.showGreen : DEFAULT_SETTINGS.showGreen,
    showYellow:
      typeof values.showYellow === 'boolean' ? values.showYellow : DEFAULT_SETTINGS.showYellow,
    showOrange:
      typeof values.showOrange === 'boolean' ? values.showOrange : DEFAULT_SETTINGS.showOrange,
    showRed: typeof values.showRed === 'boolean' ? values.showRed : DEFAULT_SETTINGS.showRed,
    backgroundOpacity: clamp(
      typeof values.backgroundOpacity === 'number'
        ? values.backgroundOpacity
        : DEFAULT_SETTINGS.backgroundOpacity,
      0,
      100,
    ),
  };
};

const normalizeBox = (box: DashboardBox | null, top = false): DashboardBox => ({
  ...EMPTY_BOX,
  ...(top ? { label: '', value: '' } : {}),
  ...(box ?? {}),
  label: top ? '' : box?.label && box.label.trim().length > 0 ? box.label : 'N/A',
  value: box?.value ?? '',
});

const toneClassByHighlight = (tone: ColumnTone, highlight: number) => {
  if (highlight === -1) {
    return 'is-negative';
  }
  if (highlight === 1) {
    return `is-${tone}`;
  }
  return '';
};

const valueSizeClass = (value: string) => {
  if (value.length >= 8) {
    return 'is-compact';
  }
  if (value.length >= 5) {
    return 'is-medium';
  }
  return '';
};

const DashCard = ({
  tone,
  box,
  top = false,
}: {
  tone: ColumnTone;
  box: DashboardBox;
  top?: boolean;
}) => {
  const normalized = normalizeBox(box, top);
  const highlightClass = toneClassByHighlight(tone, normalized.highlight ?? 0);
  const fillClass = normalized.fill ? `is-filled is-${tone}` : '';
  const blinkClass = normalized.blink ? 'is-blinking' : '';

  if (top) {
    return (
      <div className={`dash-card dash-card-top tone-${tone}`}>
        {normalized.visible ? (
          <div className={`dash-banner ${fillClass} ${blinkClass}`.trim()}>
            <span>{normalized.value || normalized.label}</span>
          </div>
        ) : (
          <div className="dash-banner dash-banner-placeholder" />
        )}
      </div>
    );
  }

  return (
    <article className={`dash-card tone-${tone} ${highlightClass} ${fillClass}`.trim()}>
      <div className={`dash-value ${valueSizeClass(normalized.value ?? '')}`.trim()}>
        {normalized.value || ''}
      </div>
      <div className="dash-label">{normalized.label}</div>
    </article>
  );
};

const DashColumn = ({
  tone,
  top,
  upper,
  lower,
}: {
  tone: ColumnTone;
  top: DashboardBox | null;
  upper: DashboardBox | null;
  lower: DashboardBox | null;
}) => (
  <section className="dash-column">
    <DashCard tone={tone} box={top ?? EMPTY_BOX} top />
    <DashCard tone={tone} box={upper ?? EMPTY_BOX} />
    <DashCard tone={tone} box={lower ?? EMPTY_BOX} />
  </section>
);

function App() {
  const { settings, data, isReady } = useOverlayConnection();
  const resolvedSettings = useMemo(() => buildSettings(settings), [settings]);
  const dashboard: DashboardRealtime | null = data.dashboard ?? null;

  const columns = useMemo(() => {
    if (!dashboard) {
      return [];
    }
    const greenTop: DashboardBox =
      typeof dashboard.pushToPassCooldownSeconds === 'number' &&
      dashboard.pushToPassCooldownSeconds > 0
        ? {
            visible: true,
            value: dashboard.pushToPassCooldownSeconds.toFixed(1),
          }
        : dashboard.pushToPassActive
          ? {
              visible: true,
              value: dashboard.pushToPassCount != null ? 'P2P' : 'OT ON',
              fill: true,
            }
          : (dashboard.drsStatus ?? 0) > 0
            ? {
                visible: true,
                value: 'DRS',
                fill: dashboard.drsStatus === 3 || dashboard.drsStatus === 2,
                blink: dashboard.drsStatus === 2,
              }
            : EMPTY_BOX;

    const greenUpper: DashboardBox =
      dashboard.ersBatteryPct != null
        ? {
            visible: true,
            label: 'Battery',
            value: formatInteger((dashboard.ersBatteryPct ?? 0) * 100),
          }
        : dashboard.pushToPassCount != null && dashboard.pushToPassActive
          ? {
              visible: true,
              label: 'OT Left',
              value: formatInteger(dashboard.pushToPassCount),
              fill: true,
            }
          : dashboard.pushToPassCount != null
            ? {
                visible: true,
                label: 'P2P Count',
                value: formatInteger(dashboard.pushToPassCount),
              }
            : dashboard.drsCount != null
              ? {
                  visible: true,
                  label: 'DRS Count',
                  value: formatInteger(dashboard.drsCount),
                }
              : dashboard.boostLevel != null
                ? {
                    visible: true,
                    label: 'Boost Level',
                    value: String(dashboard.boostLevel),
                  }
                : dashboard.enginePowerLevel != null
                  ? {
                      visible: true,
                      label: 'Eng. Power',
                      value: String(dashboard.enginePowerLevel),
                    }
                  : EMPTY_BOX;

    const greenLower: DashboardBox =
      dashboard.lapDeployPct != null
        ? {
            visible: true,
            label: 'Lap Deploy',
            value: formatInteger((dashboard.lapDeployPct ?? 0) * 100),
          }
        : dashboard.fuelMixLevel != null
          ? {
              visible: true,
              label: 'Fuel Mix',
              value: String(dashboard.fuelMixLevel),
            }
          : dashboard.throttleShapeLevel != null
            ? {
                visible: true,
                label: 'Thr. Shaping',
                value: String(dashboard.throttleShapeLevel),
              }
            : dashboard.deployModeLabel
              ? {
                  visible: true,
                  label:
                    dashboard.lapDeployPct == null &&
                    dashboard.fuelMixLevel == null &&
                    dashboard.throttleShapeLevel == null &&
                    dashboard.deployModeLabel === 'QUAL'
                      ? 'Target'
                      : 'Mode',
                  value: dashboard.deployModeLabel,
                }
              : EMPTY_BOX;

    const orangeUpper: DashboardBox =
      dashboard.frontAntiRollBarSetting != null
        ? {
            visible: true,
            label: 'Front ARB',
            value: formatArb(dashboard.frontAntiRollBarSetting, dashboard.frontAntiRollBarMode),
          }
        : dashboard.entryDiffPreloadOffset != null
          ? {
              visible: true,
              label: 'Entry Preload',
              value: formatDiffPair(
                dashboard.entryDiffPreloadBase,
                dashboard.entryDiffPreloadOffset,
              ),
            }
          : dashboard.tc2Level != null
            ? {
                visible: true,
                label: 'TC2 Level',
                value: String(dashboard.tc2Level),
              }
            : dashboard.exitDiffLevel != null
              ? {
                  visible: true,
                  label: 'Exit Diff',
                  value: String(dashboard.exitDiffLevel),
                }
              : dashboard.rearWingAngle != null
                ? {
                    visible: true,
                    label: 'Rear Wing',
                    value: formatNumber(dashboard.rearWingAngle, 1),
                  }
                : EMPTY_BOX;

    const orangeLower: DashboardBox =
      dashboard.rearAntiRollBarSetting != null
        ? {
            visible: true,
            label: 'Rear ARB',
            value: formatArb(dashboard.rearAntiRollBarSetting, dashboard.rearAntiRollBarMode),
          }
        : dashboard.entryDiffOffset != null
          ? {
              visible: true,
              label: 'Entry Diff',
              value: formatDiffPair(dashboard.entryDiffBase, dashboard.entryDiffOffset),
            }
          : dashboard.tcLevel != null
            ? {
                visible: true,
                label: 'TC Level',
                value: String(dashboard.tcLevel),
              }
            : EMPTY_BOX;

    const redUpper: DashboardBox =
      dashboard.brakeValve != null
        ? {
            visible: true,
            label: 'Brake Valve',
            value: formatNumber(dashboard.brakeValve, 1),
          }
        : {
            visible: true,
            label: 'Brake Bias',
            value: formatNumber(dashboard.brakeBias, 1),
          };

    const redLower: DashboardBox =
      dashboard.weightJacker != null
        ? {
            visible: true,
            label: 'Weight Jacker',
            value: formatNumber(dashboard.weightJacker, 2),
          }
        : dashboard.absLevel != null
          ? {
              visible: true,
              label: 'ABS Level',
              value: formatInteger(dashboard.absLevel),
            }
          : dashboard.peakBrakeBias != null
            ? {
                visible: true,
                label: 'Peak Bias',
                value: formatNumber(dashboard.peakBrakeBias, 2),
              }
            : dashboard.brakeBiasMigration != null
              ? {
                  visible: true,
                  label: 'BB Migration',
                  value: formatNumber(dashboard.brakeBiasMigration, 2),
                }
              : EMPTY_BOX;

    const next: {
      id: string;
      tone: ColumnTone;
      top: DashboardBox | null;
      upper: DashboardBox | null;
      lower: DashboardBox | null;
    }[] = [];
    if (resolvedSettings.showGreen) {
      next.push({
        id: 'green',
        tone: 'green',
        top: greenTop,
        upper: greenUpper,
        lower: greenLower,
      });
    }
    if (resolvedSettings.showYellow) {
      next.push({
        id: 'yellow',
        tone: 'yellow',
        top: {
          visible: dashboard.fuelPitWindowOpen === true,
          value: 'PIT',
          fill: dashboard.fuelPitWindowOpen === true,
          blink:
            dashboard.fuelPitWindowOpen === true &&
            typeof dashboard.distanceToPitEntryMeters === 'number' &&
            dashboard.distanceToPitEntryMeters < 650,
        },
        upper: {
          visible: true,
          label: 'Fuel Remain',
          value: formatNumber(dashboard.fuelLevelLiters, 1),
        },
        lower: {
          visible: true,
          label: 'Laps Estimate',
          value: formatNumber(dashboard.fuelLapsRemaining, 1),
        },
      });
    }
    if (resolvedSettings.showOrange) {
      next.push({
        id: 'orange',
        tone: 'orange',
        top: {
          visible: dashboard.tractionControlActive === true,
          value: 'TC',
          fill: dashboard.tractionControlActive === true,
        },
        upper: orangeUpper,
        lower: orangeLower,
      });
    }
    if (resolvedSettings.showRed) {
      next.push({
        id: 'red',
        tone: 'red',
        top: {
          visible: dashboard.absActive === true,
          value: 'ABS',
          fill: dashboard.absActive === true,
        },
        upper: redUpper,
        lower: redLower,
      });
    }
    return next;
  }, [dashboard, resolvedSettings]);
  const hasEnabledColumns =
    resolvedSettings.showGreen ||
    resolvedSettings.showYellow ||
    resolvedSettings.showOrange ||
    resolvedSettings.showRed;

  if (!isReady) {
    return null;
  }

  return (
    <div
      className="dash-root"
      style={
        {
          '--dash-bg-opacity': String(resolvedSettings.backgroundOpacity / 100),
          '--dash-column-count': String(Math.max(columns.length, 1)),
        } as CSSProperties
      }
    >
      <div className="dash-shell">
        {columns.length > 0 ? (
          columns.map((column) => (
            <DashColumn
              key={column.id}
              tone={column.tone}
              top={column.top}
              upper={column.upper}
              lower={column.lower}
            />
          ))
        ) : !hasEnabledColumns ? (
          <div className="dash-empty">Enable at least one color group.</div>
        ) : !dashboard ? (
          <div className="dash-empty">Waiting for live telemetry.</div>
        ) : (
          <div className="dash-empty">No dashboard data available.</div>
        )}
      </div>
    </div>
  );
}

export default App;
