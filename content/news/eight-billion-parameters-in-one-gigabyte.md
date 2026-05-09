+++
title = "Eight Billion Parameters in One Gigabyte"
description = "We're adding sub-2-bit LLM inference to our macOS Islands. An 8B model now fits in 1.1 GB on disk, 2.4 GB at runtime, and runs at 66 tokens/sec on a MacBook M4 — through Archipelag.io's actual production code path, not a vendored CLI. Here's why it matters and what we had to fix to get there."
date = 2026-05-09

[extra]
category = "Technical"
author = "Raffael Schneider"
+++

The compression curve hit something interesting this spring. PrismML's [Bonsai-8B](https://huggingface.co/collections/prism-ml/bonsai) — a Q1_0-quantized derivative of Qwen3-8B — packs 8.19 billion parameters into **1.07 GiB on disk** and roughly 2.4 GB at runtime. That's ~1.125 bits per weight. For comparison, Q4_K_M (the GGUF quant most LLM tooling defaults to) is ~4.5 bits/weight; fp16 is 16. Going from Q4 to Q1_0 means a model that needed a 5-7 GB working set now needs ~2.4 GB.

We can fit that in an attested macOS Island's hardened-process budget on every M-series Mac.

This isn't a research-stage curiosity. We've measured it end-to-end on Apple M4 through the actual code path the Mac Island runs in production: **66.3 tokens/sec** of generation, within ±5% of the spike's `llama-cli` baseline of 63.5 tok/s. Swift wrapper overhead is negligible. The Q1_0 Metal kernels (`kernel_mul_mv_q1_0_f32`, `kernel_mul_mm_q1_0_f32`) carry the load.

We're not flipping the workload's `approved` flag yet — there are gates left, and we'll cover them below. But the rails are built.

## Why this matters for Archipelag.io

We've been clear that [our Tier-1 confidential inference path](/news/the-math-says-we-cannot-read-your-prompt/) runs on Apple Silicon hardened processes, gated by Secure Enclave attestation. That story has always had a model-size ceiling: an attested macOS process gets a constrained working-set budget, and most useful 7B/8B models in fp16 or even Q4 push past it on 8 GB and 16 GB Macs.

Sub-2-bit quants change the shape of what's feasible inside the Tier-1 box:

- **More capable models on the same hardware.** Q1_0 lets an 8B model run where Q4 only fit a 3B. The intelligence-per-watt ratio of an attested Mac Island goes up without any hardware change.
- **More devices in the eligible pool.** A 5 GB Q4 model excludes the 8 GB MacBook Air; a 1.1 GB Q1_0 model includes it. Larger eligible pool = lower placement latency and better fit-scoring.
- **Cheaper cold starts.** First-job model download time scales with file size. A Q4 8B model is ~4.5 GB; Q1_0 is ~1.1 GB. On a typical home connection, that's the difference between a multi-minute initial download and one that finishes while the consumer is still typing the prompt.

None of this matters if the quality collapses. Bonsai-8B's headline numbers from PrismML's evaluation are competitive with fp16 baselines on standard benchmarks (MMLU, HellaSwag, ARC, GSM8K) — within a few percentage points. We'll re-run those internally before flipping `approved` (more on that in the gates section), but the early indication is that the quality-per-byte ratio of Q1_0 is genuinely surprising in 2026.

## How quantization-format support is wired

