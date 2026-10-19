+++
title = "Models That Use Tools"
description = "Archipelag.io now ships with a chat harness: models on the network can call tools, in the web chat, through the OpenAI-compatible API, from the SDKs and the CLI, and on phone Islands too."
date = 2026-10-19
draft = false

[extra]
category = "Product"
author = "Raffael Schneider"
image = "/og/models-that-use-tools.png"
+++

Ask a small language model what 17.5% of 2,340 is and it will answer with total confidence and, often enough, the wrong number. Ask it what day it is and it will guess. Neither is a flaw you can train away in a model that fits on a laptop. What you *can* do is let it ask for help.

That's what shipped this week. Every chat on Archipelag.io can now use **tools**: the model decides it needs a calculator, a clock or a lookup, says so in a structured way, gets the result back, and only then answers. It works in the web chat, through the API, from the SDKs and the CLI, and on desktop, server and phone Islands alike.

## What it looks like

In the web chat, there's a new **Tools** toggle (it routes your chat to a desktop or server Island). Turn it on and ask something a model shouldn't do in its head:

> What's 17.5% of 2,340, and what day of the week is it?

The model calls `calculate` with `2340 * 0.175`, calls `current_time`, gets `409.5` and today's date back, and writes its answer from facts instead of guesses. You see each step as it happens: the call, the result, then the reply.

The built-in tools are deliberately plain:

- **calculate**: arithmetic, through a small expression parser (no `eval`, ever).
- **current_time**: the date and time, in UTC or at any UTC offset.
- **search_cargos**: looks up which models the network offers, so you can ask the chat which model is best for your task.
- **generate_image**: when an image Cargo is available, the chat model can hand off a picture request to it, and the image appears in the conversation.

Reasoning models also show their work now. When a model thinks before answering, that thinking is kept apart from the answer and folded away under a "Thought for N words" line you can open, and replies render as proper Markdown.

## Your own tools, through the API

The built-ins are for the web chat. The real point is the API, which speaks the same `tools` and `tool_calls` format as OpenAI's Chat Completions, streaming included. If your code already talks to an OpenAI-compatible endpoint, you change the base URL and your existing tool definitions just work.

The Python and JavaScript SDKs (0.2.0) wrap the whole loop. Write a function, mark it as a tool, and the SDK handles the back-and-forth until the model has its answer:

```python
from archipelag import Client, tool

@tool
def stock_level(sku: str) -> int:
    """How many units of a product are in the warehouse."""
    return warehouse.count(sku)

client = Client(api_key=...)
result = client.run_agent(
    [{"role": "user", "content": "Do we have enough SKU-1142 for an order of 40?"}],
    tools=[stock_level],
)
print(result.content)
```

Your function runs on **your** machine. The Island that runs the model only ever sees the tool's name, its description, and the result you choose to send back. It never gets your database, your files or your credentials, which matters on a network where the computer doing the thinking belongs to someone else.

The JavaScript SDK has the same thing as `runAgent`, and the `island` CLI now has an interactive `island chat` for trying models from a terminal.

## How the Islands do it

Tool calling is easy to promise and easy to get subtly wrong, so here is what actually happens on an Island.

**Desktop and server Islands** (v0.6.0) render each conversation with the model's own chat template, the one it was trained on, so tool definitions reach it in exactly the format it expects. When tools are offered, generation is constrained by a grammar that only switches on once the model starts a tool call. Before that, it writes freely. Once it commits to a call, it can only produce well-formed JSON. The call comes back as structured `tool_calls`, not as text you'd have to parse and hope about.

**Phone Islands** use llama.cpp's built-in templates, which only know plain chat turns, so tools travel in text instead: described in the system message, called with `<tool_call>` tags, answered with `<tool_response>`. It's the convention the Qwen and Hermes model families are trained on, and the phone turns it back into the same structured format before anything leaves the device. To the Coordinator, and to you, a tool call from an iPhone looks exactly like one from a GPU server.

The release also fixes things we found along the way: a sampler bug that fed the grammar each token twice and could crash a Job, a race that corrupted a model when two Jobs downloaded it at once, and a crash on shutdown on Macs. And conversations are no longer served from the response cache unless you opt in. A cached reply is fine for a one-off question; for a conversation it isn't, because it can hand you an answer meant for a different chat.

## Why this matters for a network like ours

The models that fit on contributed hardware are small. Small models are fluent, fast and cheap, and also bad at arithmetic, unaware of the date, and confined to what they memorised. Tools fix exactly those weaknesses. A 4-billion-parameter model that can call a calculator beats a much larger one doing sums in its head.

So tool use isn't a premium feature bolted on for big models. It's what lets the models a phone or a gaming PC can actually run do useful work. [Try it in the chat](https://app.archipelag.io/chat) with Tools switched on, or point your existing OpenAI-style agent at the network and see what it does.
