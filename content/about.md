+++
title = "About"
description = "Archipelag.io is a local-first distributed compute fabric that routes Jobs to independently operated Islands."
+++

**Archipelag.io** (pronounced *archipelago*) is a distributed compute fabric. The name describes the network: independent Islands contribute compute, Consumers request it, and the Coordinator connects the two.

## Our Mission

We're building a practical alternative to sending every AI request to a distant hyperscale region. Consumers should be able to choose nearby compute, understand where a Job runs, and use regional placement controls when location matters.

The launch use case is AI inference, but the fabric is designed for approved, signed Cargos beyond AI as well.

## How the Network Works

1. A **Consumer** submits a Job through the web app or API.
2. The **Coordinator** matches it to a compatible, available Island using capability, latency, region, asking price, and Karma.
3. The **Island** runs the approved Cargo in a constrained sandbox.
4. Results stream back through the Coordinator to the Consumer.

Archipelag.io is not a blockchain. The Coordinator is the control-plane authority for placement, dispatch, identity, billing, and health.

## Why Local-First Compute

- **Lower distance** — real round-trip-time measurements favor responsive nearby Islands.
- **Independent supply** — compatible desktops, servers, and mobile devices can contribute capacity.
- **Transparent placement** — Consumers can see which Island handled a Job and apply regional policies.
- **Failure-aware routing** — if an Island goes offline, the Coordinator can requeue the Job and select another match.
- **Open integration** — the chat API follows the OpenAI-compatible interface, and the core components are open source.

## Swiss and European Roots

Archipelag.io is built in Switzerland with European data-protection requirements in mind. Regional placement and execution records can support a Consumer's data-residency and governance program. They do not, by themselves, make a Job or organization legally compliant; each organization remains responsible for its own obligations.

## Boring Technology, Clear Responsibilities

Our platform is built on:

- **Elixir / Phoenix** for the Coordinator and real-time web experience
- **NATS JetStream** for Job dispatch and streamed output
- **Rust / Tokio** for the Island software
- **Docker and WASM** for controlled Cargo execution
- **PostgreSQL** for authoritative platform state

Experimental capabilities—including Multi-Island compute, workflow orchestration, inference caching, federated fine-tuning, and confidential inference—are labeled as experimental throughout the site.

## Security & Privacy

- Island operators are identity-verified before receiving Jobs.
- Only approved, signed Cargos may execute.
- Cargos run with resource limits and sandbox policies.
- Traffic between Consumers, the Coordinator, and Islands is encrypted in transit.
- Standard-mode Island software can access Job data while executing it. Experimental confidential-inference modes aim to provide stronger isolation on supported hardware.

[Read the security model &rarr;](/security)

## Team

We're a small team focused on distributed systems, edge infrastructure, applied security, and open standards.

[Meet the team &rarr;](/team)

## Current Phase

Archipelag.io is in **Phase 2**. Access is free and credits-only while the Cargo catalog and end-to-end reliability are expanded. Credits and Island earnings are virtual; real-money billing and payouts are not enabled.

Single-Island Job dispatch, streaming inference, Island registration, regional placement, Karma, and supported APIs form the current path. Mobile execution and other features marked **Experimental** remain limited to controlled evaluation; **Security prototype** features are not suitable for sensitive data.

---

*Ready to test the network? [Use AI](https://app.archipelag.io/auth/login), [become an Island](/earn), or [contact us](mailto:hey@archipelag.io).*
