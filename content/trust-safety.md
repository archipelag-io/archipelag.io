+++
title = "Trust & Safety"
description = "How Archipelag.io establishes accountability for Consumers, Island operators, and Cargo publishers."
template = "page.html"
+++

Archipelag.io brings together three distinct roles: Consumers submit Jobs, Island operators contribute compute, and Cargo publishers define approved packages that can execute those Jobs. The Coordinator enforces the network rules between them.

## Participation and identity

Browsing public information and the Cargo Registry does not require identity verification. Higher-trust actions may require account or identity checks depending on the feature and its Phase 2 rollout, including registering an Island, publishing a Cargo, or accessing sensitive platform functions.

Where identity verification is requested, the verification provider processes the submitted identity document and likeness. Archipelag.io is designed to retain the verification result and the minimum account attributes needed for accountability, rather than copies of identity documents. The applicable collection and retention details are described in the [Privacy Policy](/privacy).

Verification establishes that an accountable participant is behind an account. It does not certify the safety of every Job, Cargo, Island, or generated result.

## Cargo approval

Consumers do not upload arbitrary code directly to Islands. Cargos enter the network through an approval path that can include publisher review, artifact signing, automated scanning, declared resource requirements, and runtime compatibility checks.

A Cargo Registry entry is a catalog record; it does not promise that a compatible Island is online or that the Cargo is enabled in every environment. The Coordinator only dispatches an approved Cargo to an eligible Island.

## Island accountability

Islands register their capabilities and send health information to the Coordinator. Successful execution, latency, uptime, and failures contribute to Karma and placement decisions. An Island may be made ineligible when it is unhealthy, incompatible, suspended, or outside a Consumer's placement policy.

The standard trust model still matters: Job data is available to the Island's execution environment while a Cargo runs. See [Security](/security) for the boundary and for the status of experimental confidential execution.

## Consumer responsibility

Consumers must submit lawful Jobs and review AI-generated results before relying on them. Archipelag.io's placement controls, Cargo approval process, and account safeguards do not replace a Consumer's own legal, security, and content-safety obligations.

## Enforcement and appeals

Accounts, Islands, or Cargos may be restricted or suspended for malicious code, fraud, attempts to bypass security controls, abuse of compute resources, or violations of the [Terms of Service](/terms).

If you believe a restriction was made in error, or need to report fraud, abuse, or unsafe behavior, contact [hey@archipelag.io](mailto:hey@archipelag.io). Include the relevant account, Island, Cargo, or Job identifier when available; do not include secrets or unnecessary personal data.
