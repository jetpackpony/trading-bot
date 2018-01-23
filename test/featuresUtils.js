process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
let {
  convertWindow,
  hasJumpBeforeDrop,
  willPriceJump,
  countOnes,
  getYWithGaps,
  calcDealsPerDay,
  rangeStep
} = require('../featuresUtils');

describe('hasJumpBeforeDrop', () => {
  it('returns true when jump is before drop', () => {
    let jumps = [0, 1, 1, 0];
    let drops = [0, 0, 1, 0];
    expect(hasJumpBeforeDrop(jumps, drops)).to.eq(true);
  });
  it('returns false when drop and jump are at the same time',
    () => {
      let jumps = [0, 1, 1, 0];
      let drops = [0, 1, 1, 0];
      expect(hasJumpBeforeDrop(jumps, drops)).to.eq(false);
    });
  it('returns false when drop is before jump', () => {
    let jumps = [0, 1, 1, 0];
    let drops = [1, 0, 1, 0];
    expect(hasJumpBeforeDrop(jumps, drops)).to.eq(false);
  });
  it('returns false when there are no drops or jumps', () => {
    let jumps = [0, 0, 0, 0];
    let drops = [0, 0, 0, 0];
    expect(hasJumpBeforeDrop(jumps, drops)).to.eq(false);
  });
});

describe('countOnes', () => {
  it('counts ones when has ones', () => {
    expect(countOnes([1, 0, 0, 1, 1])).to.eq(3);
  });
  it('returns zero when there is none', () => {
    expect(countOnes([0, 0, 0])).to.eq(0);
  });
});

describe('getYWithGaps', () => {
  it('removes consecutive 1s within one gap', () => {
    const postWindowSize = 3;
    const input  = [0, 1, 1, 1, 1, 1, 0, 1, 1, 1];
    const output = [0, 1, 0, 0, 0, 1, 0, 0, 0, 1];
    expect(getYWithGaps(postWindowSize, input)).to.eql(output);
  });
});

describe('calcDealsPerDay', () => {
  it('calculates average deals per day', () => {
    expect(calcDealsPerDay(5, 1000, 20)).to.eql(5.76);
  });
});

describe('rangeStep', () => {
  it('returns a list with range steps', () => {
    expect(rangeStep(0.5, 1, 3)).to.eql([1, 1.5, 2, 2.5, 3]);

  });
});
