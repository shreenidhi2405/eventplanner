/**
 * Celebráti AI - Moodboard & Personalized Ideas Studio
 * Color palette swatches, signature cocktails, invitation copywriter, and sensory design concepts
 */

import { EventStorageManager } from './events-data.js';

export class MoodboardManager {
  constructor(app) {
    this.app = app;
    this.currentInviteStyle = 'romantic';
  }

  render() {
    const event = EventStorageManager.getActiveEvent();
    if (!event) return;

    this.renderPalettes(event);
    this.renderIdeas(event);
    this.renderInvitationStudio(event);
    this.bindEvents();
  }

  renderPalettes(event) {
    const container = document.getElementById('swatchesContainer');
    if (!container) return;

    const palette = event.palette || [
      { name: 'Blush Rose', hex: '#F472B6' },
      { name: 'Sage Green', hex: '#10B981' },
      { name: 'Champagne Gold', hex: '#F59E0B' },
      { name: 'Soft Ivory', hex: '#FFFBEB' },
      { name: 'Deep Plum', hex: '#581C87' }
    ];

    container.innerHTML = palette.map(swatch => {
      return `
        <div class="swatch-card" data-hex="${swatch.hex}" title="Click to copy ${swatch.hex}">
          <div class="swatch-color-box" style="background-color: ${swatch.hex};"></div>
          <div class="swatch-info">
            <div class="swatch-hex">${swatch.hex}</div>
            <div class="swatch-name">${swatch.name}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderIdeas(event) {
    const container = document.getElementById('ideasGridContainer');
    if (!container) return;

    const ideas = event.personalizedIdeas || {};
    const drinks = ideas.signatureDrinks || [];
    const playlist = ideas.playlistVibes || 'Curated acoustic and modern indie classics';

    let cardsHtml = '';

    // Card 1: Theme & Atmosphere
    cardsHtml += `
      <div class="idea-card">
        <img src="${event.heroImage || 'assets/images/wedding.jpg'}" alt="${event.themeName}" class="idea-card-img">
        <div class="idea-card-body">
          <span class="idea-category-tag">Visual Aesthetic</span>
          <h4 class="idea-title">${event.themeName || 'Signature Celebration'}</h4>
          <p class="idea-desc">${event.themeVibe || 'An exquisite, cohesive celebration atmosphere.'}</p>
          <button class="btn-pill btn-secondary btn-ask-theme-ai" style="font-size: 0.8rem; width: fit-content;">
            ✨ Generate More Decor Ideas
          </button>
        </div>
      </div>
    `;

    // Card 2: Signature Cocktails
    if (drinks.length > 0) {
      cardsHtml += `
        <div class="idea-card">
          <div style="height: 190px; background: linear-gradient(135deg, rgba(236, 72, 153, 0.25) 0%, rgba(245, 158, 11, 0.2) 100%); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 72px; height: 72px; color: var(--accent-gold); opacity: 0.85;"><path d="M8 22h8"></path><path d="M12 11v11"></path><path d="m19 3-7 8-7-8Z"></path></svg>
            <div style="position: absolute; bottom: 10px; right: 15px; font-size: 0.72rem; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 1px;">Craft Mixology</div>
          </div>
          <div class="idea-card-body">
            <span class="idea-category-tag">Culinary & Bar</span>
            <h4 class="idea-title">Signature Cocktails</h4>
            <div style="display: flex; flex-direction: column; gap: 0.85rem; margin-bottom: 1rem;">
              ${drinks.map(d => `
                <div>
                  <div style="font-weight: 700; color: var(--text-primary); font-size: 0.92rem;">🍸 ${d.name}</div>
                  <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">${d.ingredients}</div>
                </div>
              `).join('')}
            </div>
            <button class="btn-pill btn-secondary btn-ask-drinks-ai" style="font-size: 0.8rem; width: fit-content;">
              🍹 Suggest More Drink Recipes
            </button>
          </div>
        </div>
      `;
    }

    // Card 3: Soundtrack & Ambiance
    cardsHtml += `
      <div class="idea-card">
        <div style="height: 190px; background: linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(6, 182, 212, 0.2) 100%); display: flex; align-items: center; justify-content: center; position: relative;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 72px; height: 72px; color: var(--accent-violet); opacity: 0.85;"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
          <div style="position: absolute; bottom: 10px; right: 15px; font-size: 0.72rem; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 1px;">Soundtrack Curation</div>
        </div>
        <div class="idea-card-body">
          <span class="idea-category-tag">Auditory & Vibe</span>
          <h4 class="idea-title">Acoustic & Musical Curation</h4>
          <p class="idea-desc">${playlist}</p>
          <div style="margin-top: auto;">
            <button class="btn-pill btn-secondary btn-ask-music-ai" style="font-size: 0.8rem; width: fit-content;">
              🎶 Curate Playlist by Hour
            </button>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = cardsHtml;
  }

  renderInvitationStudio(event) {
    const previewBox = document.getElementById('invitationPreviewBox');
    if (!previewBox) return;

    const styles = event.personalizedIdeas?.invitationStyles || {
      romantic: `Together with their families, ${event.title} invites you to celebrate at ${event.location}.`,
      modern: `Join us for ${event.title} on ${event.date ? event.date.split('T')[0] : 'an unforgettable evening'}.`,
      poetic: `A celebration of memories, laughter, and community under the open sky.`
    };

    const text = styles[this.currentInviteStyle] || styles.romantic || Object.values(styles)[0];
    previewBox.innerHTML = `
      <p style="white-space: pre-line;">"${text}"</p>
    `;
  }

  bindEvents() {
    // Swatch click to copy HEX
    document.querySelectorAll('.swatch-card').forEach(card => {
      card.onclick = (e) => {
        const hex = e.currentTarget.dataset.hex;
        navigator.clipboard.writeText(hex).then(() => {
          if (this.app?.showToast) this.app.showToast(`Copied ${hex} to clipboard!`, 'success');
        });
      };
    });

    // Invitation style tabs
    document.querySelectorAll('.invitation-tab-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.invitation-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentInviteStyle = btn.dataset.style;
        this.renderInvitationStudio(EventStorageManager.getActiveEvent());
      };
    });

    // Copy Invitation text
    const copyBtn = document.getElementById('btnCopyInvitation');
    if (copyBtn) {
      copyBtn.onclick = () => {
        const previewBox = document.getElementById('invitationPreviewBox');
        if (previewBox) {
          navigator.clipboard.writeText(previewBox.innerText.replace(/"/g, '')).then(() => {
            if (this.app?.showToast) this.app.showToast('Invitation wording copied to clipboard!', 'success');
          });
        }
      };
    }

    // AI triggers
    const askTheme = document.querySelector('.btn-ask-theme-ai');
    if (askTheme) {
      askTheme.onclick = () => {
        this.app.sendCustomAIPrompt(`Suggest 3 unique floral and lighting decor concepts for ${EventStorageManager.getActiveEvent().title}`);
      };
    }

    const askDrinks = document.querySelector('.btn-ask-drinks-ai');
    if (askDrinks) {
      askDrinks.onclick = () => {
        this.app.sendCustomAIPrompt(`Curate 3 signature cocktail recipes and mocktails for ${EventStorageManager.getActiveEvent().title}`);
      };
    }

    const askMusic = document.querySelector('.btn-ask-music-ai');
    if (askMusic) {
      askMusic.onclick = () => {
        this.app.sendCustomAIPrompt(`Recommend a music playlist progression from arrival to prime dance floor for ${EventStorageManager.getActiveEvent().title}`);
      };
    }
  }
}
