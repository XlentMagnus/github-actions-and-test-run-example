import { describe, it, expect } from 'vitest';
import {
  validateTicket,
  createTicket,
  sortByPriority,
  MAX_TITLE_LENGTH
} from '../server/tickets.js';

describe('validateTicket', () => {
  it('godkänner ett ärende med titel', () => {
    expect(validateTicket({ title: 'Skrivaren fungerar inte' })).toEqual([]);
  });

  it('nekar ett ärende utan titel', () => {
    expect(validateTicket({})).toContain('Titel saknas');
  });

  it('nekar en titel som bara består av mellanslag', () => {
    expect(validateTicket({ title: '   ' })).toContain('Titel saknas');
  });

  it('godkänner en titel som är exakt så lång som gränsen', () => {
    expect(validateTicket({ title: 'a'.repeat(MAX_TITLE_LENGTH) })).toEqual([]);
  });

  it('nekar en titel som är längre än gränsen', () => {
    const errors = validateTicket({ title: 'a'.repeat(MAX_TITLE_LENGTH + 1) });
    expect(errors).toHaveLength(1);
  });

  it('godkänner prioriteterna low, normal och high', () => {
    for (const priority of ['low', 'normal', 'high']) {
      expect(validateTicket({ title: 'Test', priority })).toEqual([]);
    }
  });

  it('nekar en okänd prioritet', () => {
    const errors = validateTicket({ title: 'Test', priority: 'akut!!' });
    expect(errors).toContain('Ogiltig prioritet');
  });

  it('nekar en titel som inte är en sträng', () => {
    expect(validateTicket({ title: { $ne: null } })).toContain('Titel saknas');
  });
});

describe('createTicket', () => {
  it('sätter prioritet normal om ingen anges', () => {
    const ticket = createTicket({ title: 'Test' }, 1);
    expect(ticket.priority).toBe('normal');
  });

  it('tar bort mellanslag runt titeln', () => {
    const ticket = createTicket({ title: '  Test  ' }, 1);
    expect(ticket.title).toBe('Test');
  });

  it('använder angivet id och angiven tid', () => {
    const now = new Date('2026-11-24T10:00:00.000Z');
    const ticket = createTicket({ title: 'Test' }, 7, now);
    expect(ticket.id).toBe(7);
    expect(ticket.createdAt).toBe('2026-11-24T10:00:00.000Z');
    expect(ticket.done).toBe(false);
  });
});

describe('sortByPriority', () => {
  it('lägger hög prioritet först', () => {
    const sorted = sortByPriority([
      { title: 'a', priority: 'low' },
      { title: 'b', priority: 'high' },
      { title: 'c', priority: 'normal' }
    ]);
    expect(sorted.map(t => t.priority)).toEqual(['high', 'normal', 'low']);
  });

  it('ändrar inte originallistan', () => {
    const original = [{ priority: 'low' }, { priority: 'high' }];
    sortByPriority(original);
    expect(original[0].priority).toBe('low');
  });
});
