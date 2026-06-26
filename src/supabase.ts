import { createClient } from '@supabase/supabase-js';
import { Application, Announcement, SupportTicket } from './types';

// 1. Live Supabase Credentials
const supabaseUrl = 'https://mydhrhcpkpmqopyfekdj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15ZGhyaGNwa3BtcW9weWZla2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NzIxMzcsImV4cCI6MjA5ODA0ODEzN30.UEmJuZMcBO2jmC3jwTjc__hz-IHsUuI5KpoB6jiUVNI';

export const isSupabaseConfigured = true;

// Initialize single strongly-typed client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// =========================================================================
// SECURE SERVER-SIDE ONLY: export supabaseAdmin client securely commented out
// =========================================================================
/*
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15ZGhyaGNwa3BtcW9weWZla2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjQ3MjEzNywiZXhwIjoyMDk4MDQ4MTM3fQ.ytzgkr_gYVY6omRUv8dqWqQPNRcYMvu8_ZfhZPJfzG8';
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
*/

// Fallback database handlers using LocalStorage
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
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('timestamp', { ascending: false });
      if (error) throw error;
      return (data || []) as Application[];
    } catch (err) {
      console.warn('Supabase fetch applications failed, using local storage:', err);
      return localDb.getApplications();
    }
  },

  async insertApplication(app: Application): Promise<void> {
    localDb.saveApplication(app);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id || null;
      
      const record = {
        id: app.id,
        user_id: userId,
        application_number: app.applicationNumber,
        timestamp: app.timestamp,
        personal_info: app.personalInfo,
        address_info: app.addressInfo,
        passport_info: app.passportInfo,
        documents: app.documents,
        travel_origin: app.travelOrigin,
        match_preferences: app.matchPreferences,
        attendance_type: app.attendanceType,
        accommodation_preferences: app.accommodationPreferences,
        additional_info: app.additionalInfo,
        cost_breakdown: app.costBreakdown,
        status: app.status,
        application_score: app.applicationScore,
        travel_readiness_score: app.travelReadinessScore,
        priority_level: app.priorityLevel,
        approval_timeline: app.approvalTimeline,
        reservation_status: app.reservationStatus,
        attendance_index: app.attendanceIndex,
        payment_details: app.paymentDetails
      };

      const { error } = await supabase.from('applications').upsert(record);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase save application failed:', err);
    }
  },

  async updateApplicationStatus(appId: string, status: Application['status']): Promise<void> {
    localDb.updateApplicationStatus(appId, status);
    try {
      const { error } = await supabase
        .from('applications')
        .update({ 
          status, 
          reservation_status: status === 'CLEARANCE_GRANTED' ? 'CONFIRMED' : 'PROVISIONAL' 
        })
        .eq('id', appId);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase update application status failed:', err);
    }
  },

  async deleteApplication(appId: string): Promise<void> {
    localDb.deleteApplication(appId);
    try {
      const { error } = await supabase.from('applications').delete().eq('id', appId);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase delete application failed:', err);
    }
  },

  // Announcements
  async fetchAnnouncements(): Promise<Announcement[]> {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('timestamp', { ascending: false });
      if (error) throw error;
      return (data || []) as Announcement[];
    } catch (err) {
      console.warn('Supabase fetch announcements failed, using local storage:', err);
      return localDb.getAnnouncements();
    }
  },

  async insertAnnouncement(ann: Announcement): Promise<void> {
    localDb.saveAnnouncement(ann);
    try {
      const record = {
        id: ann.id,
        timestamp: ann.timestamp,
        title: ann.title,
        content: ann.content,
        scope: ann.scope,
        target_country: ann.targetCountry
      };
      const { error } = await supabase.from('announcements').insert(record);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase save announcement failed:', err);
    }
  },

  // Support Tickets
  async fetchTickets(): Promise<SupportTicket[]> {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('id', { ascending: false });
      if (error) throw error;
      
      return (data || []).map((t: any) => ({
        id: t.id,
        applicationId: t.application_id,
        applicationNumber: t.application_number,
        userId: t.user_id,
        userName: t.user_name,
        subject: t.subject,
        status: t.status,
        messages: t.messages
      })) as SupportTicket[];
    } catch (err) {
      console.warn('Supabase fetch tickets failed, using local storage:', err);
      return localDb.getTickets();
    }
  },

  async insertTicket(ticket: SupportTicket): Promise<void> {
    localDb.saveTicket(ticket);
    try {
      const record = {
        id: ticket.id,
        application_id: ticket.applicationId,
        application_number: ticket.applicationNumber,
        user_id: ticket.userId,
        user_name: ticket.userName,
        subject: ticket.subject,
        status: ticket.status,
        messages: ticket.messages
      };
      const { error } = await supabase.from('tickets').upsert(record);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase save ticket failed:', err);
    }
  },

  async updateTicketMessages(ticketId: string, messages: any[]): Promise<void> {
    const tkts = localDb.getTickets();
    const matchIndex = tkts.findIndex((t) => t.id === ticketId);
    if (matchIndex >= 0) {
      tkts[matchIndex].messages = messages;
      localStorage.setItem('fifa_supabase_tickets', JSON.stringify(tkts));
    }
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ messages })
        .eq('id', ticketId);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase update ticket messages failed:', err);
    }
  }
};

/**
 * STORAGE / FILE UPLOAD API
 */
export const fileUploadService = {
  async uploadDocument(file: File, path: string): Promise<string> {
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
      console.error('Supabase upload failed, using blob fallback:', err);
      return URL.createObjectURL(file);
    }
  }
};

/**
 * AUTHENTICATION ACCESS API
 */
export const authService = {
  async signUp(email: string): Promise<boolean> {
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
    try {
      const adminPassword = process.env.ADMIN_PASSWORD || 'worldcuplegacyfund@081.Kokoma';
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: role === 'admin' ? adminPassword : 'TemporaryTravelerPassword123!',
      });
      if (error) {
        // Fallback: If user is new to Supabase Auth, automatically register them
        if (error.message.includes('Invalid login credentials')) {
          await supabase.auth.signUp({
            email,
            password: role === 'admin' ? adminPassword : 'TemporaryTravelerPassword123!',
          });
        }
      }
      return true;
    } catch (err) {
      console.warn('Supabase sign-in ignored, operating locally/gracefully.', err);
      return true;
    }
  },

  async getUserRole(email: string): Promise<'traveler' | 'admin'> {
    try {
      // Query profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', email.toLowerCase())
        .single();
      if (error) throw error;
      return (data?.role || 'traveler') as 'traveler' | 'admin';
    } catch (err) {
      console.warn('Could not fetch user role from Supabase, default to traveler:', err);
      return 'traveler';
    }
  }
};
