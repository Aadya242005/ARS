# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x     | ✅ Active support  |
| 1.x     | ❌ No longer supported |

## Reporting a Vulnerability

If you discover a security vulnerability in ARS, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email: **aadya02dps@gmail.com**

Include the following in your report:
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Suggested fix (if any)

## Response Timeline

- **Acknowledgment:** Within 48 hours
- **Initial Assessment:** Within 5 business days
- **Fix/Patch:** Depending on severity, typically within 14 days

## Security Best Practices in ARS

- All API keys and secrets are stored in `.env` files which are **never committed** to version control.
- The `.gitignore` file explicitly excludes `.env`, `.env.*`, and `**/.env`.
- No hardcoded credentials exist in the codebase.
- All user inputs are validated and sanitized before processing.
- CORS policies are configured to restrict unauthorized cross-origin requests.

## Dependency Management

- Dependencies are regularly reviewed for known vulnerabilities.
- We recommend running `npm audit` (frontend) and `pip audit` (backend) before deploying.
