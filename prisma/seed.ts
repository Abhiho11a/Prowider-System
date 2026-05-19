import "dotenv/config";
import prisma from "../lib/prisma";

async function main() {
  await prisma.leadAssignment.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.webhookEvent.deleteMany();
  await prisma.roundRobinState.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.service.deleteMany();

  await prisma.service.createMany({
    data: [
      { id: 1, name: "Service 1" },
      { id: 2, name: "Service 2" },
      { id: 3, name: "Service 3" },
    ],
  });

  await prisma.provider.createMany({
    data: [
      { id: 1, name: "Provider 1", monthly_quota: 10, leads_received_count: 0 },
      { id: 2, name: "Provider 2", monthly_quota: 10, leads_received_count: 0 },
      { id: 3, name: "Provider 3", monthly_quota: 10, leads_received_count: 0 },
      { id: 4, name: "Provider 4", monthly_quota: 10, leads_received_count: 0 },
      { id: 5, name: "Provider 5", monthly_quota: 10, leads_received_count: 0 },
      { id: 6, name: "Provider 6", monthly_quota: 10, leads_received_count: 0 },
      { id: 7, name: "Provider 7", monthly_quota: 10, leads_received_count: 0 },
      { id: 8, name: "Provider 8", monthly_quota: 10, leads_received_count: 0 },
    ],
  });

  await prisma.roundRobinState.createMany({
    data: [
      { id: 1, service_id: 1, current_index: 0 },
      { id: 2, service_id: 2, current_index: 0 },
      { id: 3, service_id: 3, current_index: 0 },
    ],
  });

  console.log("Seed completed successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
