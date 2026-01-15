import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { ApiError } from '../errors/ApiError';
import { isEvidenceRequiredDefaultForNewOrganizations } from '../policies/evidence.policy';
import { getPrismaClient } from '../lib/prisma';

type RegisterArgs = {
  organizationName: string;
  email: string;
  password: string;
};

type LoginArgs = {
  email: string;
  password: string;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError({ statusCode: 500, code: 'JWT_SECRET_MISSING', message: 'JWT_SECRET is not configured' });
  }
  return secret;
}

export class AuthService {
  public static async registerOrganizationAdmin(args: RegisterArgs): Promise<{ token: string }> {
    const prisma = getPrismaClient();

    const existingUser = await prisma.user.findUnique({ where: { email: args.email } });
    if (existingUser) {
      throw new ApiError({ statusCode: 409, code: 'EMAIL_TAKEN', message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(args.password, 10);

    const created = await prisma.organization.create({
      data: {
        name: args.organizationName,
        evidenceRequiredDefault: isEvidenceRequiredDefaultForNewOrganizations(),
        users: {
          create: {
            email: args.email,
            password: passwordHash,
            role: 'ADMIN',
          },
        },
      },
      include: { users: true },
    });

    const adminUser = created.users[0];
    if (!adminUser) {
      throw new ApiError({ statusCode: 500, code: 'USER_CREATE_FAILED', message: 'Failed to create admin user' });
    }

    const token = jwt.sign(
      { userId: adminUser.id, organizationId: created.id, role: adminUser.role },
      getJwtSecret(),
      { expiresIn: '12h' }
    );

    return { token };
  }

  public static async login(args: LoginArgs): Promise<{ token: string }> {
    const prisma = getPrismaClient();

    const user = await prisma.user.findUnique({ where: { email: args.email } });
    if (!user) {
      throw new ApiError({ statusCode: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(args.password, user.password);
    if (!ok) {
      throw new ApiError({ statusCode: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, organizationId: user.organizationId, role: user.role },
      getJwtSecret(),
      { expiresIn: '12h' }
    );

    return { token };
  }
}
