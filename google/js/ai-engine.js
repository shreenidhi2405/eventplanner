/**
 * Celebráti AI - Generative AI Planning Engine
 * Dual-Mode Engine:
 * 1. Native High-Precision Knowledge Generator (Rich, context-aware, instant & zero-latency)
 * 2. Optional Google Gemini API Integration (Bring-your-own API key in settings)
 */

const GEMINI_STORAGE_KEY = 'celebrati_gemini_api_key';

export class AIEngine {
  static getApiKey() {
    return localStorage.getItem(GEMINI_STORAGE_KEY) || '';
  }

  static setApiKey(key) {
    localStorage.setItem(GEMINI_STORAGE_KEY, key.trim());
  }

  /**
   * Main query processor that handles both custom prompts and prompt chips
   */
  static async generatePlanningResponse(promptText, activeEvent, onChunk = null) {
    const apiKey = this.getApiKey();

    if (apiKey && apiKey.length > 10) {
      try {
        return await this.callGeminiAPI(promptText, activeEvent, apiKey, onChunk);
      } catch (err) {
        console.warn('Gemini API call failed, falling back to Native Intelligence Engine:', err);
      }
    }

    // Native High-Precision Knowledge Generator
    return await this.generateNativeResponse(promptText, activeEvent, onChunk);
  }

