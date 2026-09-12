import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Serve Static Assets (Manifest, Icons, SW)
app.use('/manifest.json', serveStatic({ path: './public/manifest.json' }))
app.use('/sw.js', serveStatic({ path: './public/sw.js' }))
app.use('/icon-192.png', serveStatic({ path: './public/icon-192.png' }))
app.use('/icon-512.png', serveStatic({ path: './public/icon-512.png' }))

// Central API Documentation Hub with PWA Support
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>GPNet API Hub</title>
      <link rel="manifest" href="/manifest.json">
      <meta name="theme-color" content="#c8102e">
      <link rel="apple-touch-icon" href="/icon-192.png">
      <link rel="icon" type="image/png" href="/icon-192.png">
      <style>
        body { margin: 0; padding: 0; background: #fafafa; }
        .swagger-ui .topbar { background-color: #000 !important; }
      </style>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
      <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
      <script>
        window.onload = () => {
          const getSpecUrl = (path) => {
            if (window.location.hostname === 'localhost') {
              // Try to find the spec on the current port or 8788 (common for second worker)
              return path.startsWith('/ledger') ? 'http://localhost:8788' + path : path;
            }
            return path;
          };

          window.ui = SwaggerUIBundle({
            urls: [
              { url: getSpecUrl('/ledger/openapi.json'), name: 'Ledger API' }
            ],
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            layout: "StandaloneLayout",
            queryConfigEnabled: true
          });
        }
        if ('serviceWorker' in navigator) {
          window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(reg => {
              console.log('SW registered:', reg);
            }).catch(err => {
              console.log('SW registration failed:', err);
            });
          });
        }
      </script>
    </body>
    </html>
  `)
})

// Health Check
app.get('/health', (c) => c.json({ status: 'Hub Active' }))

export default app
