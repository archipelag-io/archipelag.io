+++
title = "The Math Says We Cannot Read Your Prompt"
description = "Most cloud AI runs on a contractual privacy promise: we say we won't read your prompts. We're moving to a technical one: we cannot. Here's what we shipped on Apple Silicon, what it actually protects against, and what it doesn't."
date = 2026-05-08

[extra]
category = "Technical"
author = "Raffael Schneider"
+++

Most cloud AI privacy guarantees are contractual. The provider says: *we won't read your prompts.* You believe them, or you don't. There's nothing about the system that prevents them from reading. The OS user on the inference box can read process memory. The deploy account can pull database rows. Anyone who compels the provider can compel the data.

This is also true of Archipelag.io for Tier-0 commodity workloads, and we want to be honest about that. A workload running in a Docker container on a contributor's GPU is visible to that contributor's `docker exec`, their `tcpdump localhost`, their memory snapshots. A prompt that flows through the coordinator is visible in NATS and in PostgreSQL. We promise we don't look. We can't prove we didn't.

For most workloads — public chat, image generation, code formatting — that's fine. The same trust model is what every standard LLM API runs on, and it's been good enough for the last three years. But there's a class of workloads where contractual privacy isn't enough. Medical notes. Legal drafts. Internal company data that nobody outside the company is supposed to see. For those, we want to ship something stronger.

Today we're shipping the first piece: **Tier-1 confidential inference on Apple Silicon.**

## What "Tier 1" actually means

We split workloads into three privacy tiers:

| Tier | Name | Coordinator can read? | Island operator can read? |
|------|------|-----------------------|---------------------------|
| **0** | Commodity | Yes | Yes |
| **1** | Hardened | Yes | **No** |
| **2** | Confidential | **No** | **No** |