  /**
   * Call official Gemini API
   */
  static async callGeminiAPI(prompt, activeEvent, apiKey, onChunk) {
    const systemPrompt = `You are Aura, an elite luxury celebration and event planning AI assistant.
Active Event Context:
- Title: ${activeEvent.title}
- Type: ${activeEvent.type}
- Target Budget: ${activeEvent.currency}${activeEvent.targetBudget}
- Guest Count: ${activeEvent.guestCount}
- Location: ${activeEvent.location}
- Date: ${activeEvent.date}
- Vibe: ${activeEvent.themeVibe}

Provide rich, highly organized, inspiring, and actionable advice. Use markdown headings, bullet points, and tables where suitable. Include actionable tips on budget, timelines, vendors, decor, or copy.`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question/Request:\n${prompt}` }] }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1200
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) {
      throw new Error('No candidate content received from Gemini API');
    }

    if (onChunk) {
      // Simulate smooth typewriter for Gemini output
      await this.simulateStream(candidate, onChunk);
    }

    return {
      text: candidate,
      actionableData: this.detectActionableData(candidate, activeEvent)
    };
  }

  /**
   * Native High-Precision Event Knowledge Generator
   */
  static async generateNativeResponse(prompt, activeEvent, onChunk) {
    const p = prompt.toLowerCase();
    const evType = activeEvent.type;
    const currency = activeEvent.currency || '$';
    const budget = activeEvent.targetBudget || 10000;
    const guests = activeEvent.guestCount || 50;

    let responseMarkdown = '';
    let actionableData = null;

    if (p.includes('theme') || p.includes('palette') || p.includes('decor') || p.includes('aesthetic') || p.includes('vibe')) {
      responseMarkdown = this.getThemeConcepts(activeEvent);
      actionableData = { type: 'theme', label: 'Incorporate Aesthetic to Moodboard' };
    } else if (p.includes('budget') || p.includes('cost') || p.includes('price') || p.includes('allocat') || p.includes('financ')) {
      const breakdown = this.getSmartBudgetBreakdown(activeEvent);
      responseMarkdown = breakdown.markdown;
      actionableData = { type: 'budget_items', items: breakdown.items, label: 'Apply Optimized Budget Allocations' };
    } else if (p.includes('timeline') || p.includes('schedule') || p.includes('run of show') || p.includes('itinerary') || p.includes('hour')) {
      const schedule = this.getRunOfShow(activeEvent);
      responseMarkdown = schedule.markdown;
      actionableData = { type: 'timeline_items', items: schedule.items, label: 'Add Run-of-Show Milestones' };
    } else if (p.includes('vendor') || p.includes('caterer') || p.includes('photographer') || p.includes('contract') || p.includes('question')) {
      responseMarkdown = this.getVendorChecklist(activeEvent);
      actionableData = { type: 'vendor_advice', label: 'Save Questions to Vendor Notes' };
    } else if (p.includes('invitation') || p.includes('wording') || p.includes('speech') || p.includes('toast') || p.includes('message')) {
      responseMarkdown = this.getCreativeCopy(activeEvent);
      actionableData = { type: 'copy', label: 'Copy to Clipboard' };
    } else if (p.includes('drink') || p.includes('cocktail') || p.includes('menu') || p.includes('food')) {
      responseMarkdown = this.getCateringDrinks(activeEvent);
      actionableData = { type: 'menu', label: 'Save Menu Ideas' };
    } else if (p.includes('favor') || p.includes('gift') || p.includes('souvenir')) {
      responseMarkdown = this.getFavorIdeas(activeEvent);
      actionableData = { type: 'favors', label: 'Add Favors to Checklist' };
    } else {
      // General tailored consulting response
      responseMarkdown = this.getGeneralConsulting(prompt, activeEvent);
      actionableData = { type: 'general', label: 'Plan Next Steps' };
    }

    if (onChunk) {
      await this.simulateStream(responseMarkdown, onChunk);
    }

    return {
      text: responseMarkdown,
      actionableData
    };
  }

  /**
   * Smooth realistic streaming simulation
   */
  static async simulateStream(text, onChunk) {
    const chunks = text.split(/(?<=[ \n])/);
    let current = '';
    for (let i = 0; i < chunks.length; i++) {
      current += chunks[i];
      onChunk(current);
      if (i % 3 === 0) {
        await new Promise(r => setTimeout(r, 12));
      }
    }
  }

  /**
   * 1. Theme & Aesthetic Concepts
   */
  static getThemeConcepts(event) {
    if (event.type === 'wedding') {
      return `### 🌸 3 Tailored Aesthetic Concepts for ${event.title}

Here are curated aesthetic visions engineered specifically for your **${event.guestCount}-guest** celebration in **${event.location}**:

#### 1. Enchanted Ethereal Conservatory (Recommended)
* **The Atmosphere:** Glasshouse surrounded by verdant botanical gardens, draped with wild flowering vines, blush spray roses, and hundreds of warm fairy lights suspended overhead.
* **Color Palette:**
  * Blush Petal (\`#F472B6\`)
  * Eucalyptus Sage (\`#10B981\`)
  * Champagne Gilt (\`#F59E0B\`)
  * Warm Candlelight (\`#FFFBEB\`)
* **Signature Decor Moment:** A circular living floral arch framing the exchange of vows, repurposed later as the backdrop for your sweetheart dinner table.
* **Sensory Detail:** Subtle ambient scent of French lavender and blossoming jasmine misted throughout the reception area.

#### 2. Modern Tuscan Sunset
* **The Atmosphere:** Long rustic wooden harvest tables lined with olive branches, terracotta urns with fresh lemons, and taper candles in smoked glass hurricanes.
* **Color Palette:** Terracotta (\`#EA580C\`), Burnt Amber (\`#D97706\`), Dusty Olive (\`#4D7C0F\`), Warm Sand (\`#F5F5F4\`).

#### 3. Celestial Starry Velvet
* **The Atmosphere:** Moody luxury with midnight navy drapes, floating glass orbs with tea lights, constellation place cards, and champagne velvet table linens.
* **Color Palette:** Midnight Indigo (\`#1E1B4B\`), Starlight Gold (\`#EAB308\`), Silver Dust (\`#E2E8F0\`).

💡 *Tip from Aura: Selecting 2 primary anchor colors and 2 subtle neutrals creates maximum visual cohesion without feeling overly matchy.*`;
    } else if (event.type === 'birthday') {
      return `### 🍸 3 High-Energy Concepts for ${event.title}

Curated concepts tailored for **${event.guestCount} guests** celebrating this momentous milestone:

#### 1. Neon Cyber-Lounge & Skyline Mixology (Recommended)
* **The Atmosphere:** High-altitude penthouse rooftop, ambient ultraviolet and hot fuchsia backlights, illuminated ice sculptures, and sleek chrome accents.
* **Color Palette:**
  * Cyber Violet (\`#8B5CF6\`)
  * Electric Fuchsia (\`#EC4899\`)
  * Amber Neon (\`#F59E0B\`)
  * Deep Space Obsidian (\`#0F172A\`)
* **Signature Focal Point:** A 5-foot custom LED flex sign displaying the guest of honor's name mounted against a dense matte black foliage photo wall.
* **Interactive Element:** A 5-tier champagne coupe tower cascade with fogging dry ice during the midnight toast.

#### 2. Vintage 70s Studio Disco Glam
* **The Atmosphere:** Mirrored disco balls of varying sizes suspended over the dance floor, warm amber par-can lighting, velvet booth lounges, and gold rimmed cocktail glassware.
* **Color Palette:** Disco Gold (\`#EAB308\`), Cherry Red (\`#DC2626\`), Deep Chocolate (\`#451A03\`).

#### 3. Havana Nights Speakeasy
* **The Atmosphere:** Cuban rum tasting bar, lush tropical monstera and palm leaves, brass ceiling fans, cigar rolling station, and acoustic bossa-nova rhythms.

💡 *Tip from Aura: Prioritize concentrated lighting zones over uniform lighting to make small spaces feel like an exclusive VIP lounge.*`;
    } else {
      return `### 🎪 3 Inspiring Themes for ${event.title}

Designed for community engagement, warm togetherness, and memorable shared moments for **${event.guestCount} attendees**:

#### 1. Artisanal Harvest & Folk Grove (Recommended)
* **The Atmosphere:** Open-air festoon string lights crisscrossing lawn trees, rustic cedarwood merchant stalls, hay bale picnic lounges, and acoustic folk music.
* **Color Palette:**
  * Forest Sage (\`#059669\`)
  * Honey Amber (\`#D97706\`)
  * Terracotta Clay (\`#EA580C\`)
  * Sunshine Gold (\`#FBBF24\`)
* **Signature Community Feature:** A communal "Wishes & Gratitude Loom" where attendees tie ribbons with written hopes for the neighborhood.
* **Sustainability Focus:** 100% compostable food ware with solar-powered charging and water refill stations.

#### 2. Modern Kinetic Arts & Street Market
* **The Atmosphere:** Live mural painting walls, interactive light installations, modular food truck clusters, and a youth talent amphitheater.
* **Color Palette:** Vibrant Cyan (\`#06B6D4\`), Electric Lime (\`#84CC16\`), Coral Sunset (\`#F43F5E\`).

#### 3. Midsummer Lantern & Eco-Fair
* **The Atmosphere:** Twilight paper lanterns, botanical seed planting stations, acoustic lawn performances, and local honey/bread tasting competitions.`;
    }
  }

