+++
title = "The Other Three Billion Islands"
description = "The Android Island agent now runs language models on-device — built from the same llama.cpp fork, at the same pinned revision, with the same Q1_0 kernels as our macOS Islands. Here's what landed, and what's still gated."
date = 2026-08-02
draft = false

[extra]
category = "Technical"
author = "Raffael Schneider"
+++

In April we [turned an iPhone into a compute node](/news/your-phone-is-an-island/). A prompt typed in a browser, answered by a language model running on a phone across town. Since that post, one question has come up more than any other: what about Android?

Fair question. There are more than three billion active Android devices in the world — roughly seven out of every ten smartphones. The flagships among them carry Snapdragon silicon with NPUs, big GPUs, and 8 to 16 gigabytes of RAM. If the network's premise is that capable hardware sits idle in people's pockets, Android isn't a nice-to-have. It's most of the hardware.

As of this week, the Archipelag.io Island agent for Android runs language models on-device.

## What landed

The Android Island already spoke three languages of compute: WASM Cargos through the Chicory runtime, ONNX models through ONNX Runtime with NNAPI acceleration, and lightweight jobs in between. What it couldn't do was run an LLM natively. Now it can:

- **A native llama.cpp path.** The agent embeds llama.cpp through a thin JNI bridge — model loading, tokenization, sampling, and generation all happen in native code on the phone's CPU. GGUF models download once, verify against a SHA-256 hash, and cache locally. TinyLlama 1.1B (4-bit, about 650 megabytes) preloads in the background so the first job doesn't pay the download.
- **Token streaming, end to end.** Each generated token crosses the JNI boundary through a callback and goes straight onto the WebSocket to the coordinator. The Consumer watches the response appear word by word, exactly like the iOS demo — except the Island is a Snapdragon now.
- **An agent that reports what's actually happening.** Heartbeats every ten seconds carry real system metrics — memory in use, disk, cores. Long-running jobs renew their lease with the coordinator mid-generation, so a 90-second inference doesn't get requeued halfway through. Job status carries token counts, which is what fair metering needs.

The guardrails from the iOS agent carry over unchanged: an Android Island only accepts work while charging (or above 20% battery), on WiFi — never cellular — and thermally comfortable. One tap stops everything. Every completed job earns credits.

## One runtime, two platforms

The decision worth explaining is what we *didn't* do. We didn't port stock llama.cpp and call it done.

In May we wrote about [fitting eight billion parameters in one gigabyte](/news/eight-billion-parameters-in-one-gigabyte/) — PrismML's Bonsai-8B, quantized to Q1_0 at ~1.125 bits per weight, running at 66 tokens/sec on a MacBook M4 through our production Mac Island code path. That path is built from PrismML's llama.cpp fork, which carries the Q1_0 dequantization kernels stock llama.cpp doesn't have, pinned to a revision we benchmarked and attested.

The Android agent now builds from **the same fork, at the same pinned revision**. Not "the same project, roughly" — the same commit. When the Mac Island's runtime moves, the Android runtime moves with it, and both moves happen against a revision that's been validated once.

Two things fall out of that:

1. **Capability honesty.** Every Island advertises `supported_quantization_formats` when it registers — the coordinator only routes a Q1_0 Cargo to an Island whose binary actually carries the kernels to run it. Android Islands now advertise `["gguf", "q1_0"]`, and the placement logic that already gates Mac Islands applies to phones without a single coordinator change.
2. **The Bonsai math starts applying to phones.** An 8B model at Q1_0 needs about 2.4 GB at runtime. That was the number that made it fit inside an attested Mac's working-set budget — and it's also a number a flagship phone with 12 GB of RAM can plausibly host. A model class that used to require a laptop is, on paper, within a phone's reach.

## What "on paper" means

We're being careful with claims here, the same way we were in May when we didn't flip Bonsai's `approved` flag on launch day.

What's true today: the Android agent compiles the Q1_0 kernels, advertises the capability, and the coordinator will route accordingly. The per-SoC throughput figures the Island reports — on the order of 8 to 20 tokens/sec for a TinyLlama-class model, from Snapdragon 888 up to 8 Gen 3 — are **estimates the agent advertises for placement**, not benchmarks we've published. The numbers we stand behind are still the Mac numbers.

What's still gated, in order: real-device throughput runs on actual Snapdragon hardware, the model-quality evaluation that gates the Bonsai Cargo itself, and the usual rollout discipline before anything reaches your pocket. Same posture as always: the rails are built; the flag flips when the measurements say so.

## Where this is heading

The Android agent now builds and tests in CI, has a signed release pipeline, and is headed for Play Store internal testing. If you want in early, [subscribe](/subscribe/) — beta invitations go out in order.

The name Archipelag.io was always a bet that the interesting computer isn't one big continent in a datacenter — it's a very large number of small islands, coordinated well. iOS proved a phone could be an island. Android is where the archipelago gets its landmass.
