# @chatatp/studio

Official JavaScript/TypeScript SDK for the [ChatATP Studio](https://studio.chat-atp.com) Developer API.

## Requirements

- Node.js 18+

## Installation

```bash
npm install @chatatp/studio
```

## Quick start

```typescript
import { ChatATPClient } from "@chatatp/studio";

const client = new ChatATPClient({ apiKey: process.env.CHATATP_API_KEY! });

// Send a message — conversation lifecycle handled automatically
const result = await client.chat({
  agent_id: 7,
  external_user_id: "user_12345",
  message: "Do you ship to Lagos?",
});

console.log(result.agent_message.content);
// → "Yes, shipping is available."
```

## Streaming

```typescript
for await (const event of client.chatStream({
  agent_id: 7,
  external_user_id: "user_12345",
  message: "Give me a summary of your return policy.",
})) {
  if (event.type === "agent.response.completed") {
    console.log(event.data);
  }
}
```

## Resources

```typescript
// Agents
const agents = await client.agents.list();
const agent  = await client.agents.retrieve(7);

// Conversations
const conv = await client.conversations.create({ agent_id: 7, external_user_id: "u1" });
const page = await client.conversations.list({ agent_id: 7 });
await client.conversations.delete(conv.id);

// Messages
const history = await client.messages.list(conv.id);
const reply   = await client.messages.send(conv.id, { content: "Hello" });

// Usage
const usage = await client.usage.retrieve();
```

## Error handling

```typescript
import { NotFoundError, RateLimitError } from "@chatatp/studio";

try {
  await client.agents.retrieve(999);
} catch (err) {
  if (err instanceof NotFoundError) console.error("Not found");
  if (err instanceof RateLimitError) console.error("Rate limited");
}
```

## License

MIT