  /**
   * 2. Smart Budget Allocator
   */
  static getSmartBudgetBreakdown(event) {
    const cur = event.currency || '$';
    const total = event.targetBudget || 10000;
    const guests = event.guestCount || 80;

    let venuePct = 0.30;
    let cateringPct = 0.35;
    let photoPct = 0.12;
    let decorPct = 0.10;
    let musicPct = 0.08;
    let bufferPct = 0.05;

    if (event.type === 'community') {
      venuePct = 0.20;
      cateringPct = 0.15;
      decorPct = 0.25;
      musicPct = 0.20;
      photoPct = 0.08;
      bufferPct = 0.12;
    } else if (event.type === 'birthday') {
      venuePct = 0.35;
      cateringPct = 0.35;
      decorPct = 0.10;
      musicPct = 0.12;
      photoPct = 0.04;
      bufferPct = 0.04;
    }

    const items = [
      { name: 'Venue & Facilities Rental', category: 'Venue', estimated: Math.round(total * venuePct), actual: Math.round(total * venuePct * 0.98), status: 'deposit' },
      { name: 'Catering, Food Stations & Drinks', category: 'Catering', estimated: Math.round(total * cateringPct), actual: Math.round(total * cateringPct * 1.02), status: 'deposit' },
      { name: 'Photography & Creative Video Capture', category: 'Photography', estimated: Math.round(total * photoPct), actual: Math.round(total * photoPct), status: 'paid' },
      { name: 'Floral Arrangements, Lighting & Rentals', category: 'Decor', estimated: Math.round(total * decorPct), actual: Math.round(total * decorPct * 0.95), status: 'pending' },
      { name: 'Music, Sound System & DJ/Live Acts', category: 'Music', estimated: Math.round(total * musicPct), actual: Math.round(total * musicPct), status: 'deposit' },
      { name: 'Contingency & Emergency Reserve', category: 'Buffer', estimated: Math.round(total * bufferPct), actual: 0, status: 'pending' }
    ];

    const costPerGuest = Math.round(total / (guests || 1));

    const markdown = `### 💰 Strategic Budget Allocation for ${event.title}

* **Target Budget:** \`${cur}${total.toLocaleString()}\`
* **Guest Count:** \`${guests} guests\`
* **Effective Spend Per Guest:** \`${cur}${costPerGuest}\`

| Expense Category | Allocation % | Estimated Budget | Aura Optimization Advice |
| :--- | :--- | :--- | :--- |
| **Venue & Permits** | ${(venuePct * 100).toFixed(0)}% | **${cur}${items[0].estimated.toLocaleString()}** | Ensure load-in/out hours are included to prevent overtime fees. |
| **Food & Beverage** | ${(cateringPct * 100).toFixed(0)}% | **${cur}${items[1].estimated.toLocaleString()}** | Family-style or stations often save 15-20% compared to plated coursing. |
| **Photo & Video** | ${(photoPct * 100).toFixed(0)}% | **${cur}${items[2].estimated.toLocaleString()}** | Book a 6-to-8 hour block covering key highlights rather than 12 hours. |
| **Decor & Florals** | ${(decorPct * 100).toFixed(0)}% | **${cur}${items[3].estimated.toLocaleString()}** | Repurpose ceremony florals into reception bar & cake backdrops. |
| **Entertainment & Sound** | ${(musicPct * 100).toFixed(0)}% | **${cur}${items[4].estimated.toLocaleString()}** | Bundle MC hosting with sound engineer to eliminate duplicate equipment fees. |
| **Emergency Buffer** | ${(bufferPct * 100).toFixed(0)}% | **${cur}${items[5].estimated.toLocaleString()}** | Mandatory buffer for weather adaptations, tips, and rush deliveries. |

#### 💡 Aura's 3 Secret Cost-Saving Recommendations:
1. **Curated Bar Strategy:** Instead of an unrestricted full bar, offer high-quality wine, craft beer, and 2 signature cocktails. This trims beverage overhead by up to **28%**.
2. **Seasonal Botanical Sourcing:** Ask your florist to substitute imported blooms with local seasonal stems of equivalent texture (e.g. garden spray roses and ranunculus instead of rare peonies).
3. **Digital Stationery with Printed Keepsakes:** Use digital RSVP collection with QR codes, printing only physical keepsake invitations for VIP family members.`;

    return { markdown, items };
  }

