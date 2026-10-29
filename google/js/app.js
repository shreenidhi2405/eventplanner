/**
 * Celebráti AI - Main Application Controller
 * Handles routing, event switching, modals, AI chat lifecycle, theme toggles, and dossier export
 */

import { EventStorageManager, INITIAL_EVENTS } from './events-data.js';
import { AIEngine } from './ai-engine.js';
import { BudgetManager } from './budget.js';
import { TimelineManager } from './timeline.js';
import { VendorManager } from './vendors.js';
import { MoodboardManager } from './moodboard.js';
import { GuestManager } from './guests.js';

class App {
  constructor() {
    this.activeTab = 'overview';
    this.budgetManager = new BudgetManager(this);
    this.timelineManager = new TimelineManager(this);
    this.vendorManager = new VendorManager(this);
    this.moodboardManager = new MoodboardManager(this);
    this.guestManager = new GuestManager(this);

    this.init();
  }

  init() {
    this.initTheme();
    this.populateEventSelector();
    this.updateActiveEventUI();
    this.initTabNavigation();
    this.initModals();
    this.initAIChat();
    this.initGlobalActions();

    // Render active tab sub-managers
    this.renderCurrentView();
  }

  /* ==========================================
     Theme Management
     ========================================== */
  initTheme() {
    const savedTheme = localStorage.getItem('celebrati_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);

    const toggleBtn = document.getElementById('btnThemeToggle');
    if (toggleBtn) {
      toggleBtn.onclick = () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('celebrati_theme', next);
        this.updateThemeIcon(next);
        this.budgetManager.renderChart(EventStorageManager.getActiveEvent());
      };
    }
  }

  updateThemeIcon(theme) {
    const iconEl = document.getElementById('themeToggleIcon');
    if (!iconEl) return;
    if (theme === 'dark') {
      iconEl.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
    } else {
      iconEl.innerHTML = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
    }
  }

  /* ==========================================
     Event Switcher & Hero Banner
     ========================================== */
  populateEventSelector() {
    const select = document.getElementById('eventDropdownSelect');
    if (!select) return;

    const events = EventStorageManager.getEvents();
    const activeId = EventStorageManager.getActiveEventId();

    select.innerHTML = events.map(ev => `
      <option value="${ev.id}" ${ev.id === activeId ? 'selected' : ''}>
        ${ev.title}
      </option>
    `).join('');

    select.onchange = (e) => {
      EventStorageManager.setActiveEventId(e.target.value);
      this.updateActiveEventUI();
      this.renderCurrentView();
      this.showToast('Celebration plan loaded', 'info');
    };
  }

  updateActiveEventUI() {
    const event = EventStorageManager.getActiveEvent();
    if (!event) return;

    // Update Hero Banner
    const heroImage = document.getElementById('heroBannerImg');
    const heroTitle = document.getElementById('heroBannerTitle');
    const heroTypeBadge = document.getElementById('heroBannerTypeBadge');
    const heroMetaDate = document.getElementById('heroMetaDate');
    const heroMetaLocation = document.getElementById('heroMetaLocation');
    const heroMetaGuests = document.getElementById('heroMetaGuests');
    const heroMetaBudget = document.getElementById('heroMetaBudget');

    if (heroImage) heroImage.src = event.heroImage || 'assets/images/wedding.jpg';
    if (heroTitle) heroTitle.textContent = event.title;

    if (heroTypeBadge) {
      const type = event.type || 'celebration';
      heroTypeBadge.textContent = type.toUpperCase();
      heroTypeBadge.className = `badge-pill badge-${type}`;
    }

    if (heroMetaDate) {
      if (event.date) {
        const d = new Date(event.date);
        heroMetaDate.textContent = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } else {
        heroMetaDate.textContent = 'Date TBD';
      }
    }

    if (heroMetaLocation) heroMetaLocation.textContent = event.location || 'Location TBD';
    if (heroMetaGuests) heroMetaGuests.textContent = `${event.guestCount || 0} Guests`;
    if (heroMetaBudget) heroMetaBudget.textContent = `${event.currency || '$'}${(Number(event.targetBudget) || 0).toLocaleString()}`;

    // Update Countdown
    this.timelineManager.initCountdown();
  }

