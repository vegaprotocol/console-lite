import { renderHook, waitFor } from '@testing-library/react';
import type { EnvironmentWithOptionalUrl } from './use-config';
import { useConfig } from './use-config';
import { Networks, ErrorType } from '../types';

const mockConfig = {
  hosts: [
    'https://vega-host-1.com',
    'https://vega-host-2.com',
    'https://vega-host-3.com',
    'https://vega-host-4.com',
  ],
};

const mockEnvironment: EnvironmentWithOptionalUrl = {
  VEGA_ENV: Networks.TESTNET,
  VEGA_CONFIG_URL: 'https://vega.url/config.json',
  VEGA_NETWORKS: {},
  ETHEREUM_PROVIDER_URL: 'https://ethereum.provider',
  ETHERSCAN_URL: 'https://etherscan.url',
  GIT_BRANCH: 'test',
  GIT_ORIGIN_URL: 'https://github.com/test/repo',
  GIT_COMMIT_HASH: 'abcde01234',
  GITHUB_FEEDBACK_URL: 'https://github.com/test/feedback',
};

function setupFetch(configUrl: string) {
  return (url: RequestInfo) => {
    if (url === configUrl) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      } as Response);
    }

    return Promise.resolve({
      ok: true,
    } as Response);
  };
}

global.fetch = jest.fn();

const onError = jest.fn();

beforeAll(() => {
  jest.useFakeTimers();
});

beforeEach(() => {
  onError.mockClear();
  window.localStorage.clear();

  // @ts-ignore typescript doesn't recognise the mocked instance
  global.fetch.mockReset();
  // @ts-ignore typescript doesn't recognise the mocked instance
  global.fetch.mockImplementation(
    setupFetch(mockEnvironment.VEGA_CONFIG_URL ?? '')
  );
});

afterAll(() => {
  jest.clearAllMocks();
});

describe('useConfig hook', () => {
  it("doesn't update when there is no VEGA_CONFIG_URL in the environment", async () => {
    const mockEnvWithoutUrl = {
      ...mockEnvironment,
      VEGA_CONFIG_URL: undefined,
    };
    const { result } = renderHook(() =>
      useConfig({ environment: mockEnvWithoutUrl }, onError)
    );

    expect(result.current.config).toBe(undefined);
  });

  it('fetches configuration from the provided url', async () => {
    const { result } = renderHook(() =>
      useConfig({ environment: mockEnvironment }, onError)
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(mockEnvironment.VEGA_CONFIG_URL);
      expect(result.current.config).toEqual(mockConfig);
    });
  });

  it('executes the error callback when the config endpoint fails', async () => {
    // @ts-ignore typescript doesn't recognise the mocked instance
    global.fetch.mockImplementation(() => Promise.reject());

    const { result } = renderHook(() =>
      useConfig({ environment: mockEnvironment }, onError)
    );

    await waitFor(() => {
      expect(result.current.config).toEqual({ hosts: [] });
      expect(onError).toHaveBeenCalledWith(ErrorType.CONFIG_LOAD_ERROR);
    });
  });

  it('executes the error callback when the config validation fails', async () => {
    // @ts-ignore typescript doesn't recognise the mocked instance
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: 'not-valid-config' }),
      })
    );

    const { result } = renderHook(() =>
      useConfig({ environment: mockEnvironment }, onError)
    );

    await waitFor(() => {
      expect(result.current.config).toBe(undefined);
      expect(onError).toHaveBeenCalledWith(ErrorType.CONFIG_VALIDATION_ERROR);
    });
  });

  it('returns the default config without getting it from the network when provided', async () => {
    const defaultConfig = { hosts: ['https://default.url'] };
    const { result } = renderHook(() =>
      useConfig(
        {
          environment: mockEnvironment,
          defaultConfig,
        },
        onError
      )
    );

    await waitFor(() => {
      expect(result.current.config).toBe(defaultConfig);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