  /**
   * 3. Run-of-Show & Timeline Itinerary
   */
  static getRunOfShow(event) {
    let items = [];
    let markdown = '';

    if (event.type === 'wedding') {
      items = [
        { time: '09:30 AM', title: 'Bridal Suite Hair & Makeup Prep', location: 'Bridal Suite', notes: 'Light pastries and coffee for bridal party' },
        { time: '12:00 PM', title: 'Vendor Load-in & Floral Arch Construction', location: 'Main Garden', notes: 'Coordinator checks audio levels and seating' },
        { time: '02:00 PM', title: 'First Look & Couple Portraits', location: 'Sunlit Courtyard', notes: 'Private portraits before guests arrive' },
        { time: '03:30 PM', title: 'Guest Arrival & Welcome Refreshments', location: 'Garden Terrace', notes: 'Acoustic violin music and sparkling lavender spritz' },
        { time: '04:00 PM', title: 'Wedding Ceremony Processional', location: 'Floral Arch', notes: 'Exchange of vows, rings, and first kiss' },
        { time: '04:45 PM', title: 'Cocktail Hour & Golden Hour Photos', location: 'Piazza', notes: 'Passed hor d\'oeuvres and open bar opens' },
        { time: '06:15 PM', title: 'Grand Entrance & Welcome Dinner', location: 'Reception Conservatory', notes: 'Dinner served followed by toasts' },
        { time: '08:00 PM', title: 'Cake Cutting & First Dance', location: 'Dance Floor', notes: 'Band initiates upbeat dance set' },
        { time: '10:30 PM', title: 'Grand Sparkler Send-off', location: 'Front Portico', notes: 'Guest tunnel with sparklers & getaway transport' }
      ];

      markdown = `### ⏳ Minute-by-Minute Run-of-Show Itinerary

Here is a seamless, low-stress day-of timeline structured to ensure zero awkward pauses and smooth guest transitions:

* **09:30 AM — Glamour & Getting Ready:** Hair, makeup, and photographer arrives for detail shots (rings, dress, stationery).
* **12:00 PM — Vendor Operations:** Florist installs botanical arch; sound engineer performs mic checks.
* **02:00 PM — Intimate First Look:** Couple's emotional first look and bridal party portraits while makeup is pristine.
* **03:30 PM — Welcoming the Guests:** Soft instrumental music plays; welcome drinks served to set a celebratory mood.
* **04:00 PM — The Ceremony:** Processional, personalized vows, ring exchange, and joyous recessional.
* **04:45 PM — Cocktail Hour:** Golden hour photo session for couple while guests enjoy drinks and canapés.
* **06:15 PM — Dinner & Speeches:** Welcome remarks by hosts; 3 curated heartfelt toasts paced between courses.
* **08:00 PM — First Dance & Party Launch:** Cake cutting immediately into the couple's first dance, opening the dance floor!
* **10:30 PM — Sparkler Farewell:** Grand exit through twin rows of sparklers.

💡 *Aura Coordinator Tip: Always add 10-15 minute buffer cushions before the ceremony and before the grand entrance. Guests always take longer to find their seats than anticipated!*`;
    } else if (event.type === 'birthday') {
      items = [
        { time: '05:30 PM', title: 'Sound, Neon & Bartender Setup', location: 'Rooftop Bar', notes: 'Check neon photo wall lighting & chill champagne' },
        { time: '07:30 PM', title: 'VIP Doors & Welcome Signature Drinks', location: 'Skyline Terrace', notes: 'Chill house DJ music & polaroid guest book' },
        { time: '09:00 PM', title: 'Artisanal Tapas & Interactive Photo Moments', location: 'Lounge Area', notes: 'Tapas stations open' },
        { time: '10:45 PM', title: 'Birthday Roast, Toast & Champagne Cascade', location: 'Center Bar', notes: 'Coupe tower pour and birthday tribute' },
        { time: '11:59 PM', title: 'Midnight Countdown & Confetti Drop', location: 'Terrace Edge', notes: 'High-energy celebration & late night dance' }
      ];

      markdown = `### ⏳ High-Vibe Party Run-of-Show

* **05:30 PM — Production Setup:** DJ sound check, bartender batching signature syrups, neon wall lit.
* **07:30 PM — Doors Open:** Guests arrive to glowing twilight skyline, signature welcome cocktail in hand.
* **09:00 PM — Tapas & Mingling:** Passed gourmet tapas, Polaroid photo booth station in full swing.
* **10:45 PM — The Birthday Roast & Toast:** Short, punchy toasts from best friends followed by champagne tower pouring.
* **11:59 PM — The Midnight Peak:** High energy countdown, sparklers, and favorite anthem on the sound system!`;
    } else {
      items = [
        { time: '07:30 AM', title: 'Vendor & Artisan Stalls Load-In', location: 'Park Entrance', notes: 'Assign booth slots and distribute event badges' },
        { time: '09:30 AM', title: 'Health, Safety & Sound Check', location: 'Entire Grounds', notes: 'First aid tent setup and sound inspection' },
        { time: '10:00 AM', title: 'Festival Gates Open to Public', location: 'Main Arch', notes: 'Community band fanfare and welcome desk' },
        { time: '12:00 PM', title: 'Opening Ceremony & Community Showcase', location: 'Main Amphitheater', notes: 'Local council speech and community choir' },
        { time: '02:30 PM', title: 'Kids Workshops & Artisan Competitions', location: 'Lawn Area', notes: 'Baking contest and eco-craft workshop' },
        { time: '06:00 PM', title: 'Twilight Lawn Concert & Community Dance', location: 'Acoustic Stage', notes: 'Headline folk band performs' },
        { time: '08:00 PM', title: 'Festival Close & Zero-Waste Cleanup', location: 'Park Grounds', notes: 'Volunteer breakdown and recycling collation' }
      ];

      markdown = `### ⏳ Community Fair Master Schedule

Structured for smooth foot traffic flow, family safety, and dynamic stage programming:

* **07:30 AM — Logistics & Load-in:** Managed vehicle queue for artisan booths and food trucks.
* **09:30 AM — Safety Sign-off:** First aid tent, fire extinguishers, and electrical cord covers verified.
* **10:00 AM — Public Opening:** Gates open with live welcome brass/acoustic music.
* **12:00 PM — Civic Spotlight:** Ribbon cutting, community leader address, and local choir.
* **02:30 PM — Afternoon Activity Peak:** Pie judging, interactive craft workshops, and face painting.
* **06:00 PM — Sunset Concert:** Headliner band performance as festoon lights illuminate the lawn.
* **08:00 PM — Zero-Waste Egress:** Coordinated volunteer clean-up and recycling collation.`;
    }

    return { markdown, items };
  }

