import { supabase, authHelpers } from './supabaseClient';

class AuthService {
  async signUp(email, password, userData = {}) {
    return await authHelpers.signUp(email, password, userData);
  }

  async signIn(email, password) {
    return await authHelpers.signIn(email, password);
  }

  async signOut() {
    return await authHelpers.signOut();
  }

  async getSession() {
    return await authHelpers.getSession();
  }

  onAuthStateChange(callback) {
    return authHelpers.onAuthStateChange(callback);
  }

  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to fetch user profile' };
    }
  }

  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to update user profile' };
    }
  }

  async resetPassword(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      return { success: !error, data, error: error?.message };
    } catch (error) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  }
}

export default new AuthService();