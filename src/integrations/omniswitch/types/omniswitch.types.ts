export type OmniSwitchOk<T> = {
  ok: true;
  data: T;
};

export type OmniSwitchErr = {
  ok: false;
  code: string;
  message: string;
  detail?: unknown;
};

export type OmniSwitchResult<T> = OmniSwitchOk<T> | OmniSwitchErr;

export type OmniSwitchPostArgs<TPayload> = {
  endpoint: string;
  payload: TPayload;
};

export interface OmniSwitchClient {
  post<TPayload, TResponse>(args: OmniSwitchPostArgs<TPayload>): Promise<OmniSwitchResult<TResponse>>;
}