  /**
   * 4. Vendor Checklist & Interview Questions
   */
  static getVendorChecklist(event) {
    return `### 📋 Comprehensive Vendor Vetting & Contract Checklist

Before signing contracts or wiring non-refundable deposits, review these essential questions across key vendor categories:

#### 1. 🍽️ Caterer & Bar Service
* **Essential Questions:**
  * *"Is cleanup, trash disposal, and linen removal included in your staffing fee?"*
  * *"What is your exact protocol for severe allergies (nut, celiac) to avoid cross-contamination?"*
  * *"Can we supply our own alcohol with a corkage fee, or must we buy through your license?"*
* ⚠️ **Red Flag:** Vague per-person quotes that fail to specify server gratuity, service charges, or sales tax (which often add 25-32% onto final invoices).

#### 2. 📸 Photographer & Videographer
* **Essential Questions:**
  * *"Will you personally shoot our event, or does your agency assign an associate shooter?"*
  * *"What is your backup equipment protocol if a lens or memory card fails during the ceremony?"*
  * *"What is the guaranteed delivery timeframe in writing for the preview gallery vs the full hi-res suite?"*
* ⚠️ **Red Flag:** No liability insurance policy (most reputable venues require a $1M to $2M COI from photographers).

#### 3. 🏰 Venue Host
* **Essential Questions:**
  * *"What are the exact decibel restrictions and hard cutoff times for amplified music?"*
  * *"In the event of sudden rain or extreme heat, what is the exact indoor backup plan and transition time?"*
  * *"How many hours prior to event start are vendors allowed on-site for load-in without additional fees?"*

#### 4. 🎵 DJ & Live Music
* **Essential Questions:**
  * *"Do you bring backup sound mixers and wireless microphones for toasts and speeches?"*
  * *"How do you handle guest song requests vs our strictly enforced 'Do Not Play' list?"*

💡 *Aura Pro Tip: Always ensure payments are split into at least 3 milestones (Deposit, Mid-point Check-in, and Final balance 7-14 days before the event). Never pay 100% upfront.*`;
  }

