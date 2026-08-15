+++
title = "Privacy Policy"
description = "How Archipelag.io collects, uses, and protects your personal information."
date = 2026-01-26
+++

*Last updated: March 15, 2026*

This Privacy Policy describes how Archipelag.io ("we", "us", or "our") collects, uses, and shares information about you when you use our website, platform, and services (collectively, the "Services").

## Information We Collect

### Information You Provide

- **Account Information**: When you create an account, we collect your email address, username, and password. If you sign up using GitHub, we receive your GitHub username and email.
- **Payment Information**: Phase 2 does not accept credit purchases or issue Island payouts. If a paid service is introduced later, its payment processor and collection details will be disclosed before payment.
- **Island Information**: If you register as an Island (compute contributor), we collect information about your hardware specifications, IP address, and geographic region.
- **Communications**: When you contact us, we collect the information you provide in your messages.

### Information Collected Automatically

- **Usage Data**: We collect information about how you use our Services, including API calls, Cargo types, and timestamps.
- **Device Information**: We collect information about the device you use to access our Services, including browser type, operating system, and device identifiers.
- **Log Data**: Our servers automatically record information including your IP address, access times, and pages viewed.
- **Cookies**: We use essential cookies to maintain your session and preferences. We do not use third-party tracking cookies.

### Information from Islands

When Cargos run on Island machines:
- Islands receive only the minimum data necessary to execute Cargos
- All data is encrypted in transit using TLS 1.3
- Cargos run in isolated containers with no persistent storage
- In standard execution mode, Job data is available to the Island's execution environment while the Cargo runs. Island operators are prohibited from retaining it after completion; see [Security](/security) for the current trust boundary.

### Information from Mobile Apps (iOS & Android)

When you use the Archipelag.io Island app on your mobile device:

- **Device Information**: We collect device model, operating system version, and hardware capabilities (e.g., Neural Engine availability, GPU model) to match your device with compatible Cargos.
- **Network Status**: We detect WiFi connectivity to ensure jobs only run on unmetered connections. We do not collect WiFi network names or passwords.
- **Battery & Thermal State**: We monitor battery level, charging status, and thermal state to protect your device. This data is sent as part of heartbeat messages and is not stored long-term.
- **Device Identifier**: A unique identifier is generated locally on your device for Island registration. This is not linked to your Apple ID, Google account, or advertising identifiers.
- **ML Model Caching**: AI models downloaded for on-device inference are cached locally on your device. Model files are verified via SHA-256 hash and are not shared with third parties.
- **Job Execution Data**: Input data for Cargos is processed entirely on your device and streamed back to the coordinator. We do not retain Consumer input data on your device after job completion.
- **Camera**: The camera is used only for QR code scanning during device pairing. No images or video are stored or transmitted.
- **Background Activity**: The app may run in the background to process jobs. You can control this via device settings and in-app scheduling preferences.
- **No Tracking**: Our mobile apps do not use advertising identifiers (IDFA/GAID), do not contain third-party analytics SDKs, and do not track you across other apps or websites.

## How We Use Your Information

We use the information we collect to:

- **Provide Services**: Process your requests, route Cargos, and deliver results
- **Manage Accounts**: Create and manage your account and maintain Phase 2 virtual-credit balances
- **Improve Services**: Analyze usage patterns to improve performance and develop new features
- **Ensure Security**: Detect and prevent fraud, abuse, and security threats
- **Communicate**: Send service announcements, security alerts, and support messages
- **Comply with Law**: Meet legal obligations and respond to lawful requests

## How We Share Your Information

We do not sell your personal information. We share information only in these circumstances:

### With Service Providers
- **Stripe**: Identity or payment services when a feature explicitly requires them
- **Cloud infrastructure**: Hosting and data storage (EU-based)
- **Email services**: Transactional email delivery

### With Islands
- The selected Island receives the Job data needed to execute its Cargo. In standard execution mode, that data is available to the Island's execution environment while the Job runs.
- Islands do not receive your identity, account details, or payment information
- Geographic routing data is approximate (city-level) only

### For Legal Reasons
We may disclose information if required by law, court order, or government request, or to protect rights, safety, or property.

### Business Transfers
If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.

## Data Security

We implement appropriate technical and organizational measures to protect your information:

- **Transport Security**: Service and Island connections use encrypted transport
- **Access Controls**: Authenticated access, scoped API keys, and ownership checks protect service functions
- **Monitoring**: Operational metrics, health checks, and structured security logs support detection and investigation
- **Software Security**: Dependency scanning, signed Cargo artifacts, registry controls, and sandbox profiles reduce platform risk
- **Incident Response**: Documented procedures for security incident handling

## Data Retention

- **Account Data**: Retained while your account is active, then deleted within 30 days of account closure
- **Usage Logs**: Retained for 90 days for operational purposes
- **Payment Records**: Phase 2 does not create credit-purchase or Island-payout records. Records from any future paid service would be retained as required by applicable law.
- **Support Communications**: Retained for 2 years after resolution

## Your Rights

Depending on your location, you may have the following rights:

- **Access**: Request a copy of the personal information we hold about you
- **Correction**: Request correction of inaccurate information
- **Deletion**: Request deletion of your personal information
- **Portability**: Request your data in a machine-readable format
- **Objection**: Object to certain processing of your information
- **Restriction**: Request restriction of processing in certain circumstances

To exercise these rights, contact us at [hey@archipelag.io](mailto:hey@archipelag.io).

## International Data Transfers

Our primary infrastructure is located in the European Union. If you access our Services from outside the EU, your information may be transferred to, stored, and processed in the EU. We ensure appropriate safeguards are in place for any international transfers.

## Children's Privacy

Our Services are not directed to children under 16. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.

## Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of the Services after changes constitutes acceptance of the updated policy.

## Contact Us

If you have questions about this Privacy Policy or our privacy practices, contact us at:

- **Email**: [hey@archipelag.io](mailto:hey@archipelag.io)
- **Address**: Archipelag.io, Amsterdam, Netherlands

For data protection inquiries in the EU, you may also contact your local data protection authority.

---

*This policy is provided for informational purposes. For the legally binding terms, please refer to the [Terms of Service](/terms).*
