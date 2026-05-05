import client1 from "@/data/clients/client-1.json"

const clients: Record<string, any> = {
  "thabang-wedding": client1,
}

export function getClient(slug: string) {
  return clients[slug]
}