  /**
   * 5. Creative Copy, Invitations & Speeches
   */
  static getCreativeCopy(event) {
    if (event.type === 'wedding') {
      return `### 💌 Personalized Invitation Wording & Toast Speeches

Here are 3 distinct invitation tones crafted for **${event.title}**:

#### Option A: Romantic & Classical
> *"The honor of your presence is requested at the marriage of Aria & Julian.  
> As two lives join together in love and partnership, please join us for a celebration in the garden at Meadowood Conservatories, Napa Valley.  
> Saturday, the eighteenth of June, two thousand twenty-seven, at four o'clock in the afternoon.  
> Dinner, drinks, and joyful dancing to follow."*

#### Option B: Modern, Warm & Chic
> *"We’re getting married!  
> Aria and Julian invite you to share our happiest day surrounded by good wine, blooming gardens, and the people we cherish most.  
> June 18, 2027 • Napa Valley, CA  
> RSVP online by May 10th."*

---

### 🥂 Heartfelt Toast Speech Framework (For Maid of Honor / Best Man / Host)
1. **The Warm Hook (0-1 min):** *"Good evening everyone. If you don't know me, I'm [Name], and I've had the immense honor of knowing [Bride/Groom] for [X] years..."*
2. **The Revealing Anecdote (1-2 mins):** Share a lighthearted memory demonstrating their kindness, humor, or loyalty.
3. **The Turning Point (2-3 mins):** *"When [Partner] first walked into the picture, everything clicked. I noticed [Partner] made [Bride/Groom] laugh in a way nobody else could..."*
4. **The Toast (30 secs):** *"To love that grows deeper with every season, to friendship that endures, and to Aria and Julian. Raise your glasses!"*`;
    } else {
      return `### ✉️ Creative Invitation Copy & Toast Framework

#### Option 1: Sleek & Energetic
> *"Level 30: Unlocked.  
> You're invited to celebrate Leo's 30th Birthday under the neon skyline.  
> Expect craft cocktails, rooftop views, and unforgettable memories as we toast to the next decade.  
> New Year's Eve • The Apex Penthouse • Dress: Elevated Nightlife"*

#### Option 2: Witty & Warm
> *"They say thirty is the new twenty, but with better cocktails and stronger opinions.  
> Come raise a glass to Leo as we welcome chapter thirty in style!"*

---

### 🎙️ The 3-Minute Birthday Toast Guide:
* **Minute 1:** A hilarious memory from their twenties.
* **Minute 2:** Why this person is such an anchor of support and joy for everyone in this room.
* **Minute 3:** A celebratory countdown toast to the boldest decade yet!`;
    }
  }

