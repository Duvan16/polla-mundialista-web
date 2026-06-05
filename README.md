# Polla Mundialista — Web

Angular 17 frontend for a private World Cup prediction pool.

**Backend repo:** [polla-mundialista-api](https://github.com/Duvan16/polla-mundialista-api) (.NET 8 / Azure)

---

## Prerequisites

- Node.js 20+
- Angular CLI 17: `npm install -g @angular/cli@17`

---

## Local development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:4200)
ng serve --configuration development
```

The dev build reads `src/environments/environment.ts`.  
Set `apiUrl` there to point at your local or hosted API:

```ts
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000',   // local .NET API
};
```

If the API runs on a different port, add a proxy config:

```json
// proxy.conf.json
{
  "/api": {
    "target": "http://localhost:5000",
    "changeOrigin": true
  }
}
```

Then start with `ng serve --proxy-config proxy.conf.json`.

---

## Production build

```bash
ng build --configuration production
```

Output goes to `dist/polla-mundialista-web/browser/`.

The production build uses `src/environments/environment.prod.ts`:

```ts
export const environment = {
  production: true,
  apiUrl: 'https://polla-mundialista-api.azurewebsites.net',
};
```

Update `apiUrl` to match your deployed backend before building.

---

## Docker

```bash
# Build image
docker build -t polla-mundialista-web .

# Run locally
docker run -p 8080:80 polla-mundialista-web

# Open http://localhost:8080
```

The Dockerfile is a two-stage build (Node builder → nginx server).  
nginx is configured in `nginx.conf` to serve the Angular SPA with proper
client-side routing fallback and long-lived cache headers for hashed assets.

---

## Deployment options

### Option A — Azure App Service (Docker)

1. Push the image to Azure Container Registry (ACR):

```bash
az acr build \
  --registry <your-acr-name> \
  --image polla-mundialista-web:latest .
```

2. Create a Web App for Containers targeting that image.

3. Set the App Service port to `80` (WEBSITES_PORT = 80).

### Option B — Azure Static Web Apps

Azure SWA serves static files natively — no nginx needed.

1. Build locally or via GitHub Actions:

```bash
ng build --configuration production
```

2. Deploy with the SWA CLI:

```bash
npm install -g @azure/static-web-apps-cli
swa deploy ./dist/polla-mundialista-web/browser \
  --deployment-token <your-token> \
  --env production
```

3. Add a `staticwebapp.config.json` at the project root to enable SPA routing:

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/assets/*", "/*.{css,js,ico,png,svg}"]
  }
}
```

### GitHub Actions CI/CD (Static Web Apps)

Azure provides a ready-made workflow when you link a GitHub repo in the
Azure portal. The generated workflow runs `ng build --configuration production`
and deploys the output folder automatically on every push to `main`.

---

## Environment variables at runtime (Docker/App Service)

If you want to inject the API URL at container start time instead of baking
it into the image, use a small shell script that replaces a placeholder in
built JS files before nginx starts. Example `docker-entrypoint.sh`:

```bash
#!/bin/sh
find /usr/share/nginx/html -name '*.js' -exec \
  sed -i "s|__API_URL__|${API_URL}|g" {} \;
nginx -g 'daemon off;'
```

Then set `apiUrl: '__API_URL__'` in `environment.prod.ts` and pass
`-e API_URL=https://...` to `docker run`.

---

## Project structure

```
src/
├── app/
│   ├── core/          # Auth, guards, interceptors, models, services
│   ├── features/      # auth · matches · leaderboard · admin (lazy-loaded)
│   └── shared/        # Shell layout, reusable components
└── environments/      # environment.ts / environment.prod.ts
```

## Available scripts

| Command | Description |
|---|---|
| `ng serve` | Dev server with hot reload |
| `ng build` | Production build |
| `ng test` | Unit tests (Karma) |
| `ng lint` | ESLint |
