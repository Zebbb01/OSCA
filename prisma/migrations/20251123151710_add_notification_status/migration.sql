-- CreateTable
CREATE TABLE "public"."notification_status" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_status_userId_idx" ON "public"."notification_status"("userId");

-- CreateIndex
CREATE INDEX "notification_status_notificationId_idx" ON "public"."notification_status"("notificationId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_status_userId_notificationId_key" ON "public"."notification_status"("userId", "notificationId");

-- AddForeignKey
ALTER TABLE "public"."notification_status" ADD CONSTRAINT "notification_status_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
