import { vi } from 'vitest';

export const mockFetchOnce = (data: any, ok = true, status = 200) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as unknown as Response);
