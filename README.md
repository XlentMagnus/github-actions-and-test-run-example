# Ärendelistan

Ett litet exempel-repo som visar ett helt flöde i miniatyr: backend, frontend, enhetstester och en GitHub Actions-pipeline som kör samma tester som du kör lokalt.

* **Backend:** Node.js med den inbyggda `http`-modulen, inga beroenden. Ärenden lagras i minnet.
* **Frontend:** Vite med vanlig JavaScript (inget ramverk).
* **Tester:** Enhetstester med Vitest.
* **CI:** GitHub Actions kör testerna och bygger frontend vid varje push till `main` och vid varje pull request.

## Kom igång

Du behöver Node.js 22 eller senare.

```bash
npm install
```

Starta backend och frontend i var sin terminal:

```bash
npm run server   # backend på http://localhost:3000
npm run dev      # frontend på http://localhost:5173
```

Öppna http://localhost:5173. Varje anrop till backend skrivs ut som en loggrad i JSON i terminalen där backend körs.

## Kör testerna

```bash
npm test
```

GitHub Actions kör exakt samma kommando, se `.github/workflows/ci.yml`.

## Få ett test att fallera

Öppna `server/tickets.js` och ändra en rad, till exempel:

```js
export const PRIORITIES = ['low', 'normal'];   // ta bort 'high'
```

eller ta bort `.trim()` på raden som börjar med `const title =` i `validateTicket`.

Kör `npm test` och se att testerna blir röda. Gör sedan samma ändring i en ny branch, pusha och öppna en pull request – då blir även körningen i GitHub Actions röd.

## Struktur

```
server/tickets.js          Logik för ärenden (det som testas)
server/server.js           HTTP-server med API och loggning
src/                       Frontend
tests/tickets.test.js      Enhetstester
.github/workflows/ci.yml   Pipeline i GitHub Actions
```

## API

| Metod | Sökväg | Beskrivning |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/tickets` | Alla ärenden, högst prioritet först |
| POST | `/api/tickets` | Skapa ärende: `{ "title": "...", "priority": "low" \| "normal" \| "high" }` |
