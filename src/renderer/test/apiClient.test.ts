import api from '../api/client';

describe('API client response interceptor (envelope unwrap)', () => {
  it('transforms envelope response to unwrapped data', () => {
    const envelope = { success: true, data: { id: 'abc', name: 'test' }, meta: { timestamp: '2025-01-01' } };
    const transformed = api.interceptors.response.handlers[0].fulfilled({ data: envelope } as any);
    expect(transformed.data).toEqual({ id: 'abc', name: 'test' });
  });

  it('passes through non-envelope responses unchanged', () => {
    const plain = { id: 'abc', name: 'test' };
    const transformed = api.interceptors.response.handlers[0].fulfilled({ data: plain } as any);
    expect(transformed.data).toEqual(plain);
  });

  it('passes through array responses unchanged', () => {
    const arr = [{ id: '1' }, { id: '2' }];
    const transformed = api.interceptors.response.handlers[0].fulfilled({ data: arr } as any);
    expect(transformed.data).toEqual(arr);
  });
});
