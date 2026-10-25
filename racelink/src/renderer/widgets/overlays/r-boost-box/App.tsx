import type { TelemetryTopic } from '../../../../shared/overlay-api/telemetry';
import { useRacingOverlay } from '../model/useRacingOverlay';
import { cx } from '../r-common/driver/cx';
import { RContainer } from '../r-common/RContainer';
import { bool, readGeneral } from '../r-common/rSettings';
import { useFitFont } from '../r-common/useFitFont';
import deployIcon from './assets/deploy.svg';
import energyIcon from './assets/energy.svg';

const topics: readonly TelemetryTopic[] = ['connection', 'vehicle'];

/** The bars start under the skewed left edge and overshoot at 100 %. */
const barWidth = (percent: number): number =>
  percent <= 1 ? 10 + percent - 4 : percent >= 99.9 ? 10 + percent + 4 : 10 + percent;

const percentOf = (fraction: number | null): number =>
  fraction === null ? 0 : Math.min(100, Math.max(0, fraction * 100));

/** Boost Box: deploy left this lap and battery charge, with the last lap's values. */
export default function App() {
  const overlay = useRacingOverlay(topics, 20);
  const { values } = overlay.settings;
  const battery = overlay.telemetry.vehicle.battery;
  const showLastLap = bool(values, 'ShowLastLapInfoBox', true);
  const [fontSize, fit] = useFitFont('height', showLastLap);
  const general = { ...readGeneral(values), fontSize };

  const deployPct = percentOf(battery.deployBudgetFraction);
  const energyPct = percentOf(battery.chargeFraction);
  const lastLapDeployPct = percentOf(battery.lastLapDeployBudgetFraction);
  const lastLapEnergyPct = percentOf(battery.lastLapChargeFraction);
  const deployActive = battery.isDeploying === true;
  const energyActive = battery.isHarvesting === true;

  return (
    <div ref={fit} className="rFit">
      <RContainer general={general} title="Boost" className="BoostBoxOverlay">
        <div className="overlay_content">
          {deployPct > 1 && (
            <div
              className={cx('glow', { active: deployActive })}
              style={{ width: `${String(deployPct - 4)}%` }}
            />
          )}
          <div className="deployContainer">
            <img src={deployIcon} className="deployIcon" alt="" />
            <div className="progressBar" style={{ width: `${String(barWidth(deployPct))}%` }} />
            <div
              className={cx('progressBarActive', { active: deployActive })}
              style={{ width: `${String(barWidth(deployPct))}%` }}
            />
            <div className="deployPercentage">{Math.floor(deployPct)}%</div>
            <div
              className="lastLapDeployLine"
              style={{ width: `${String(barWidth(lastLapDeployPct))}%` }}
            />
          </div>
          <div
            className={cx('glowEnergy', { active: energyActive })}
            style={{ width: `${String(energyPct - 4)}%` }}
          />
          <div className="energyContainer">
            <img src={energyIcon} className="energyIcon" alt="" />
            <div className="progressBar" style={{ width: `${String(barWidth(energyPct))}%` }} />
            <div
              className={cx('progressBarActive', { active: energyActive })}
              style={{ width: `${String(barWidth(energyPct))}%` }}
            />
            <div className="energyPercentage">{Math.floor(energyPct)}%</div>
            <div
              className="lastLapEnergyLine"
              style={{ width: `${String(barWidth(lastLapEnergyPct))}%` }}
            />
          </div>
        </div>
        {showLastLap && (
          <>
            <div className="overlay_content_lastLap">
              <span className="lastLapTitle">last lap</span>
            </div>
            <div className="overlay_content_lastLapValues">
              <div className="lastLapDeploy">
                <img src={deployIcon} className="deployIcon" alt="" />{' '}
                {Math.floor(lastLapDeployPct)}%
              </div>
              <div className="lastLapEnergy">
                <img src={energyIcon} className="energyIcon" alt="" />{' '}
                {Math.floor(lastLapEnergyPct)}%
              </div>
            </div>
          </>
        )}
      </RContainer>
    </div>
  );
}
