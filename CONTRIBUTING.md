# Contributing to ARS

Thank you for your interest in contributing to the **Autonomous Research Scientist** project! We welcome contributions of all kinds — bug fixes, new features, documentation improvements, and more.

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/ARS.git
   cd ARS
   ```
3. **Create a branch** for your change:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Install dependencies** for the service you are modifying:
   - **Frontend:** `cd ars-frontend && npm install`
   - **Backend:** `cd ars-backend && pip install -r requirements.txt`
   - **Agents:** `cd ars-agents && pip install -r requirements.txt`

## Development Guidelines

### Code Style
- **Python:** Follow [PEP 8](https://peps.python.org/pep-0008/). Use type hints where possible.
- **JavaScript/React:** Use ES6+ syntax. Prefer functional components and hooks.
- **CSS:** Use Tailwind utility classes. Avoid inline styles.

### Commit Messages
Use clear, descriptive commit messages following the [Conventional Commits](https://www.conventionalcommits.org/) standard:
```
feat: add hypothesis confidence visualization
fix: resolve PDF generation markdown stripping
docs: update README with architecture diagram
refactor: extract chart components from dashboard
```

### Testing
- Test your changes locally before submitting a PR.
- Ensure all three services (`ars-frontend`, `ars-backend`, `ars-agents`) start without errors.
- For frontend changes, verify across different screen sizes.

## Pull Request Process

1. Update documentation if your change affects the public API or user-facing behavior.
2. Ensure your branch is up to date with `main`.
3. Fill out the PR template completely.
4. Request a review from a maintainer.

## Reporting Bugs

Use the [Bug Report](https://github.com/Aadya242005/ARS/issues/new?template=bug_report.md) issue template.

## Requesting Features

Use the [Feature Request](https://github.com/Aadya242005/ARS/issues/new?template=feature_request.md) issue template.

## Code of Conduct

This project follows our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating.

---

Thank you for helping make ARS better! 🚀
