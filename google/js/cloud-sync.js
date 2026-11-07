import { supabase } from './supabase-client.js';

const asDate = value => {
  if (!value || value === 'TBD') return null;
  const match = String(value).match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : null;
};

export class CloudSyncManager {
  static async saveEvent(event, user) {
    if (!user?.id) throw new Error('Sign in before saving to cloud.');

    const eventPayload = {
      user_id: user.id,
      event_name: event.title,
      event_type: event.type || 'celebration',
      description: event.themeVibe || event.themeName || null,
      event_date: asDate(event.date),
      location: event.location || null,
      guest_count: Number(event.guestCount) || 0,
      status: 'planning'
    };

    let eventQuery = supabase.from('events').upsert(
      event.cloudId ? { id: event.cloudId, ...eventPayload } : eventPayload
    ).select('id').single();
    const { data: savedEvent, error: eventError } = await eventQuery;
    if (eventError) throw eventError;
    const eventId = savedEvent.id;

    const { error: budgetError } = await supabase.from('budgets').upsert({
      event_id: eventId,
      total_budget: Number(event.targetBudget) || 0,
      currency: event.currency || 'INR'
    }, { onConflict: 'event_id' });
    if (budgetError) throw budgetError;

    // Replace this event's child records as one logical snapshot.
    for (const table of ['expenses', 'tasks', 'guests', 'schedules']) {
      const { error } = await supabase.from(table).delete().eq('event_id', eventId);
      if (error) throw error;
    }

    const expenses = (event.budget || []).map(item => ({
      event_id: eventId,
      category: item.category || 'Other',
      description: [item.name, item.notes ? 'Notes: ' + item.notes : '', 'Estimated: ' + (Number(item.estimated) || 0), 'Status: ' + (item.status || 'pending')].filter(Boolean).join(' | '),
      amount: Number(item.actual) || 0
    }));
    if (expenses.length) {
      const { error } = await supabase.from('expenses').insert(expenses);
      if (error) throw error;
    }

    const tasks = (event.timeline || []).map(item => ({
      event_id: eventId,
      task_name: item.title || 'Untitled task',
      description: [item.phase, item.assignee ? 'Assigned to: ' + item.assignee : ''].filter(Boolean).join(' | ') || null,
      due_date: asDate(item.date),
      priority: ['low', 'medium', 'high'].includes(item.priority) ? item.priority : 'high',
      is_completed: Boolean(item.completed)
    }));
    if (tasks.length) {
      const { error } = await supabase.from('tasks').insert(tasks);
      if (error) throw error;
    }

    const guests = (event.guests || []).map(item => ({
      event_id: eventId,
      guest_name: item.name || 'Guest',
      rsvp_status: ['accepted', 'declined', 'pending'].includes(item.rsvp) ? item.rsvp : 'pending',
      plus_ones: Math.max(0, (Number(item.count) || 1) - 1),
      email: item.email || null,
      phone: item.phone || null
    }));
    if (guests.length) {
      const { error } = await supabase.from('guests').insert(guests);
      if (error) throw error;
    }

    const schedules = (event.runOfShow || []).map(item => ({
      event_id: eventId,
      activity_name: item.title || 'Schedule item',
      location: item.location || null,
      notes: [item.time, item.notes].filter(Boolean).join(' | ') || null
    }));
    if (schedules.length) {
      const { error } = await supabase.from('schedules').insert(schedules);
      if (error) throw error;
    }

    return { ...event, cloudId: eventId };
  }
}
