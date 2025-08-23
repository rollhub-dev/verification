# Rollhub Game Verifiers

Deterministic, client-side verification tools for Rollhub games.

### Live Demo
- Pages: https://rollhub-dev.github.io/verification

### Structure
- `index.html` — landing page linking to all verifiers
- `pages/` — game verifiers (HTML only)
  - `crash.html` + root `crash.js`
  - `dice99.html` + `scripts/dice99_legacy.js`
  - `dice99_v2.html` + `scripts/dice99_v2.js`
  - `limbo99.html` + `scripts/limbo99.js`
  - `mines99.html` + `scripts/mines99.js`
- `scripts/utils/deterministic.js` — shared deterministic helpers (SHA-384 + AES-CTR)
- `assets/main.css` — shared styling

### Local Usage
Open `index.html` directly in your browser, or serve locally:

```bash
npx http-server . -p 8080
```

### Contributing
See [CONTRIBUTING.md](./CONTRIBUTING.md). By participating you agree to the [Code of Conduct](./CODE_OF_CONDUCT.md).

### License
[MIT](./LICENSE)
