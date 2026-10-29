/**
 * Celebráti AI - Event Data Models & State Management
 * Pre-configured with realistic showcase celebrations: Wedding, Birthday & Community Festival
 */

const STORAGE_KEY = 'celebrati_events_data_v1';
const ACTIVE_EVENT_KEY = 'celebrati_active_event_id';

export const INITIAL_EVENTS = [
  {
    id: 'wedding-aria-julian',
    title: "Aria & Julian's Botanical Garden Wedding",
    type: 'wedding',
    date: '2027-06-18T16:00',
    location: 'Meadowood Botanical Conservatories, Napa Valley',
    targetBudget: 28000,
    currency: '$',
    guestCount: 120,
    heroImage: 'assets/images/wedding.jpg',
    themeName: 'Enchanted Botanical Romance',
    themeVibe: 'Romantic, timeless, fairy-lit greenery with blush roses and warm gold accents',
    palette: [
      { name: 'Blush Rose', hex: '#F472B6' },
      { name: 'Sage Green', hex: '#10B981' },
      { name: 'Champagne Gold', hex: '#F59E0B' },
      { name: 'Soft Ivory', hex: '#FFFBEB' },
      { name: 'Deep Plum', hex: '#581C87' }
    ],
    budget: [
      { id: 'b1', name: 'Glasshouse Conservatory Venue Rental', category: 'Venue', estimated: 7500, actual: 7500, status: 'deposit', notes: 'Includes 10 hours access & tables/chairs' },
      { id: 'b2', name: 'Farm-to-Table Plated Dinner & Wine', category: 'Catering', estimated: 8400, actual: 8600, status: 'deposit', notes: '3-course organic dinner for 120 guests + open bar' },
      { id: 'b3', name: 'Fine Art Wedding Photography & Video', category: 'Photography', estimated: 3800, actual: 3800, status: 'paid', notes: 'Full day coverage with second shooter and drone film' },
      { id: 'b4', name: 'Floral Arch, Centerpieces & Bouquets', category: 'Decor', estimated: 3200, actual: 3000, status: 'deposit', notes: 'Eucalyptus, blush garden roses & hanging fairy lights' },
      { id: 'b5', name: 'Acoustic Trio & Evening Live DJ', category: 'Music', estimated: 2200, actual: 2200, status: 'deposit', notes: 'Ceremony acoustic violin/cello + reception dance set' },
      { id: 'b6', name: 'Custom 3-Tier Pistachio Rosewater Cake', category: 'Catering', estimated: 750, actual: 700, status: 'pending', notes: 'Gluten-free top tier included' },
      { id: 'b7', name: 'Letterpress Invitations & Place Cards', category: 'Stationery', estimated: 650, actual: 620, status: 'paid', notes: 'Wax sealed handmade paper suites' },
      { id: 'b8', name: 'Botanical Seed Packet Favors & Ribbons', category: 'Favors', estimated: 350, actual: 320, status: 'pending', notes: 'Wildflower seeds in mini burlap pouches' },
      { id: 'b9', name: 'Contingency / Emergency Buffer', category: 'Buffer', estimated: 1150, actual: 400, status: 'pending', notes: 'Weather protection & unexpected add-ons' }
    ],
    timeline: [
      { id: 't1', title: 'Confirm Venue & Sign Glasshouse Contract', phase: '6-12 Months Before', date: '2026-08-15', completed: true, priority: 'critical', assignee: 'Aria & Julian' },
      { id: 't2', title: 'Book Photographer & Schedule Engagement Shoot', phase: '6-12 Months Before', date: '2026-09-20', completed: true, priority: 'high', assignee: 'Aria' },
      { id: 't3', title: 'Catering Tasting & Custom Menu Selection', phase: '3-6 Months Before', date: '2027-01-14', completed: true, priority: 'high', assignee: 'Both' },
      { id: 't4', title: 'Send Formal Invitations & Launch RSVP Portal', phase: '3-6 Months Before', date: '2027-02-10', completed: true, priority: 'medium', assignee: 'Julian' },
      { id: 't5', title: 'Floral Mockup & Table Centerpiece Review', phase: '1 Month Before', date: '2027-05-10', completed: false, priority: 'medium', assignee: 'Aria & Florist' },
      { id: 't6', title: 'Final Headcount & Dietary List to Caterer', phase: '2 Weeks Before', date: '2027-06-01', completed: false, priority: 'critical', assignee: 'Julian' },
      { id: 't7', title: 'Rehearsal Dinner at Napa Vineyard', phase: 'Day Before', date: '2027-06-17', completed: false, priority: 'high', assignee: 'Wedding Party' },
      { id: 't8', title: 'Wedding Ceremony & Reception Celebration', phase: 'Day Of', date: '2027-06-18', completed: false, priority: 'critical', assignee: 'Everyone' }
    ],
    runOfShow: [
      { id: 'ros1', time: '10:00 AM', title: 'Bridal Suite Hair & Makeup Starts', location: 'Bridal Cottage', notes: 'Mimosas & light breakfast for bridal party', completed: false },
      { id: 'ros2', time: '12:30 PM', title: 'Florist & Decor Crew Setup', location: 'Conservatory Arch & Lawn', notes: 'Arch greenery, fairy lights and table candles check', completed: false },
      { id: 'ros3', time: '02:30 PM', title: 'First Look & Couple Portraits', location: 'Olive Grove Pathway', notes: 'Photographer to guide private quiet moment', completed: false },
      { id: 'ros4', time: '03:30 PM', title: 'Guests Arrive & Welcome Sparkling Spritz', location: 'Terrace Garden', notes: 'Acoustic violin duo playing classical renditions', completed: false },
      { id: 'ros5', time: '04:00 PM', title: 'Ceremony Processional Begins', location: 'Botanical Floral Arch', notes: 'Vows exchange and ring blessing', completed: false },
      { id: 'ros6', time: '05:00 PM', title: 'Golden Hour Cocktail Reception & Canapes', location: 'Glass Terrace', notes: 'Passed hor d\'oeuvres and signature drinks', completed: false },
      { id: 'ros7', time: '06:30 PM', title: 'Grand Entrance & Plated Dinner', location: 'Main Conservatory Hall', notes: 'Welcome toast by Maid of Honor and Best Man', completed: false },
      { id: 'ros8', time: '08:00 PM', title: 'Cake Cutting & First Dance', location: 'Dance Floor', notes: 'Song: "La Vie En Rose" acoustic version', completed: false },
      { id: 'ros9', time: '10:30 PM', title: 'Sparkler Grand Exit & Farewell', location: 'Conservatory Courtyard', notes: 'Sparklers handed out by coordinators', completed: false }
    ],
    vendors: [
      {
        id: 'v1',
        name: 'Meadowood Botanical Estate',
        category: 'Venue',
        contact: 'Elena Rostova',
        phone: '+1 (707) 555-0192',
        email: 'events@meadowoodestate.com',
        quote: 7500,
        depositPaid: 3750,
        status: 'contracted',
        checklist: [
          { text: 'Verify noise curfew regulations (11:00 PM)', done: true },
          { text: 'Confirm bridal suite access time (09:00 AM)', done: true },
          { text: 'Arrange rain contingency layout in glass hall', done: true }
        ],
        notes: 'Security deposit refundable within 14 days of event.'
      },
      {
        id: 'v2',
        name: 'Artisan Thyme Catering & Cellars',
        category: 'Catering',
        contact: 'Chef Marcus Vance',
        phone: '+1 (707) 555-0843',
        email: 'marcus@artisanthymecatering.com',
        quote: 8400,
        depositPaid: 4200,
        status: 'contracted',
        checklist: [
          { text: 'Finalize dietary alternatives (12 GF, 6 Vegan)', done: true },
          { text: 'Confirm vendor meals for band & photographers', done: false },
          { text: 'Bar staffing ratio: 1 bartender per 50 guests', done: true }
        ],
        notes: 'Provides table linens and crystal stemware.'
      },
      {
        id: 'v3',
        name: 'Lumière Fine Art Imagery',
        category: 'Photography',
        contact: 'Sophie Chen',
        phone: '+1 (415) 555-7721',
        email: 'sophie@lumierefineart.com',
        quote: 3800,
        depositPaid: 3800,
        status: 'paid',
        checklist: [
          { text: 'Share shot list (grandparents, ring detail, veil toss)', done: true },
          { text: 'Schedule golden hour couple portraits for 05:15 PM', done: true },
          { text: 'Confirm 8-week delivery timeline for online gallery', done: true }
        ],
        notes: 'Paid in full. Includes 40-page linen album.'
      },
      {
        id: 'v4',
        name: 'Fleuriste Petals & Stems',
        category: 'Decor',
        contact: 'Camille Laurent',
        phone: '+1 (415) 555-3210',
        email: 'hello@fleuristepetals.com',
        quote: 3200,
        depositPaid: 1600,
        status: 'contracted',
        checklist: [
          { text: 'Inspect sample arch installation photos', done: true },
          { text: 'Confirm 14 table centerpieces with mercury glass candles', done: false },
          { text: 'Breakdown and compost collection at 11:30 PM', done: false }
        ],
        notes: 'Will repurpose ceremony arch florals for sweetheart table.'
      }
    ],
    guests: [
      { id: 'g1', name: 'Eleanor & Robert Vance', rsvp: 'accepted', count: 2, dietary: 'None', table: 'Table 1 (Family)' },
      { id: 'g2', name: 'Dr. Sarah Sterling', rsvp: 'accepted', count: 1, dietary: 'Gluten-Free', table: 'Table 2 (Friends)' },
      { id: 'g3', name: 'Michael & David Rossi', rsvp: 'accepted', count: 2, dietary: 'Vegetarian', table: 'Table 2 (Friends)' },
      { id: 'g4', name: 'Claire Dupont', rsvp: 'pending', count: 2, dietary: 'Nut Allergy', table: 'Unassigned' },
      { id: 'g5', name: 'Aunt Beatrix Miller', rsvp: 'accepted', count: 1, dietary: 'Vegan', table: 'Table 1 (Family)' },
      { id: 'g6', name: 'Kevin O’Connor', rsvp: 'declined', count: 1, dietary: 'None', table: 'N/A' }
    ],
    personalizedIdeas: {
      signatureDrinks: [
        { name: 'The Napa Sunset Spritz', ingredients: 'Sparkling Rosé, Elderflower Liqueur, Fresh Grapefruit, Thyme Sprig' },
        { name: 'Smoked Botanical Old Fashioned', ingredients: 'Small Batch Bourbon, Fig Bitters, Orange Peel, Rosemary Smoke' }
      ],
      playlistVibes: 'Golden hour acoustic covers, Leon Bridges, Norah Jones, French jazz into vibrant indie pop',
      invitationStyles: {
        romantic: "Together with their families, Aria & Julian invite you to celebrate their love under the golden Napa skies as they exchange wedding vows at Meadowood Botanical Conservatories.",
        modern: "Aria and Julian are getting married! Join us for an evening of wine, love, and dancing in the gardens on June 18th, 2027.",
        poetic: "Two souls, one blooming garden, and a lifetime of love. Please grace us with your presence as we pledge our tomorrows to each other."
      }
    }
  },
  {
    id: 'birthday-leo-30',
    title: "Leo's Neon Cyber-Lounge 30th Birthday",
    type: 'birthday',
    date: '2026-12-31T20:00',
    location: 'The Apex Penthouse & Rooftop Lounge, Downtown',
    targetBudget: 5000,
    currency: '$',
    guestCount: 45,
    heroImage: 'assets/images/birthday.jpg',
    themeName: 'Cyberpunk Glow & Rooftop Mixology',
    themeVibe: 'Futuristic chic, ambient purple and cyan neon, celebratory champagne towers, craft mixology and skyline views',
    palette: [
      { name: 'Neon Violet', hex: '#8B5CF6' },
      { name: 'Electric Fuchsia', hex: '#EC4899' },
      { name: 'Cyber Amber', hex: '#F59E0B' },
      { name: 'Midnight Onyx', hex: '#0F172A' },
      { name: 'Chrome Silver', hex: '#E2E8F0' }
    ],
    budget: [
      { id: 'b10', name: 'Skyline Penthouse Rooftop Lounge Rental', category: 'Venue', estimated: 1800, actual: 1800, status: 'paid', notes: '4 hour private terrace booking' },
      { id: 'b11', name: 'Craft Cocktail Bar & Champagne Tower', category: 'Catering', estimated: 1600, actual: 1750, status: 'deposit', notes: '2 signature drinks + prosecco cascade' },
      { id: 'b12', name: 'Gourmet Sliders, Tacos & Bao Tapas', category: 'Catering', estimated: 800, actual: 750, status: 'deposit', notes: 'Passed finger food throughout the night' },
      { id: 'b13', name: 'Neon LED Custom Sign ("LEO 30") & Decor', category: 'Decor', estimated: 450, actual: 420, status: 'paid', notes: 'Custom purple LED flex sign for photo wall' },
      { id: 'b14', name: 'House & Synthwave DJ Set', category: 'Music', estimated: 600, actual: 600, status: 'deposit', notes: '3-hour live mixing set' },
      { id: 'b15', name: 'Black Velvet Geode Cake', category: 'Catering', estimated: 250, actual: 250, status: 'pending', notes: 'Edible gold leaf with amethyst crystal candy' }
    ],
    timeline: [
      { id: 't10', title: 'Lock Penthouse Terrace for NYE Celebration', phase: '3-6 Months Before', date: '2026-09-01', completed: true, priority: 'critical', assignee: 'Leo' },
      { id: 't11', title: 'Order Custom LED Neon Signage', phase: '1 Month Before', date: '2026-11-20', completed: true, priority: 'high', assignee: 'Leo' },
      { id: 't12', title: 'Send Digital Animated Invitations', phase: '1 Month Before', date: '2026-12-01', completed: true, priority: 'medium', assignee: 'Leo' },
      { id: 't13', title: 'Finalize DJ Setlist & Sound Check', phase: '1 Week Before', date: '2026-12-24', completed: false, priority: 'high', assignee: 'DJ & Host' },
      { id: 't14', title: 'New Year Eve 30th Birthday Bash Kickoff', phase: 'Day Of', date: '2026-12-31', completed: false, priority: 'critical', assignee: 'Everyone' }
    ],
    runOfShow: [
      { id: 'ros10', time: '06:00 PM', title: 'Venue Setup, Sound & Neon Wall Prep', location: 'Penthouse', notes: 'Plug in LED signs, test smoke effects and DJ booth', completed: false },
      { id: 'ros11', time: '08:00 PM', title: 'VIP Doors Open & Welcome Cocktails', location: 'Rooftop Bar', notes: 'Signature "Electric Violet" cocktails served', completed: false },
      { id: 'ros12', time: '09:30 PM', title: 'Tapas Food Stations & Photo Booth', location: 'Lounge Area', notes: 'Polaroid guestbook with metallic sharpies', completed: false },
      { id: 'ros13', time: '11:15 PM', title: 'Birthday Roast & Toast Speech', location: 'DJ Stage', notes: 'Best friends toast & LED champagne cascade', completed: false },
      { id: 'ros14', time: '11:59 PM', title: 'NYE Countdown & Birthday Confetti Burst', location: 'Terrace Edge', notes: 'Celebrate both 30th milestone & New Year simultaneously!', completed: false }
    ],
    vendors: [
      {
        id: 'v10',
        name: 'The Apex Skyline Penthouse',
        category: 'Venue',
        contact: 'Jordan Blake',
        phone: '+1 (213) 555-8910',
        email: 'rentals@apexskyline.com',
        quote: 1800,
        depositPaid: 1800,
        status: 'paid',
        checklist: [
          { text: 'Check elevator freight access for sound gear', done: true },
          { text: 'Ensure sound permits till 01:30 AM', done: true }
        ],
        notes: 'Includes rooftop heating lamps and lounge furniture.'
      },
      {
        id: 'v11',
        name: 'Liquid Alchemy Mobile Bar',
        category: 'Catering',
        contact: 'Mateo Cruz',
        phone: '+1 (213) 555-4422',
        email: 'info@liquidalchemybar.com',
        quote: 1600,
        depositPaid: 800,
        status: 'contracted',
        checklist: [
          { text: 'Provide 5-tier champagne coupe tower', done: true },
          { text: 'Bring dry ice for smoky signature cocktails', done: false }
        ],
        notes: 'Will bring 2 licensed mixologists.'
      }
    ],
    guests: [
      { id: 'g10', name: 'Maya Lin', rsvp: 'accepted', count: 1, dietary: 'Vegetarian', table: 'VIP Lounge' },
      { id: 'g11', name: 'Zack Morris', rsvp: 'accepted', count: 2, dietary: 'None', table: 'VIP Lounge' },
      { id: 'g12', name: 'Jessica Alba-Diaz', rsvp: 'accepted', count: 1, dietary: 'Gluten-Free', table: 'VIP Lounge' },
      { id: 'g13', name: 'Tariq Al-Mansoor', rsvp: 'pending', count: 1, dietary: 'Halal', table: 'Unassigned' }
    ],
    personalizedIdeas: {
      signatureDrinks: [
        { name: 'The Neon Horizon', ingredients: 'Empress 1908 Indigo Gin, Tonic, Elderflower, Glow Stirrer, Lime' },
        { name: 'Cyber Velvet Smoke', ingredients: 'Mezcal, Black Cherry Cordial, Citrus, Activated Charcoal Dust' }
      ],
      playlistVibes: 'Daft Punk, Rufus Du Sol, ODESZA, Nu-disco, Modern synthwave bangers',
      invitationStyles: {
        romantic: "Celebrate three decades of life, dreams, and memories under the stars on New Year's Eve as Leo turns 30.",
        modern: "Level 30 Unlocked. Join Leo for an unforgettable night of high-altitude cocktails, neon vibes, and midnight countdowns.",
        poetic: "Leaving the twenties in our rearview mirror. Step into the neon glow and toast to Leo's grand 30th chapter."
      }
    }
  },
  {
    id: 'community-harvest-fair',
    title: "Oakridge Harvest & Arts Community Fair",
    type: 'community',
    date: '2027-04-24T10:00',
    location: 'Oakridge Central Community Park & Amphitheater',
    targetBudget: 12500,
    currency: '$',
    guestCount: 450,
    heroImage: 'assets/images/community.jpg',
    themeName: 'Artisanal Harvest, Folk Music & Eco-Fair',
    themeVibe: 'Warm community festival, handcrafted wares, local produce, acoustic lawn concerts and family craft workshops',
    palette: [
      { name: 'Forest Green', hex: '#059669' },
      { name: 'Honey Amber', hex: '#D97706' },
      { name: 'Terracotta', hex: '#EA580C' },
      { name: 'Warm Sun', hex: '#FBBF24' },
      { name: 'Earth Brown', hex: '#78350F' }
    ],
    budget: [
      { id: 'b20', name: 'City Park Permits, Waste & Security Bonds', category: 'Venue', estimated: 2200, actual: 2200, status: 'paid', notes: 'Includes park ranger patrol and sound permits' },
      { id: 'b21', name: 'Amphitheater Sound Stage & Acoustic Gear', category: 'Music', estimated: 2800, actual: 2600, status: 'deposit', notes: '4 local folk bands & master of ceremonies mic' },
      { id: 'b22', name: '30 Artisanal Wooden Vendor Booths & Tents', category: 'Decor', estimated: 3400, actual: 3400, status: 'paid', notes: 'Rentals for farmers, potters and craft makers' },
      { id: 'b23', name: 'Kids Eco-Craft Workshop & Face Painting', category: 'Entertainment', estimated: 1200, actual: 1100, status: 'deposit', notes: 'Recycled art sculpting and pollinator seed bombs' },
      { id: 'b24', name: 'Compostable Dinnerware & Recycling Hubs', category: 'Operations', estimated: 900, actual: 850, status: 'deposit', notes: 'Zero-waste initiative requirement' },
      { id: 'b25', name: 'Community Banners, Maps & Directional Signage', category: 'Stationery', estimated: 800, actual: 750, status: 'paid', notes: 'Recycled kraft cardstock signs' }
    ],
    timeline: [
      { id: 't20', title: 'Submit Municipal Park & Amplified Sound Permit', phase: '6-12 Months Before', date: '2026-10-15', completed: true, priority: 'critical', assignee: 'Steering Committee' },
      { id: 't21', title: 'Open Artisan & Food Truck Vendor Applications', phase: '3-6 Months Before', date: '2026-12-01', completed: true, priority: 'high', assignee: 'Vendor Coordinator' },
      { id: 't22', title: 'Confirm Folk Band Lineup & Stage Schedule', phase: '1 Month Before', date: '2027-03-10', completed: false, priority: 'high', assignee: 'Music Director' },
      { id: 't23', title: 'Volunteer Orientation & First Aid Station Setup', phase: '1 Week Before', date: '2027-04-18', completed: false, priority: 'medium', assignee: 'Volunteer Lead' },
      { id: 't24', title: 'Oakridge Community Fair Celebration Day', phase: 'Day Of', date: '2027-04-24', completed: false, priority: 'critical', assignee: 'All Volunteers' }
    ],
    runOfShow: [
      { id: 'ros20', time: '07:00 AM', title: 'Park Gates Open for Vendor Load-in', location: 'Park Perimeter Road', notes: 'Assigned booth spots 1 to 30', completed: false },
      { id: 'ros21', time: '09:30 AM', title: 'Safety Inspection & Volunteer Briefing', location: 'Information Pavilion', notes: 'Safety officer signs off on electrical lines', completed: false },
      { id: 'ros22', time: '10:00 AM', title: 'Festival Gates Open to Public', location: 'Main Entrance Arch', notes: 'Welcome acoustic fanfare by Oakridge Brass', completed: false },
      { id: 'ros23', time: '12:00 PM', title: 'Mayor\'s Welcome & Community Choir', location: 'Main Amphitheater', notes: 'Opening speech honoring local craftspeople', completed: false },
      { id: 'ros24', time: '02:00 PM', title: 'Pie Baking Contest & Honey Judging', location: 'Artisan Barn', notes: 'Trophies awarded to local bakers', completed: false },
      { id: 'ros25', time: '05:30 PM', title: 'Sunset Ceilidh & Community Square Dance', location: 'Lawn Area', notes: 'Open participation dance for all ages', completed: false },
      { id: 'ros26', time: '07:30 PM', title: 'Festival Wrap-up & Eco Clean-up', location: 'Entire Park', notes: 'Zero-waste sorting and vendor load-out', completed: false }
    ],
    vendors: [
      {
        id: 'v20',
        name: 'Valley Audio & Stage Pro',
        category: 'Music',
        contact: 'Dave Miller',
        phone: '+1 (510) 555-8839',
        email: 'dave@valleyaudio.com',
        quote: 2800,
        depositPaid: 1400,
        status: 'contracted',
        checklist: [
          { text: 'Check weather canopy coverage for sound board', done: true },
          { text: 'Provide 4 wireless mics for speakers and MC', done: true }
        ],
        notes: 'Provides quiet generator power for stage.'
      },
      {
        id: 'v21',
        name: 'GreenEarth Clean & Waste Hubs',
        category: 'Operations',
        contact: 'Maria Santos',
        phone: '+1 (510) 555-3319',
        email: 'maria@greenearthwaste.org',
        quote: 900,
        depositPaid: 450,
        status: 'contracted',
        checklist: [
          { text: 'Deliver 6 multi-stream compost & recycling stations', done: true },
          { text: 'Organize volunteer education booth', done: false }
        ],
        notes: 'Compost hauled to Oakridge Community Farm.'
      }
    ],
    guests: [
      { id: 'g20', name: 'Oakridge Town Council Delegation', rsvp: 'accepted', count: 12, dietary: 'Mixed', table: 'VIP Pavilion' },
      { id: 'g21', name: 'Senior Center Shuttle Group', rsvp: 'accepted', count: 28, dietary: 'Standard', table: 'Shaded Arbor' },
      { id: 'g22', name: 'Youth Art Collective Volunteers', rsvp: 'accepted', count: 18, dietary: 'Vegetarian / Vegan', table: 'Youth Booth' }
    ],
    personalizedIdeas: {
      signatureDrinks: [
        { name: 'Wild Blackberry Honey Lemonade', ingredients: 'Fresh Lemon Juice, Oakridge Farm Honey, Wild Blackberries, Mint' },
        { name: 'Spiced Apple Cider Float', ingredients: 'Warm Spiced Local Cider, Cinnamon Stick, Vanilla Bean Gelato' }
      ],
      playlistVibes: 'Fleet Foxes, The Lumineers, Traditional Irish Fiddle, Warm bluegrass and local singer-songwriters',
      invitationStyles: {
        romantic: "Celebrate the bounty of nature and community spirit at the annual Oakridge Harvest & Arts Fair.",
        modern: "Music, makers, and delicious local food. The Oakridge Community Fair is back this April 24th! Admission is free.",
        poetic: "Where laughter weaves through ancient oaks and music fills the open sky. Come celebrate community with us."
      }
    }
  }
];

