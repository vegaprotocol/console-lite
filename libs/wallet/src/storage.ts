import { LocalStorage } from '@vegaprotocol/react-helpers';

interface ConnectorConfig {
  token: string | null;
  connector: 'rest' | 'jsonRpc';
  url: string | null;
}

export const WALLET_CONFIG = 'vega_wallet_config';
export const WALLET_KEY = 'vega_wallet_key';

export function setConfig(cfg: ConnectorConfig) {
  LocalStorage.setItem(WALLET_CONFIG, JSON.stringify(cfg));
}

export function getConfig(): ConnectorConfig | null {
  const cfg = LocalStorage.getItem(WALLET_CONFIG);
  if (cfg) {
    try {
      return JSON.parse(cfg);
    } catch {
      return null;
    }
  } else {
    return null;
  }
}

export function clearConfig() {
  LocalStorage.removeItem(WALLET_CONFIG);
}
