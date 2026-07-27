import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

vi.mock('../store/auth.store', () => ({
  useAuthStore: vi.fn((selector?: any) => {
    const state = { tenantId: 't1' };
    return selector ? selector(state) : state;
  }),
}));

import { checkFeature } from '../hooks/useFeature';

describe('useFeature - checkFeature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true for starter/free features', () => {
    expect(checkFeature('inventory')).toBe(true);
    expect(checkFeature('sales')).toBe(true);
    expect(checkFeature('pos')).toBe(true);
    expect(checkFeature('quotes')).toBe(true);
    expect(checkFeature('invoices')).toBe(true);
    expect(checkFeature('customers')).toBe(true);
    expect(checkFeature('basic_reports')).toBe(true);
  });

  it('returns false for paid features before cache is set', () => {
    expect(checkFeature('accounting')).toBe(false);
    expect(checkFeature('hr')).toBe(false);
    expect(checkFeature('production')).toBe(false);
    expect(checkFeature('procurement')).toBe(false);
    expect(checkFeature('locations')).toBe(false);
    expect(checkFeature('crm')).toBe(false);
  });

  it('returns false for unknown features', () => {
    expect(checkFeature('nonexistent_feature')).toBe(false);
  });
});
