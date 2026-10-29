/**
 * Celebráti AI - Timeline & Run-of-Show Master Controller
 * Live countdown clock, milestone phase tracking & minute-by-minute day-of schedule
 */

import { EventStorageManager } from './events-data.js';

export class TimelineManager {
  constructor(app) {
    this.app = app;
    this.currentView = 'milestones'; // 'milestones' or 'runOfShow'
    this.timerInterval = null;
    this.initCountdown();
  }

  initCountdown() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.updateCountdownDisplay();
    this.timerInterval = setInterval(() => this.updateCountdownDisplay(), 1000);
  }

  updateCountdownDisplay() {
    const event = EventStorageManager.getActiveEvent();
    if (!event || !event.date) return;

    const eventTime = new Date(event.date).getTime();
    const now = Date.now();
    const diff = eventTime - now;

    const daysEl = document.getElementById('countDays');
    const hoursEl = document.getElementById('countHours');
    const minsEl = document.getElementById('countMins');
    const secsEl = document.getElementById('countSecs');

    if (diff <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minsEl) minsEl.textContent = '00';
      if (secsEl) secsEl.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minsEl) minsEl.textContent = String(minutes).padStart(2, '0');
    if (secsEl) secsEl.textContent = String(seconds).padStart(2, '0');
  }

  render() {
    const event = EventStorageManager.getActiveEvent();
    if (!event) return;

    this.updateProgressKPI(event);

    if (this.currentView === 'milestones') {
      this.renderMilestones(event);
    } else {
      this.renderRunOfShow(event);
    }

    this.bindEvents();
  }

  updateProgressKPI(event) {
    const tasks = event.timeline || [];
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    const kpiVal = document.getElementById('kpiTimelineVal');
    const kpiSub = document.getElementById('kpiTimelineSub');
    const kpiBar = document.getElementById('kpiTimelineBar');

    if (kpiVal) kpiVal.textContent = `${pct}%`;
    if (kpiSub) kpiSub.textContent = `${completed} of ${total} tasks complete`;
    if (kpiBar) kpiBar.style.width = `${pct}%`;
  }

  renderMilestones(event) {
    const stream = document.getElementById('timelineStreamContainer');
    if (!stream) return;

    const tasks = event.timeline || [];

    if (tasks.length === 0) {
      stream.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
          No planning milestones yet. Ask Aura AI to generate a timeline or click "+ Add Task"!
        </div>
      `;
      return;
    }

    stream.innerHTML = tasks.map(task => {
      const priorityColor = task.priority === 'critical' ? 'var(--accent-ruby)' : task.priority === 'high' ? 'var(--accent-amber)' : 'var(--accent-violet)';

      return `
        <div class="timeline-item-card ${task.completed ? 'completed' : ''}" data-id="${task.id}">
          <div class="timeline-node ${task.completed ? 'completed' : ''}" data-id="${task.id}" title="Click to toggle status"></div>
          <div class="timeline-item-header">
            <span class="timeline-meta-badge">${task.phase || 'Milestone'}</span>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 0.72rem; padding: 0.15rem 0.5rem; border-radius: var(--radius-full); background: rgba(255,255,255,0.06); color: ${priorityColor}; font-weight: 700; text-transform: uppercase;">
                ${task.priority || 'Normal'}
              </span>
              <button class="btn-icon btn-delete-task" data-id="${task.id}" style="width: 26px; height: 26px; color: var(--text-muted);" title="Delete Task">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
          <div class="timeline-task-title">${task.title}</div>
          <div class="timeline-task-desc" style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
            <span>Target: <strong>${task.date || 'TBD'}</strong></span>
            ${task.assignee ? `<span>Lead: <em>${task.assignee}</em></span>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  renderRunOfShow(event) {
    const stream = document.getElementById('timelineStreamContainer');
    if (!stream) return;

    const schedule = event.runOfShow || [];

    if (schedule.length === 0) {
      stream.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
          No day-of schedule created yet. Click "Generate Day-of Itinerary with AI" to generate a minute-by-minute run-of-show!
        </div>
      `;
      return;
    }

    stream.innerHTML = schedule.map(item => {
      return `
        <div class="timeline-item-card ${item.completed ? 'completed' : ''}" data-id="${item.id}">
          <div class="timeline-node ${item.completed ? 'completed' : ''}" data-ros-id="${item.id}" title="Toggle Run of Show Item"></div>
          <div class="timeline-item-header">
            <span class="run-time-pill">${item.time}</span>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 0.78rem; color: var(--text-muted);">${item.location || 'Main Venue'}</span>
              <button class="btn-icon btn-delete-ros" data-id="${item.id}" style="width: 26px; height: 26px; color: var(--text-muted);" title="Delete">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
          <div class="timeline-task-title">${item.title}</div>
          ${item.notes ? `<div class="timeline-task-desc" style="margin-top: 0.4rem;">${item.notes}</div>` : ''}
        </div>
      `;
    }).join('');
  }

  bindEvents() {
    // Switch between Milestones and Run of Show
    const btnMilestones = document.getElementById('viewMilestonesBtn');
    const btnRunOfShow = document.getElementById('viewRunOfShowBtn');

    if (btnMilestones && btnRunOfShow) {
      btnMilestones.onclick = () => {
        btnMilestones.classList.add('active');
        btnRunOfShow.classList.remove('active');
        this.currentView = 'milestones';
        this.render();
      };
      btnRunOfShow.onclick = () => {
        btnRunOfShow.classList.add('active');
        btnMilestones.classList.remove('active');
        this.currentView = 'runOfShow';
        this.render();
      };
    }

    // Toggle milestone status
    document.querySelectorAll('.timeline-node[data-id]').forEach(node => {
      node.onclick = (e) => {
        const id = e.currentTarget.dataset.id;
        this.toggleMilestone(id);
      };
    });

    // Toggle Run of Show status
    document.querySelectorAll('.timeline-node[data-ros-id]').forEach(node => {
      node.onclick = (e) => {
        const id = e.currentTarget.dataset.rosId;
        this.toggleRunOfShow(id);
      };
    });

    // Delete task buttons
    document.querySelectorAll('.btn-delete-task').forEach(btn => {
      btn.onclick = (e) => {
        const id = e.currentTarget.dataset.id;
        this.deleteMilestone(id);
      };
    });

    // Delete run of show buttons
    document.querySelectorAll('.btn-delete-ros').forEach(btn => {
      btn.onclick = (e) => {
        const id = e.currentTarget.dataset.id;
        this.deleteRunOfShowItem(id);
      };
    });
  }

  toggleMilestone(id) {
    const event = EventStorageManager.getActiveEvent();
    const task = (event.timeline || []).find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      EventStorageManager.updateActiveEvent(event);
      this.render();
    }
  }

  toggleRunOfShow(id) {
    const event = EventStorageManager.getActiveEvent();
    const item = (event.runOfShow || []).find(r => r.id === id);
    if (item) {
      item.completed = !item.completed;
      EventStorageManager.updateActiveEvent(event);
      this.render();
    }
  }

  deleteMilestone(id) {
    const event = EventStorageManager.getActiveEvent();
    event.timeline = (event.timeline || []).filter(t => t.id !== id);
    EventStorageManager.updateActiveEvent(event);
    this.render();
    if (this.app?.showToast) this.app.showToast('Task removed from timeline', 'info');
  }

  deleteRunOfShowItem(id) {
    const event = EventStorageManager.getActiveEvent();
    event.runOfShow = (event.runOfShow || []).filter(r => r.id !== id);
    EventStorageManager.updateActiveEvent(event);
    this.render();
    if (this.app?.showToast) this.app.showToast('Schedule item removed', 'info');
  }

  saveTaskFromModal() {
    const event = EventStorageManager.getActiveEvent();
    const title = document.getElementById('taskTitleInput').value.trim();
    const phase = document.getElementById('taskPhaseSelect').value;
    const date = document.getElementById('taskDateInput').value;
    const priority = document.getElementById('taskPrioritySelect').value;
    const assignee = document.getElementById('taskAssigneeInput').value.trim();

    if (!title) {
      alert('Please enter a milestone title');
      return;
    }

    if (!event.timeline) event.timeline = [];
    event.timeline.push({
      id: 't_' + Date.now(),
      title,
      phase,
      date: date || 'TBD',
      priority,
      assignee,
      completed: false
    });

    EventStorageManager.updateActiveEvent(event);
    this.app.closeModal('taskModal');
    this.render();
    if (this.app?.showToast) this.app.showToast('Milestone task added to timeline', 'success');
  }
}