Tier 0 is what we've always had. Tier 1 closes the Island side: the contributor running the hardware can no longer read the prompt or the response. Tier 2 closes the coordinator side too — the operator (us) can't read it either. Tier 1 is shipped today on Apple Silicon. Tier 2 is on the roadmap (P2 in [`PRIVACY_ROADMAP.md`](https://github.com/archipelag-io/.claude/blob/main/PRIVACY_ROADMAP.md)).

This work is heavily inspired by [Eigen Labs' April 2026 paper on private decentralized inference](https://github.com/Layr-Labs/d-inference). They sketched the access-path-elimination approach for Apple Silicon; we took that approach, applied it to a consumer compute network, and shipped working code.

## Anatomy of a confidential job

Here's what happens when you submit a job with `privacy_tier: 1` to a macOS Island today.

### 1. The Island attests itself

When a Mac mini or MacBook joins the network as a Verified Island, it doesn't just register. It runs `MacOSIsland.bootstrap()`:

- **Hardware identity.** It generates a P-256 keypair *inside the Secure Enclave*. The private half never leaves the SE — there's no API to extract it, even with root. The public half goes into the Island's persistent identity.
- **Hardening checks.** It calls `PT_DENY_ATTACH` to refuse debugger attachment, queries `csr_check()` to confirm SIP is enabled, and verifies that no `kSecCSDynamicInformation` flags are set on its own running binary. If any of these fail, bootstrap aborts.
- **Binary self-hash.** It hashes its own running binary (`runningBinarySHA256`) so the coordinator can compare against an allowlist of known-good Island builds.
- **Fetch a nonce.** It asks the coordinator for a fresh challenge nonce — a one-time random value, expires in 60 seconds.
- **Sign.** It builds a canonical-JSON attestation blob — `{hardware_id, security_posture, binary_hash, nonce, public_keys}` — and signs it with the SE-bound key.
- **Submit.** POST to `/api/v1/island/apple-silicon/attest`. The coordinator verifies the signature against the public key, checks the nonce is fresh, validates the hardening claims, and either issues a 15-minute blessing or rejects the Island outright.

A Verified Island has `privacy_tier ≥ 1` in the database, a `binary_hash` we recognize, and a `blessed_until` timestamp. Re-attestation runs every 10 minutes; a single transient failure doesn't drop you, but anything sustained does.

### 2. The consumer encrypts to the Island's hardware-bound key

When a consumer submits a Tier-1 job, the SDK first hits `/api/v1/island/encryption-target` to get the picked Island's *current* encryption pubkey (the SE-bound one from attestation). The consumer:

- Generates an ephemeral P-256 keypair in their own RAM. Single use.
- Computes `ECDH(consumer_priv, island_pub)` → 32-byte shared secret.
- Derives a session key with HKDF-SHA256 over a fresh 16-byte `session_id`.
- Seals the prompt with ChaCha20-Poly1305, fresh 12-byte nonce.
- Sends the envelope (`consumer_pub_xy`, `session_id`, `nonce`, `ciphertext`, `tag`) to the coordinator.

The coordinator persists the envelope verbatim. It cannot decrypt — it has no private key on either side of this exchange.

### 3. The Island decrypts inside the Secure Enclave's domain

The coordinator forwards the envelope to the assigned Island over a Phoenix Channel. Inside the Island's hardened process:

- The SE-bound private key + the consumer's pubkey produces the same shared secret. Same HKDF over the same session_id, same key.
- ChaCha20-Poly1305 verifies the Poly1305 tag (constant-time) and decrypts the ciphertext.
- The plaintext exists *only* inside this process's address space, on this hardware, for the duration of the job.
- llama.cpp runs the inference (TinyLlama 1.1B Q4_K_M for our smoke test, larger models for production).
- The response is re-sealed with the same shared secret, a *fresh* session_id and nonce — never reuse a (key, nonce) pair — and published as a single sealed chunk.

### 4. The consumer decrypts locally

The coordinator routes the sealed response back. The consumer derives the same shared secret (their saved private key + the published Island pubkey), unseals, recovers the plaintext.

End to end, the prompt was readable in exactly two places: the consumer's RAM (where it was typed), and the inside of the hardened Island binary on attested hardware (where inference happened). Nowhere else. The coordinator saw ciphertext only.

We verified this end-to-end on a real Apple M4 yesterday — full round-trip, encrypted prompt → SE-attested island → TinyLlama inference → encrypted response → consumer-side decrypt.

## What this actually protects against

A non-exhaustive enumeration:

- **A curious or compromised Island operator.** They can't `docker exec` into the inference process — there's no Docker container. They can't snapshot memory without disabling SIP, which the attestation refuses. They can't extract the private key — it's in the Secure Enclave. They can't substitute their own binary — the binary hash is in the attestation blob.
- **A coordinator operator who tries to read prompts.** They have the ciphertext and nothing else. ChaCha20-Poly1305 with a 256-bit key derived from a fresh ECDH is not breakable in practice.
- **Network observers.** Same answer; everything sensitive is encrypted under hardware-bound keys.

## What this does *not* protect against

We promised honesty about scope. Here's what Tier 1 doesn't do:

- **A compromised coordinator operator (i.e. us) who acts maliciously.** The coordinator decides which Island handles your job. A malicious coordinator could route every job to a single attacker-controlled Island that's been reverse-engineered. Tier 1 closes the Island side of the trust model; the coordinator side stays open until Tier 2 ships. Tier 2 puts the coordinator itself inside an Intel TDX or AMD SEV-SNP TEE so even *we* can't see which job went where.
- **A determined attacker with physical hardware access.** `PT_DENY_ATTACH` and `csr_check` are speed bumps, not bunkers. Someone with the actual Mac mini, willing to disable SIP, attach JTAG, or run an unsigned kernel extension, can defeat both. The Secure Enclave still protects the private key — but they could read live memory before encryption. We mitigate by routing only to Islands whose hardening posture is *currently* attested; we do not claim full physical resistance.
- **Side-channel attacks on the SE itself.** Apple has had a good track record here, but no chip is perfectly side-channel-resistant. If you're modeling a nation-state attacker, this isn't your threat model.
- **Linux Islands.** Today only Apple Silicon Islands can serve Tier-1 jobs. Linux is on the roadmap (TPM 2.0 + IMA) but not shipped.
- **Android Islands.** Same — Play Integrity API is on the roadmap, not shipped.
- **The consumer's own machine.** If your laptop has malware, no amount of SE-bound encryption on the inference end helps. We can secure the wire and the compute; you have to secure the keyboard.

We'd rather be conservative about what Tier 1 means than ship a marketing claim that crumbles when an actual security researcher pokes at it.

## Why we built this on consumer hardware

Most confidential-compute work targets datacenter silicon — Intel SGX, Intel TDX, AMD SEV-SNP. Those are useful, and Tier 2 will use them. But there's an interesting property of consumer Apple hardware that makes it a good Tier-1 substrate:

- **The Secure Enclave is in every chip Apple ships.** Every M-series Mac and every recent iPhone has one. There are hundreds of millions of these in the wild, sitting idle most of the time.
- **CryptoKit exposes SE-bound P-256 ECDH directly.** No vendor-specific SDK, no platform attestation token brokered through a third party. Just `SecureEnclave.P256.KeyAgreement.PrivateKey`.
- **Hardened Runtime + code signing give us a binary-identity primitive.** The same machinery Apple uses to make sure App Store apps haven't been tampered with, we use to make sure the Island binary running on someone's Mac mini is the one we built.

So the math worked out: a privacy substrate built on hardware most cloud providers don't have, on devices that already exist, mostly idle, in people's homes and offices. The same observation that drove ["Your Phone Is an Island"](/news/your-phone-is-an-island/) — the chip is everywhere, it's idle, let's use it — applies to its security features just as much as to its inference throughput.

## What's next

The privacy roadmap covers six phases:

- **P0 — Threat Model & Honest Statement.** Done. See the [updated SECURITY.md](https://github.com/archipelag-io/.claude/blob/main/SECURITY.md).
- **P1 — Apple Silicon Tier 1.** Done. Live in production today.
- **P2 — Coordinator TEE.** Run the coordinator itself inside Intel TDX or AMD SEV-SNP so the operator can't read prompts either. This is the bridge from Tier 1 to Tier 2.
- **P3 — End-to-end encryption.** Done at the protocol layer (this post). Awaits P2 to close the trust loop.
- **P4 — Linux Tier 1/2.** TPM 2.0 + IMA-measured boot for Linux Islands; SGX/TDX/SEV-SNP for Linux Tier 2.
- **P5 — Continuous Verification.** Periodic re-attestation with audit logs, transparent reporting of what each Island did and when.

The full document is in our [engineering context repo](https://github.com/archipelag-io/.claude/blob/main/PRIVACY_ROADMAP.md).

If you have a workload where contractual privacy isn't enough — set `privacy_tier: 1` on your Cargo. The job will only route to a Verified Island within its blessing TTL, the prompt will be encrypted to that Island's SE-bound key, and the response comes back the same way. The coordinator carries ciphertext; the contributor's machine sees the work; nobody else sees either.

That's the difference between "we promise we don't read your prompts" and "the math says we cannot." For Tier 1, we shipped the math.