  /**
   * 6. Catering & Signature Cocktails
   */
  static getCateringDrinks(event) {
    return `### 🍸 Curated Signature Drink Pairings & Menu Ideas

Elevate the guest culinary experience with these handcrafted beverage concepts and food pairings:

#### 1. "The Botanical Bloom" (Signature Gin/Mocktail Cocktail)
* **Ingredients:** Empress 1908 Indigo Gin (or botanical non-alcoholic spirit), Elderflower St-Germain, Fresh Lemon Juice, Fever-Tree Sparkling Tonic, Candied Viola Flower & Rosemary Sprig garnish.
* **Vibe:** Color-shifting lavender hue that looks stunning in coupe glassware.
* **Food Pairing:** Smoked salmon crostini with dill creme fraiche or herbed goat cheese tartlets.

#### 2. "The Napa Orchard Ember" (Warm & Earthy)
* **Ingredients:** Kentucky Bourbon, Spiced Apple-Cinnamon Reduction, Sweet Vermouth, Angostura Bitters, Smoked Orange Peel.
* **Food Pairing:** Miniature braised short-rib sliders with caramelized shallot jam.

#### 3. Zero-Proof Mocktail: "The Sparkling Blackberry Spritzer"
* **Ingredients:** Muddled wild blackberries, fresh lime juice, organic honey syrup, club soda, and fresh mint.
* **Why it shines:** Gives non-drinking guests an equally sophisticated, artisanal beverage experience.`;
  }

  /**
   * 7. Favors & Souvenirs
   */
  static getFavorIdeas(event) {
    return `### 🎁 Memorable & Sustainable Guest Favor Concepts

Skip generic trinkets that get left behind. Here are high-perceived-value, thoughtful souvenirs:

1. **Custom Seeded Plantable Seed Paper:** Personalized cards embedded with wildflower or culinary herb seeds (basil, thyme, poppies) that guests plant in their home garden.
2. **Artisanal Local Honey / Olive Oil Vials:** Mini hexagonal glass jars sourced from local regional apiaries with custom wax-stamped labels: *"Sweet love from [Event Name]"*.
3. **Engraved Acoustic Wood Coasters:** Laser-etched birch wood coasters with a minimalist botanical line illustration and event date.
4. **Signature Tea Blend in Cork Vials:** Custom blend of loose-leaf Earl Grey, rose petals, and lavender blossoms with a miniature gold brewing spoon.`;
  }

  /**
   * 8. General Consulting
   */
  static getGeneralConsulting(prompt, event) {
    return `### 💡 Aura Event Consulting

Thank you for your question regarding **${event.title}**.

Here is strategic guidance tailored to your event parameters (${event.guestCount} guests • ${event.currency}${event.targetBudget.toLocaleString()} target budget • ${event.location}):

#### Key Considerations:
* **Logistics & Guest Flow:** For an event of this scale, anticipate that arrivals peak 15-20 minutes before official start time. Ensure check-in or welcome stations have at least 2 hosts to prevent bottlenecks.
* **Weather & Environmental Contingencies:** Always confirm outdoor shelter, patio heaters, or indoor cooling units with venue management at least 14 days prior to event day.
* **Vendor Coordination:** Share your day-of Run-of-Show with all vendors 1 week in advance so every vendor knows exactly where power drops, loading zones, and vendor meal stations are located.

*Feel free to ask me to draft invitations, generate vendor interview checklists, optimize your budget breakdown, or outline minute-by-minute schedules!*`;
  }

  /**
   * Detect and parse actionable data from responses
   */
  static detectActionableData(text, event) {
    if (text.includes('Budget') || text.includes('Allocation')) {
      return { type: 'budget_items', label: 'Apply Suggested Allocations' };
    }
    if (text.includes('Run-of-Show') || text.includes('Timeline')) {
      return { type: 'timeline_items', label: 'Import Run-of-Show to Schedule' };
    }
    return null;
  }
}
