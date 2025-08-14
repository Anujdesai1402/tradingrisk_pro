import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window?.localStorage,
    storageKey: 'tradingrisk-auth'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Auth helpers
export const authHelpers = {
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      return { success: !error, data, error: error?.message };
    } catch (error) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  },

  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { success: !error, data, error: error?.message };
    } catch (error) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      return { success: !error, error: error?.message };
    } catch (error) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  },

  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      return { success: !error, data, error: error?.message };
    } catch (error) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

export default supabase;