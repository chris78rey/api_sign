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
  private readonly apiKey?: string;
  private readonly userName?: string;
  private readonly password?: string;

  public constructor() {
    this.baseUrl = getEnv('OMNISWITCH_BASE_URL').replace(/\/+$/, '');
    this.apiKey = process.env.OMNISWITCH_API_KEY || undefined;
    this.userName = process.env.OMNISWITCH_USERNAME || undefined;
    this.password = process.env.OMNISWITCH_PASSWORD || undefined;
  }

  public async post<TPayload, TResponse>(
    args: OmniSwitchPostArgs<TPayload>
  ): Promise<OmniSwitchResult<TResponse>> {
    try {
      const endpoint = args.endpoint.startsWith('/') ? args.endpoint : `/${args.endpoint}`;
      const url = `${this.baseUrl}${endpoint}`;

      const payload =
        this.userName && this.password
          ? ({ UserName: this.userName, Password: this.password, ...args.payload } as unknown)
          : args.payload;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.apiKey) {
        headers.Authorization = `Bearer ${this.apiKey}`;
      }

      const res = await axios.post<TResponse>(url, payload, {
        timeout: 3000,
        headers,
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
