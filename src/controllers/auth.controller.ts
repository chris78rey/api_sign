import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '../errors/ApiError';
import { AuthService } from '../services/auth.service';

type RegisterBody = {
  organizationName?: unknown;
  email?: unknown;
  password?: unknown;
};

type LoginBody = {
  email?: unknown;
  password?: unknown;
};

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ApiError({ statusCode: 400, code: 'BAD_REQUEST', message: `Invalid ${field}` });
  }
  return value;
}

export class AuthController {
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as RegisterBody;
      const organizationName = requireString(body.organizationName, 'organizationName');
      const email = requireString(body.email, 'email');
      const password = requireString(body.password, 'password');

      const result = await AuthService.registerOrganizationAdmin({ organizationName, email, password });
      res.status(201).json({ ok: true, token: result.token });
    } catch (err) {
      next(err);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as LoginBody;
      const email = requireString(body.email, 'email');
      const password = requireString(body.password, 'password');

      const result = await AuthService.login({ email, password });
      res.status(200).json({ ok: true, token: result.token });
    } catch (err) {
      next(err);
    }
  }
}
