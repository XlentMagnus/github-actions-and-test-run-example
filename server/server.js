// Minimal backend med Nodes inbyggda http-modul (inga beroenden).
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { validateTicket, createTicket, sortByPriority } from './tickets.js';

const PORT = process.env.PORT ?? 3000;
const MAX_BODY_BYTES = 10_000;

// Datalagring i minnet – försvinner när servern startas om.
const tickets = [];
let nextId = 1;

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

// Läser och tolkar en JSON-body, med en övre gräns för storleken.
async function readJson(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > MAX_BODY_BYTES) throw new Error('För stor body');
  }
  return JSON.parse(body);
}

const server = createServer(async (req, res) => {
  const requestId = randomUUID();
  const started = Date.now();

  // En strukturerad loggrad (JSON) per anrop när svaret är skickat.
  res.on('finish', () => {
    console.log(JSON.stringify({
      time: new Date().toISOString(),
      level: res.statusCode >= 500 ? 'error' : 'info',
      requestId,
      method: req.method,
      path: req.url,
      status: res.statusCode,
      ms: Date.now() - started
    }));
  });

  try {
    if (req.method === 'GET' && req.url === '/api/health') {
      return sendJson(res, 200, { status: 'ok' });
    }
    if (req.method === 'GET' && req.url === '/api/tickets') {
      return sendJson(res, 200, sortByPriority(tickets));
    }
    if (req.method === 'POST' && req.url === '/api/tickets') {
      let input;
      try {
        input = await readJson(req);
      } catch {
        return sendJson(res, 400, { errors: ['Ogiltig JSON'] });
      }
      const errors = validateTicket(input);
      if (errors.length > 0) {
        return sendJson(res, 400, { errors });
      }
      const ticket = createTicket(input, nextId++);
      tickets.push(ticket);
      return sendJson(res, 201, ticket);
    }
    sendJson(res, 404, { errors: ['Hittades inte'] });
  } catch {
    // Skicka aldrig interna feldetaljer till klienten.
    sendJson(res, 500, { errors: ['Internt fel'] });
  }
});

server.listen(PORT, () => {
  console.log(`Backend lyssnar på http://localhost:${PORT}`);
});
