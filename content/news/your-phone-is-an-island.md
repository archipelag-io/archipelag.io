+++
title = "Your Phone Is an Island"
description = "We turned an iPhone into a compute node. A prompt typed in a browser, answered by a language model running on someone's phone across town. Here's how it works, and why it matters."
date = 2026-04-16

[extra]
category = "Technical"
author = "Raffael Schneider"
image = "/og/your-phone-is-an-island.png"
+++

There's a chip inside your phone that most software never touches.

Apple calls it the Neural Engine. It's a dedicated matrix-multiplication accelerator — sixteen cores on the A17 Pro, capable of 35 trillion operations per second. It was designed for machine learning: face recognition, photo enhancement, Siri's on-device processing, that sort of thing. But most of the time, across most of the billion-plus iPhones in the world, it does absolutely nothing.

The same is true for the GPU. The M-series chips in MacBooks and iPads have GPUs that rival discrete desktop cards from a few years ago. The A-series chips in iPhones have Metal-capable GPUs that can run real inference workloads. Not toy demos — actual language models, generating coherent text at usable speeds. Apple spent billions designing this silicon. It sits in people's pockets, idle.

We looked at that and thought: what if it didn't have to be?

## A prompt walks into a phone

Here's what we built. It's easier to show than to explain.

Person A opens an app on their iPhone. The app connects to the Archipelag.io coordinator — our control plane — and registers the phone as an Island on the network. The phone reports what it can do: which chip it has, how much memory is available, what model formats it supports. From this moment, the phone is a compute node, ready to accept work.

Person B opens a browser on their laptop, navigates to Archipelag.io, and types a message into a chat interface. Something like: "Explain distributed computing in one sentence."

What happens next takes about two seconds:

1. The coordinator receives the prompt and looks for an available Island that can handle it.
2. It finds Person A's iPhone — online, charged, on WiFi, thermally stable — and dispatches the job.
3. The iPhone receives the job over a WebSocket connection, loads a language model (TinyLlama 1.1B, quantized to 4-bit, about 650 megabytes), and begins inference.
4. Tokens stream back in real time — word by word, through the coordinator, through a WebSocket, into Person B's browser.
5. Person B sees the response appear progressively, just like any chat interface. Except the model that generated it is running on a phone across town.

No cloud GPU was involved. No data center. No NVIDIA. Just a phone, a browser, and a coordination layer in between.

## Why this is not a gimmick

The natural reaction is: okay, but a phone is slow compared to an A100. Why would anyone do this?

Fair question. Here's why we think this matters.

**The numbers are better than you'd expect.** An iPhone 15 Pro (A17 chip) runs TinyLlama at roughly 25 tokens per second. That's fast enough for conversational use — most people read at about 4-5 words per second, and each token is roughly three-quarters of a word. The model is small (1.1 billion parameters), but it's coherent, and it's enough for a wide range of tasks: summarization, Q&A, classification, simple creative writing. Larger phones with more RAM can run bigger models. The M-series iPads and MacBooks can run 7B and 13B parameter models at speeds that rival some cloud endpoints.

**The hardware already exists at enormous scale.** Apple has shipped over 2.3 billion iPhones since 2007. Even if you only count devices from the last three years — phones with Neural Engines capable of running quantized LLMs — that's hundreds of millions of devices. Each one is a potential compute node. No one needs to buy new hardware. No one needs to provision a cloud instance. The compute is already distributed across every city, every neighborhood, every pocket.

**Latency can be better, not worse.** When a GPU is physically close to the person making the request, the network round-trip is measured in single-digit milliseconds instead of the 50-200ms typical of cloud endpoints in a different region. For streaming applications — where tokens arrive one at a time and perceived speed matters as much as throughput — local inference on modest hardware can feel faster than remote inference on expensive hardware.

**It's resilient in ways centralized infrastructure isn't.** A network of ten thousand phones spread across a city doesn't have a single point of failure. There's no region to go down, no availability zone to lose, no cloud provider to have an outage. Individual phones go offline — they run out of battery, lose WiFi, get put in a pocket. The coordinator routes around them. The aggregate network stays up.

## Under the hood

For the engineers in the room, here's how the pieces fit together.

### The Island software

The Archipelag.io Island app is a native Swift application built on Apple's platform stack. At its core is `AgentCore`, which manages the lifecycle of the phone as a compute node: registration, heartbeating, job acceptance, execution, and result streaming.

