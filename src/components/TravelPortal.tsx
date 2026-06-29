import React, { useState, useEffect } from 'react';
import { 
  Building, Plane, Map, Bell, Compass, HelpCircle, 
  ChevronRight, Calendar, ArrowUpRight, MessageSquare, 
  Send, ShieldAlert, Sparkles, AlertCircle, RefreshCw, Key, Heart, Lock
} from 'lucide-react';
import { Application, Language, SupportTicket } from '../types';
import { formatLocalCurrency } from '../localization';

interface TravelPortalProps {
  application: Application;
  lang: Language;
  onLogout: () => void;
  announcements: { id: string; timestamp: string; title: string; content: string }[];
  tickets: SupportTicket[];
  onAddTicketMessage: (ticketId: string, text: string) => void;
  onNewTicket: (subject: string, firstText: string) => void;
  onNavigateToPayment: () => void;
}

function LockedTabOverlay({ depositAmount, onPay, methodStatus }: { depositAmount: number; onPay: () => void; methodStatus?: string }) {
  return (
    <div className="glass-card rounded-3xl p-8 border border-white/5 relative overflow-hidden text-center space-y-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-scanlines opacity-[0.02] pointer-events-none" />
      <div className="mx-auto w-16 h-16 rounded-full border border-dashed border-red-500/30 flex items-center justify-center bg-[#1C1C27]/50">
        <Lock className="w-7 h-7 text-[#796BFF] animate-pulse" />
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-bold text-white uppercase font-sans tracking-wider">Accreditation Feature Gated</h4>
        <div className="inline-block px-3 py-1 bg-red-950/20 border border-red-500/20 rounded-full font-mono text-[9px] font-bold text-red-400 uppercase tracking-widest animate-pulse">
          {methodStatus === 'PENDING_VERIFICATION' ? 'VERIFICATION IN PROGRESS' : 'DEPOSIT REQUIRED'}
        </div>
      </div>

      <p className="text-xs text-[#8B8FA8] leading-relaxed max-w-sm mx-auto font-sans">
        {methodStatus === 'PENDING_VERIFICATION' 
          ? 'Your payment proof is currently under review by our treasury team. Accommodation quarters, secure convoys, and aviation logs will unlock once verification is approved.'
          : 'A deposit payment of 10% of the total package value is required to unlock your luxury lodging coordinates, secured private convoys, and aviation scheduling.'}
      </p>

      {methodStatus !== 'PENDING_VERIFICATION' && (
        <button
          onClick={onPay}
          className="px-6 py-3 bg-white hover:bg-zinc-100 text-[#13131A] font-bold text-xs uppercase rounded-full tracking-wider duration-150 active:scale-95 cursor-pointer shadow-md inline-flex items-center gap-1.5"
        >
          <span>PROCEED TO PAYMENT DECK</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default function TravelPortal({ 
  application, lang, onLogout, announcements, tickets, onAddTicketMessage, onNewTicket, onNavigateToPayment 
}: TravelPortalProps) {
  const [activeTab, setActiveTab] = useState<'tracker' | 'accommodation' | 'travel' | 'local' | 'support'>('tracker');
  const [countdown, setCountdown] = useState({ days: 355, hours: 14, minutes: 22, seconds: 40 });
  const [activeGuideCity, setActiveGuideCity] = useState<'NY' | 'LA' | 'MIA'>('NY');

  // Support Chat states
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketMsg, setNewTicketMsg] = useState('');
  const [chatInput, setChatInput] = useState('');

  // Inbox Notifications state
  const [inboxItems, setInboxItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchInbox = () => {
      const userKey = `fifa_inbox_${(application.personalInfo?.email || '').toLowerCase()}`;
      try {
        const items = JSON.parse(localStorage.getItem(userKey) || '[]');
        setInboxItems(items);
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchInbox();
    const interval = setInterval(fetchInbox, 3000);
    return () => clearInterval(interval);
  }, [application.personalInfo.email]);

  const handleMarkAsRead = (id: string) => {
    const userKey = `fifa_inbox_${(application.personalInfo?.email || '').toLowerCase()}`;
    const updated = inboxItems.map(item => item.id === id ? { ...item, read: true } : item);
    localStorage.setItem(userKey, JSON.stringify(updated));
    setInboxItems(updated);
  };

  const handleClearNotifications = () => {
    const userKey = `fifa_inbox_${(application.personalInfo?.email || '').toLowerCase()}`;
    const cleared = inboxItems.map(item => ({ ...item, read: true }));
    localStorage.setItem(userKey, JSON.stringify(cleared));
    setInboxItems(cleared);
  };

  const unreadCount = inboxItems.filter(item => !item.read).length;

  // World Cup Opening Countdown Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { ...prev, days: Math.max(0, prev.days - 1), hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Quick host city guide contents
  const hostCities = {
    NY: {
      name: 'New York / New Jersey',
      stadium: 'MetLife Stadium, East Rutherford',
      capacity: '82,500 Seat Capacity',
      transit: 'Custom helicopter shuttles directly from JFK Terminal 4, or luxury bulletproof private convoy.',
      hotel: 'The Ritz-Carlton, Central Park / Mandarin Oriental NY',
      highlights: 'Official FIFA Fan Zone at Central Park, exclusive luxury restaurants reservation priority.',
    },
    LA: {
      name: 'Los Angeles / California',
      stadium: 'SoFi Stadium, Inglewood',
      capacity: '70,240 Seat Capacity',
      transit: 'Private high-speed lanes on the I-405, and private jet landings coordinated via LAX FBO.',
      hotel: 'Beverly Hills Hotel / Waldorf Astoria Beverly Hills',
      highlights: 'Exclusive VIP sunset functions, high-security shuttles directly into the SoFi luxury club suites.',
    },
    MIA: {
      name: 'Miami / Florida',
      stadium: 'Hard Rock Stadium, Miami Gardens',
      capacity: '64,767 Seat Capacity',
      transit: 'Helicopter shuttles from Miami Executive Airport, VIP motorcades.',
      hotel: 'Faena Hotel Miami Beach / Four Seasons Surf Club',
      highlights: 'VIP beach functions, private yacht coordinates mapped to stadium waterways.',
    }
  };

  const handleSendChat = (ticketId: string) => {
    if (!chatInput.trim()) return;
    onAddTicketMessage(ticketId, chatInput);
    setChatInput('');
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject || !newTicketMsg) return;
    onNewTicket(newTicketSubject, newTicketMsg);
    setNewTicketSubject('');
    setNewTicketMsg('');
  };

  // Find user tickets
  const userTickets = tickets.filter(t => t.applicationId === application.id) || [];

  return (
    <div id="traveler_portal_cabinet" className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
      
      {/* Side HUD Controller panel */}
      <div id="portal_side_hud" className="lg:col-span-1 space-y-6">
        
        {/* Accreditee Status Badge */}
        <div className="glass-card rounded-3xl p-5 text-center">
          <div className="relative mx-auto w-16 h-16 rounded-full border border-white/10 bg-[#121420] overflow-hidden">
            {application.documents?.passportPhotoUrl && application.documents.passportPhotoUrl.startsWith('data:image') ? (
              <img
                src={application.documents.passportPhotoUrl}
                alt="Passport photo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-xl select-none">🏆</span>
              </div>
            )}
            <div className="absolute -inset-1 rounded-full border-2 border-dashed border-[#796BFF]/30 animate-spin-slow pointer-events-none" />
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-bold text-white uppercase font-sans tracking-tight leading-none truncate">
              {application.personalInfo?.fullName || ''}
            </h4>
            <span className="text-[10px] font-mono text-[#5B5F78] uppercase tracking-widest mt-1 block">
              STATUS CLASSIFICATION
            </span>
            <div className="mt-3.5 inline-block px-3 py-1 bg-[#796BFF]/10 text-[#B6B3FF] border border-[#796BFF]/20 rounded-full font-mono text-[9px] font-bold uppercase tracking-widest animate-pulse">
              {application.status === 'CLEARANCE_GRANTED' ? 'CLEARANCE GRANTED' : 'PENDING APPROVAL'}
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-white/[0.06] space-y-2 text-left font-mono text-[10px]">
            <div className="flex justify-between">
              <span className="text-[#5B5F78] uppercase">INDEX KEY:</span>
              <span className="text-white font-bold">{application.attendanceIndex}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5B5F78] uppercase">PRIORITY:</span>
              <span className="text-white font-bold">{application.priorityLevel}</span>
            </div>
            <div className="flex justify-between text-right">
              <span className="text-[#5B5F78] uppercase">RECONV:</span>
              <span className="text-white font-bold">{formatLocalCurrency(application.costBreakdown?.totalUSD || 0, lang)}</span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full mt-6 py-2.5 border border-red-500/20 hover:border-red-500/40 rounded-full font-sans text-xs uppercase tracking-wide text-red-400 hover:bg-red-500/5 duration-150 cursor-pointer active:scale-95"
          >
            DISCONNECT SECURE PORT
          </button>
        </div>

        {/* Dynamic Countdown Screen */}
        <div className="glass-card rounded-3xl p-5 text-center relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 text-white/5 font-mono text-7xl font-black pointer-events-none uppercase">
            2026
          </div>
          <p className="text-[9px] font-mono text-white/80 tracking-widest uppercase font-bold mb-3.5">
            GRAND OPENING TIMER
          </p>
          <div className="grid grid-cols-4 gap-1">
            <div className="glass rounded-lg p-2">
              <span className="block text-sm font-bold text-white font-mono">{countdown.days}</span>
              <span className="text-[8px] font-mono text-[#5B5F78] uppercase">DAY</span>
            </div>
            <div className="glass rounded-lg p-2">
              <span className="block text-sm font-bold text-white font-mono">{countdown.hours}</span>
              <span className="text-[8px] font-mono text-[#5B5F78] uppercase">HRS</span>
            </div>
            <div className="glass rounded-lg p-2">
              <span className="block text-sm font-bold text-white font-mono">{countdown.minutes}</span>
              <span className="text-[8px] font-mono text-[#5B5F78] uppercase">MIN</span>
            </div>
            <div className="glass rounded-lg p-2">
              <span className="block text-base font-bold text-white font-mono animate-pulse">{countdown.seconds}</span>
              <span className="text-[8px] font-mono text-white uppercase">SEC</span>
            </div>
          </div>
        </div>

        {/* Navigation Tab selection list */}
        <div className="glass-card rounded-2xl p-2.5 space-y-1">
          {[
            { tag: 'tracker', label: 'Journey Status Tracker', icon: Compass },
            { tag: 'accommodation', label: 'Luxury Quarters Allocation', icon: Building },
            { tag: 'travel', label: 'Secured Aviation Logs', icon: Plane },
            { tag: 'local', label: 'Continental Host Cities', icon: Map },
            { tag: 'support', label: 'Accreditation Helpdesk', icon: HelpCircle }
          ].map((item) => {
              const IconComp = item.icon;
              const isSelected = activeTab === item.tag;
              const isGated = ['accommodation', 'travel', 'local'].includes(item.tag) && application.paymentDetails?.status !== 'APPROVED';
              return (
                <button
                  key={item.tag}
                  onClick={() => setActiveTab(item.tag as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-sans text-xs text-left cursor-pointer duration-155 transition ${
                    isSelected 
                      ? 'bg-[#796BFF]/15 text-[#B6B3FF] border border-[#796BFF]/30 shadow-md' 
                      : 'text-[#8B8FA8] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComp className={`w-4.5 h-4.5 ${isSelected ? 'text-[#B6B3FF]' : 'text-[#5B5F78]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isGated ? (
                    <Lock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  ) : (
                    <ChevronRight className={`w-3.5 h-3.5 duration-150 ${isSelected ? 'translate-x-0.5 text-white' : 'text-[#5B5F78]'}`} />
                  )}
                </button>
              );
          })}
        </div>
      </div>

      {/* Main interactive Tab Content cabinet */}
      <div id="portal_tab_content" className="lg:col-span-3 space-y-6">

        {/* 1. JOURNEY TRACKER TAB */}
        {activeTab === 'tracker' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top global warning strip */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-white shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white uppercase font-sans">Active Travel Pass Security Status</p>
                <p className="text-[10px] text-[#8B8FA8] font-mono mt-0.5 uppercase">
                  Accreditation levels are synchronized across LAX, JFK, and border security checkpoints natively. Keep digital passport active.
                </p>
              </div>
            </div>

            {/* Inbox Section */}
            {inboxItems.length > 0 && (
              <div className="glass-card rounded-3xl p-5 border border-white/5 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#796BFF]" />
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-widest">
                      Security Notifications & Alerts
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-[#796BFF] text-white text-[9px] font-mono rounded-full font-bold animate-pulse">
                        {unreadCount} NEW
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleClearNotifications}
                      className="text-[9px] font-mono text-[#8B8FA8] hover:text-white uppercase underline cursor-pointer bg-transparent border-none"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {inboxItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => !item.read && handleMarkAsRead(item.id)}
                      className={`p-3.5 rounded-xl border text-xs leading-relaxed transition-all duration-150 ${
                        item.read
                          ? 'bg-[#121420]/30 border-white/[0.03] text-[#8B8FA8]'
                          : 'bg-[#796BFF]/5 border-[#796BFF]/20 text-white cursor-pointer hover:bg-[#796BFF]/10'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`font-semibold uppercase text-[10px] ${item.read ? 'text-[#5B5F78]' : 'text-[#B6B3FF]'}`}>
                          {item.subject}
                        </span>
                        <span className="text-[8px] font-mono text-[#5B5F78]">
                          {new Date(item.sentAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="font-sans text-[11px] leading-relaxed text-zinc-300">{item.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Interactive Journey Flow timeline representing milestones */}
            <div className="glass-card rounded-3xl p-6 relative">
              <h3 className="text-sm font-bold text-white uppercase font-serif tracking-widest mb-6">Attendant Milestone Map</h3>
              
              <div className="relative pl-6 space-y-6 border-l-2 border-white/[0.08]">
                {/* Milestone 1 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#796BFF] ring-4 ring-[#796BFF]/20" />
                  <div>
                    <span className="block text-[10px] font-mono text-white uppercase font-bold">ACC_ENTRY_SUBMITTED</span>
                    <h5 className="text-xs font-bold text-white font-sans mt-0.5">Accreditation Dossier Received & Authenticated</h5>
                    <p className="text-[10px] text-[#5B5F78] font-sans mt-1">Accreditation key registered: {application.attendanceIndex}</p>
                  </div>
                </div>

                {/* Milestone 2 */}
                <div className="relative">
                  <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full ring-4 ${
                    application.status === 'CLEARANCE_GRANTED' ? 'bg-[#796BFF] ring-[#796BFF]/20' : 'bg-zinc-600 ring-zinc-800'
                  }`} />
                  <div>
                    <span className={`block text-[10px] font-mono uppercase font-bold ${
                      application.status === 'CLEARANCE_GRANTED' ? 'text-white' : 'text-white'
                    }`}>
                      {application.status === 'CLEARANCE_GRANTED' ? 'JUDICIAL_VERIFIED' : 'PENDING_ADMIN_REVIEW'}
                    </span>
                    <h5 className="text-xs font-bold text-white font-sans mt-0.5">European Intelligence & Background Clearance Check</h5>
                    <p className="text-[10px] text-[#5B5F78] font-sans mt-1">Cross-database identification tracking of passport and biometric check logs.</p>
                  </div>
                </div>

                {/* Milestone 3 */}
                <div className="relative">
                  <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full ring-4 ${
                    application.paymentDetails?.status === 'APPROVED'
                      ? 'bg-emerald-500 ring-emerald-500/20'
                      : application.paymentDetails?.status === 'PENDING_VERIFICATION'
                      ? 'bg-amber-500 ring-amber-500/20 animate-pulse'
                      : application.paymentDetails?.status === 'REJECTED'
                      ? 'bg-red-500 ring-red-500/20'
                      : 'bg-[#121420] border border-white/15'
                  }`} />
                  <div>
                    <span className={`block text-[10px] font-mono uppercase font-bold ${
                      application.paymentDetails?.status === 'APPROVED'
                        ? 'text-emerald-400 font-bold'
                        : application.paymentDetails?.status === 'PENDING_VERIFICATION'
                        ? 'text-amber-400 font-bold animate-pulse'
                        : application.paymentDetails?.status === 'REJECTED'
                        ? 'text-red-400 font-bold'
                        : 'text-zinc-500'
                    }`}>
                      {application.paymentDetails?.status === 'APPROVED'
                        ? 'CRYPTO_TARIFF_SETTLED'
                        : application.paymentDetails?.status === 'PENDING_VERIFICATION'
                        ? 'CRYPTO_TARIFF_IN_VERIFICATION'
                        : application.paymentDetails?.status === 'REJECTED'
                        ? 'CRYPTO_TARIFF_REJECTED'
                        : 'AWAITING_CRYPTO_TARIFF'}
                    </span>
                    <h5 className="text-xs font-bold text-white font-sans mt-0.5">Accreditation Reservation Block Confirmation</h5>
                    <p className="text-[10px] text-[#5B5F78] font-sans mt-1">
                      {application.paymentDetails?.status === 'APPROVED'
                        ? `Tariff verification complete. Deposit payment of 10% was successfully credited.`
                        : application.paymentDetails?.status === 'PENDING_VERIFICATION'
                        ? `Verification in progress. Proof file uploaded successfully.`
                        : application.paymentDetails?.status === 'REJECTED'
                        ? `Rejected: ${application.paymentDetails?.rejectionReason || 'No reason specified'}.`
                        : `Settle the required 10% deposit (${formatLocalCurrency(application.costBreakdown?.totalUSD || 0 * 0.1, lang)}) to confirm reservation.`}
                    </p>
                  </div>
                </div>

                {/* Milestone 4 */}
                <div className="relative">
                  <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full ring-4 ${
                    application.paymentDetails?.status === 'APPROVED'
                      ? 'bg-[#796BFF] ring-[#796BFF]/20'
                      : 'bg-zinc-800 ring-zinc-900'
                  }`} />
                  <div>
                    <span className={`block text-[10px] font-mono uppercase font-bold ${
                      application.paymentDetails?.status === 'APPROVED' ? 'text-white' : 'text-[#5B5F78]'
                    }`}>AVIATION_LODGING_DISPATCH</span>
                    <h5 className="text-xs font-bold text-[#8B8FA8] font-sans mt-0.5">Aviation Route Launching & Resort Check-in Passkeys</h5>
                    <p className="text-[10px] text-[#5B5F78] font-sans mt-1">Schedules are generated in coordination with direct private VIP convoy shuttles.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ACCOMMODATION TAB */}
        {activeTab === 'accommodation' && (
          application.paymentDetails?.status !== 'APPROVED' ? (
            <LockedTabOverlay 
              depositAmount={application.costBreakdown?.totalUSD || 0 * 0.1} 
              onPay={onNavigateToPayment} 
              methodStatus={application.paymentDetails?.status} 
            />
          ) : (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="glass-card rounded-3xl p-6 space-y-4">
                  <span className="text-[9px] font-mono text-white font-bold tracking-widest uppercase block">
                    DEPLOYED ASSIGNMENT
                  </span>
                  <h4 className="text-base font-bold text-white uppercase font-sans">
                    {application.accommodationPreferences.tier}
                  </h4>
                  <p className="text-xs text-[#8B8FA8] leading-relaxed font-sans">
                    Your luxury block belongs to the exclusive Host Hotel corridor. All suites feature top-tier accommodations, private transport access, and 24/7 dedicated concierge service.
                  </p>

                  <div className="pt-4 border-t border-white/[0.06] space-y-2 text-[10px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-[#5B5F78]">RESORT GROUP:</span>
                      <span className="text-white text-right">Amex Fine Hotels Premium Collection</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5B5F78]">GATE ACCORDANCE:</span>
                      <span className="text-white text-right font-bold">ESTABLISHED PASS (100%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5B5F78]">STADIUN TRANSIT:</span>
                      <span className="text-white text-right">6 Min (Helicopter VIP Stream)</span>
                    </div>
                  </div>
                </div>

                {/* Dynamic room pass key preview card */}
                <div className="bg-gradient-to-br from-[#121420] to-[#1A1D30] border border-white/5 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                  <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/5 border border-white/8 pointer-events-none" />
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[8px] font-sans text-white uppercase tracking-widest block font-bold">SUITE ENCRYPTION KEY</span>
                      <span className="text-sm font-bold text-white font-mono uppercase mt-0.5 block">KEY-M26-RESORT-BLOCK</span>
                    </div>
                    <Key className="w-5 h-5 text-[#796BFF] animate-pulse" />
                  </div>

                  <div className="font-mono text-[#5B5F78] font-semibold space-y-1">
                    <p className="text-[9px] text-[#5B5F78] uppercase leading-none">Registered Room Code</p>
                    <p className="text-2xl text-white font-bold font-sans">Suite 1902-VIP</p>
                  </div>

                  <div className="text-[9px] font-mono text-[#5B5F78] uppercase mt-4 flex justify-between">
                    <span>EXP: JULY 20, 2026</span>
                    <span>STATUS: SECURE DISPATCH</span>
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {/* 3. FLIGHT LOGS / AVIATION TAB */}
        {activeTab === 'travel' && (
          application.paymentDetails?.status !== 'APPROVED' ? (
            <LockedTabOverlay 
              depositAmount={application.costBreakdown?.totalUSD || 0 * 0.1} 
              onPay={onNavigateToPayment} 
              methodStatus={application.paymentDetails?.status} 
            />
          ) : (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-[#13131A]/85 border border-white/[0.06] rounded-3xl p-6">
                <h3 className="text-sm font-bold text-white uppercase font-sans tracking-wider mb-5">Airport Terminal & Aviation Clearances</h3>
                
                <div id="aviation_bento_nodes" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4.5 rounded-xl border border-white/[0.06] bg-[#1C1C27]/15">
                    <span className="text-[8px] font-mono text-[#5B5F78] uppercase block">OUTBOUND CORRIDOR</span>
                    <p className="text-xs font-bold text-white mt-1 uppercase font-mono">
                      {application.travelOrigin.departureCity} Port to Host Stadium Port
                    </p>
                    <div className="mt-3 text-[10px] font-mono text-white">
                      CLASS: {application.travelOrigin.preferredAirlineClass} SERVICE
                    </div>
                  </div>

                  <div className="p-4.5 rounded-xl border border-white/[0.06] bg-[#1C1C27]/15">
                    <span className="text-[8px] font-mono text-[#5B5F78] uppercase block">SECURITY LINE ACCESS</span>
                    <p className="text-xs font-bold text-white mt-1 uppercase font-sans">
                      Fast-Track Airport Signature Clearance
                    </p>
                    <div className="mt-3 text-[10px] font-mono text-white">
                      VIP Priority Line: ACTIVE ({application.priorityLevel})
                    </div>
                  </div>
                </div>

                {/* Custom visually striking Coordinate route simulator representing world travels */}
                <div className="mt-6 p-10 rounded-2xl border border-white/[0.06] bg-[#13131A] flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-map-grid opacity-[0.04] pointer-events-none" />
                  <div className="w-full text-center space-y-4 relative z-10 font-mono">
                    <span className="text-[10px] text-white uppercase tracking-widest font-bold">ROUTE MONITORING PROJ_S26</span>
                    <div className="flex items-center justify-center gap-6">
                      <span className="text-xs text-white uppercase font-bold">{application.travelOrigin.departureCity} (EU)</span>
                      <div className="relative flex-1 max-w-[140px] h-0.5 bg-dashed border-t border-dashed border-[#796BFF]/30">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-[#796BFF]">✈</div>
                      </div>
                      <span className="text-xs text-white uppercase font-bold">HOST STADIUM GATE</span>
                    </div>
                    <p className="text-[9px] text-[#5B5F78] uppercase">DEPARTURE STATUS: CONFIGURED • DIRECT VIP CORRIDOR</p>
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {/* 4. LOCAL SITES & HOST CITIES TAB */}
        {activeTab === 'local' && (
          application.paymentDetails?.status !== 'APPROVED' ? (
            <LockedTabOverlay 
              depositAmount={application.costBreakdown?.totalUSD || 0 * 0.1} 
              onPay={onNavigateToPayment} 
              methodStatus={application.paymentDetails?.status} 
            />
          ) : (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="glass-card rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <div>
                    <span className="text-[9px] font-mono text-[#5B5F78] uppercase tracking-widest block">CONTINENTAL HOSTS</span>
                    <h4 className="text-base font-bold text-white uppercase font-serif">Host City Explorations</h4>
                  </div>

                  {/* Sub-tabs mapping NY, LA, MIA */}
                  <div className="flex gap-2 p-1 bg-[#1C1C27] rounded-lg text-[10px] font-mono">
                    {(['NY', 'LA', 'MIA'] as const).map((key) => (
                      <button
                        key={key}
                        onClick={() => setActiveGuideCity(key)}
                        className={`px-3 py-1.5 rounded-md font-bold uppercase cursor-pointer ${
                          activeGuideCity === key ? 'bg-white text-[#13131A]' : 'text-[#8B8FA8] hover:text-white'
                        }`}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Display host data */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-white uppercase font-serif tracking-tight">
                      {hostCities[activeGuideCity].name}
                    </h3>
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#5B5F78] font-mono uppercase block">OFFICIAL AREA HOST VENUE</span>
                      <span className="text-xs font-semibold text-white/80 font-mono uppercase">
                        {hostCities[activeGuideCity].stadium} ({hostCities[activeGuideCity].capacity})
                      </span>
                    </div>

                    <p className="text-xs text-[#8B8FA8] leading-relaxed font-sans font-medium">
                      {hostCities[activeGuideCity].highlights}
                    </p>

                    <div className="pt-4 border-t border-white/[0.06] space-y-1 text-xs">
                      <span className="text-[10px] font-mono text-[#5B5F78] uppercase block">TRANSIT MATRIX PATHS</span>
                      <p className="text-white/80 leading-relaxed font-mono text-[11px]">
                        {hostCities[activeGuideCity].transit}
                      </p>
                    </div>
                  </div>

                  {/* Local Stay highlight card inside bento */}
                  <div className="p-5 rounded-2xl border border-white/[0.06] bg-[#1C1C27]/10 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-[#5B5F78] uppercase block">ACC_HOTEL_RESERVE</span>
                      <h5 className="text-xs font-bold text-white mt-1 leading-snug">{hostCities[activeGuideCity].hotel}</h5>
                    </div>
                    
                    <div className="space-y-1.5 mt-6">
                      <span className="text-[8px] font-mono text-white uppercase tracking-wider block">✓ DIRECT SHUTTLE INTEGRATED</span>
                      <p className="text-[10px] text-[#5B5F78] font-sans leading-tight font-medium">
                        GPS transport coordinates synchronized with host tickets natively.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {/* 5. SECURE ACCREDITATION HELPDESK / SUPPORT TAB */}
        {activeTab === 'support' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Column: Create new Support Ticket form */}
              <div className="md:col-span-1 glass-card rounded-3xl p-6 flex flex-col h-full justify-between">
                <div>
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest mb-4">
                    OPEN SUPPORT INQUIRY
                  </h4>
                  <form onSubmit={handleCreateTicket} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-sans text-[#5B5F78] uppercase tracking-widest block font-bold">Query Subject</label>
                      <input
                        type="text"
                        placeholder="e.g. Helicopter route sync"
                        value={newTicketSubject}
                        onChange={(e) => setNewTicketSubject(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg glass-input text-xs text-white placeholder-zinc-500 focus:outline-none font-sans"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-sans text-[#5B5F78] uppercase tracking-widest block font-bold">Inquiry Message</label>
                      <textarea
                        rows={3}
                        placeholder="Describe your requirements..."
                        value={newTicketMsg}
                        onChange={(e) => setNewTicketMsg(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg glass-input text-xs text-white placeholder-zinc-500 focus:outline-none font-sans"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-white hover:bg-zinc-100 text-[#0C0D12] font-sans text-xs font-bold uppercase tracking-wider rounded-full cursor-pointer duration-150 active:scale-95 shadow-md"
                    >
                      SEND INQUIRY
                    </button>
                  </form>
                </div>

                <div className="pt-6 border-t border-white/[0.06] font-mono text-[9px] text-[#5B5F78] uppercase tracking-wider space-y-1.5 mt-6">
                  <div className="flex justify-between">
                    <span>TELEGRAM LINK:</span>
                    <span className="text-[#8B8FA8]">@fifa_support_m26</span>
                  </div>
                  <div className="flex justify-between">
                    <span>FAST RESPONSE:</span>
                    <span className="text-[#8B8FA8] font-bold">STAFF ONLINE</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Ticket Conversation Node */}
              <div className="md:col-span-2 glass-card rounded-3xl p-6 flex flex-col h-[400px]">
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest pb-3 border-b border-white/[0.06] mb-4">
                  SUPPORT TEAM ACTIVE CHAT
                </h4>

                {userTickets.length > 0 ? (
                  <div className="flex-1 flex flex-col min-h-0">
                    {userTickets.map((ticket) => (
                      <div key={ticket.id} className="flex-1 flex flex-col min-h-0">
                        {/* Subject */}
                        <div className="flex items-center justify-between mb-3 text-xs glass rounded-lg p-2.5 font-mono">
                          <span className="text-white font-bold uppercase">SEC-LOG: {ticket.subject}</span>
                          <span className="text-white animate-pulse">[ CHAT ACTIVE ]</span>
                        </div>

                        {/* Message list */}
                        <div className="flex-1 overflow-y-auto mb-4 space-y-3 p-1">
                          {ticket.messages.map((m) => {
                            const isAdmin = m.sender === 'admin';
                            return (
                              <div
                                key={m.id}
                                className={`flex flex-col max-w-[85%] ${isAdmin ? 'mr-auto items-start' : 'ml-auto items-end'}`}
                              >
                                <div className={`p-3 rounded-2xl text-xs font-sans leading-relaxed ${
                                  isAdmin 
                                    ? 'bg-white/5 text-white rounded-tl-none border border-white/10' 
                                    : 'bg-[#796BFF]/10 text-white/90 rounded-tr-none border border-[#796BFF]/25'
                                }`}>
                                  {m.text}
                                </div>
                                <span className="text-[8px] font-mono text-[#5B5F78] uppercase mt-1">
                                  {isAdmin ? 'SUPPORT REPRESENTATIVE' : 'ACCREDITEE'} • {new Date(m.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Input Area */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Address support team..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSendChat(ticket.id);
                            }}
                            className="flex-1 px-3 py-2 rounded-lg glass-input text-xs text-white placeholder-zinc-500 focus:outline-none font-sans"
                          />
                          <button
                            onClick={() => handleSendChat(ticket.id)}
                            className="p-2.5 bg-[#796BFF] hover:bg-[#B6B3FF] text-white rounded-lg cursor-pointer duration-150 active:scale-95"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 p-6">
                    <MessageSquare className="w-8 h-8 text-[#5B5F78] animate-pulse" />
                    <div>
                      <p className="text-xs font-semibold text-[#8B8FA8] uppercase font-mono tracking-wider">
                        SUPPORT CHANNELS INACTIVE
                      </p>
                      <p className="text-[10px] text-[#5B5F78] font-sans max-w-xs mt-1">
                        No active inquiries open. Submit a request on the left panel to contact the admin team.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}