Until last week, our Mac Island had one inference runtime: stock llama.cpp via [LLM.swift](https://github.com/eastriverlee/LLM.swift). Adding Q1_0 meant adding *a second runtime fork* — PrismML's llama.cpp, which ships the Q1_0 dequantization kernels stock llama.cpp doesn't. We did this in three phases.

**Phase 1 — data plumbing.** A new `quantization_format` field on the `Job` schema, a new `supported_quantization_formats` field on host capabilities, and a coordinator-side filter that won't dispatch a Q1_0 workload to an Island that can't run it. Phase 1 was *defense in depth*: the Island advertised `["gguf"]` only, and a Q1_0 dispatch would've been refused upstream.

**Phase 2 — actual runtime linkage.** This is where it got interesting.

PrismML's fork is Apache 2.0, builds cleanly to a Metal-enabled xcframework via a slim macOS-only adaptation of upstream's `build-xcframework.sh`, and we vendored it as `Vendor/Bonsai.xcframework` (gitignored — a build script reproduces it from a pinned PrismML commit). Modulo a one-character framework rename (we called ours `BonsaiLlama` so it didn't collide with LLM.swift's framework, also called `llama`), this should have just worked.

It didn't.

What we found: both frameworks export the same ~2,115 C symbols. `llama_model_load_from_file`, `gguf_init_from_file`, `ggml_compute_forward` — all of it. They're forks of the same project. The Swift module rename solved the *Clang compile-time* enum-redefinition error (PrismML's fork extends `ggml_type` with new cases for Q1_0 and Q2_0; stock llama.cpp doesn't), and we further hid PrismML's headers behind `@_implementationOnly import` so they wouldn't leak into our agent's compilation unit.

The dynamic linker doesn't care about any of that. At runtime, dyld's flat-namespace lookup picks one definition per symbol. On our build, LLM.swift's stock-llama.cpp consistently won the race, and *every* Q1_0 dispatch silently routed through stock llama.cpp's loader, which doesn't recognize PrismML's Q1_0 type identifier. The smoke test produced this:

```
gguf_init_from_file_impl: tensor 'output.weight' has invalid ggml type 41 (NONE)
gguf_init_from_file_impl: failed to read tensor info
llama_model_load_from_file_impl: failed to load model
```

That's stock llama.cpp's loader processing a file that PrismML's loader was supposed to handle. Type 41 is what PrismML calls Q1_0. Stock llama.cpp says "NONE" because the slot is empty in its enum.

We caught this because we kept testing. The smoke test "passed" once on a fresh build — that was build-cache happenstance — and after a clean rebuild, it failed 10/10 in a row with the type-41 error. Production was deterministically broken.

The fix turned out to be conceptually clean. PrismML's fork is a *strict superset* of stock llama.cpp — it loads stock GGUFs (Q4_K_M, Q5, Q8, fp16) just fine, plus Q1_0 and Q2_0. So we don't need both libraries. We dropped LLM.swift entirely, rewrote our `gguf` execution path to go through `BonsaiLLM` (our thin Swift wrapper around PrismML's C API), and now `island-mac`'s `otool -L` shows exactly one llama.cpp framework. The symbol collision is gone because the colliding library is gone.

The regression test was important: a stock GGUF (TinyLlama-1.1B Q4_K_M) still loads and produces coherent output through the new path, at 76 tok/s on M4. Q4 didn't get any slower; Q1_0 got correct.

**Phase 3 — measurement.** A bench harness that exercises `BonsaiLLM` directly on a real Bonsai-8B-Q1_0 GGUF, gated behind an environment variable so it doesn't run in CI but does run in any developer's local checkout with the model on disk. The single-shot M4 number is **66.3 tok/s** steady-state generation, with TTFT of ~0.18s for a short prompt (dominated by one-time Metal pipeline compilation). Real Bonsai output, asked "The capital of France is":

> *"Paris, which is also the capital of the Île-de-France region."*

Coherent, stays on topic, doesn't hallucinate. From an 8B model in 1.1 GB on disk.

## What still gates `approved: true`

Throughput on the host classes we don't have. We've measured M4. M1, M2, M3 are unmeasured; the bench harness is set up to populate them as we get hands on the hardware. Until then, the coordinator's placement scoring treats Apple Silicon capability as a boolean ("can run Q1_0: yes/no") rather than the per-(host_class, format) throughput ranking we want.

Quality eval. PrismML published their own MMLU/HellaSwag/ARC/GSM8K numbers; we re-run them internally before publishing a `quality_tier` claim. If Q1_0 is within 5% of fp16 Qwen3-8B baseline, the workload stays at `quality_tier: standard`. If not, it gets `aggressive` and a candid note on the Cargo Registry detail page.

A Metal pipeline-compile race we tracked down ([mobile-agent-ios#7](https://github.com/archipelag-io/mobile-agent-ios/issues/7)). Single-shot generation works fine; running multiple generations within one process — even with proper KV-cache reset between calls — can SIGSEGV during late Metal pipeline compilation if the warmup prompt didn't trigger every kernel real workloads will need. Production is currently safe because the prompts in our smoke matrix compile the common kernel set, but this needs to land before sustained Bonsai traffic.

License notice bundling. PrismML's NOTICE/LICENSE and llama.cpp's LICENSE need to travel inside the Mac Island binary's `LICENSES/` directory. Apache 2.0 / MIT both require it. Mechanical, just hasn't been done yet.

These gates are the difference between "we built it" and "we operate it." The rails are built.

## Why we're not stopping at 8B

Bonsai is one of three Q1_0/i2_s ternary model lineages we've evaluated. Microsoft's [BitNet b1.58 2B](https://huggingface.co/microsoft/bitnet-b1.58-2B-4T) works perfectly upstream and runs at 49 tok/s on M4 — small but coherent. The 7B and 8B BitNet variants have known issues in the upstream HF1BitLLM port that we hit during the spike (the Llama-3 and Falcon3 derivatives produce gibberish; tracked at [microsoft/BitNet#12](https://github.com/microsoft/BitNet/issues/12) and elsewhere). Bonsai-8B was the model that worked end-to-end and pushed the size/quality tradeoff into the range we needed.

Beyond Bonsai-8B, the [PrismML collection](https://huggingface.co/collections/prism-ml/bonsai) ships 1.7B and 4B Q1_0 variants we haven't yet benched. The 4B is a likely good fit for older M1/M2 hardware where 8B runtime memory is tight; the 1.7B fits everything down to A17 Pro iPhones if the dispatch-payload story extends to mobile (it doesn't yet, but the architecture supports it).

There's also a browser story. Q1_0 in the browser would mean any `https://chat.archipelag.io` user's tab becomes an Island, contributing compute back into the pool while they consume from it. We have notes on what that costs — primarily, transformers.js absorbing Q1_0 or us shipping a custom WGSL kernel — at [Phase 7 of the quantization plan](https://github.com/archipelag-io/.claude/blob/main/QUANTIZATION_VARIANTS_PLAN.md).

The shape of the bet is: ultra-low-bit quants make the on-device confidential inference story bigger, not smaller. We started with Apple Silicon because the Secure Enclave gives us hardware-bound key material for Tier-1. We're building toward "every Mac you own is a confidential inference endpoint, capable of running 8B-class models on the hardware you already paid for, with cryptographic attestation that the operator (us) can't read your prompts."

This is one piece of that. More to come.
