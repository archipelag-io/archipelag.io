+++
title = "Security"
description = "How Archipelag.io protects your data and ensures secure compute operations."
date = 2026-01-26
+++

Security is fundamental to Archipelag.io. We've designed our platform with security at every layer, ensuring both users and hosts can participate safely in our distributed compute network.

## Security Architecture

### Zero-Trust Model

We operate on a zero-trust security model where:

- **Users don't trust hosts**: All user data is encrypted and hosts never see plaintext content
- **Hosts don't trust workloads**: All workloads run in isolated containers with strict resource limits
- **The coordinator is the authority**: Cryptographically signed workloads and authenticated communications

### Encryption

- **In Transit**: All communications use TLS 1.3 with modern cipher suites
- **At Rest**: Sensitive data encrypted using AES-256-GCM
- **Workload Data**: End-to-end encryption for sensitive workload payloads
- **API Keys**: Hashed using Argon2id before storage

### Workload Isolation

Every workload on our network runs in complete isolation:

- **Container Sandboxing**: Docker containers with seccomp profiles and AppArmor
- **Resource Limits**: Strict CPU, memory, and network quotas
- **No Persistent Storage**: Workloads cannot write to host filesystems
- **Network Restrictions**: Outbound-only connections, no host network access
- **Signed Images**: Only cryptographically signed container images can execute

## Host Security

### Agent Security

The Archipelag.io host agent is designed with security as a priority:

- **Written in Rust**: Memory-safe language eliminates entire classes of vulnerabilities
- **Minimal Privileges**: Runs with least-privilege access
- **Automatic Updates**: Security patches delivered automatically
- **Open Source**: Agent code is available for security review

### Network Security

- **Outbound-Only**: Hosts never accept inbound connections
- **WireGuard VPN**: Encrypted tunnels for all coordinator communication
- **No Port Forwarding**: No router configuration or firewall changes required
- **IP Anonymization**: User IPs are not shared with hosts

## User Security

### Account Protection

- **Strong Password Requirements**: Minimum 12 characters with complexity requirements
- **OAuth Integration**: Secure authentication via GitHub
- **Session Management**: Automatic session expiration and secure token handling
- **API Key Scoping**: Fine-grained permissions for API keys

### Data Protection

- **Regional Processing**: Data processed in your geographic region by default
- **No Data Retention**: Workload inputs and outputs not stored after completion
- **Audit Logging**: Complete audit trail of account and API activity
- **Right to Deletion**: Request complete data deletion at any time

## Infrastructure Security

### Platform Security

- **EU Data Centers**: Primary infrastructure hosted in EU data centers
- **DDoS Protection**: Multi-layer DDoS mitigation
- **Web Application Firewall**: Protection against common web attacks
- **Regular Penetration Testing**: Third-party security assessments

### Monitoring & Response

- **24/7 Monitoring**: Automated security monitoring and alerting
- **Incident Response**: Documented procedures for security incidents
- **Vulnerability Management**: Regular scanning and patching
- **Security Logging**: Comprehensive logging for forensic analysis

## Compliance

We maintain security practices aligned with:

- **GDPR**: EU data protection requirements
- **SOC 2 Type II**: (In progress) Security, availability, and confidentiality controls
- **ISO 27001**: (Planned) Information security management

## Vulnerability Disclosure

We welcome responsible disclosure of security vulnerabilities.

### Reporting a Vulnerability

If you discover a security issue, please report it to:

**Email**: [hey@archipelag.io](mailto:hey@archipelag.io)

**PGP Key**: Available at [archipelag.io/.well-known/security.txt](/.well-known/security.txt)

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Your contact information (optional, for follow-up)

### Our Commitment

- **Acknowledgment**: We'll acknowledge receipt within 24 hours
- **Assessment**: Initial assessment within 72 hours
- **Resolution**: Critical issues addressed within 7 days
- **Credit**: Public acknowledgment for responsible disclosures (if desired)
- **No Legal Action**: We will not pursue legal action against good-faith researchers

### Scope

In-scope systems include:
- archipelag.io and all subdomains
- api.archipelag.io
- The host agent software
- Mobile applications

Out of scope:
- Third-party services (Stripe, GitHub)
- Social engineering attacks
- Physical attacks
- Denial of service testing

## Security Best Practices

### For Users

1. **Use Strong Passwords**: Or sign in with GitHub for OAuth security
2. **Protect API Keys**: Never commit keys to version control
3. **Monitor Usage**: Review your account activity regularly
4. **Enable Notifications**: Get alerts for account changes
5. **Report Suspicious Activity**: Contact us if you notice anything unusual

### For Hosts

1. **Keep Systems Updated**: Enable automatic updates for the agent
2. **Secure Your Network**: Use a firewall and secure your home network
3. **Monitor Resources**: Watch for unusual CPU or network activity
4. **Dedicated Hardware**: Consider using dedicated hardware for hosting
5. **Review Logs**: Periodically review agent logs for anomalies

## Security Updates

We publish security advisories for significant issues at:

- **Status Page**: [status.archipelag.io](https://status.archipelag.io)
- **Email Notifications**: Security alerts sent to registered users
- **GitHub**: Security advisories in our public repositories

## Contact

For security questions or concerns:

- **Security Team**: [hey@archipelag.io](mailto:hey@archipelag.io)
- **General Support**: [hey@archipelag.io](mailto:hey@archipelag.io)

---

*Security is an ongoing process. We continuously improve our security posture and welcome feedback from our community.*
