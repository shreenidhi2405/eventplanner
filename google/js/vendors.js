/**
 * Celebráti AI - Vendor Management & Checklist Module
 * Organizes vendor categories, deposits, contracts, contact records & interview checklists
 */

import { EventStorageManager } from './events-data.js';

export class VendorManager {
  constructor(app) {
    this.app = app;
    this.currentCategory = 'all';
  }

  render() {
    const event = EventStorageManager.getActiveEvent();
    if (!event) return;

    this.updateKPI(event);
    this.renderVendors(event);
    this.bindEvents();
  }

  updateKPI(event) {
    const vendors = event.vendors || [];
    const total = vendors.length;
    const booked = vendors.filter(v => v.status === 'contracted' || v.status === 'paid').length;
    const pct = total > 0 ? Math.round((booked / total) * 100) : 0;

    const kpiVal = document.getElementById('kpiVendorVal');
    const kpiSub = document.getElementById('kpiVendorSub');
    const kpiBar = document.getElementById('kpiVendorBar');

    if (kpiVal) kpiVal.textContent = `${booked}/${total}`;
    if (kpiSub) kpiSub.textContent = `${pct}% confirmed & contracted`;
    if (kpiBar) kpiBar.style.width = `${pct}%`;
  }

  renderVendors(event) {
    const container = document.getElementById('vendorsGridContainer');
    if (!container) return;

    const cur = event.currency || '$';
    let vendors = event.vendors || [];

    if (this.currentCategory !== 'all') {
      vendors = vendors.filter(v => v.category.toLowerCase() === this.currentCategory.toLowerCase());
    }

    if (vendors.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted); background: var(--surface-card); border-radius: var(--radius-lg);">
          No vendors found in this category. Click "+ Add Vendor" to add a new partner or quote!
        </div>
      `;
      return;
    }

    container.innerHTML = vendors.map(vendor => {
      const statusClass = vendor.status === 'paid' ? 'paid' : vendor.status === 'contracted' ? 'booked' : 'in-talks';
      const statusLabel = vendor.status === 'paid' ? 'Paid in Full' : vendor.status === 'contracted' ? 'Contract Signed' : 'In Negotiation';

      return `
        <div class="vendor-card" data-id="${vendor.id}">
          <div>
            <div class="vendor-top-row">
              <span class="vendor-category-badge">${vendor.category}</span>
              <span class="status-badge ${statusClass}">${statusLabel}</span>
            </div>
            <div class="vendor-name">${vendor.name}</div>
            
            <div class="vendor-contact-info">
              ${vendor.contact ? `
                <div class="vendor-contact-row">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <span>${vendor.contact}</span>
                </div>
              ` : ''}
              ${vendor.phone ? `
                <div class="vendor-contact-row">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  <a href="tel:${vendor.phone}" style="color: var(--accent-rose);">${vendor.phone}</a>
                </div>
              ` : ''}
              ${vendor.email ? `
                <div class="vendor-contact-row">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  <span>${vendor.email}</span>
                </div>
              ` : ''}
            </div>

            <div class="vendor-quote-box">
              <div>
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Quoted Fee</div>
                <div class="vendor-quote-num">${cur}${(Number(vendor.quote) || 0).toLocaleString()}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Deposit Paid</div>
                <div class="vendor-deposit-tag">${cur}${(Number(vendor.depositPaid) || 0).toLocaleString()}</div>
              </div>
            </div>

            ${vendor.checklist && vendor.checklist.length > 0 ? `
              <div class="vendor-checklist-preview">
                <div class="vendor-checklist-title">Deliverables & Vetting Checklist</div>
                <div class="vendor-checklist-items">
                  ${vendor.checklist.map((c, idx) => `
                    <label class="vendor-checklist-item">
                      <input type="checkbox" data-vendor-id="${vendor.id}" data-idx="${idx}" ${c.done ? 'checked' : ''}>
                      <span style="${c.done ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${c.text}</span>
                    </label>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem; padding-top: 0.75rem; border-top: 1px solid var(--border-subtle);">
            <button class="btn-pill btn-secondary btn-ask-vendor-ai" data-category="${vendor.category}" style="font-size: 0.76rem; padding: 0.35rem 0.75rem;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 13px; height: 13px;"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              Interview Questions
            </button>
            <button class="btn-icon btn-delete-vendor" data-id="${vendor.id}" style="width: 28px; height: 28px; color: var(--accent-ruby);" title="Remove Vendor">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  bindEvents() {
    // Category filters
    document.querySelectorAll('.vendor-filter-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.vendor-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategory = btn.dataset.category || 'all';
        this.render();
      };
    });

    // Checkbox toggling for checklist items
    document.querySelectorAll('input[type="checkbox"][data-vendor-id]').forEach(checkbox => {
      checkbox.onchange = (e) => {
        const vendorId = e.target.dataset.vendorId;
        const idx = parseInt(e.target.dataset.idx, 10);
        this.toggleChecklistItem(vendorId, idx, e.target.checked);
      };
    });

    // Ask AI questions for this vendor category
    document.querySelectorAll('.btn-ask-vendor-ai').forEach(btn => {
      btn.onclick = (e) => {
        const cat = e.currentTarget.dataset.category;
        this.app.sendCustomAIPrompt(`What are the top 5 questions and contractual red flags I must check before hiring our ${cat}?`);
      };
    });

    // Delete vendor
    document.querySelectorAll('.btn-delete-vendor').forEach(btn => {
      btn.onclick = (e) => {
        const id = e.currentTarget.dataset.id;
        this.deleteVendor(id);
      };
    });
  }

  toggleChecklistItem(vendorId, idx, checked) {
    const event = EventStorageManager.getActiveEvent();
    const vendor = (event.vendors || []).find(v => v.id === vendorId);
    if (vendor && vendor.checklist && vendor.checklist[idx]) {
      vendor.checklist[idx].done = checked;
      EventStorageManager.updateActiveEvent(event);
      this.render();
    }
  }

  deleteVendor(id) {
    const event = EventStorageManager.getActiveEvent();
    event.vendors = (event.vendors || []).filter(v => v.id !== id);
    EventStorageManager.updateActiveEvent(event);
    this.render();
    if (this.app?.showToast) this.app.showToast('Vendor removed from directory', 'info');
  }

  saveVendorFromModal() {
    const event = EventStorageManager.getActiveEvent();
    const name = document.getElementById('vendorNameInput').value.trim();
    const category = document.getElementById('vendorCategorySelect').value;
    const contact = document.getElementById('vendorContactInput').value.trim();
    const phone = document.getElementById('vendorPhoneInput').value.trim();
    const email = document.getElementById('vendorEmailInput').value.trim();
    const quote = Number(document.getElementById('vendorQuoteInput').value) || 0;
    const depositPaid = Number(document.getElementById('vendorDepositInput').value) || 0;
    const status = document.getElementById('vendorStatusSelect').value;
    const notes = document.getElementById('vendorNotesInput').value.trim();

    if (!name) {
      alert('Please enter a vendor company or provider name');
      return;
    }

    if (!event.vendors) event.vendors = [];
    event.vendors.push({
      id: 'v_' + Date.now(),
      name,
      category,
      contact,
      phone,
      email,
      quote,
      depositPaid,
      status,
      notes,
      checklist: [
        { text: 'Confirm arrival time and loading access', done: false },
        { text: 'Verify liability insurance certificate', done: false }
      ]
    });

    EventStorageManager.updateActiveEvent(event);
    this.app.closeModal('vendorModal');
    this.render();
    if (this.app?.showToast) this.app.showToast('New vendor successfully added', 'success');
  }
}
