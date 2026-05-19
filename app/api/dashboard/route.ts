import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const providers = await prisma.provider.findMany({
      orderBy: { id: "asc" },
      include: {
        leadAssignments: {
          include: {
            lead: {
              include: { service: true },
            },
          },
          orderBy: {
            assigned_at: "desc",
          },
        },
      },
    });

    const mappedProviders = providers.map((provider) => ({
      id: provider.id,
      name: provider.name,
      leads_received_count: provider.leads_received_count,
      monthly_quota: provider.monthly_quota,
      leads: provider.leadAssignments.map((assignment) => ({
        id: assignment.lead.id,
        customer_name: assignment.lead.customer_name,
        service_name: assignment.lead.service.name,
        city: assignment.lead.city,
        created_at: assignment.lead.created_at,
      })),
    }));

    return NextResponse.json({ providers: mappedProviders });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