When the app starts, it generates a persistent host ID (a UUID stored locally), detects the device's capability class based on the chip generation, and opens a WebSocket connection to the coordinator using the Phoenix Channel protocol. Registration includes the device's supported runtimes (`llmcpp` for quantized language models, `coreml` for Apple's ML framework, `wasm` for WebAssembly modules), available memory, and performance estimates.

The phone sends a heartbeat every ten seconds: current status, battery level, charging state, thermal condition, active jobs. The coordinator uses this to decide whether the phone is a viable target for new work.

### Inference

Language model inference runs through `LlamaExecutor`, a Swift wrapper around [llama.cpp](https://github.com/ggerganov/llama.cpp) via the [LLM.swift](https://github.com/eastriverlee/LLM.swift) library. Models are GGUF-format files — quantized (4-bit, Q4_K_M) to fit in mobile memory while preserving output quality.

The first time a phone receives a job for a given model, it downloads the GGUF file (about 650MB for TinyLlama), verifies its SHA-256 hash, and caches it locally. Subsequent jobs skip the download entirely. The coordinator can also push preload recommendations — telling the phone to fetch a model in advance based on anticipated demand, so it's ready before the first job arrives.

During inference, tokens are generated sequentially and streamed back to the coordinator in real time. Each token is sent as a discrete message with a sequence number, allowing the coordinator to relay them to the consumer's browser in order. The consumer sees text appear word by word, with the same progressive feel as any cloud-hosted chat interface.

### The coordinator

The coordinator is an Elixir/Phoenix application that serves as the control plane for the entire network. When a consumer submits a prompt, the coordinator selects the best available Island using a multi-dimensional scoring system:

- **Speed score**: estimated throughput for this model on this hardware.
- **Fit score**: how well the workload matches the Island's resources — not too tight (risk of failure), not too loose (wasted capacity).
- **Headroom score**: remaining capacity for concurrent work.

For mobile Islands running LLM inference, speed is weighted heaviest (50%), because on-device inference time dominates the user experience. The coordinator also prefers "warm" Islands — those that have recently run the same model and still have it loaded in memory — to avoid the latency of cold-starting a model load.

Once a host is selected, the coordinator dispatches the job over the WebSocket channel, including the model URL, expected hash, context window size, and temperature setting. The Island software picks it up, runs inference, and streams tokens back through the same channel.

### Pairing

How does a phone become an Island? Through a pairing flow designed to be as simple as scanning a QR code.

A user logs into Archipelag.io on their laptop and navigates to the pairing page. The system generates a six-character code (alphanumeric, no ambiguous characters like I/O/1/0) that's valid for ten minutes. The user opens the Archipelag.io Island app on their phone, enters the code (or scans the QR), and the phone connects to the coordinator with that code as a credential. The coordinator verifies it, links the phone to the user's account, issues a 30-day auth token, and the phone is now a registered Island.

From that point forward, the phone reconnects automatically whenever it's on WiFi and its preconditions are met.

### Preconditions

A phone is not a server. It overheats, runs out of battery, loses connectivity, and gets shoved into a back pocket mid-inference. The Island software accounts for all of this.

Before accepting any job, the phone checks: Is it connected to WiFi? Is the battery above 20%? Is it charging (waived in demo mode)? Is the thermal state nominal or fair (not throttling)? Is it within the owner's configured availability schedule?

If any of these conditions fail, the phone reports itself as unavailable and the coordinator routes around it. If conditions change mid-job (the phone overheats, WiFi drops), the coordinator's lease system detects the stall — leases renew every 30 seconds, and if a renewal is missed, the job is requeued to another Island.

## Beyond phones

The mobile Island is a proof of concept for a broader thesis: compute should come from everywhere, not just data centers.

Today, Archipelag.io routes AI inference jobs to desktop GPUs, Mac Studios, Linux workstations, and now phones. The architecture doesn't privilege any particular hardware. The same coordinator, the same job dispatch protocol, the same streaming pipeline works whether the Island is an RTX 4090 in a gaming rig or an A17 chip in an iPhone. The scoring system adapts — it knows a phone is slower than a desktop GPU and routes accordingly, sending lightweight jobs to phones and heavy inference to big GPUs.

But more importantly, the architecture isn't limited to AI inference at all. The coordinator dispatches jobs to containers. Those containers can run anything: OCR, image processing, document conversion, video transcoding, code formatting, data transformation. The [Cargo Registry](/cargo) already lists dozens of non-AI workloads. A phone can't run all of them — it doesn't have Docker — but it can run WASM modules and native inference, and as Apple's hardware continues to improve, the range of feasible workloads grows with every chip generation.

This is what makes Archipelag.io fundamentally different from inference-only networks that are locked to a single hardware vendor. We're not building a relay for LLM API calls. We're building a compute fabric — one where any device, running any supported runtime, can contribute capacity to the network and earn credits for the work it does.

The phone in your pocket is not just a client. It's a node. It's an Island.

## The economics

During our [open beta](/news/open-beta-announcement), all credits are virtual — nobody pays, nobody gets paid. But the economic signals are real.

An Island earns credits for every job it completes. The [Compute Exchange](/matchmaking) sets prices through supply and demand: Islands post asking prices, consumers place bids, and the market clears. A phone that reliably completes lightweight inference jobs earns credits at a rate proportional to the work it does. Over time, Islands build up karma — a reputation score based on completion rate, speed, and reliability — which gives them access to higher-value jobs.

The marginal cost of running inference on a phone is effectively zero. The device is already purchased, already charged (usually), already on WiFi. The electricity consumed during inference is negligible — pennies per day. There's no rack to rent, no cooling bill, no bandwidth fee. This means even modest earnings represent near-pure margin for the phone's owner.

At scale, the aggregate capacity is striking. If one percent of iPhones sold in the last three years — roughly two million devices — contributed one hour of compute per day, the network's total throughput would rival a mid-sized cloud region. Not in raw FLOPS on paper, but in actual inference requests served, close to the people who need them.

## What comes next

The mobile Island is live in our beta today for iOS. Android support (using ONNX Runtime for on-device inference) is in active development. We're working on expanding the set of models that run efficiently on mobile hardware — Phi-3 Mini (3.8B parameters) runs well on recent iPhones with 8GB+ of RAM, and the M-series iPads and Macs can handle much larger models.

We're also exploring distributed inference — splitting a single large model across multiple nearby devices, so a cluster of phones could collectively run a model that none of them could run alone. This is early-stage research, not a shipped feature, but the architecture was designed with it in mind.

If you want to turn your phone into an Island: [become an Island](/earn), pair your device with your account, and start contributing compute. If you want to use AI served from the network: [sign up](https://app.archipelag.io/auth/login) and open the chat. Your prompt might be answered by a GPU in someone's basement, or by a phone on someone's desk. Either way, it'll be closer to you than any data center.

The hardware is already everywhere. We just connected it.
