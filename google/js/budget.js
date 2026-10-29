/**
 * Celebráti AI - Budget & Expense Tracker Module
 * Calculates financial metrics, renders high-DPI interactive Donut Chart, and manages line items
 */

import { EventStorageManager } from './events-data.js';

export class BudgetManager {
  constructor(app) {
    this.app = app;
    this.currentFilter = 'all';
    this.colors = [
      '#ec4899', '#8b5cf6', '#f59e0b', '#10b981', '#06b6d4', 
      '#f43f5e', '#6366f1', '#eab308', '#14b8a6', '#a855f7'
    ];
  }

  render() {
    const event = EventStorageManager.getActiveEvent();
    if (!event) return;

    this.renderStats(event);
    this.renderChart(event);
    this.renderTable(event);
    this.bindEvents();
  }

  renderStats(event) {
    const cur = event.currency || '$';
    const target = Number(event.targetBudget) || 0;
    const items = event.budget || [];

    const totalEstimated = items.reduce((sum, item) => sum + (Number(item.estimated) || 0), 0);
    const totalActual = items.reduce((sum, item) => sum + (Number(item.actual) || 0), 0);
    const remaining = target - totalActual;
    const isOver = remaining < 0;

    const targetEl = document.getElementById('statTargetBudget');
    const spentEl = document.getElementById('statActualSpent');
    const remainingEl = document.getElementById('statRemainingBudget');
    const remainingBox = document.getElementById('boxRemainingBudget');

    if (targetEl) targetEl.textContent = `${cur}${target.toLocaleString()}`;
    if (spentEl) spentEl.textContent = `${cur}${totalActual.toLocaleString()}`;
    if (remainingEl) {
      remainingEl.textContent = `${cur}${Math.abs(remaining).toLocaleString()}${isOver ? ' (Over)' : ''}`;
    }
    if (remainingBox) {
      remainingBox.className = `budget-stat-box ${isOver ? 'overbudget' : 'remaining'}`;
    }

    // Update KPI on Overview tab as well
    const kpiSpent = document.getElementById('kpiBudgetSpent');
    const kpiSub = document.getElementById('kpiBudgetSub');
    const kpiBar = document.getElementById('kpiBudgetBar');
    if (kpiSpent) kpiSpent.textContent = `${cur}${totalActual.toLocaleString()}`;
    if (kpiSub) kpiSub.textContent = `Target: ${cur}${target.toLocaleString()}`;
    if (kpiBar) {
      const pct = target > 0 ? Math.min(100, Math.round((totalActual / target) * 100)) : 0;
      kpiBar.style.width = `${pct}%`;
    }
  }

  getCategoryBreakdown(items) {
    const catMap = {};
    items.forEach(item => {
      const cat = item.category || 'Other';
      const val = Number(item.actual) || Number(item.estimated) || 0;
      catMap[cat] = (catMap[cat] || 0) + val;
    });
    return Object.entries(catMap).map(([cat, val], idx) => ({
      category: cat,
      amount: val,
      color: this.colors[idx % this.colors.length]
    }));
  }

