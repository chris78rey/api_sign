ALTER TABLE "Request" ADD COLUMN "evidenceRequired" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "RequestEvent" ADD COLUMN "actorUserId" TEXT,
ADD COLUMN "organizationId" TEXT;

UPDATE "RequestEvent" AS e
SET "organizationId" = r."organizationId"
FROM "Request" AS r
WHERE r."id" = e."requestId";

ALTER TABLE "RequestEvent" ALTER COLUMN "organizationId" SET NOT NULL;

CREATE INDEX "Request_organizationId_createdAt_idx" ON "Request"("organizationId", "createdAt");
CREATE INDEX "RequestEvent_organizationId_createdAt_idx" ON "RequestEvent"("organizationId", "createdAt");
CREATE INDEX "RequestEvent_requestId_createdAt_idx" ON "RequestEvent"("requestId", "createdAt");
