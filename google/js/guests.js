/**
 * Celebráti AI - Guest & RSVP Tracker Module
 * RSVP status counts, dietary requirements breakdown, and table seating assignments
 */

import { EventStorageManager } from './events-data.js';

export class GuestManager {
  constructor(app) {
    this.app = app;
  }

  render() {
    const event = EventStorageManager.getActiveEvent();
    if (!event) return;

    this.renderKPIs(event);
    this.renderDietaryStats(event);
    this.renderGuestList(event);
    this.bindEvents();
  }

  renderKPIs(event) {
    const guests = event.guests || [];
    let totalInvited = 0;
    let confirmed = 0;
    let declined = 0;
    let pending = 0;

    guests.forEach(g => {
      const count = Number(g.count) || 1;
      totalInvited += count;
      if (g.rsvp === 'accepted') confirmed += count;
      else if (g.rsvp === 'declined') declined += count;
      else pending += count;
    });

    const targetCount = event.guestCount || totalInvited;
    const pct = targetCount > 0 ? Math.round((confirmed / targetCount) * 100) : 0;

    // KPI on overview tab
    const kpiVal = document.getElementById('kpiGuestVal');
    const kpiSub = document.getElementById('kpiGuestSub');
    const kpiBar = document.getElementById('kpiGuestBar');

    if (kpiVal) kpiVal.textContent = `${confirmed} / ${targetCount}`;
    if (kpiSub) kpiSub.textContent = `${pending} RSVPs still awaiting response`;
    if (kpiBar) kpiBar.style.width = `${pct}%`;

    // Stats cards on guest tab
    const elTotal = document.getElementById('guestStatTotal');
    const elConfirmed = document.getElementById('guestStatConfirmed');
    const elPending = document.getElementById('guestStatPending');
    const elDeclined = document.getElementById('guestStatDeclined');

    if (elTotal) elTotal.textContent = targetCount;
    if (elConfirmed) elConfirmed.textContent = confirmed;
    if (elPending) elPending.textContent = pending;
    if (elDeclined) elDeclined.textContent = declined;
  }

  renderDietaryStats(event) {
    const container = document.getElementById('dietaryStatsContainer');
    if (!container) return;

    const guests = event.guests || [];
    const dietMap = {};

    guests.forEach(g => {
      if (g.rsvp === 'accepted' && g.dietary && g.dietary !== 'None') {
        dietMap[g.dietary] = (dietMap[g.dietary] || 0) + (Number(g.count) || 1);
      }
    });

    const entries = Object.entries(dietMap);
    if (entries.length === 0) {
      container.innerHTML = `<span style="font-size: 0.82rem; color: var(--text-muted);">No special dietary restrictions logged among confirmed guests yet.</span>`;
      return;
    }

    container.innerHTML = entries.map(([diet, count]) => {
      return `
        <div style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.35rem 0.75rem; border-radius: var(--radius-full); background: rgba(244, 114, 182, 0.15); border: 1px solid rgba(244, 114, 182, 0.3); font-size: 0.8rem; font-weight: 600; color: #f472b6;">
          <span>🥗 ${diet}:</span>
          <strong>${count}</strong>
        </div>
      `;
    }).join('');
  }

  renderGuestList(event) {
    const tbody = document.getElementById('guestTableBody');
    if (!tbody) return;

    const guests = event.guests || [];

    if (guests.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">
            No guests added yet. Click "+ Add Guest" to start building your guest list!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = guests.map(guest => {
      const statusClass = guest.rsvp === 'accepted' ? 'paid' : guest.rsvp === 'declined' ? 'deposit' : 'pending';
      const statusLabel = guest.rsvp === 'accepted' ? 'Attending' : guest.rsvp === 'declined' ? 'Declined' : 'Awaiting RSVP';

      return `
        <tr data-id="${guest.id}">
          <td style="font-weight: 600; color: var(--text-primary);">${guest.name}</td>
          <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
          <td style="font-family: var(--font-mono); font-weight: 600;">${guest.count || 1}</td>
          <td>
            <span style="font-size: 0.82rem; ${guest.dietary && guest.dietary !== 'None' ? 'color: var(--accent-rose); font-weight: 600;' : 'color: var(--text-muted);'}">
              ${guest.dietary || 'None'}
            </span>
          </td>
          <td style="color: var(--text-secondary);">${guest.table || 'Unassigned'}</td>
          <td style="text-align: right;">
            <button class="btn-icon btn-delete-guest" data-id="${guest.id}" style="width: 28px; height: 28px; color: var(--accent-ruby); display: inline-flex;" title="Delete Guest">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  bindEvents() {
    document.querySelectorAll('.btn-delete-guest').forEach(btn => {
      btn.onclick = (e) => {
        const id = e.currentTarget.dataset.id;
        this.deleteGuest(id);
      };
    });
  }

  deleteGuest(id) {
    const event = EventStorageManager.getActiveEvent();
    event.guests = (event.guests || []).filter(g => g.id !== id);
    EventStorageManager.updateActiveEvent(event);
    this.render();
    if (this.app?.showToast) this.app.showToast('Guest removed from list', 'info');
  }

  saveGuestFromModal() {
    const event = EventStorageManager.getActiveEvent();
    const name = document.getElementById('guestNameInput').value.trim();
    const count = Number(document.getElementById('guestPartyCountInput').value) || 1;
    const rsvp = document.getElementById('guestRsvpSelect').value;
    const dietary = document.getElementById('guestDietaryInput').value.trim() || 'None';
    const table = document.getElementById('guestTableInput').value.trim() || 'Unassigned';

    if (!name) {
      alert('Please enter a guest or household name');
      return;
    }

    if (!event.guests) event.guests = [];
    event.guests.push({
      id: 'g_' + Date.now(),
      name,
      count,
      rsvp,
      dietary,
      table
    });

    EventStorageManager.updateActiveEvent(event);
    this.app.closeModal('guestModal');
    this.render();
    if (this.app?.showToast) this.app.showToast('Guest added to guest list', 'success');
  }
}