export class EventStorageManager {
  static getEvents() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to parse stored events from localStorage', e);
    }
    // Set initial
    this.saveEvents(INITIAL_EVENTS);
    return INITIAL_EVENTS;
  }

  static saveEvents(events) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.error('Failed to save events to localStorage', e);
    }
  }

  static getActiveEventId() {
    return localStorage.getItem(ACTIVE_EVENT_KEY) || INITIAL_EVENTS[0].id;
  }

  static setActiveEventId(id) {
    localStorage.setItem(ACTIVE_EVENT_KEY, id);
  }

  static getActiveEvent() {
    const events = this.getEvents();
    const activeId = this.getActiveEventId();
    return events.find(ev => ev.id === activeId) || events[0];
  }

  static updateActiveEvent(updatedEvent) {
    const events = this.getEvents();
    const idx = events.findIndex(ev => ev.id === updatedEvent.id);
    if (idx !== -1) {
      events[idx] = updatedEvent;
      this.saveEvents(events);
    }
  }

  static addEvent(newEvent) {
    const events = this.getEvents();
    events.unshift(newEvent);
    this.saveEvents(events);
    this.setActiveEventId(newEvent.id);
    return newEvent;
  }

  static deleteActiveEvent() {
    const events = this.getEvents();
    const activeId = this.getActiveEventId();
    if (events.length <= 1) {
      alert("You must keep at least one event in your planner.");
      return null;
    }
    const filtered = events.filter(e => e.id !== activeId);
    this.saveEvents(filtered);
    this.setActiveEventId(filtered[0].id);
    return filtered[0];
  }

  static resetToDefaults() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVE_EVENT_KEY);
    return this.getEvents()[0];
  }
}
