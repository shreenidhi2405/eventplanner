import { supabase } from './supabase-client.js';

export class AuthManager {
  constructor(app) { this.app = app; this.user = null; }

  async init() {
    const { data, error } = await supabase.auth.getSession();
    if (error) console.error('Unable to restore Supabase session:', error);
    this.user = data?.session?.user || null;
    this.render();
    supabase.auth.onAuthStateChange((_event, session) => {
      this.user = session?.user || null;
      this.render();
    });
  }

  render() {
    const button = document.getElementById('btnAuth');
    const label = document.getElementById('authStatusLabel');
    if (button) button.textContent = this.user ? 'Sign out' : 'Sign in';
    if (label) label.textContent = this.user ? (this.user.email || 'Signed in') : 'Local demo mode';
  }

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    this.user = data.user;
    await this.ensureProfile(data.user);
    this.render();
    return data.user;
  }

  async signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    if (error) throw error;
    if (data.user && data.session) {
      this.user = data.user;
      await this.ensureProfile(data.user, fullName);
      this.render();
    }
    return data;
  }

  async ensureProfile(user, fullName = '') {
    const { error } = await supabase.from('profiles').upsert({
      id: user.id, email: user.email, full_name: fullName || user.user_metadata?.full_name || ''
    }, { onConflict: 'id' });
    if (error) console.warn('Profile record could not be saved:', error.message);
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    this.user = null;
    this.render();
  }
}
