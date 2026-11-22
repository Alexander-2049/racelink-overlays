import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { consumptionOf, fuelBoard, type FuelBoardInput } from './fuelBoard.ts';

const base: FuelBoardInput = {
  levelLiters: 50,
  capacityLiters: 106,
  history: [
    { usedLiters: 3.0, isClean: true },
    { usedLiters: 3.2, isClean: true },
    { usedLiters: 3.4, isClean: true },
    { usedLiters: 9.9, isClean: false },
  ],
  strategies: { lastLap: { perLapLiters: 3.5 }, allLaps: { perLapLiters: 3.1 } },
  modelPerLapLiters: 3.3,
  lapsToFinish: 20.2,
  source: 'AVERAGE',
  customPerLapLiters: 4,
  marginLaps: 1,
  extraMode: 'spare',
  onPitRoad: false,
};

describe('consumptionOf', () => {
  it('averages the clean laps without the extremes', () => {
    assert.ok(Math.abs((consumptionOf(base) ?? 0) - 3.2) < 1e-9);
  });
  it('falls back to the model without clean laps', () => {
    assert.equal(consumptionOf({ ...base, history: [], strategies: null }), 3.3);
  });
  it('reads the other sources', () => {
    assert.equal(consumptionOf({ ...base, source: 'LAST' }), 3.5);
    assert.equal(consumptionOf({ ...base, source: 'ALL' }), 3.1);
    assert.equal(consumptionOf({ ...base, source: 'LOWEST' }), null);
    assert.equal(consumptionOf({ ...base, source: 'CUSTOM' }), 4);
    assert.equal(consumptionOf({ ...base, source: 'CUSTOM', customPerLapLiters: 0 }), null);
  });
});

describe('fuelBoard', () => {
  it('works out the fuel to add with the margin', () => {
    const board = fuelBoard({ ...base, source: 'CUSTOM', customPerLapLiters: 4 });
    // 21 laps left, one lap of margin: 22 * 4 = 88; minus 50 in the tank.
    assert.equal(board.lapsLeft, 21);
    assert.equal(board.addLiters, 38);
    assert.equal(board.lapsOfFuel, 12.5);
    assert.equal(board.atFinishLiters, 50 - 84);
  });

  it('limits the fuel to add to the space in the tank', () => {
    const board = fuelBoard({ ...base, levelLiters: 10, source: 'CUSTOM', customPerLapLiters: 6 });
    assert.equal(board.addLiters, 96);
  });

  it('adds nothing when the tank lasts', () => {
    const board = fuelBoard({ ...base, levelLiters: 100, lapsToFinish: 5 });
    assert.equal(board.addLiters, 0);
    assert.equal(board.warning, 0);
  });

  it('warns about the last laps of fuel', () => {
    assert.equal(fuelBoard({ ...base, levelLiters: 6, source: 'CUSTOM', customPerLapLiters: 3.5 }).warning, 1);
    assert.equal(fuelBoard({ ...base, levelLiters: 3, source: 'CUSTOM', customPerLapLiters: 3.5 }).warning, 2);
  });

  it('leaves everything empty before a consumption is known', () => {
    const board = fuelBoard({ ...base, history: [], strategies: null, modelPerLapLiters: null });
    assert.equal(board.perLapLiters, null);
    assert.equal(board.addLiters, null);
    assert.equal(board.lapsOfFuel, null);
  });

  it('has no fuel to add for a session of unknown length', () => {
    const board = fuelBoard({ ...base, lapsToFinish: null });
    assert.equal(board.addLiters, null);
    assert.equal(board.lapsLeft, null);
    assert.ok(board.lapsOfFuel !== null);
  });
});
