const form = document.querySelector('#ticket-form');
const list = document.querySelector('#ticket-list');
const message = document.querySelector('#message');

const priorityLabels = { low: 'Låg', normal: 'Normal', high: 'Hög' };

// Hämtar alla ärenden från backend och ritar om listan.
async function loadTickets() {
  const response = await fetch('/api/tickets');
  const tickets = await response.json();
  list.replaceChildren(...tickets.map(renderTicket));
}

// textContent (inte innerHTML) gör att text från användare aldrig tolkas som HTML.
function renderTicket(ticket) {
  const li = document.createElement('li');
  const badge = document.createElement('span');
  badge.className = `badge ${ticket.priority}`;
  badge.textContent = priorityLabels[ticket.priority];
  const title = document.createElement('span');
  title.textContent = ticket.title;
  li.append(badge, title);
  return li;
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const response = await fetch('/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (response.ok) {
    message.textContent = '';
    form.reset();
    await loadTickets();
  } else {
    const { errors } = await response.json();
    message.textContent = errors.join(', ');
  }
});

loadTickets().catch(() => {
  message.textContent = 'Kunde inte nå backend. Har du startat den med npm run server?';
});
