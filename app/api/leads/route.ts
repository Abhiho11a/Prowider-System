import { allocateProviders } from "@/lib/allocation";
import prisma from "@/lib/prisma";
import { broadcast } from "@/lib/sse";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

type LeadBody = {
  customer_name?: string;
  phone_number?: string;
  city?: string;
  service_id?: number;
  description?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LeadBody;

    const {
      customer_name,
      phone_number,
      city,
      service_id,
      description,
    } = body;

    if (
      !customer_name ||
      !phone_number ||
      !city ||
      service_id === undefined ||
      !description
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const phone = phone_number.replace(/\D/g, "");

    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { error: "Phone number must be 10 digits" },
        { status: 400 }
      );
    }

    const serviceId = Number(service_id);

    if (![1, 2, 3].includes(serviceId)) {
      return NextResponse.json(
        { error: "Invalid service" },
        { status: 400 }
      );
    }

    const { lead, assignedProviders } = await prisma.$transaction(
      async (tx) => {
        const existing = await tx.lead.findUnique({
          where: {
            phone_number_service_id: {
              phone_number: phone,
              service_id: serviceId,
            },
          },
        });

        if (existing) {
          throw new Error("DUPLICATE_LEAD");
        }

        await tx.$executeRaw`
          SELECT *
          FROM round_robin_state
          WHERE service_id = ${serviceId}
          FOR UPDATE
        `;

        const lead = await tx.lead.create({
          data: {
            customer_name: customer_name.trim(),
            phone_number: phone,
            city: city.trim(),
            service_id: serviceId,
            description: description.trim(),
          },
        });

        const assignedProviders = await allocateProviders(
          tx,
          lead.id,
          serviceId
        );

        return { lead, assignedProviders };
      },
      {
        isolationLevel:
          Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    broadcast("lead_assigned", { leadId: lead.id });

    return NextResponse.json(
      {
        success: true,
        lead_id: lead.id,
        assigned_providers: assignedProviders,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message === "DUPLICATE_LEAD"
    ) {
      return NextResponse.json(
        {
          error:
            "You have already submitted a request for this service",
        },
        { status: 409 }
      );
    }

    console.error("POST /api/leads error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
