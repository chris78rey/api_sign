import type { OmniSwitchClient } from './types/omniswitch.types';
import { OmniSwitchMockClient } from './clients/OmniSwitchMockClient';
import { OmniSwitchRealClient } from './clients/OmniSwitchRealClient';

export function getOmniSwitchClient(): OmniSwitchClient {
  const mode = (process.env.OMNISWITCH_MODE ?? 'mock').toLowerCase();

  if (mode === 'real') {
    return new OmniSwitchRealClient();
  }

  return new OmniSwitchMockClient();
}
