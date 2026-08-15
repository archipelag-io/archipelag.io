+++
title = "Security"
description = "The Archipelag.io trust model, implemented controls, and current security boundaries."
date = 2026-08-15
+++

Archipelag.io connects Consumers with independently operated Islands. That makes trust boundaries important: Consumers should not have to trust arbitrary Island software, and Island operators should not have to trust arbitrary Consumer code.

This page describes the current Phase 2 security model. Experimental features are labeled explicitly.

## Security model

- **The Coordinator is the authority.** It authenticates participants, selects eligible Islands, dispatches Jobs, and records their state.
- **Islands run controlled Cargos.** The standard Island software accepts network-approved, signed Cargo artifacts rather than arbitrary Consumer code.
- **Cargos are isolated from the Island.** Container execution uses resource limits, seccomp profiles, and registry controls appropriate to the configured sandbox tier.
- **Consumers are separated from Island operators.** A Consumer's account identity is not sent to an Island as part of a Job.
- **Failure is expected.** Heartbeats, acknowledgements, retries, requeueing, and Karma signals help the Coordinator respond when an Island becomes unavailable.

No sandbox is a substitute for a patched operating system. Island operators remain responsible for securing the machines and networks they contribute.

## What an Island can see

In standard execution mode, Job data is protected in transit, but it is available to the Island's container runtime while the Cargo executes. Consumers should not send secrets or regulated data unless the selected execution mode and their own risk assessment permit it.

| Data | Standard execution | Confidential execution (Security prototype) |
|---|---|---|
| Job input and output during execution | Available to the execution environment | Intended to be decrypted only inside an attested environment |
| Consumer account identity | Not included in the Job dispatch | Not included in the Job dispatch |
| Cargo identity and resource requirements | Visible to the Island | Visible to the Island |
| Operational Job metadata | Visible where needed for execution and tracing | Visible where needed for execution and tracing |

Confidential inference is under active validation. It is not a production guarantee and requires compatible attested hardware and client support.

## Implemented controls

### Cargo execution

- Approved Cargo and registry allowlists
- Signed artifact verification
- Per-sandbox seccomp profiles
- CPU, memory, and execution limits
- Capability matching before dispatch
- Job correlation IDs across dispatch, execution, and completion

### Accounts and APIs

- Authenticated browser and API access
- Scoped API keys for read and write operations
- Session and Job ownership checks for realtime channels
- Request, body, and message-size limits
- Rate limits for API and authentication endpoints

### Island communication

- Outbound connections from the Island software to the Coordinator and message fabric
- Encrypted transport
- Heartbeats and health reporting
- No requirement to expose an inbound router port for normal operation

The Island software is written in Rust and is available for review in the [public repository](https://github.com/archipelag-io/node-agent).

## Placement and compliance

Regional placement policies can restrict which reported Island locations are eligible for a Job, and execution records identify the selected Island. These are technical controls that may support a Consumer's governance or data-residency program. They do not, by themselves, establish GDPR, EU AI Act, SOC 2, ISO 27001, or industry-specific compliance.

Archipelag.io is not currently SOC 2 or ISO 27001 certified. Consumers remain responsible for assessing their own legal, security, and contractual requirements.

## Operational security

The platform includes structured logging, Prometheus metrics, dependency scanning, and incident-response runbooks. Security controls and operational coverage continue to be hardened during Phase 2.

For Island operators:

1. Keep the operating system, container runtime, and Island software updated.
2. Use a dedicated or appropriately isolated machine for untrusted compute.
3. Review resource use and logs for unexpected behavior.
4. Protect API keys and never commit them to source control.
5. Report suspected incidents promptly.

## Report a vulnerability

Send vulnerability reports to [hey@archipelag.io](mailto:hey@archipelag.io). The canonical disclosure contact is also published at [/.well-known/security.txt](/.well-known/security.txt).

Please include the affected component, reproduction steps, potential impact, and a safe way to contact you. Do not access other people's data, use social engineering, or perform denial-of-service testing.

Security is an ongoing process. We welcome good-faith reports and improve these controls as the network matures.
