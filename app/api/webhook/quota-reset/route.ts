import prisma from "@/lib/prisma";
import { broadcast } from "@/lib/sse";
import { NextResponse } from "next/server";

type WebhookBody = {
  idempotency_key?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as WebhookBody;

    const idempotencyKey = body.idempotency_key;

    if (!idempotencyKey) {
      return NextResponse.json(
        { error: "idempotency_key is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.webhookEvent.findUnique({
      where: { id: idempotencyKey },
    });

    if (existing) {
      return NextResponse.json({
        success: false,
        message: "Already processed",
        skipped: true,
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.provider.updateMany({
        data: {
          monthly_quota: 10,
          leads_received_count: 0,
        },
      });

      await tx.roundRobinState.updateMany({
        data: { current_index: 0 },
      });

      await tx.webhookEvent.create({
        data: {
          id: idempotencyKey,
          event_type: "quota_reset",
        },
      });
    });

    broadcast("quota_reset", {
      message: "All quotas reset to 10",
    });

    return NextResponse.json({
      success: true,
      message: "Quota reset successfully",
      skipped: false,
    });
  } catch (error) {
    console.error("POST /api/webhook/quota-reset error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
