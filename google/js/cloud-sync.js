import { supabase } from './supabase-client.js';

const asDate = value => {
  if (!value || value === 'TBD') return null;
  const match = String(value).match(/^\\d{4}-\\d{2}-\\d{2}/);
  return match ? match[0] : null;
};

export class CloudSyncManager {
  static async loadEvents(user) {
    if (!user?.id) return [];
    const { data: rows, error } = await supabase.from('events')
      .select('id, event_name, event_type, description, event_date, location, guest_count, status, budgets(total_budget, currency), expenses(category, description, amount, expense_date), tasks(task_name, description, due_date, priority, is_completed), guests(guest_name, email, phone, rsvp_status, plus_ones), schedules(activity_name, start_time, end_time, location, notes), event_vendors(vendor_name, vendor_type, contact_name, phone, email, quote, deposit_paid, booking_status, checklist, notes)')
      .eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) throw error;

    return (rows || []).map(row => {
      const budgetRow = (row.budgets || [])[0] || {};
      const budget = (row.expenses || []).map((item, index) => {
        const parts = (item.description || '').split(' | ');
        const estimated = parts.find(part => part.startsWith('Estimated: '));
        const status = parts.find(part => part.startsWith('Status: '));
        const notes = parts.find(part => part.startsWith('Notes: '));
        return {
          id: 'cloud-expense-' + index, name: parts[0] || item.category || 'Expense',
          category: item.category || 'Other',
          estimated: estimated ? Number(estimated.slice(11)) || 0 : Number(item.amount) || 0,
          actual: Number(item.amount) || 0, status: status ? status.slice(8) : 'pending',
          notes: notes ? notes.slice(7) : ''
        };
      });
      const timeline = (row.tasks || []).map((task, index) => {
        const details = (task.description || '').split(' | ');
        return {
          id: 'cloud-task-' + index, title: task.task_name, phase: details[0] || 'Planning Phase',
          date: task.due_date || 'TBD', completed: Boolean(task.is_completed),
          priority: task.priority || 'medium',
          assignee: (details.find(part => part.startsWith('Assigned to: ')) || '').replace('Assigned to: ', '')
        };
      });
      const guests = (row.guests || []).map((guest, index) => ({
        id: 'cloud-guest-' + index, name: guest.guest_name, email: guest.email || '',
        phone: guest.phone || '', rsvp: guest.rsvp_status || 'pending',
        count: 1 + (Number(guest.plus_ones) || 0), dietary: '', table: ''
      }));
      const runOfShow = (row.schedules || []).map((item, index) => {
        const details = (item.notes || '').split(' | ');
        return {
          id: 'cloud-schedule-' + index, time: details[0] || '',
          title: item.activity_name, location: item.location || '',
          notes: details.slice(1).join(' | '), completed: false
        };
      });
      const vendors = (row.event_vendors || []).map((vendor, index) => ({
        id: 'cloud-vendor-' + index, name: vendor.vendor_name, category: vendor.vendor_type || 'Other',
        contact: vendor.contact_name || '', phone: vendor.phone || '', email: vendor.email || '',
        quote: Number(vendor.quote) || 0, depositPaid: Number(vendor.deposit_paid) || 0,
        status: vendor.booking_status || 'shortlisted',
        checklist: Array.isArray(vendor.checklist) ? vendor.checklist : [], notes: vendor.notes || ''
      }));
      const type = row.event_type || 'celebration';
      return {
        id: 'cloud_' + row.id, cloudId: row.id, title: row.event_name, type,
        date: row.event_date ? row.event_date + 'T18:00' : '', location: row.location || 'TBD',
        targetBudget: Number(budgetRow.total_budget) || 0, currency: budgetRow.currency || 'INR',
        guestCount: Number(row.guest_count) || 0,
        heroImage: type === 'birthday' ? 'assets/images/birthday.jpg' : type === 'community' ? 'assets/images/community.jpg' : 'assets/images/wedding.jpg',
        themeName: row.event_name + ' Aesthetic', themeVibe: row.description || '', palette: [],
        budget, timeline, runOfShow, vendors, guests,
        personalizedIdeas: { signatureDrinks: [], playlistVibes: '', invitationStyles: { romantic: '', modern: '', poetic: '' } }
      };
    });
  }

  static async saveEvent(event, user) {
    if (!user?.id) throw new Error('Sign in before saving to cloud.');

    const expenses = (event.budget || []).map(item => ({
      category: item.category || 'Other',
      description: [
        item.name,
        item.notes ? 'Notes: ' + item.notes : '',
        'Estimated: ' + (Number(item.estimated) || 0),
        'Status: ' + (item.status || 'pending')
      ].filter(Boolean).join(' | '),
      amount: Number(item.actual) || 0
    }));

    const tasks = (event.timeline || []).map(item => ({
      task_name: item.title || 'Untitled task',
      description: [item.phase, item.assignee ? 'Assigned to: ' + item.assignee : ''].filter(Boolean).join(' | ') || null,
      due_date: asDate(item.date),
      priority: ['low', 'medium', 'high'].includes(item.priority) ? item.priority : 'high',
      is_completed: Boolean(item.completed)
    }));

    const guests = (event.guests || []).map(item => ({
      guest_name: item.name || 'Guest',
      rsvp_status: ['accepted', 'declined', 'pending'].includes(item.rsvp) ? item.rsvp : 'pending',
      plus_ones: Math.max(0, (Number(item.count) || 1) - 1),
      email: item.email || null,
      phone: item.phone || null
    }));

    const vendors = (event.vendors || []).map(item => ({
      vendor_name: item.name || 'Vendor',
      vendor_type: item.category || 'Other',
      contact_name: item.contact || null,
      phone: item.phone || null,
      email: item.email || null,
      quote: Number(item.quote) || 0,
      deposit_paid: Number(item.depositPaid) || 0,
      booking_status: item.status || 'shortlisted',
      checklist: Array.isArray(item.checklist) ? item.checklist : [],
      notes: item.notes || null
    }));

    const schedules = (event.runOfShow || []).map(item => ({
      activity_name: item.title || 'Schedule item',
      location: item.location || null,
      // Preserve the UI's human-readable time string without lossy timestamp conversion.
      notes: [item.time, item.notes].filter(Boolean).join(' | ') || null
    }));

    const { data: eventId, error } = await supabase.rpc('save_event_snapshot', {
      p_event: {
        ...(event.cloudId ? { id: event.cloudId } : {}),
        event_name: event.title,
        event_type: event.type || 'celebration',
        description: event.themeVibe || event.themeName || null,
        event_date: asDate(event.date),
        location: event.location || null,
        guest_count: Number(event.guestCount) || 0,
        status: 'planning'
      },
      p_budget: {
        total_budget: Number(event.targetBudget) || 0,
        currency: event.currency || 'INR'
      },
      p_expenses: expenses,
      p_tasks: tasks,
      p_guests: guests,
      p_schedules: schedules,
      p_vendors: vendors
    });
    if (error) throw error;
    return { ...event, cloudId: eventId };
  }
}
