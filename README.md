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
          themePrimary="blue"
          themeSecondary="orange"
          placeholder="Ask me anything..."
          statusText="Ask anything about your agents."
          inputPlaceholder="Ask your agent..."
          emptyHeading="What are we building today?"
          emptySubheading="Choose a starter or ask freely."
          fullscreenUrl="/copilot"
          quickActions={[
            { icon: <Bot size={16} />, title: "Build an Agent", subtitle: "Start from scratch", prompt: "Help me build an agent" },
            { iconHtml: "<svg>...</svg>", title: "Connect Tools", subtitle: "APIs and integrations", prompt: "Help me connect tools" }
          ]}
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
  fullscreen-url="/copilot"
  placeholder="Ask me anything..."
></chatatp-copilot-button>
```


## Copilot customization

| Property | Default | Description |
|----------|---------|-------------|
| `placeholder` | `''` | Launcher pill text beside the copilot button. |
| `statusText` | `'Ask anything about your agents, platforms or tools.'` | Header helper text when idle. |
| `inputPlaceholder` | `'Ask the copilot...'` | Message textarea placeholder. |
| `emptyHeading` | `'What are we building today?'` | Empty-state headline. |
| `emptySubheading` | `'Ask me anything, or pick a starting point below.'` | Empty-state supporting text. |
| `quickActions` / `quick-actions-json` | Built-in starter cards | Custom cards with `title`, `subtitle`, `prompt`, optional `iconHtml`, or React `icon`. |
| `fullscreenUrl` | `''` | Route to navigate to when fullscreen is requested. |
| `sidebarTarget` | `'body'` | CSS selector for the element shifted by sidebar padding. |

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


### Layout behavior

- The launcher is visible for `popup`, `sidebar`, and routed `fullscreen`; clicking it opens the configured mode or navigates to `fullscreenUrl`.
- `popup` renders as a floating corner overlay above the current page, like a normal chatbot widget.
- `sidebar` opens as a fixed side panel and shifts `sidebarTarget` with padding instead of covering the main app. Closing or switching away removes that padding.
- `fullscreen` navigates to `fullscreenUrl` when provided; on the dedicated route, omit `fullscreenUrl` to render the full-page copilot screen.

### Fullscreen route component

Use the floating widget with `fullscreenUrl` on normal pages, then register a dedicated route that renders the same Copilot in `fullscreen` mode without `fullscreenUrl`:

```tsx
// App shell
<Copilot
  apiKey="YOUR_API_KEY"
  agentId={7}
  mode="popup"
  fullscreenUrl="/copilot"
/>

// /copilot route
<Copilot
  apiKey="YOUR_API_KEY"
  agentId={7}
  mode="fullscreen"
  themePrimary="blue"
  themeSecondary="orange"
/>
```

Fullscreen mode renders a full-page ChatGPT-style screen with an expandable/collapsible conversation sidebar.

### React icon quick actions

React wrappers can pass icon provider components directly:

```tsx
import { Bot, Plug } from "lucide-react";

<Copilot
  apiKey="YOUR_API_KEY"
  agentId={7}
  quickActions={[
    { icon: <Bot size={16} />, title: "Build an Agent", subtitle: "Start from scratch", prompt: "Help me build an agent" },
    { icon: <Plug size={16} />, title: "Connect Tools", subtitle: "APIs and integrations", prompt: "Help me connect tools" }
  ]}
/>
```

### Vanilla quick actions

Use `quick-actions-json` when configuring the Web Component from HTML:

```html
<chatatp-copilot-button
  apiKey="YOUR_API_KEY"
  agentId="7"
  quick-actions-json='[
    {"title":"Build an Agent","subtitle":"Start from scratch","prompt":"Help me build an agent"},
    {"title":"Connect Tools","subtitle":"APIs and integrations","prompt":"Help me connect tools"}
  ]'
></chatatp-copilot-button>
```
