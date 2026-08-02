+++
title = "Kimi K3 Joins the Catalog"
description = "The newest entry in the Archipelag.io catalog is Moonshot's Kimi K3 — 2.8 trillion parameters, open weights, and a memory footprint that starts at 594 GB. It's our first datacenter-tier Cargo, and it's an invitation."
# Held for w/c 2026-08-10 — bump `date` and flip `draft` when publishing.
date = 2026-08-02
draft = true

[extra]
category = "Technical"
author = "Raffael Schneider"
+++

The Archipelag.io catalog has a new entry, and it's the largest one by three orders of magnitude: **Kimi K3**, Moonshot AI's mixture-of-experts model — 2.8 trillion total parameters, 104 billion active per token, weights released July 27th under an MIT-style license.

In June we said [Phase 2 is about building the catalog](/news/phase-2-building-the-catalog/): getting the best open-weight models onto the network's shelves, priced in credits, before we worry about anything else. GLM-5.2 was the model that forced that thesis. K3 is the model that stress-tests it — because K3 doesn't fit on anything.

## The numbers

K3 was trained quantization-aware in MXFP4, so it compresses unusually well — and it's still enormous:

| Quantization | Size |
|---|---|
| UD-IQ1_S (absolute floor) | 594 GB |
| UD-Q2_K_XL (our Cargo's default) | 861 GB |
| UD-Q8_K_XL (near-lossless) | 1.56 TB |

The smallest of those does not fit on a maxed-out 512 GB Mac Studio — the largest single machine a consumer can buy. Serving K3 takes eight 80-gigabyte-class GPUs, or a terabyte of system RAM, or a hybrid of both. And before you ask the question a network named after an archipelago invites: no, you can't shard one inference across a thousand phones. Every generated token moves activations through the whole model, and across home internet links each hop costs WAN latency. Physics votes no. Models this size need one big Island, not many small ones.

## So what does "in the catalog" mean?

It means the network knows how to describe K3, price it, and route it — correctly, today.

The pleasant surprise while building this: our placement logic needed **no new concepts**. The coordinator has always matched Cargos to Islands on declared requirements — RAM, VRAM, cores, runtimes, quantization formats, trust tiers. A "datacenter tier" is just very large values in the same fields. The `gguf-kimi-k3` entry demands a terabyte of RAM and 32 cores, and the same gates that keep a Bonsai job away from an Island without Q1_0 kernels keep K3 away from your phone. We wrote placement tests to prove it and stopped there, because there was nothing else to build.

What did ship, across three repos this week:

- **The K3 Cargo**: a containerized llama.cpp server with the chat template read from the GGUF itself, a 131k-token default context (native max is 1M, but the KV cache at that length is its own hardware problem), and a cold-load timeout in the tens of minutes — loading 861 GB off disk is not quick. One footnote for the record: mainline llama.cpp can't run K3's architecture yet; support lives in a fork while the upstream PR lands, and the Cargo pins accordingly.
- **The catalog entry**: priced to reflect what terabyte-class hardware's time is worth, and never chosen by the auto-selector, which always prefers the smallest model that can do the job.
- **Big-Island capability declarations**: operators of serious hardware can now advertise it to the coordinator — declared capabilities get you considered, verified capabilities get you trusted, same posture as everywhere else on the network.

## The invitation

A catalog entry is a promise: *if* a machine that can hold this model joins the network, jobs will route to it, meter correctly, and pay out. The software side of that promise is built and in final review. The other side of it is you.

If you operate hardware in this class — a lab with idle H100 nodes, an overprovisioned inference box, a university cluster with quiet weekends — the network now has work worthy of your machine, and the strongest open-weight models finally have somewhere sovereign to run. [Talk to us](/contact/).

Islands come in sizes. The catalog now knows that — and its shelves are stocked for the biggest ones first.
