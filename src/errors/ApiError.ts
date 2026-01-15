export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly detail?: unknown;

  public constructor(args: {
    statusCode: number;
    code: string;
    message: string;
    detail?: unknown;
  }) {
    super(args.message);
    this.statusCode = args.statusCode;
    this.code = args.code;
    this.detail = args.detail;
  }
}
