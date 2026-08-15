+++
title = "Current Status"
description = "What can be tested on Archipelag.io today, what remains experimental, and what Phase 2 virtual credits mean."
date = 2026-08-15
+++

# What works today

Archipelag.io is in **Phase 2**. Access is free and credits-only while the approved Cargo catalog, placement behavior, and end-to-end reliability are expanded and validated. Credits and Island earnings are virtual; real-money billing and Island payouts are not enabled.

**Last reviewed:** 15 August 2026. This page is the canonical public source for the current product phase and commercial status.

## Network facts

| Fact | Current public status |
| --- | --- |
| Product phase | Phase 2 validation |
| Commercial access | Free to test |
| Credits | Virtual accounting only; no cash value |
| Island payouts | Not enabled |
| Primary launch use case | AI inference |
| Compute contributors | Independently operated Islands |
| Execution unit | Approved, signed Cargo |
| Placement | Compatible-Island matching with nearby-first and regional-policy signals |

These statements describe the publicly supported product boundary. Source-code presence alone does not make a feature generally available or production-verified.

## Shared maturity labels

| Label | Meaning |
| --- | --- |
| **Current path** | The normal Phase 2 path used by the app and supported tooling |
| **Phase 2 simulation** | A real interface exercising virtual accounting or market behavior; no cash value |
| **Experimental** | Feature code or endpoints exist, but production or end-to-end validation is incomplete |
| **Security prototype** | Unaudited security-sensitive work without a production-verified trust boundary |
| **Planned** | A documented direction without a supported operational path |

These labels are shared by the marketing site, application, and documentation. See the [canonical definitions](https://docs.archipelag.io/reference/feature-maturity/) for appropriate-use guidance and the current feature map.

## Available for testing

- Consumer account access and API-key management
- Job submission through supported web and API paths
- Streaming AI inference where an approved Cargo and compatible Island are available
- Island registration, heartbeats, capability reporting, placement, and Karma signals
- Nearby-first placement and configured regional restrictions
- The public Cargo Registry and virtual Compute Exchange

Availability changes with the online Island pool. A Cargo catalog entry does not guarantee that a compatible Island is currently online.

## Experimental

- Multi-Island model execution and pipeline parallelism
- Workflow orchestration and batch fan-out
- Inference caching and speculative decoding
- Federated fine-tuning
- Confidential inference and hardware attestation
- Mobile execution beyond specifically documented demonstrations

Experimental interfaces, measurements, and security boundaries can change without notice during Phase 2.

## Verify the network

- [Browse current Cargo availability](https://app.archipelag.io/cargo)
- [Inspect the virtual Compute Exchange](https://app.archipelag.io/exchange)
- [Read the security boundaries](/security/)
- [Read the technical documentation](https://docs.archipelag.io/)
- [Follow the source and releases](https://github.com/archipelag-io)

If a public page and this status page disagree, please [tell us](mailto:hey@archipelag.io).

## Evidence and update method

This status is reviewed against the deployed marketing site, public application routes, documentation, release history, and current Phase 2 operating policy. It deliberately avoids publishing live Island, Cargo, latency, or availability counts without a timestamped measurement source.

Operational measurements will be added here only when they include the observation time, sample window, environment, and collection method. Historical claims remain available through dated [news posts](/news/) and [GitHub releases](https://github.com/archipelag-io).
