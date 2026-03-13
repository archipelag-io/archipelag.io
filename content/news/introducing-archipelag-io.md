+++
title = "Introducing Archipelag.io: Compute, Closer to You"
description = "Today we're launching Archipelag.io, a distributed compute network that brings AI inference to community hardware. Here's why we built it and what's next."
date = 2025-01-26

[extra]
category = "Blog"
+++

Today, we're opening the doors to Archipelag.io—a new kind of compute infrastructure built on a simple idea: **the best compute is the compute closest to you**.

## The Problem We're Solving

Cloud computing changed everything. But somewhere along the way, we accepted a trade-off that doesn't make sense anymore: sending our data to distant data centers, waiting for responses, and paying premium prices for the privilege.

For AI workloads, this is especially painful. You're streaming tokens from a GPU that might be thousands of miles away, paying for bandwidth and latency you don't need, while powerful GPUs sit idle in homes and offices everywhere.

We asked ourselves: what if those idle GPUs could work for you?

## How Archipelag.io Works

Archipelag.io is a two-sided marketplace connecting people who need compute with people who have it:

**For AI users:** Submit inference requests—LLM chat, image generation—and get results streamed from the nearest available host. Lower latency, fair pricing, no cloud provider markup.

**For compute hosts:** Install our lightweight agent, set your availability, and earn money from your idle GPU. RTX 4090 owners can earn up to $400/month with just 8 hours of daily availability.

The magic is in the middle: our coordinator handles placement, dispatch, and billing. It finds the best host for each job based on proximity, capability, and reliability. Hosts build karma through successful completions, unlocking priority jobs and better rates.

## What We're Launching With

Today's launch includes:

- **LLM Chat** with Mistral 7B and Llama models, streaming responses in real-time
- **Image Generation** with Stable Diffusion XL and FLUX (coming soon)
- **Node Agent** for Windows, macOS, and Linux hosts
- **OpenAI-compatible API** for developers who want to integrate

We're starting with AI inference because it's where the pain is sharpest. But the architecture is workload-agnostic—rendering, transcoding, batch processing, and more are on the roadmap.

## Why Now?

Three trends are converging:

1. **GPU proliferation**: There are more powerful GPUs in consumer hands than ever before. Gaming PCs, creative workstations, and retired mining rigs represent massive untapped compute capacity.

2. **AI at the edge**: As AI becomes embedded in everything, the centralized cloud model is hitting limits. Latency matters. Privacy matters. Resilience matters.

3. **Community infrastructure**: People are increasingly willing to participate in decentralized networks—whether that's sharing storage, bandwidth, or compute.

We believe the next era of computing won't be built in hyperscale data centers alone. It'll be built on a fabric of community-contributed resources, coordinated by software that makes them feel like a single, reliable system.

## What's Next

This is just the beginning. Over the coming months, we're focused on:

- **More models**: Expanding our supported LLMs and adding vision models
- **Geographic expansion**: Building out host coverage in more regions
- **Developer tools**: SDKs for Python and JavaScript, webhook integrations
- **Mobile agent**: Bringing hosting to iOS and Android devices

We're also working on the economics—refining the karma system, optimizing job routing, and ensuring hosts are fairly compensated for their contributions.

## Get Involved

There are two ways to join us:

**Use AI**: [Create an account](https://app.archipelag.io) and get 10 free credits to try the service. Use the web UI or integrate via API.

**Become a host**: [Download the agent](https://github.com/archipelag-io/node-agent/releases) and start earning from your idle hardware. You'll need an NVIDIA RTX 3060 or better and a decent internet connection.

We're building this in public. Follow our progress on [GitHub](https://github.com/archipelag-io), reach out at [hello@archipelag.io](mailto:hello@archipelag.io), or just reply to this post.

The future of compute is distributed. Let's build it together.

—The Archipelag.io Team
