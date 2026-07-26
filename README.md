# ChatATP Studio SDK

Javascript SDK for building and interacting with agents created in ChatATP Studio.

- Async-first API
- Conversation lifecycle management
- Streaming support
- Fully typed

![NPM](https://img.shields.io/npm/v/@chatatp/studio)
![Node](https://img.shields.io/node/v/@chatatp/studio)

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
  switch (event.type) {
    case "agent.response.delta":
      process.stdout.write(event.data.delta);
      break;
    case "tool.execution.started":
      console.log(`\n[Running tool: ${event.data.name}]`);
      break;
    case "tool.execution.completed":
      console.log(`\n[Tool completed. Result: ${event.data.result}]`);
      break;
    case "error":
      console.error(`\n[Error: ${event.data.message}]`);
      break;
    case "agent.response.completed":
      console.log("\nFinished!");
      break;
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

## Copilot UI Components

The `@chatatp/studio` SDK includes fully managed, plug-and-play UI components to embed the ChatATP Copilot directly into your applications. The components handle the complete conversational lifecycle, streaming, markdown rendering, tool execution, and rich animations out of the box.

We support multiple frameworks via subpath exports.

### React

```tsx
import { Copilot } from "@chatatp/studio/react";

function App() {
  return (
    <div>
      <header>
        {/* Place the button anywhere in your app */}
        <Copilot 
          apiKey="YOUR_API_KEY"
          agentId={7}
          userId="user_123"
          userDisplayName="John Doe"
          mode="sidebar" 
          position="right"
          themePrimary="#0ea5e9"
          themeSecondary="#6366f1"
          placeholder="Ask me anything..."
        />
      </header>
    </div>
  );
}
```

### Vue

```vue
<script setup>
import { Copilot } from '@chatatp/studio/vue';
</script>

<template>
  <Copilot 
    apiKey="YOUR_API_KEY"
    agentId="7"
    mode="popup"
    position="right"
    placeholder="Ask me anything..."
  />
</template>
```

### Angular

Import `CopilotDirective` from `@chatatp/studio/angular` and use it on an element or as a standalone component.

### Web Components (Vanilla JS)

```html
<script type="module">
  import '@chatatp/studio/web';
</script>

<chatatp-copilot-button
  apiKey="YOUR_API_KEY"
  agentId="7"
  mode="fullscreen"
  placeholder="Ask me anything..."
></chatatp-copilot-button>
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
