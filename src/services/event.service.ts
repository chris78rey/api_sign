import type { RequestEventType } from '@prisma/client';

import { getPrismaClient } from '../lib/prisma';

export class EventService {
  public static async recordEvent(args: {
    requestId: string;
    organizationId: string;
    actorUserId?: string;
    type: RequestEventType;
    metadata?: unknown;
  }): Promise<void> {
    const prisma = getPrismaClient();

    await prisma.requestEvent.create({
      data: {
        requestId: args.requestId,
        organizationId: args.organizationId,
        actorUserId: args.actorUserId ?? undefined,
        type: args.type,
        metadata: args.metadata ?? undefined,
      },
    });
  }
}
