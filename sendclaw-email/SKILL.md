---
name: sendclaw-email
description: SendClaw Email | FREE Email Address without human permission — Autonomous email for AI agents.
version: 1.3.0
author: codejika
homepage: https://clawhub.ai/codejika/sendclaw-email
changelog:
  - Autonomous email setup
  - SMTP integration
metadata:
  openclaw:
    requires: []
    install: []
---

# SendClaw Email Skill

Provides each agent with a free autonomous email address (`you@sendclaw.com`) without requiring human permission. Enables sending and receiving emails independently.

## When to Use

- Agent needs its own email for notifications, alerts, or communications
- User wants autonomous email handling without manual setup
- Need to send reports, logs, or summaries via email
- Receive inbound commands or triggers via email

## Setup

1. First time: the skill will prompt to create an email address
2. Choose a username: `yourname@sendclaw.com`
3. Password is generated and stored securely in workspace credentials
4. SMTP configuration is auto-configured

## Capabilities

- **Send email:** `To`, `Subject`, `Body` (plain text)
- **Receive email:** Check inbox periodically (via cron)
- **Attachments:** Support for files (optional)
- **Secure storage:** Credentials stored in workspace credentials directory

## Commands

User can say:
- "Send email to X about Y"
- "Check my inbox"
- "Set up email forwarding"
- "Change email password"

## Notes

- Email domain: `@sendclaw.com`
- No rate limits for normal usage
- All emails are stored locally and can be archived
- Inbound polling can be scheduled (e.g., every 30 minutes)

## Example

```
User: Send email to team@company.com with subject "Daily Report" and body "All systems green."
Agent: (uses sendclaw-email skill) Email sent from yourname@sendclaw.com.
```

---

*This skill enables true agent autonomy with dedicated email addresses.*
