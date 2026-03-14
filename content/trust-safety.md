+++
title = "Trust & Safety"
description = "How Archipelag.io verifies users and providers to keep the network safe and trustworthy."
template = "page.html"
+++

## Identity Verification

Archipelag.io requires identity verification for users who submit compute workloads and providers who contribute compute resources. This helps prevent fraud, abuse, and ensures accountability across the network.

### What's verified

- **Government-issued photo ID** — passport, driver's license, or national ID card
- **Selfie match** — a live selfie is compared against the photo on your ID to confirm you are the document holder

### What we store

We store only the minimum information needed:

- **Your verified name** — as it appears on your government ID
- **Your country** — the issuing country of your ID document
- **Verification status** — whether your identity has been confirmed

We do **not** store copies of your ID documents or selfie images. All document processing is handled securely by [Stripe Identity](https://stripe.com/identity), a PCI-certified payment infrastructure provider.

### Why it's required

Identity verification serves several purposes:

1. **Fraud prevention** — Ensures real people behind accounts, reducing abuse and fraudulent activity
2. **Accountability** — Compute providers handling sensitive workloads must be identifiable
3. **Compliance** — Supports GDPR and EU AI Act requirements for data processing transparency
4. **Network trust** — Verified users and providers create a more reliable compute network

### When it's required

- **Browsing the marketplace** — No verification needed
- **Exploring the platform** — No verification needed
- **Submitting compute workloads** — Verification required
- **Registering as an Island** — Verification required
- **Purchasing credits** — Small amounts allowed without verification (free tier)

### Appeal process

If your verification is rejected, you can:

1. **Try again** — Submit a new verification with a different document or better photo quality
2. **Contact support** — Email [hey@archipelag.io](mailto:hey@archipelag.io) if you believe the rejection was in error
3. **Request manual review** — In exceptional circumstances, our team can review your case manually

## Account Bans

Accounts may be suspended for violations of our [Terms of Service](/terms), including:

- Submitting malicious or illegal workloads
- Attempting to circumvent security controls
- Fraudulent activity or identity misrepresentation
- Abuse of compute resources

Banned users may appeal by contacting [hey@archipelag.io](mailto:hey@archipelag.io).

## Reporting

To report trust or safety concerns, contact [hey@archipelag.io](mailto:hey@archipelag.io).
