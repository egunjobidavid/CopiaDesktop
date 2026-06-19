import { checkFeature } from '../hooks/useFeature';

describe('checkFeature', () => {
  it('returns true for free plan features', () => {
    expect(checkFeature('inventory')).toBe(true);
    expect(checkFeature('sales')).toBe(true);
    expect(checkFeature('crm')).toBe(true);
  });

  it('returns false for paid-only features before cache is set', () => {
    expect(checkFeature('accounting')).toBe(false);
    expect(checkFeature('hr')).toBe(false);
    expect(checkFeature('fixed_assets')).toBe(false);
    expect(checkFeature('production')).toBe(false);
  });
});
