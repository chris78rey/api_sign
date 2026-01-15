import { ApiError } from '../errors/ApiError';
import { getPrismaClient } from '../lib/prisma';

function parseCost(name: string): number {
  const raw = process.env[name];
  if (!raw) {
    throw new ApiError({ statusCode: 500, code: 'ENV_MISSING', message: `${name} is not configured` });
  }
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    throw new ApiError({ statusCode: 500, code: 'ENV_INVALID', message: `${name} is invalid` });
  }
  return n;
}

function parseMonth(month: string): { start: Date; end: Date } {
  const m = month.match(/^(\d{4})-(\d{2})$/);
  if (!m) {
    throw new ApiError({ statusCode: 400, code: 'BAD_REQUEST', message: 'Invalid month (expected YYYY-MM)' });
  }

  const year = Number(m[1]);
  const monthIndex = Number(m[2]) - 1;
  if (!Number.isInteger(year) || !Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    throw new ApiError({ statusCode: 400, code: 'BAD_REQUEST', message: 'Invalid month (expected YYYY-MM)' });
  }

  const start = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, monthIndex + 1, 1, 0, 0, 0));

  return { start, end };
}

export class ReportingService {
  public static async utilityReport(args: { month: string }): Promise<
    Array<{
      organizationId: string;
      totalRequests: number;
      totalSignatories: number;
      revenue: number;
      cost: number;
      profit: number;
    }>
  > {
    const prisma = getPrismaClient();

    const { start, end } = parseMonth(args.month);
    const costPerSignatory = parseCost('COST_PER_SIGNATORY');
    const pricePerSignatory = parseCost('PRICE_PER_SIGNATORY');

    const organizations = await prisma.organization.findMany({ select: { id: true } });

    const rows = await Promise.all(
      organizations.map(async (org) => {
        const totalRequests = await prisma.request.count({
          where: { organizationId: org.id, createdAt: { gte: start, lt: end } },
        });

        const totalSignatories = await prisma.signatory.count({
          where: { request: { organizationId: org.id, createdAt: { gte: start, lt: end } } },
        });

        const revenue = totalSignatories * pricePerSignatory;
        const cost = totalSignatories * costPerSignatory;

        return {
          organizationId: org.id,
          totalRequests,
          totalSignatories,
          revenue,
          cost,
          profit: revenue - cost,
        };
      })
    );

    return rows;
  }
}
