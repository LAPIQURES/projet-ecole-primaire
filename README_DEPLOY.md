# Déploiement - Plateforme École

Brève checklist et commandes pour construire et déployer l'application.

Prerequis:
- Node.js 18+ (recommandé 20+)
- MySQL accessible et variables d'environnement (`.env`) configurées
- Ports libres: backend 5000, frontend 3000/3002

1) Installer dépendances
```bash
npm install
cd backend
npm install
```

2) Variables d'environnement
- Copier `.env.example` vers `.env` et ajuster `DB_*`, `JWT_SECRET`, etc.

3) Build production frontend
```bash
npm run build
```
- Ceci génère `dist/` prêt à servir.

4) Démarrer backend en production
```bash
cd backend
NODE_ENV=production node server.js
```
- Ou utiliser PM2 / systemd pour processus durable.

5) Déploiement recommandé
- Mettre le `dist/` derrière un CDN ou serveur statique (nginx).
- API sur un serveur Node accessible via reverse-proxy (nginx).

6) Exécuter la suite E2E (locally)
```bash
npm install --save-dev @playwright/test
npx playwright install
npm run test:e2e
```

7) CI snippet (GitHub Actions) - exemple
```yaml
name: E2E Tests
on: [push]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: {node-version: '20'}
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

Notes:
- Les tests Playwright utilisent des tokens `dev:*` pour bypass auth en local.
- Pour production, veillez à configurer correctement `JWT_SECRET`.
