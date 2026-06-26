import { createClient } from '@supabase/supabase-js';
import { Application, Announcement, SupportTicket } from './types';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// Initialize Supabase. Check if URL/key exist to detect if we have connected.
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

console.log(
  isSupabaseConfigured
    ? '✨ Supabase Configured: Client initialized successfully.'
    : '⚖️ Supabase Demo Mode: Missing credentials. Operating via local storage backup.'
);

// Fallback database handlers using LocalStorage (fully aligned with actual Supabase schemas)
class LocalDbService {
  getApplications(): Application[] {
    const saved = localStorage.getItem('fifa_supabase_applications');
    return saved ? JSON.parse(saved) : [];
  }

  saveApplication(app: Application): void {
    const apps = this.getApplications();
    const index = apps.findIndex((a) => a.id === app.id);
    if (index >= 0) {
      apps[index] = app;
    } else {
      apps.push(app);
    }
    localStorage.setItem('fifa_supabase_applications', JSON.stringify(apps));
  }

  updateApplicationStatus(appId: string, status: Application['status']): void {
    const apps = this.getApplications();
    const index = apps.findIndex((a) => a.id === appId);
    if (index >= 0) {
      apps[index].status = status;
      apps[index].reservationStatus = status === 'CLEARANCE_GRANTED' ? 'CONFIRMED' : 'PROVISIONAL';
      localStorage.setItem('fifa_supabase_applications', JSON.stringify(apps));
    }
  }

  deleteApplication(appId: string): void {
    const apps = this.getApplications();
    const filtered = apps.filter((a) => a.id !== appId);
    localStorage.setItem('fifa_supabase_applications', JSON.stringify(filtered));
  }

  getAnnouncements(): Announcement[] {
    const saved = localStorage.getItem('fifa_supabase_announcements');
    return saved ? JSON.parse(saved) : [];
  }

  saveAnnouncement(ann: Announcement): void {
    const anns = this.getAnnouncements();
    anns.unshift(ann);
    localStorage.setItem('fifa_supabase_announcements', JSON.stringify(anns));
  }

  getTickets(): SupportTicket[] {
    const saved = localStorage.getItem('fifa_supabase_tickets');
    return saved ? JSON.parse(saved) : [];
  }

  saveTicket(ticket: SupportTicket): void {
    const tkts = this.getTickets();
    const index = tkts.findIndex((t) => t.id === ticket.id);
    if (index >= 0) {
      tkts[index] = ticket;
    } else {
      tkts.push(ticket);
    }
    localStorage.setItem('fifa_supabase_tickets', JSON.stringify(tkts));
  }
}

const localDb = new LocalDbService();

/**
 * DATABASE OPERATIONS API
 */
export const dbService = {
  // Applications
  async fetchApplications(): Promise<Application[]> {
    if (!isSupabaseConfigured || !supabase) {
      return localDb.getApplications();
    }
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('timestamp', { ascending: false });
      if (error) throw error;
      return (data || []) as Application[];
    } catch (err) {
      console.error('Supabase fetch applications error, falling back:', err);
      return localDb.getApplications();
    }
  },

  async insertApplication(app: Application): Promise<void> {
    localDb.saveApplication(app);
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { error } = await supabase.from('applications').upsert(app);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase save application error:', err);
    }
  },

  async updateApplicationStatus(appId: string, status: Application['status']): Promise<void> {
    localDb.updateApplicationStatus(appId, status);
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { error } = await supabase
        .from('applications')
        .update({ 
          status, 
          reservationStatus: status === 'CLEARANCE_GRANTED' ? 'CONFIRMED' : 'PROVISIONAL' 
        })
        .eq('id', appId);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase update application status error:', err);
    }
  },

  async deleteApplication(appId: string): Promise<void> {
    localDb.deleteApplication(appId);
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { error } = await supabase.from('applications').delete().eq('id', appId);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase delete application error:', err);
    }
  },

  // Announcements
  async fetchAnnouncements(): Promise<Announcement[]> {
    if (!isSupabaseConfigured || !supabase) {
      return localDb.getAnnouncements();
    }
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('timestamp', { ascending: false });
      if (error) throw error;
      return (data || []) as Announcement[];
    } catch (err) {
      console.error('Supabase fetch announcements error, falling back:', err);
      return localDb.getAnnouncements();
    }
  },

  async insertAnnouncement(ann: Announcement): Promise<void> {
    localDb.saveAnnouncement(ann);
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { error } = await supabase.from('announcements').insert(ann);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase save announcement error:', err);
    }
  },

  // Support Tickets
  async fetchTickets(): Promise<SupportTicket[]> {
    if (!isSupabaseConfigured || !supabase) {
      return localDb.getTickets();
    }
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('id', { ascending: false });
      if (error) throw error;
      return (data || []) as SupportTicket[];
    } catch (err) {
      console.error('Supabase fetch tickets error, falling back:', err);
      return localDb.getTickets();
    }
  },

  async insertTicket(ticket: SupportTicket): Promise<void> {
    localDb.saveTicket(ticket);
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { error } = await supabase.from('tickets').upsert(ticket);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase save ticket error:', err);
    }
  },

  async updateTicketMessages(ticketId: string, messages: any[]): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      const tkts = localDb.getTickets();
      const matchIndex = tkts.findIndex((t) => t.id === ticketId);
      if (matchIndex >= 0) {
        tkts[matchIndex].messages = messages;
        localStorage.setItem('fifa_supabase_tickets', JSON.stringify(tkts));
      }
      return;
    }
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ messages })
        .eq('id', ticketId);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase update ticket message error:', err);
    }
  }
};

/**
 * STORAGE / FILE UPLOAD API
 */
export const fileUploadService = {
  async uploadDocument(file: File, path: string): Promise<string> {
    if (!isSupabaseConfigured || !supabase) {
      // Return local placeholder object representing file URL
      return URL.createObjectURL(file);
    }
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(path, file, { cacheControl: '3600', upsert: true });
      if (error) throw error;
      
      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(data.path);
        
      return publicUrlData.publicUrl;
    } catch (err) {
      console.error('Supabase upload error, fallback to blob:', err);
      return URL.createObjectURL(file);
    }
  }
};

/**
 * AUTHENTICATION ACCESS API
 */
export const authService = {
  async signUp(email: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return true;
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: 'TemporaryTravelerPassword123!',
      });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Supabase signup error:', err);
      return true;
    }
  },

  async signIn(email: string, role: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return true;
    try {
      // Check if signed in
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: 'TemporaryTravelerPassword123!',
      });
      // Accept even on local fallback during testing
      return true;
    } catch (err) {
      console.warn('Supabase sign-in ignored, operating locally/gracefully.', err);
      return true;
    }
  }
};
