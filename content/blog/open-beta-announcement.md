+++
title = "Archipelag.io Enters Open Beta"
description = "Archipelag.io is now in open beta. For the next three months, everyone can try the platform — use AI, contribute compute, and help us shape the future of distributed inference."
date = 2026-03-13
+++

Today we're opening Archipelag.io to everyone. Starting now and running through **June 13, 2026**, the platform is in **open beta** — free to explore, free to break, and free to help us improve.

## What Does Open Beta Mean?

During the open beta period:

- **Anyone can sign up** and start using AI inference on the platform — LLM chat, image generation, and more.
- **Anyone can become a host** by installing the node agent and contributing idle GPU compute to the network.
- **Remuneration is virtual.** Credits, earnings, and payouts shown on the platform are fictive during the beta. No real money changes hands. This lets us stress-test the billing, karma, and payout systems without financial risk to participants.
- **Things will break.** We're actively developing and stabilizing the platform. Expect rough edges, downtime, and changes. Your feedback during this period is invaluable.

## Why Open Beta?

We've been building Archipelag.io for over a year — the coordinator, the node agent, workload containers, SDKs, and all the infrastructure that ties them together. Feature code exists for everything from host registration and job dispatch to container signing and regional placement.

But software only gets real when real people use it. We need:

- **Load diversity**: Different hardware, network conditions, and usage patterns that we can't simulate in testing.
- **UX feedback**: Where does the onboarding confuse you? What's missing from the dashboard? Which error messages are unhelpful?
- **Edge cases**: The bugs that only surface when hundreds of people do things we didn't anticipate.

The open beta is our way of inviting you into the process.

## What's Available

During the beta you'll have access to:

- **LLM Chat** — Converse with Mistral 7B and Llama models, with responses streamed in real-time from nearby hosts.
- **Image Generation** — Generate images with Stable Diffusion XL (FLUX coming soon).
- **OpenAI-compatible API** — Drop in our API endpoint and use your existing code. Python and JavaScript SDKs available.
- **Node Agent** — Run the host agent on Windows, macOS, or Linux to contribute your GPU and earn virtual credits.
- **Playground & Marketplace** — Explore available models and workloads through the web UI.

## What to Expect

The beta runs for **three months** (March 13 – June 13, 2026). During this time:

1. **No real payments.** All credits and earnings are virtual. When we transition to production billing, beta participants will receive a bonus credit allocation as thanks.
2. **Data may be reset.** We may need to reset accounts, credits, or job history as we iterate on the database schema and systems.
3. **Availability is best-effort.** Host coverage depends on community participation. Some regions may have limited availability initially.
4. **We ship fast.** Expect frequent updates, new models, and improved features throughout the beta.

## How to Participate

**As a user:**
1. [Create an account](https://app.archipelag.io/auth/register) on the platform.
2. Try the chat interface or connect via the API.
3. [Report issues](https://github.com/archipelag-io/archipelag-io/issues) or send feedback to [hello@archipelag.io](mailto:hello@archipelag.io).

**As a host:**
1. [Download the node agent](https://github.com/archipelag-io/node-agent/releases) for your platform.
2. Configure it with your API key and set your availability.
3. Your GPU starts earning virtual credits as it serves inference requests.

**As a developer:**
1. Check out the [documentation](https://docs.archipelag.io) and [API reference](https://docs.archipelag.io/api).
2. Install the [Python SDK](https://pypi.org/project/archipelag/) or [JavaScript SDK](https://www.npmjs.com/package/@archipelag/sdk).
3. Build something and tell us about it.

## What Comes After Beta?

After the beta period, we plan to:

- **Enable real billing** with Stripe-powered payments and host payouts.
- **Expand model support** with more LLMs, vision models, and custom workloads.
- **Launch the mobile agent** for iOS and Android.
- **Grow the host network** across more regions.

The exact timeline depends on what we learn during the beta. We're building this in public and will share updates on this blog and on [GitHub](https://github.com/archipelag-io).

## Thank You

Open beta is a leap of faith — ours and yours. Thank you for trying something new, for reporting the bugs, and for believing that compute should be closer to the people who need it.

Let's build this together.

— The Archipelag.io Team
