const globalForSse = globalThis as {
  sseClients?: Set<ReadableStreamDefaultController>;
};

const clients =
  globalForSse.sseClients ??
  new Set<ReadableStreamDefaultController>();

if (process.env.NODE_ENV !== "production") {
  globalForSse.sseClients = clients;
}

export function addClient(controller: ReadableStreamDefaultController) {
  clients.add(controller);
}

export function removeClient(controller: ReadableStreamDefaultController) {
  clients.delete(controller);
}

export function broadcast(eventType: string, data: Record<string, unknown>) {
  const payload = `data: ${JSON.stringify({ type: eventType, ...data })}\n\n`;
  const encoder = new TextEncoder();

  for (const client of clients) {
    try {
      client.enqueue(encoder.encode(payload));
    } catch {
      clients.delete(client);
    }
  }
}