  renderChart(event) {
    const canvas = document.getElementById('budgetDonutChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const items = event.budget || [];
    const breakdown = this.getCategoryBreakdown(items);
    const total = breakdown.reduce((sum, b) => sum + b.amount, 0);

    // Setup high DPI
    const dpr = window.devicePixelRatio || 1;
    const size = 240;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 95;
    const innerRadius = 65;

    if (total === 0) {
      // Empty placeholder ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.arc(centerX, centerY, innerRadius, 2 * Math.PI, 0, true);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fill();
      return;
    }

    let startAngle = -0.5 * Math.PI;

    breakdown.forEach(item => {
      const sliceAngle = (item.amount / total) * (2 * Math.PI);
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.shadowColor = item.color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      startAngle = endAngle;
    });

    // Render legend
    const legendEl = document.getElementById('budgetChartLegend');
    if (legendEl) {
      legendEl.innerHTML = breakdown.map(b => {
        const pct = total > 0 ? Math.round((b.amount / total) * 100) : 0;
        return `
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.82rem; padding: 0.25rem 0;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="width: 10px; height: 10px; border-radius: 50%; background: ${b.color};"></span>
              <span style="color: var(--text-secondary);">${b.category}</span>
            </div>
            <span style="font-weight: 600; color: var(--text-primary);">${event.currency || '$'}${b.amount.toLocaleString()} (${pct}%)</span>
          </div>
        `;
      }).join('');
    }
  }

  renderTable(event) {
    const tbody = document.getElementById('budgetTableBody');
    if (!tbody) return;

    const cur = event.currency || '$';
    let items = event.budget || [];

    if (this.currentFilter !== 'all') {
      items = items.filter(it => it.category.toLowerCase() === this.currentFilter.toLowerCase());
    }

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
            No expenses found in this category. Click "+ Add Expense" or ask Aura AI to generate allocations!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = items.map(item => {
      const statusClass = item.status === 'paid' ? 'paid' : item.status === 'deposit' ? 'deposit' : 'pending';
      const statusLabel = item.status === 'paid' ? 'Fully Paid' : item.status === 'deposit' ? 'Deposit Paid' : 'Pending';

      return `
        <tr data-id="${item.id}">
          <td>
            <div class="item-name-cell">
              <span>${item.name}</span>
            </div>
            ${item.notes ? `<div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">${item.notes}</div>` : ''}
          </td>
          <td><span class="category-tag">${item.category}</span></td>
          <td style="font-family: var(--font-mono); font-weight: 600;">${cur}${(Number(item.estimated) || 0).toLocaleString()}</td>
          <td style="font-family: var(--font-mono); font-weight: 700; color: var(--text-primary);">${cur}${(Number(item.actual) || 0).toLocaleString()}</td>
          <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
          <td style="text-align: right;">
            <button class="btn-icon btn-edit-expense" data-id="${item.id}" title="Edit Expense" style="width: 30px; height: 30px; display: inline-flex;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn-icon btn-delete-expense" data-id="${item.id}" title="Delete Expense" style="width: 30px; height: 30px; display: inline-flex; color: var(--accent-ruby);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  bindEvents() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.budget-filter-btn');
    filterButtons.forEach(btn => {
      btn.onclick = () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.dataset.category || 'all';
        this.renderTable(EventStorageManager.getActiveEvent());
      };
    });

    // Delete handlers
    document.querySelectorAll('.btn-delete-expense').forEach(btn => {
      btn.onclick = (e) => {
        const id = e.currentTarget.dataset.id;
        this.deleteExpense(id);
      };
    });

    // Edit handlers
    document.querySelectorAll('.btn-edit-expense').forEach(btn => {
      btn.onclick = (e) => {
        const id = e.currentTarget.dataset.id;
        this.openEditExpenseModal(id);
      };
    });
  }

  deleteExpense(id) {
    const event = EventStorageManager.getActiveEvent();
    event.budget = (event.budget || []).filter(item => item.id !== id);
    EventStorageManager.updateActiveEvent(event);
    this.render();
    if (this.app?.showToast) this.app.showToast('Expense item removed', 'info');
  }

  openEditExpenseModal(id) {
    const event = EventStorageManager.getActiveEvent();
    const item = (event.budget || []).find(b => b.id === id);
    if (!item) return;

    document.getElementById('expenseModalTitle').textContent = 'Edit Expense Item';
    document.getElementById('expenseEditId').value = item.id;
    document.getElementById('expenseNameInput').value = item.name;
    document.getElementById('expenseCategorySelect').value = item.category;
    document.getElementById('expenseEstimatedInput').value = item.estimated;
    document.getElementById('expenseActualInput').value = item.actual;
    document.getElementById('expenseStatusSelect').value = item.status;
    document.getElementById('expenseNotesInput').value = item.notes || '';

    this.app.openModal('expenseModal');
  }

  saveExpenseFromModal() {
    const event = EventStorageManager.getActiveEvent();
    const editId = document.getElementById('expenseEditId').value;
    const name = document.getElementById('expenseNameInput').value.trim();
    const category = document.getElementById('expenseCategorySelect').value;
    const estimated = Number(document.getElementById('expenseEstimatedInput').value) || 0;
    const actual = Number(document.getElementById('expenseActualInput').value) || 0;
    const status = document.getElementById('expenseStatusSelect').value;
    const notes = document.getElementById('expenseNotesInput').value.trim();

    if (!name) {
      alert('Please enter an expense name');
      return;
    }

    if (editId) {
      const idx = (event.budget || []).findIndex(b => b.id === editId);
      if (idx !== -1) {
        event.budget[idx] = { id: editId, name, category, estimated, actual, status, notes };
      }
    } else {
      const newId = 'b_' + Date.now();
      if (!event.budget) event.budget = [];
      event.budget.push({ id: newId, name, category, estimated, actual, status, notes });
    }

    EventStorageManager.updateActiveEvent(event);
    this.app.closeModal('expenseModal');
    this.render();
    if (this.app?.showToast) this.app.showToast('Budget successfully updated', 'success');
  }
}
