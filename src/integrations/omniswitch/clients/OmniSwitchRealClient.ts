import axios, { AxiosError } from 'axios';

import type { OmniSwitchClient, OmniSwitchPostArgs, OmniSwitchResult } from '../types/omniswitch.types';

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

export class OmniSwitchRealClient implements OmniSwitchClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  public constructor() {
    this.baseUrl = getEnv('OMNISWITCH_BASE_URL');
    this.apiKey = getEnv('OMNISWITCH_API_KEY');
  }

  public async post<TPayload, TResponse>(
    args: OmniSwitchPostArgs<TPayload>
  ): Promise<OmniSwitchResult<TResponse>> {
    try {
      const res = await axios.post<TResponse>(`${this.baseUrl}${args.endpoint}`, args.payload, {
        timeout: 3000,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return { ok: true, data: res.data };
    } catch (err) {
      const axiosErr = err as AxiosError;
      const status = axiosErr.response?.status;
      const data = axiosErr.response?.data;

      return {
        ok: false,
        code: 'OMNISWITCH_HTTP_ERROR',
        message: `OmniSwitch request failed${status ? ` (status ${status})` : ''}`,
        detail: data,
      };
    }
  }
}
