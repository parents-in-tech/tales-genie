# Security Policy

## Supported versions

Only the latest code on `main` (which is what runs at [talesgenie.parentsintech.org](https://talesgenie.parentsintech.org)) is supported.

## Reporting a vulnerability

Please **do not open a public issue** for security problems. Instead:

- Use [GitHub private vulnerability reporting](https://github.com/parents-in-tech/tales-genie/security/advisories/new), or
- Email the maintainer at hello@parentsintech.org.

You should get a response within a few days. Please include steps to reproduce and the impact you believe the issue has.

## Scope

Because this app is aimed at children, we treat the following as security issues in addition to the usual ones:

- Bypasses of the kid-safety content constraints (getting the genie to produce non-age-appropriate stories or images)
- Bypasses of rate limiting or prompt-length caps
- Any way to make the Worker leak secrets or serve content from another origin