  /* ==========================================
     Tab Navigation System
     ========================================== */
  initTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn[data-tab]');
    tabButtons.forEach(btn => {
      btn.onclick = () => {
        const targetTab = btn.dataset.tab;
        this.switchTab(targetTab);
      };
    });
  }

  switchTab(tabId) {
    this.activeTab = tabId;

    // Update active tab buttons
    document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update visible panel
    document.querySelectorAll('.tab-content-panel').forEach(panel => {
      if (panel.id === `tabPanel_${tabId}`) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    this.renderCurrentView();
  }

  renderCurrentView() {
    const event = EventStorageManager.getActiveEvent();
    if (!event) return;

    this.budgetManager.renderStats(event);
    this.timelineManager.updateProgressKPI(event);
    this.vendorManager.updateKPI(event);
    this.guestManager.renderKPIs(event);

    if (this.activeTab === 'overview') {
      this.renderOverviewUrgentActions(event);
    } else if (this.activeTab === 'ai') {
      // AI Tab
    } else if (this.activeTab === 'budget') {
      this.budgetManager.render();
    } else if (this.activeTab === 'timeline') {
      this.timelineManager.render();
    } else if (this.activeTab === 'vendors') {
      this.vendorManager.render();
    } else if (this.activeTab === 'moodboard') {
      this.moodboardManager.render();
    } else if (this.activeTab === 'guests') {
      this.guestManager.render();
    }
  }

  renderOverviewUrgentActions(event) {
    const urgentContainer = document.getElementById('overviewUrgentList');
    if (!urgentContainer) return;

    const uncompletedTasks = (event.timeline || []).filter(t => !t.completed).slice(0, 3);
    const unbookedVendors = (event.vendors || []).filter(v => v.status === 'in-talks' || v.status === 'shortlisted').slice(0, 2);

    if (uncompletedTasks.length === 0 && unbookedVendors.length === 0) {
      urgentContainer.innerHTML = `
        <div style="padding: 1.5rem; text-align: center; color: var(--accent-emerald); font-weight: 600;">
          🎉 All milestones and critical vendors are on schedule!
        </div>
      `;
      return;
    }

    let html = '';
    uncompletedTasks.forEach(t => {
      html += `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; border-radius: var(--radius-sm); background: var(--surface-glass); border: 1px solid var(--border-subtle); margin-bottom: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--accent-amber);"></span>
            <span style="font-size: 0.88rem; font-weight: 600; color: var(--text-primary);">${t.title}</span>
          </div>
          <span style="font-size: 0.75rem; color: var(--text-muted);">${t.date || 'Soon'}</span>
        </div>
      `;
    });

    unbookedVendors.forEach(v => {
      html += `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; border-radius: var(--radius-sm); background: var(--surface-glass); border: 1px solid var(--border-subtle); margin-bottom: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--accent-rose);"></span>
            <span style="font-size: 0.88rem; font-weight: 600; color: var(--text-primary);">${v.name} (${v.category})</span>
          </div>
          <span class="status-badge in-talks">Needs Decision</span>
        </div>
      `;
    });

    urgentContainer.innerHTML = html;
  }

  /* ==========================================
     GenAI Planning Assistant
     ========================================== */
  initAIChat() {
    const input = document.getElementById('aiChatInput');
    const sendBtn = document.getElementById('aiChatSendBtn');
    const chips = document.querySelectorAll('.prompt-chip');

    if (sendBtn && input) {
      sendBtn.onclick = () => {
        const text = input.value.trim();
        if (text) {
          this.submitAIMessage(text);
          input.value = '';
        }
      };

      input.onkeydown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendBtn.click();
        }
      };
    }

    chips.forEach(chip => {
      chip.onclick = () => {
        const prompt = chip.dataset.prompt;
        if (prompt) {
          this.switchTab('ai');
          this.submitAIMessage(prompt);
        }
      };
    });
  }

  sendCustomAIPrompt(promptText) {
    this.switchTab('ai');
    this.submitAIMessage(promptText);
  }

  async submitAIMessage(promptText) {
    const container = document.getElementById('aiChatMessages');
    if (!container) return;

    // Append User Bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble user';
    userBubble.innerHTML = `
      <div class="bubble-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
      </div>
      <div class="bubble-content">
        <p>${this.escapeHtml(promptText)}</p>
      </div>
    `;
    container.appendChild(userBubble);

    // Append AI Bubble with Typing Indicator
    const aiBubble = document.createElement('div');
    aiBubble.className = 'chat-bubble ai';
    const bubbleId = 'ai_resp_' + Date.now();
    aiBubble.innerHTML = `
      <div class="bubble-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></svg>
      </div>
      <div class="bubble-content" id="${bubbleId}">
        <div class="typing-dots">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
    `;
    container.appendChild(aiBubble);
    container.scrollTop = container.scrollHeight;

    const activeEvent = EventStorageManager.getActiveEvent();

    try {
      const response = await AIEngine.generatePlanningResponse(promptText, activeEvent, (streamText) => {
        const targetEl = document.getElementById(bubbleId);
        if (targetEl) {
          targetEl.innerHTML = this.renderMarkdown(streamText);
          container.scrollTop = container.scrollHeight;
        }
      });

      // Attach actionable buttons if applicable
      const targetEl = document.getElementById(bubbleId);
      if (targetEl && response.actionableData) {
        const actionFooter = document.createElement('div');
        actionFooter.className = 'ai-action-footer';

        if (response.actionableData.type === 'budget_items' && response.actionableData.items) {
          actionFooter.innerHTML = `
            <button class="btn-ai-apply btn-apply-budget" id="act_btn_${bubbleId}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              ${response.actionableData.label}
            </button>
          `;
          targetEl.appendChild(actionFooter);

          const applyBtn = document.getElementById(`act_btn_${bubbleId}`);
          if (applyBtn) {
            applyBtn.onclick = () => {
              this.applyAIBudgetItems(response.actionableData.items);
              applyBtn.innerHTML = '✓ Allocations Applied to Budget';
              applyBtn.disabled = true;
              applyBtn.style.opacity = '0.7';
            };
          }
        } else if (response.actionableData.type === 'timeline_items' && response.actionableData.items) {
          actionFooter.innerHTML = `
            <button class="btn-ai-apply btn-apply-timeline" id="act_btn_${bubbleId}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              ${response.actionableData.label}
            </button>
          `;
          targetEl.appendChild(actionFooter);

          const applyBtn = document.getElementById(`act_btn_${bubbleId}`);
          if (applyBtn) {
            applyBtn.onclick = () => {
              this.applyAITimelineItems(response.actionableData.items);
              applyBtn.innerHTML = '✓ Run-of-Show Imported';
              applyBtn.disabled = true;
              applyBtn.style.opacity = '0.7';
            };
          }
        }
      }

      container.scrollTop = container.scrollHeight;
    } catch (err) {
      console.error(err);
      const targetEl = document.getElementById(bubbleId);
      if (targetEl) {
        targetEl.innerHTML = `<p style="color: var(--accent-ruby);">Error processing request. Please try again.</p>`;
      }
    }
  }

  applyAIBudgetItems(items) {
    const event = EventStorageManager.getActiveEvent();
    if (!event.budget) event.budget = [];
    items.forEach((item, idx) => {
      event.budget.push({
        id: 'b_ai_' + Date.now() + '_' + idx,
        name: item.name,
        category: item.category,
        estimated: item.estimated,
        actual: item.actual,
        status: item.status,
        notes: 'AI Recommended Allocation'
      });
    });
    EventStorageManager.updateActiveEvent(event);
    this.budgetManager.render();
    this.showToast('AI Budget allocations added to budget tracker!', 'success');
  }

  applyAITimelineItems(items) {
    const event = EventStorageManager.getActiveEvent();
    if (!event.runOfShow) event.runOfShow = [];
    items.forEach((item, idx) => {
      event.runOfShow.push({
        id: 'ros_ai_' + Date.now() + '_' + idx,
        time: item.time,
        title: item.title,
        location: item.location || 'Main Venue',
        notes: item.notes || '',
        completed: false
      });
    });
    EventStorageManager.updateActiveEvent(event);
    this.timelineManager.render();
    this.showToast('Run-of-show itinerary imported into schedule!', 'success');
  }

  renderMarkdown(text) {
    if (!text) return '';

    // Simple markdown renderer for tables, headers, bold, bullets, code
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Headings
    html = html.replace(/^### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^#### (.*$)/gim, '<h5 style="color: var(--accent-gold); margin-top: 0.6rem;">$1</h5>');

    // Bold & italic
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

    // Code chips
    html = html.replace(/`([^`]+)`/gim, '<code style="background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.85em; color: var(--accent-rose);">$1</code>');

    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote style="border-left: 3px solid var(--accent-rose); padding-left: 1rem; margin: 0.5rem 0; color: var(--text-primary); font-style: italic;">$1</blockquote>');

    // Simple table parser
    if (html.includes('|')) {
      const lines = html.split('\n');
      let inTable = false;
      let tableHtml = '';
      const newLines = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('|') && line.endsWith('|')) {
          if (!inTable) {
            inTable = true;
            tableHtml = '<table><thead>';
          }
          const cells = line.split('|').filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
          if (line.includes(':---') || line.includes('---')) {
            tableHtml += '</thead><tbody>';
          } else {
            const tag = tableHtml.includes('<tbody>') ? 'td' : 'th';
            tableHtml += '<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>';
          }
        } else {
          if (inTable) {
            inTable = false;
            tableHtml += '</tbody></table>';
            newLines.push(tableHtml);
            tableHtml = '';
          }
          newLines.push(line);
        }
      }
      if (inTable) {
        tableHtml += '</tbody></table>';
        newLines.push(tableHtml);
      }
      html = newLines.join('\n');
    }

    // Bullet points
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');

    // Paragraph breaks
    html = html.replace(/\n\n/g, '<br><br>');

    return html;
  }

  escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ==========================================
     Modals Management
     ========================================== */
  initModals() {
    // Generic modal closers
    document.querySelectorAll('.modal-close-trigger').forEach(btn => {
      btn.onclick = () => {
        const modal = btn.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      };
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      };
    });

    // Add Expense triggers
    const btnOpenExpense = document.getElementById('btnOpenAddExpense');
    if (btnOpenExpense) {
      btnOpenExpense.onclick = () => {
        document.getElementById('expenseModalTitle').textContent = 'Add Expense Item';
        document.getElementById('expenseEditId').value = '';
        document.getElementById('expenseNameInput').value = '';
        document.getElementById('expenseEstimatedInput').value = '';
        document.getElementById('expenseActualInput').value = '';
        document.getElementById('expenseNotesInput').value = '';
        this.openModal('expenseModal');
      };
    }

    const btnSaveExpense = document.getElementById('btnSaveExpenseModal');
    if (btnSaveExpense) {
      btnSaveExpense.onclick = () => this.budgetManager.saveExpenseFromModal();
    }

    // Add Task triggers
    const btnOpenTask = document.getElementById('btnOpenAddTask');
    if (btnOpenTask) {
      btnOpenTask.onclick = () => {
        document.getElementById('taskTitleInput').value = '';
        document.getElementById('taskDateInput').value = '';
        document.getElementById('taskAssigneeInput').value = '';
        this.openModal('taskModal');
      };
    }

    const btnSaveTask = document.getElementById('btnSaveTaskModal');
    if (btnSaveTask) {
      btnSaveTask.onclick = () => this.timelineManager.saveTaskFromModal();
    }

    // Add Vendor triggers
    const btnOpenVendor = document.getElementById('btnOpenAddVendor');
    if (btnOpenVendor) {
      btnOpenVendor.onclick = () => {
        document.getElementById('vendorNameInput').value = '';
        document.getElementById('vendorContactInput').value = '';
        document.getElementById('vendorPhoneInput').value = '';
        document.getElementById('vendorEmailInput').value = '';
        document.getElementById('vendorQuoteInput').value = '';
        document.getElementById('vendorDepositInput').value = '';
        document.getElementById('vendorNotesInput').value = '';
        this.openModal('vendorModal');
      };
    }

    const btnSaveVendor = document.getElementById('btnSaveVendorModal');
    if (btnSaveVendor) {
      btnSaveVendor.onclick = () => this.vendorManager.saveVendorFromModal();
    }

    // Add Guest triggers
    const btnOpenGuest = document.getElementById('btnOpenAddGuest');
    if (btnOpenGuest) {
      btnOpenGuest.onclick = () => {
        document.getElementById('guestNameInput').value = '';
        document.getElementById('guestPartyCountInput').value = '1';
        document.getElementById('guestDietaryInput').value = '';
        document.getElementById('guestTableInput').value = '';
        this.openModal('guestModal');
      };
    }

    const btnSaveGuest = document.getElementById('btnSaveGuestModal');
    if (btnSaveGuest) {
      btnSaveGuest.onclick = () => this.guestManager.saveGuestFromModal();
    }

    // Create New Event Modal
    const btnCreateEvent = document.getElementById('btnOpenCreateEvent');
    if (btnCreateEvent) {
      btnCreateEvent.onclick = () => {
        document.getElementById('newEventTitle').value = '';
        document.getElementById('newEventBudget').value = '10000';
        document.getElementById('newEventGuests').value = '50';
        document.getElementById('newEventLocation').value = '';
        document.getElementById('newEventVibe').value = '';
        this.openModal('createEventModal');
      };
    }

    const btnSaveNewEvent = document.getElementById('btnSaveNewEventModal');
    if (btnSaveNewEvent) {
      btnSaveNewEvent.onclick = () => this.saveNewEventFromModal();
    }

    // Gemini API Key Modal
    const btnOpenKeyModal = document.getElementById('btnOpenKeyModal');
    if (btnOpenKeyModal) {
      btnOpenKeyModal.onclick = () => {
        document.getElementById('geminiApiKeyInput').value = AIEngine.getApiKey();
        this.openModal('geminiKeyModal');
      };
    }

    const btnSaveKey = document.getElementById('btnSaveGeminiKey');
    if (btnSaveKey) {
      btnSaveKey.onclick = () => {
        const val = document.getElementById('geminiApiKeyInput').value;
        AIEngine.setApiKey(val);
        this.closeModal('geminiKeyModal');
        this.showToast(val ? 'Gemini API Key activated!' : 'Gemini Key cleared (Using Native Engine)', 'success');
      };
    }
  }

  openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('active');
  }

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('active');
  }

  saveNewEventFromModal() {
    const title = document.getElementById('newEventTitle').value.trim();
    const type = document.getElementById('newEventType').value;
    const date = document.getElementById('newEventDate').value;
    const budget = Number(document.getElementById('newEventBudget').value) || 5000;
    const guests = Number(document.getElementById('newEventGuests').value) || 25;
    const location = document.getElementById('newEventLocation').value.trim() || 'TBD';
    const vibe = document.getElementById('newEventVibe').value.trim() || 'Joyful & memorable celebration';

    if (!title) {
      alert('Please enter a celebration name');
      return;
    }

    // Assign appropriate image based on type
    let heroImage = 'assets/images/wedding.jpg';
    if (type === 'birthday') heroImage = 'assets/images/birthday.jpg';
    else if (type === 'community') heroImage = 'assets/images/community.jpg';

    const newEvent = {
      id: 'event_' + Date.now(),
      title,
      type,
      date: date ? `${date}T18:00` : new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 16),
      location,
      targetBudget: budget,
      currency: '$',
      guestCount: guests,
      heroImage,
      themeName: `${title} Aesthetic`,
      themeVibe: vibe,
      palette: [
        { name: 'Royal Violet', hex: '#8B5CF6' },
        { name: 'Rose Gold', hex: '#EC4899' },
        { name: 'Champagne', hex: '#F59E0B' },
        { name: 'Obsidian', hex: '#0F172A' },
        { name: 'Pearl', hex: '#F8FAFC' }
      ],
      budget: [
        { id: 'b_init_1', name: 'Venue & Facilities', category: 'Venue', estimated: Math.round(budget * 0.35), actual: 0, status: 'pending' },
        { id: 'b_init_2', name: 'Food & Beverage', category: 'Catering', estimated: Math.round(budget * 0.35), actual: 0, status: 'pending' },
        { id: 'b_init_3', name: 'Decor & Atmosphere', category: 'Decor', estimated: Math.round(budget * 0.15), actual: 0, status: 'pending' },
        { id: 'b_init_4', name: 'Entertainment & Music', category: 'Music', estimated: Math.round(budget * 0.10), actual: 0, status: 'pending' },
        { id: 'b_init_5', name: 'Contingency Buffer', category: 'Buffer', estimated: Math.round(budget * 0.05), actual: 0, status: 'pending' }
      ],
      timeline: [
        { id: 't_init_1', title: 'Confirm Venue Reservation', phase: 'Planning Phase', date: 'TBD', completed: false, priority: 'critical', assignee: 'Host' },
        { id: 't_init_2', title: 'Draft Guest List & Invitations', phase: 'Planning Phase', date: 'TBD', completed: false, priority: 'high', assignee: 'Host' }
      ],
      runOfShow: [],
      vendors: [],
      guests: [],
      personalizedIdeas: {
        signatureDrinks: [
          { name: 'The Celebration Sparkler', ingredients: 'Prosecco, Elderflower, Fresh Berries & Mint' }
        ],
        playlistVibes: 'Uplifting celebration anthems, golden hour lounge and feel-good hits',
        invitationStyles: {
          romantic: `You are cordially invited to celebrate ${title}.`,
          modern: `Save the date for ${title}! We can't wait to celebrate with you.`,
          poetic: `Join us under the stars for an evening of joy and good cheer.`
        }
      }
    };

    EventStorageManager.addEvent(newEvent);
    this.populateEventSelector();
    this.updateActiveEventUI();
    this.closeModal('createEventModal');
    this.renderCurrentView();
    this.showToast(`Celebration "${title}" successfully created!`, 'success');
  }

  /* ==========================================
     Global Actions & Dossier Export
     ========================================== */
  initGlobalActions() {
    // Print / PDF Dossier
    const btnPrint = document.getElementById('btnPrintPlan');
    if (btnPrint) {
      btnPrint.onclick = () => window.print();
    }

    // Export JSON
    const btnExport = document.getElementById('btnExportJson');
    if (btnExport) {
      btnExport.onclick = () => {
        const event = EventStorageManager.getActiveEvent();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(event, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `${event.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_plan.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        this.showToast('Event plan exported as JSON file', 'success');
      };
    }

    // Reset Defaults
    const btnReset = document.getElementById('btnResetDefaults');
    if (btnReset) {
      btnReset.onclick = () => {
        if (confirm("Reset planner to default showcase celebrations?")) {
          EventStorageManager.resetToDefaults();
          this.populateEventSelector();
          this.updateActiveEventUI();
          this.renderCurrentView();
          this.showToast('Reset to demo celebrations', 'info');
        }
      };
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span style="font-size: 1.1rem;">${type === 'success' ? '✓' : type === 'warning' ? '⚠️' : '✨'}</span>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

// Instantiate on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  window.CelebratiApp = new App();
});
