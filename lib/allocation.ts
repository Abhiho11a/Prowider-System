import { Prisma } from "@prisma/client";

const RULES: Record<
  number,
  { mandatory: number[]; pool: number[] }
> = {
  1: { mandatory: [1], pool: [2, 3, 4] },
  2: { mandatory: [5], pool: [6, 7, 8] },
  3: { mandatory: [1, 4], pool: [2, 3, 5, 6, 7, 8] },
};

export async function allocateProviders(
  tx: Prisma.TransactionClient,
  leadId: string,
  serviceId: number
): Promise<number[]> {
  const config = RULES[serviceId];
  if (!config) {
    throw new Error("Invalid service");
  }

  const assignedProviders: number[] = [];

  // Mandatory providers — always assigned first
  for (const providerId of config.mandatory) {
    const provider = await tx.provider.findUnique({
      where: { id: providerId },
    });

    if (!provider || provider.monthly_quota <= 0) {
      throw new Error(
        `Mandatory provider ${providerId} has no quota`
      );
    }

    await tx.leadAssignment.create({
      data: {
        lead_id: leadId,
        provider_id: providerId,
      },
    });

    await tx.provider.update({
      where: { id: providerId },
      data: {
        monthly_quota: { decrement: 1 },
        leads_received_count: { increment: 1 },
      },
    });

    assignedProviders.push(providerId);
  }

  const rrState = await tx.roundRobinState.findUnique({
    where: { service_id: serviceId },
  });

  if (!rrState) {
    throw new Error("Round robin state missing");
  }

  let currentIndex = rrState.current_index;
  const slotsNeeded = 3 - config.mandatory.length;

  // Round-robin fill for remaining slots
  for (let slot = 0; slot < slotsNeeded; slot++) {
    let assigned = false;

    for (let attempt = 0; attempt < config.pool.length; attempt++) {
      const poolIndex =
        (currentIndex + attempt) % config.pool.length;
      const providerId = config.pool[poolIndex];

      if (assignedProviders.includes(providerId)) {
        continue;
      }

      const provider = await tx.provider.findUnique({
        where: { id: providerId },
      });

      if (!provider || provider.monthly_quota <= 0) {
        continue;
      }

      await tx.leadAssignment.create({
        data: {
          lead_id: leadId,
          provider_id: providerId,
        },
      });

      await tx.provider.update({
        where: { id: providerId },
        data: {
          monthly_quota: { decrement: 1 },
          leads_received_count: { increment: 1 },
        },
      });

      assignedProviders.push(providerId);
      currentIndex = (poolIndex + 1) % config.pool.length;
      assigned = true;
      break;
    }

    if (!assigned) {
      throw new Error("Could not assign provider from pool");
    }
  }

  await tx.roundRobinState.update({
    where: { service_id: serviceId },
    data: {
      current_index: currentIndex % config.pool.length,
    },
  });

  if (assignedProviders.length !== 3) {
    throw new Error("Could not assign exactly 3 providers");
  }

  return assignedProviders;
}
