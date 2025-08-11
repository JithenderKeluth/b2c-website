// New Relic must be imported first, but only in production
if (process.env.NODE_ENV === 'production') {
  require('./newrelic');
}

console.log('Starting SSR server...');

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

import 'zone.js/node';
import { APP_BASE_HREF } from '@angular/common';
import express, { Router, Request } from 'express';
import { join, resolve } from 'path';
import { readFileSync, existsSync } from 'fs';
import { renderModule } from '@angular/platform-server';
import AppServerModule from '../app.server-export';
import secureProxyRoutes from './routes/secure-proxy.routes';
import bodyParser from 'body-parser';
import axios from 'axios';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';
import { apiConfig } from './config/apiConfig';

// 🔄 Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
    }
  }
}

const sessionStore = new Map<string, { status:string, session_id: string; cpysource: string }>();
const SESSION_COOKIE_NAME = 'custom_ssr_session';

export function app(): express.Express {
  console.log('Creating Express server...');
  const server = express();
  const router = Router();

  const serverDistFolder = __dirname;
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtmlPath = join(browserDistFolder, 'index.html');

  console.log('distFolder:', browserDistFolder);
  console.log('indexHtmlPath:', indexHtmlPath);

  if (!existsSync(indexHtmlPath)) {
    console.error('index.html not found at:', indexHtmlPath);
  }

  server.use(bodyParser.json());
  server.use(cookieParser());

  // ✅ Assign session ID via cookie
  server.use((req, res, next) => {
    let sessionId = req.cookies[SESSION_COOKIE_NAME];
    if (!sessionId) {
      sessionId = uuidv4();
      res.cookie(SESSION_COOKIE_NAME, sessionId, {
        httpOnly: true,
        sameSite: 'lax'
      });
    }
    req.sessionId = sessionId;
    next();
  });

  server.use('/server', secureProxyRoutes);
  router.use('/', express.static(browserDistFolder, { maxAge: '1y' }));

  const allowedPatterns = [
    /^ABSA\s*-\s*ANDROID\s*-\s*.*/i,
    /^ABSA\s*-\s*IOS\s*-\s*.*/i
  ];

  async function handleSSR(req: express.Request, res: express.Response, next: express.NextFunction) {
    const sessionId:any = req.sessionId;
    const existingSession = sessionId ? sessionStore.get(sessionId) : null;

    const isInitializerRoute = ['/start'].includes(req.originalUrl);

    if (isInitializerRoute) {
      const userAgent = req.get('User-Agent') || '';
      const authHeader = req.get('authorization') || '';

      if (process.env.NODE_ENV !== 'production' && process.env.ENV !== 'production') {
        console.log('Skipping User-Agent validation in development');
      } else {
        const isUserAgentValid = allowedPatterns.some(pattern => pattern.test(userAgent));
        if (!isUserAgentValid) {
          return res.status(403).json({ error: 'Forbidden: Invalid User-Agent', userAgent });
        }
      }

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
      }

      const token = authHeader.split(' ')[1];

      try {
        const response = await axios.post(
          `${apiConfig.mm_partnerProxyUrls}/absa/auth`,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            validateStatus: () => true
          }
        );

        if (response.status >= 400) {
          if (sessionId) sessionStore.delete(sessionId);
          return res.status(response.status).json(response.data);
        }

        if (response.data.redirectURL) {
          const parsed = new URL(response.data.redirectURL);
          const cpysource = parsed.searchParams.get('cpysource') || '';
          const absaSessionId = parsed.searchParams.get('session_id') || '';

          if (sessionId) {
            sessionStore.set(sessionId, {
              status:"success",
              cpysource,
              session_id: absaSessionId
            });
          }else {
            sessionStore.set(sessionId, {
              status:"error",
              cpysource,
              session_id: ''
            });
          }

          res.locals.injectSessionData = sessionStore.get(sessionId);
          return renderHtml(req, res);
        }
      } catch (error) {
        console.error('Auth failed:', error);
        if (sessionId) sessionStore.delete(sessionId);
        return res.status(500).json({ error: 'Internal server error during auth' });
      }
    }

    // ✅ For all other routes
    if (existingSession) {
      res.locals.injectSessionData = existingSession;
    } else {
      res.locals.injectSessionData = { status: '', session_id: '', cpysource: '' };
    }

    return renderHtml(req, res);
  }


  function renderHtml(req: express.Request, res: express.Response<any, Record<string, any>>) {
    try {
      const indexHtmlContent = readFileSync(indexHtmlPath, 'utf-8');

      renderModule(AppServerModule, {
        document: indexHtmlContent,
        url: req.originalUrl,
        extraProviders: [
          { provide: APP_BASE_HREF, useValue: req.baseUrl || '/' }
        ]
      }).then(html => {
        const sessionData = res.locals.injectSessionData || {};

        const sessionScript = `
          <script>
            window.sessionData = {
              'status': '${sessionData.status}',
              'session_id': '${sessionData.session_id || ''}',
              'cpysource': '${sessionData.cpysource || ''}'
            };
          </script>
        `;

        const htmlWithSession = html.replace('</body>', `${sessionScript}</body>`);
        res.send(htmlWithSession);
      }).catch(err => {
        console.error('SSR Rendering Error:', err);
        res.status(500).send(`
          <html>
            <head><title>SSR Failed</title></head>
            <body>
              <h1>Server-side rendering failed</h1>
              <pre>${err.message}</pre>
            </body>
          </html>
        `);
      });
    } catch (readErr) {
      console.error('Failed to read index.html:', readErr);
      res.status(500).send(`
        <html>
          <body>
            <h1>Critical server error</h1>
            <pre>${readErr.message}</pre>
          </body>
        </html>
      `);
    }
  }

// Routes
router.post('/start', handleSSR);

// SSR GET routes
router.get('/start', handleSSR);
router.get('/flights', handleSSR);
router.get('/booking', handleSSR);
router.get('/payment', handleSSR);
router.get('/my-account', handleSSR);
router.get('*', handleSSR);

  server.use('/', router);
  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;
  console.log(`Attempting to start server on port ${port}`);

  const serverInstance = app();
  serverInstance.listen(port, () => {
    console.log(`Angular SSR server running at http://localhost:${port}`);
  });
}

run();
