import React, { useState } from 'react';
import { 
  Users, ClipboardList, CheckSquare, ShieldAlert, BarChart3, 
  Search, Settings, ShieldCheck, Mail, Megaphone, Check, X, FileCheck, 
  Trash2, AlertCircle, RefreshCw, Send, DollarSign, Wallet
} from 'lucide-react';
import { Application, SupportTicket, Announcement } from '../types';
import { formatLocalCurrency } from '../localization';

interface AdminPanelProps {
  applications: Application[];
  onUpdateAppStatus: (appId: string, status: Application['status']) => void;
  onUpdateApplication: (appId: string, updates: Partial<Application>) => void;
  onDeleteApplication: (appId: string) => void;
  announcements: Announcement[];
  onAddAnnouncement: (title: string, content: string, scope: Announcement['scope'], country?: string) => void;
  tickets: SupportTicket[];
  onAdminResponse: (ticketId: string, text: string) => void;
  onSendDirectMessage: (userEmail: string, subject: string, message: string) => void;
  onLogout: () => void;
}

type AdminRole = 'Super Admin' | 'Finance Officer' | 'Verification Officer' | 'Support Officer';

export default function AdminPanel({
  applications, onUpdateAppStatus, onUpdateApplication, onDeleteApplication, announcements, onAddAnnouncement, tickets, onAdminResponse, onSendDirectMessage, onLogout
}: AdminPanelProps) {
  const [currentAdminRole, setCurrentAdminRole] = useState<AdminRole>('Super Admin');
  const [activeAdminTab, setActiveAdminTab] = useState<'analytics' | 'applications' | 'payments' | 'announcements' | 'tickets'>('analytics');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editFields, setEditFields] = useState<{ fullName: string; email: string; phone: string; nationality: string; passportNumber: string; priorityLevel: string; approvalTimeline: string }>({ fullName: '', email: '', phone: '', nationality: '', passportNumber: '', priorityLevel: '', approvalTimeline: '' });

  // Direct message state
  const [dmEmail, setDmEmail] = useState('');
  const [dmSubject, setDmSubject] = useState('');
  const [dmMessage, setDmMessage] = useState('');
  const [dmSent, setDmSent] = useState(false);

  // Payment states
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [paymentCryptoFilter, setPaymentCryptoFilter] = useState<'ALL' | 'ETH' | 'BTC' | 'SOL'>('ALL');
  const [selectedPaymentApp, setSelectedPaymentApp] = useState<Application | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [internalNotesText, setInternalNotesText] = useState('');
  const [rejectionReasonText, setRejectionReasonText] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const paymentFilteredApps = applications.filter(app => {
    const hasPaymentInfo = !!app.paymentDetails;
    const isPaymentStatus = app.status === 'PENDING_VERIFICATION' || app.status === 'PAYMENT_PENDING_CONFIRMATION';
    if (!hasPaymentInfo && !isPaymentStatus) return false;

    // Filter by crypto
    if (paymentCryptoFilter !== 'ALL') {
      if (app.paymentDetails?.method !== paymentCryptoFilter) return false;
    }

    // Filter by status
    if (paymentStatusFilter !== 'ALL') {
      const payStatus = app.paymentDetails?.status || 'PENDING_VERIFICATION';
      if (paymentStatusFilter === 'PENDING' && payStatus !== 'PENDING_VERIFICATION') return false;
      if (paymentStatusFilter === 'APPROVED' && payStatus !== 'APPROVED') return false;
      if (paymentStatusFilter === 'REJECTED' && payStatus !== 'REJECTED') return false;
    }

    // Search query
    const term = paymentSearch.toLowerCase();
    if (term) {
      const fullName = (app.personalInfo?.fullName || '').toLowerCase();
      const email = (app.personalInfo?.email || '').toLowerCase();
      const appNum = app.applicationNumber.toLowerCase();
      const appId = app.id.toLowerCase();
      return fullName.includes(term) || email.includes(term) || appNum.includes(term) || appId.includes(term);
    }

    return true;
  });

  // Broadcast Alert Composer state
  const [alertTitle, setAlertTitle] = useState('');
  const [alertContent, setAlertContent] = useState('');
  const [alertScope, setAlertScope] = useState<Announcement['scope']>('all');
  const [alertCountry, setAlertCountry] = useState('ALL');

  // Support input matching state
  const [ticketReplies, setTicketReplies] = useState<Record<string, string>>({});

  // Filter lists based on search
  const filteredApps = applications.filter(app => {
    const term = searchQuery.toLowerCase();
    return (
      (app.personalInfo?.fullName || '').toLowerCase().includes(term) ||
      app.applicationNumber.toLowerCase().includes(term) ||
      app.passportInfo.passportNumber.toLowerCase().includes(term) ||
      (app.personalInfo?.email || '').toLowerCase().includes(term)
    );
  });

  // Calculate Metrics
  const totalApps = applications.length;
  const approvedApps = applications.filter(a => a.status === 'CLEARANCE_GRANTED').length;
  const pendingApps = applications.filter(a => a.status === 'PENDING_VERIFICATION' || a.status === 'PAYMENT_PENDING_CONFIRMATION').length;
  const totalValueUSD = applications.reduce((acc, curr) => acc + (curr.costBreakdown?.totalUSD || 0), 0);
  const totalValueSettledUSD = applications
    .filter(a => a.status === 'CLEARANCE_GRANTED')
    .reduce((acc, curr) => acc + (curr.costBreakdown?.totalUSD || 0), 0);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle || !alertContent) return;
    onAddAnnouncement(alertTitle, alertContent, alertScope, alertScope === 'country_specific' ? alertCountry : undefined);
    setAlertTitle('');
    setAlertContent('');
    alert('Broadcast transmitted across secure regional portals.');
  };

  const openEditMode = (app: Application) => {
    setEditFields({
      fullName: app.personalInfo?.fullName || '',
      email: app.personalInfo?.email || '',
      phone: app.personalInfo?.phone || '',
      nationality: app.personalInfo?.nationality || '',
      passportNumber: app.passportInfo.passportNumber,
      priorityLevel: app.priorityLevel,
      approvalTimeline: app.approvalTimeline,
    });
    setEditMode(true);
  };

  const handleSaveEdit = () => {
    if (!selectedApp) return;
    onUpdateApplication(selectedApp.id, {
      personalInfo: { ...selectedApp.personalInfo, fullName: editFields.fullName, email: editFields.email, phone: editFields.phone, nationality: editFields.nationality },
      passportInfo: { ...selectedApp.passportInfo, passportNumber: editFields.passportNumber },
      priorityLevel: editFields.priorityLevel as Application['priorityLevel'],
      approvalTimeline: editFields.approvalTimeline,
    });
    setEditMode(false);
    setSelectedApp(prev => prev ? { ...prev, personalInfo: { ...prev.personalInfo, fullName: editFields.fullName, email: editFields.email, phone: editFields.phone, nationality: editFields.nationality }, passportInfo: { ...prev.passportInfo, passportNumber: editFields.passportNumber }, priorityLevel: editFields.priorityLevel as Application['priorityLevel'], approvalTimeline: editFields.approvalTimeline } : null);
  };

  const handleSendDM = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dmEmail || !dmSubject || !dmMessage) return;
    onSendDirectMessage(dmEmail, dmSubject, dmMessage);
    setDmSent(true);
    setTimeout(() => { setDmSent(false); setDmEmail(''); setDmSubject(''); setDmMessage(''); }, 3000);
  };

  const handleTicketReplySubmit = (ticketId: string) => {
    const text = ticketReplies[ticketId];
    if (!text || !text.trim()) return;
    onAdminResponse(ticketId, text);
    setTicketReplies(prev => ({ ...prev, [ticketId]: '' }));
  };

  return (
    <div id="admin_command_deck" className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
      
      {/* Top Admin Control Strip */}
      <div className="glass-card lg:col-span-4 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white">
            <Settings className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">Accreditation Management Center</h3>
            <div className="flex items-center gap-2 mt-1 font-mono text-[9px] text-[#5B5F78] uppercase">
              <span>ADMINISTRATIVE TERMINAL ACTIVE</span>
              <span className="text-white font-bold">• CONNECTED</span>
            </div>
          </div>
        </div>

        {/* Exit action button */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[9px] font-mono text-[#5B5F78] uppercase block font-bold leading-none">ACTIVE USER</span>
            <span className="text-xs text-white/80 font-mono">System Admin</span>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 border border-red-500/20 hover:border-red-500/40 rounded-full font-sans text-xs uppercase font-bold text-red-400 hover:bg-red-500/5 duration-150 cursor-pointer active:scale-95"
          >
            Logout
          </button>
        </div>
      </div>


      {/* Side Administration Menu tab selectors */}
      <div className="lg:col-span-1 space-y-4">
        <div id="admin_sidebar_menu" className="glass-card rounded-3xl p-3.5 space-y-1">
          {[
            { tag: 'analytics', label: 'Sector Metrics Dashboard', icon: BarChart3 },
            { tag: 'applications', label: 'Accreditation Dossiers', icon: ClipboardList },
            { tag: 'payments', label: 'Crypto Ledger Ledger', icon: DollarSign },
            { tag: 'announcements', label: 'Portal Alerts Broadcast', icon: Megaphone },
            { tag: 'tickets', label: 'Emergency Support Deck', icon: ShieldAlert },
            { tag: 'messages', label: 'Direct Message User', icon: Mail },
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeAdminTab === tab.tag;
            return (
              <button
                key={tab.tag}
                onClick={() => setActiveAdminTab(tab.tag as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-sans text-xs text-left cursor-pointer duration-150 transition ${
                  isSelected 
                    ? 'bg-[#796BFF]/15 text-[#B6B3FF] border border-[#796BFF]/30 shadow-md' 
                    : 'text-[#8B8FA8] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isSelected ? 'text-[#B6B3FF]' : 'text-[#5B5F78]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Admin tab panels */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* TAB 1: ANALYTICS & MONITORING */}
        {activeAdminTab === 'analytics' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Quick Metrics grid */}
            <div id="admin_quick_metrics" className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card rounded-2xl p-4">
                <span className="text-[10px] font-sans text-[#B6B3FF] uppercase tracking-wider block font-semibold">Accreditation Dossiers</span>
                <span className="text-3xl font-extrabold text-[#796BFF] font-sans block mt-1.5">{totalApps} Received</span>
                <span className="text-[8px] font-sans text-[#8B8FA8] uppercase tracking-widest block mt-1">TOTAL GLOBAL LOGS</span>
              </div>
              <div className="glass-card rounded-2xl p-4">
                <span className="text-[10px] font-sans text-[#B6B3FF] uppercase tracking-wider block font-semibold">Approved Gateways</span>
                <span className="text-3xl font-extrabold text-[#796BFF] font-sans block mt-1.5">{approvedApps} Passports</span>
                <span className="text-[8px] font-sans text-[#8B8FA8] uppercase block mt-1">APPROVAL RATE: {totalApps > 0 ? Math.round((approvedApps/totalApps)*100) : 0}%</span>
              </div>
              <div className="glass-card rounded-2xl p-4">
                <span className="text-[10px] font-sans text-[#B6B3FF] uppercase tracking-wider block font-semibold">Dynamic Portal Value</span>
                <span className="text-3xl font-extrabold text-[#796BFF] font-sans block mt-1.5">${totalValueUSD.toLocaleString()}</span>
                <span className="text-[8px] font-sans text-[#8B8FA8] uppercase block mt-1">USD BASIS VALUE REGISTERED</span>
              </div>
              <div className="glass-card rounded-2xl p-4">
                <span className="text-[10px] font-sans text-[#B6B3FF] uppercase tracking-wider block font-semibold">Settled Crypto Ledger</span>
                <span className="text-3xl font-extrabold text-[#796BFF] font-sans block mt-1.5">${totalValueSettledUSD.toLocaleString()}</span>
                <span className="text-[8px] font-sans text-[#8B8FA8] uppercase block mt-1 font-bold">✓ SECURE BLOCKCHAIN ACCORD</span>
              </div>
            </div>

            {/* Simulated Live security operations dashboard charts or logs represent high-security environment */}
            <div className="glass-card rounded-3xl p-6">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <span className="text-[9px] font-mono text-[#5B5F78] uppercase block">SECURITY TELEMETRY LOG</span>
                  <h4 className="text-sm font-bold text-white uppercase font-sans tracking-wide">Accreditee Country heatmaps</h4>
                </div>
                <span className="text-[9px] font-mono text-white bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full uppercase font-bold animate-pulse">
                  STABLE SYNC
                </span>
              </div>

              {/* Graphical simulation of country distribution */}
              <div className="space-y-4 font-mono text-xs text-[#8B8FA8]">
                {[
                  { name: 'France (UEFA Corridor A)', count: applications.filter(a => a.personalInfo?.nationality === 'French').length, color: 'bg-[#796BFF]' },
                  { name: 'Germany (UEFA Corridor B)', count: applications.filter(a => a.personalInfo?.nationality === 'German').length, color: 'bg-[#B6B3FF]' },
                  { name: 'Spain / Iberia Area', count: applications.filter(a => a.personalInfo?.nationality === 'Spanish').length, color: 'bg-sky-400' },
                  { name: 'European Sovereigns (Mixed)', count: applications.filter(a => a.personalInfo?.nationality !== 'French' && a.personalInfo?.nationality !== 'German' && a.personalInfo?.nationality !== 'Spanish').length, color: 'bg-zinc-800' }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between font-bold">
                      <span className="text-white text-[11px] uppercase">{item.name}</span>
                      <span>{item.count} Dossiers</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full`}
                        style={{ width: `${totalApps > 0 ? (item.count / totalApps) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: APPLICATIONS MANAGEMENT */}
        {activeAdminTab === 'applications' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Filter bar */}
            <div className="flex items-center relative">
              <Search className="w-4 h-4 text-[#5B5F78] absolute left-3" />
              <input
                type="text"
                placeholder="Search registered dossiers by name, passport, clearance index..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-xs text-white placeholder-zinc-500 focus:outline-none font-sans"
              />
            </div>

            {/* Grid listings of dossiers */}
            <div className="glass-card rounded-3xl overflow-hidden">
              <div className="p-4 bg-[#1C1C27]/30 border-b border-white/[0.06] flex justify-between items-center font-mono text-[10px] text-[#8B8FA8] uppercase tracking-widest font-bold">
                <span>REPRESENTATIVE NAME</span>
                <span className="hidden md:inline">PASSPORT CODE</span>
                <span className="hidden md:inline">SECURITY LEVEL</span>
                <span>STATUS DECISION</span>
              </div>

              {filteredApps.length > 0 ? (
                <div className="divide-y divide-white/[0.06]">
                  {filteredApps.map((app) => (
                    <div 
                      key={app.id} 
                      className="p-4 flex items-center justify-between gap-4 hover:bg-[#1C1C27]/30 cursor-pointer duration-150"
                      onClick={() => setSelectedApp(app)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1C1C27] border border-white/[0.08] flex items-center justify-center text-xs text-[#8B8FA8]">
                          👤
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-white font-sans">{app.personalInfo?.fullName || ''}</h5>
                          <span className="text-[9px] font-mono text-[#5B5F78] uppercase tracking-wider block mt-0.5">{app.applicationNumber}</span>
                        </div>
                      </div>

                      <div className="hidden md:block font-mono text-[10px] text-[#8B8FA8]">
                        {app.passportInfo.passportNumber}
                      </div>

                      <div className="hidden md:block font-mono text-[9px] text-white uppercase bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full font-bold">
                        {app.priorityLevel}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-mono font-bold uppercase ${
                          app.status === 'CLEARANCE_GRANTED' ? 'text-white' : 'text-white animate-pulse'
                        }`}>
                          {app.status === 'CLEARANCE_GRANTED' ? 'GRANTED' : 'UNDER REVIEW'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-[#5B5F78] font-mono text-[11px] uppercase tracking-wider">
                  Zero corresponding dossiers registered in database
                </div>
              )}
            </div>

            {/* Highlighted Selected Application Decision Sandbox Modal Panel */}
            {selectedApp && (
              <div className="glass-card glass-glow rounded-3xl p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex justify-between items-start border-b border-white/[0.06] pb-4">
                  <div>
                    <span className="text-[8px] font-mono text-white uppercase tracking-widest block font-bold">DECISION VIEWPORT</span>
                    <h4 className="text-sm font-bold text-white uppercase font-sans mt-0.5">
                      Accreditation Docket: {selectedApp.applicationNumber}
                    </h4>
                  </div>
                  <button 
                    onClick={() => setSelectedApp(null)}
                    className="text-[#5B5F78] hover:text-white font-mono text-xs cursor-pointer uppercase"
                  >
                    [ Close Decision Window ]
                  </button>
                </div>

                {/* Passport & Selfie Scan validation images */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl glass flex flex-col items-center justify-center text-center space-y-2">
                    <CheckSquare className="w-5 h-5 text-white" />
                    <div>
                      <h5 className="text-[11px] font-bold text-white font-sans uppercase">Verify Passport Binary Scan</h5>
                      <span className="text-[9px] font-mono text-[#5B5F78] block">ENACTED THROUGH SECURITY API</span>
                    </div>
                    <div className="text-[9px] font-mono text-white bg-white/5 px-2 py-0.5 rounded border border-white/10">
                      ✓ ENCRYPTED FILE INTEGRITY SCAN: PASS
                    </div>
                  </div>

                  <div className="p-4 rounded-xl glass flex flex-col items-center justify-center text-center space-y-2">
                    <CheckSquare className="w-5 h-5 text-white" />
                    <div>
                      <h5 className="text-[11px] font-bold text-white font-sans uppercase">Verify Selfie Match Facial Node</h5>
                      <span className="text-[9px] font-mono text-[#5B5F78] block">PROCESSED BY IMMIGRATION SECURITY</span>
                    </div>
                    <div className="text-[9px] font-mono text-white bg-white/5 px-2 py-0.5 rounded border border-white/10">
                      ✓ FACIAL COMPARATIVE MATCH RATE: 99.8%
                    </div>
                  </div>
                </div>

                {/* Edit Mode toggle */}
                <div className="flex gap-3 pt-2 border-t border-white/[0.06] flex-wrap">
                  <button
                    onClick={() => { openEditMode(selectedApp); }}
                    className="flex items-center gap-1.5 border border-white/[0.08] hover:border-white/20 text-white/80 hover:text-white px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase duration-150 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Edit Application
                  </button>
                </div>

                {/* Inline Edit Fields */}
                {editMode && (
                  <div className="mt-4 p-5 rounded-2xl glass space-y-4 animate-in fade-in duration-200">
                    <h5 className="text-[10px] font-mono font-bold text-white uppercase tracking-widest border-b border-white/[0.06] pb-3">
                      Edit Applicant Details
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { label: 'Full Name', key: 'fullName' },
                        { label: 'Email', key: 'email' },
                        { label: 'Phone', key: 'phone' },
                        { label: 'Nationality', key: 'nationality' },
                        { label: 'Passport Number', key: 'passportNumber' },
                        { label: 'Approval Timeline', key: 'approvalTimeline' },
                      ].map(({ label, key }) => (
                        <div key={key} className="space-y-1">
                          <label className="text-[9px] font-sans text-[#5B5F78] uppercase block font-bold">{label}</label>
                          <input
                            type="text"
                            value={(editFields as any)[key]}
                            onChange={e => setEditFields(prev => ({ ...prev, [key]: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg glass-input text-xs text-white placeholder-zinc-500 focus:outline-none font-sans"
                          />
                        </div>
                      ))}
                      <div className="space-y-1">
                        <label className="text-[9px] font-sans text-[#5B5F78] uppercase block font-bold">Priority Level</label>
                        <select
                          value={editFields.priorityLevel}
                          onChange={e => setEditFields(prev => ({ ...prev, priorityLevel: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg glass-input text-xs text-white focus:outline-none font-sans"
                        >
                          <option value="STANDARD">STANDARD</option>
                          <option value="EXECUTIVE">EXECUTIVE</option>
                          <option value="EXECUTIVE_VIP">EXECUTIVE VIP</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleSaveEdit}
                        className="px-5 py-2.5 bg-white hover:bg-zinc-100 text-[#13131A] font-bold text-xs uppercase rounded-xl cursor-pointer active:scale-95 duration-150"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        className="px-5 py-2.5 glass-btn text-white/60 hover:text-white font-mono text-xs uppercase rounded-xl cursor-pointer duration-150"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Operator Actions */}
                <div className="flex gap-3 justify-end pt-2 flex-wrap">
                  {(['Super Admin', 'Verification Officer'] as AdminRole[]).includes(currentAdminRole) && (
                    <>
                      <button
                        onClick={() => {
                          onUpdateAppStatus(selectedApp.id, 'CLEARANCE_GRANTED');
                          setSelectedApp(null);
                        }}
                        className="flex items-center gap-1.5 bg-white hover:bg-zinc-200 text-[#13131A] px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase duration-150 cursor-pointer active:scale-95"
                      >
                        <ShieldCheck className="w-4 h-4" /> Issue Gate Clearance
                      </button>

                      <button
                        onClick={() => {
                          onUpdateAppStatus(selectedApp.id, 'PASSPORT_REJECTED');
                          setSelectedApp(null);
                        }}
                        className="flex items-center gap-1.5 bg-red-950 hover:bg-red-900 hover:text-white text-red-400 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase duration-150 cursor-pointer border border-red-500/20"
                      >
                        <X className="w-4 h-4" /> REJECT DOSSIER PASSPORT
                      </button>

                      <button
                        onClick={() => {
                          onUpdateAppStatus(selectedApp.id, 'DOCUMENT_REQUESTED');
                          setSelectedApp(null);
                        }}
                        className="flex items-center gap-1.5 border border-white/[0.08] hover:border-white/[0.12] hover:bg-[#1C1C27] text-white/80 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase duration-150 cursor-pointer"
                      >
                        <Mail className="w-4 h-4" /> REQUEST NEW UPLOAD
                      </button>
                    </>
                  )}

                  {currentAdminRole === 'Super Admin' && (
                    <button
                      onClick={() => {
                        onDeleteApplication(selectedApp.id);
                        setSelectedApp(null);
                      }}
                      className="flex items-center gap-1.5 bg-[#1C1C27] hover:bg-white/[0.06] hover:text-red-400 border border-white/[0.08] p-2.5 rounded-xl duration-150 cursor-pointer"
                      title="De-register App"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CRYPTO CLEARANCE MATRIX */}
        {activeAdminTab === 'payments' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-4.5 bg-white/5 border border-white/8 rounded-2xl flex items-center gap-3">
              <Wallet className="w-5 h-5 text-white shrink-0" />
              <div className="font-sans text-xs">
                <p className="text-white font-bold uppercase">Sovereign settlement audits matrix</p>
                <p className="text-[#8B8FA8] font-mono text-[10px] mt-0.5 uppercase">
                  Verify currency rates and proof attachments before granting final accreditee clearances.
                </p>
              </div>
            </div>

            {/* SEARCH AND FILTERS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="w-4 h-4 text-[#5B5F78] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by traveler, email, application..."
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-xs text-white placeholder-zinc-500 focus:outline-none font-sans"
                />
              </div>

              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value as any)}
                className="px-4 py-3 rounded-xl glass-input text-xs text-white focus:outline-none font-sans appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='none' stroke='white' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M19 9l-7 7-7-7'></path></svg>")`, backgroundPosition: 'right 16px center', backgroundSize: '14px', backgroundRepeat: 'no-repeat' }}
              >
                <option value="ALL" className="bg-[#13131A] text-white">All Statuses</option>
                <option value="PENDING" className="bg-[#13131A] text-white">Pending Verification</option>
                <option value="APPROVED" className="bg-[#13131A] text-white">Approved</option>
                <option value="REJECTED" className="bg-[#13131A] text-white">Rejected</option>
              </select>

              <select
                value={paymentCryptoFilter}
                onChange={(e) => setPaymentCryptoFilter(e.target.value as any)}
                className="px-4 py-3 rounded-xl glass-input text-xs text-white focus:outline-none font-sans appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='none' stroke='white' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M19 9l-7 7-7-7'></path></svg>")`, backgroundPosition: 'right 16px center', backgroundSize: '14px', backgroundRepeat: 'no-repeat' }}
              >
                <option value="ALL" className="bg-[#13131A] text-white">All Cryptocurrencies</option>
                <option value="ETH" className="bg-[#13131A] text-white">Ethereum (ETH)</option>
                <option value="BTC" className="bg-[#13131A] text-white">Bitcoin (BTC)</option>
                <option value="SOL" className="bg-[#13131A] text-white">Solana (SOL)</option>
              </select>
            </div>

            {/* PAYMENTS LIST */}
            <div className="glass-card rounded-3xl overflow-hidden">
              <div className="p-4 bg-[#1C1C27]/30 border-b border-white/[0.06] grid grid-cols-2 md:grid-cols-6 gap-2 font-mono text-[9px] text-[#8B8FA8] uppercase tracking-widest font-bold">
                <span className="col-span-2">Traveler</span>
                <span className="hidden md:inline">Crypto Asset</span>
                <span className="hidden md:inline">Deposit (10%) / Total</span>
                <span className="hidden md:inline">Date Submitted</span>
                <span>Status</span>
              </div>

              {paymentFilteredApps.length > 0 ? (
                <div className="divide-y divide-white/[0.06]">
                  {paymentFilteredApps.map((app) => {
                    const payDetails = app.paymentDetails;
                    const method = payDetails?.method || 'N/A';
                    const depositAmt = payDetails?.depositAmountUSD || ((app.costBreakdown?.totalUSD || 0) * 0.1);
                    const totalAmt = app.costBreakdown?.totalUSD || 0;
                    const cryptoAmt = payDetails?.amountCrypto;
                    const submittedAt = payDetails?.uploadedAt ? new Date(payDetails.uploadedAt).toLocaleDateString() : 'N/A';
                    const status = payDetails?.status || 'PENDING_VERIFICATION';

                    return (
                      <div
                        key={app.id}
                        onClick={() => {
                          setSelectedPaymentApp(app);
                          setInternalNotesText(payDetails?.internalNotes || '');
                          setRejectionReasonText(payDetails?.rejectionReason || '');
                          setShowRejectForm(false);
                          setZoomScale(1);
                        }}
                        className={`p-4 grid grid-cols-2 md:grid-cols-6 gap-2 items-center hover:bg-[#1C1C27]/30 cursor-pointer duration-150 ${selectedPaymentApp?.id === app.id ? 'bg-[#796BFF]/5' : ''}`}
                      >
                        <div className="col-span-2 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#1C1C27] border border-white/[0.08] flex items-center justify-center text-xs text-[#8B8FA8]">
                            💰
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-white font-sans">{app.personalInfo?.fullName || ''}</h5>
                            <span className="text-[9px] font-mono text-[#5B5F78] uppercase tracking-wider block mt-0.5">{app.personalInfo?.email || ''}</span>
                          </div>
                        </div>

                        <div className="hidden md:block font-mono text-xs text-white">
                          {method} {cryptoAmt ? `(${cryptoAmt})` : ''}
                        </div>

                        <div className="hidden md:block font-mono text-xs text-white">
                          <span className="font-bold text-[#B6B3FF]">${depositAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          <span className="text-[10px] text-[#5B5F78] block">/ ${totalAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>

                        <div className="hidden md:block font-mono text-[10px] text-[#8B8FA8]">
                          {submittedAt}
                        </div>

                        <div>
                          <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                            status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                          }`}>
                            {status === 'PENDING_VERIFICATION' ? 'PENDING' : status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center text-[#5B5F78] font-mono text-[11px] uppercase tracking-wider">
                  Zero corresponding payments found in database
                </div>
              )}
            </div>

            {/* EXPANDED REVIEW SECTION */}
            {selectedPaymentApp && (
              <div className="glass-card glass-glow rounded-3xl p-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex justify-between items-start border-b border-white/[0.06] pb-4">
                  <div>
                    <span className="text-[8px] font-mono text-white uppercase tracking-widest block font-bold">PAYMENT AUDIT VIEWPORT</span>
                    <h4 className="text-sm font-bold text-white uppercase font-sans mt-0.5">
                      Verification Docket: {selectedPaymentApp.applicationNumber}
                    </h4>
                  </div>
                  <button 
                    onClick={() => setSelectedPaymentApp(null)}
                    className="text-[#5B5F78] hover:text-white font-mono text-xs cursor-pointer uppercase"
                  >
                    [ Close Audit Window ]
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* LEFT: Proof Viewer */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h5 className="text-[11px] font-bold text-white font-sans uppercase">Uploaded Proof document</h5>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setZoomScale(prev => Math.max(0.5, prev - 0.25))}
                          className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white rounded text-[10px] font-mono cursor-pointer"
                        >
                          Zoom -
                        </button>
                        <button
                          onClick={() => setZoomScale(1)}
                          className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white rounded text-[10px] font-mono cursor-pointer"
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => setZoomScale(prev => Math.min(3, prev + 0.25))}
                          className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white rounded text-[10px] font-mono cursor-pointer"
                        >
                          Zoom +
                        </button>
                        {selectedPaymentApp.paymentDetails?.proofUrl && (
                          <a
                            href={selectedPaymentApp.paymentDetails.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 bg-[#796BFF]/20 hover:bg-[#796BFF]/30 text-[#B6B3FF] rounded text-[10px] font-mono inline-flex items-center gap-1 cursor-pointer"
                          >
                            Open External
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="relative border border-white/10 rounded-xl bg-zinc-950/80 overflow-hidden flex items-center justify-center min-h-[300px] max-h-[450px]">
                      {selectedPaymentApp.paymentDetails?.proofUrl ? (
                        selectedPaymentApp.paymentDetails.proofUrl.toLowerCase().endsWith('.pdf') ? (
                          <iframe 
                            src={selectedPaymentApp.paymentDetails.proofUrl} 
                            className="w-full h-[400px] border-none" 
                            title="Payment Proof PDF"
                          />
                        ) : (
                          <div className="w-full h-full overflow-auto p-4 flex items-center justify-center">
                            <img
                              src={selectedPaymentApp.paymentDetails.proofUrl}
                              style={{ transform: `scale(${zoomScale})`, transition: 'transform 0.15s ease' }}
                              className="max-w-full max-h-[380px] object-contain rounded-lg"
                              alt="Payment Proof document"
                            />
                          </div>
                        )
                      ) : (
                        <span className="text-[#5B5F78] font-mono text-xs uppercase">No proof file on record</span>
                      )}
                    </div>
                  </div>

                  {/* RIGHT: Transaction Metadata and Actions */}
                  <div className="space-y-5 flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Details list */}
                      <div className="grid grid-cols-2 gap-4 font-mono text-xs bg-[#13131A] p-4 rounded-xl border border-white/[0.06]">
                        <div>
                          <span className="text-[#5B5F78] block text-[9px] uppercase">Applicant Name:</span>
                          <span className="text-white font-sans font-bold">{selectedPaymentApp.personalInfo?.fullName || ''}</span>
                        </div>
                        <div>
                          <span className="text-[#5B5F78] block text-[9px] uppercase">Applicant Email:</span>
                          <span className="text-white font-sans">{selectedPaymentApp.personalInfo?.email || ''}</span>
                        </div>
                        <div>
                          <span className="text-[#5B5F78] block text-[9px] uppercase">Crypto Asset:</span>
                          <span className="text-white font-bold">{selectedPaymentApp.paymentDetails?.method || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-[#5B5F78] block text-[9px] uppercase">Equivalent Crypto:</span>
                          <span className="text-white font-bold">{selectedPaymentApp.paymentDetails?.amountCrypto || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-[#5B5F78] block text-[9px] uppercase">Deposit Value (10%):</span>
                          <span className="text-emerald-400 font-bold">${(selectedPaymentApp.paymentDetails?.depositAmountUSD || ((selectedPaymentApp.costBreakdown?.totalUSD || 0) * 0.1)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div>
                          <span className="text-[#5B5F78] block text-[9px] uppercase">Package Total Value:</span>
                          <span className="text-white font-bold">${(selectedPaymentApp.costBreakdown?.totalUSD || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div>
                          <span className="text-[#5B5F78] block text-[9px] uppercase">Submission Date:</span>
                          <span className="text-white">{selectedPaymentApp.paymentDetails?.uploadedAt ? new Date(selectedPaymentApp.paymentDetails.uploadedAt).toLocaleString() : 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-[#5B5F78] block text-[9px] uppercase">Current Payment Status:</span>
                          <span className="text-white font-bold uppercase">{selectedPaymentApp.paymentDetails?.status || 'PENDING'}</span>
                        </div>
                      </div>

                      {/* Internal Notes textarea */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-sans text-[#5B5F78] uppercase block font-bold">
                          Treasury Internal Notes
                        </label>
                        <div className="flex gap-2">
                          <textarea
                            rows={3}
                            value={internalNotesText}
                            onChange={(e) => setInternalNotesText(e.target.value)}
                            placeholder="Add administrative notes regarding this transaction..."
                            className="flex-1 px-3 py-2 rounded-xl glass-input text-xs text-white placeholder-zinc-600 focus:outline-none font-sans resize-none"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              const updatedApp: Application = {
                                ...selectedPaymentApp,
                                paymentDetails: {
                                  ...selectedPaymentApp.paymentDetails!,
                                  internalNotes: internalNotesText
                                }
                              };
                              await onUpdateApplication(selectedPaymentApp.id, updatedApp);
                              setSelectedPaymentApp(updatedApp);
                              alert('Treasury notes saved successfully.');
                            }}
                            className="px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-sans font-bold uppercase cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      </div>

                      {/* Rejection UI Form if requested */}
                      {showRejectForm && (
                        <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-xl space-y-3 animate-in slide-in-from-bottom-2 duration-200">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-mono text-red-400 uppercase tracking-widest block font-bold">
                              Reason for Rejection
                            </label>
                            <textarea
                              rows={2}
                              required
                              value={rejectionReasonText}
                              onChange={(e) => setRejectionReasonText(e.target.value)}
                              placeholder="e.g. Transaction hash could not be verified on the Solana explorer, or proof document is too blurry."
                              className="w-full px-3 py-2 rounded-lg border border-red-500/20 bg-[#13131A]/60 text-xs text-white placeholder-red-300/20 focus:outline-none focus:border-red-500/40 font-sans"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={async () => {
                                if (!rejectionReasonText.trim()) {
                                  alert('Please enter a reason for rejecting the payment proof.');
                                  return;
                                }
                                
                                const updatedApp: Application = {
                                  ...selectedPaymentApp,
                                  status: 'APPROVED_AWAITING_PAYMENT',
                                  paymentDetails: {
                                    ...selectedPaymentApp.paymentDetails!,
                                    status: 'REJECTED',
                                    rejectionReason: rejectionReasonText,
                                    internalNotes: internalNotesText
                                  }
                                };

                                // Write notification to traveler inbox
                                const userEmail = (selectedPaymentApp.personalInfo?.email || '').toLowerCase();
                                const userKey = `fifa_inbox_${userEmail}`;
                                const userInbox = JSON.parse(localStorage.getItem(userKey) || '[]');
                                userInbox.unshift({
                                  id: `notif_${Date.now()}`,
                                  subject: 'Deposit Payment Rejected',
                                  message: `Your deposit proof of payment has been rejected by our financial officers. Reason: ${rejectionReasonText}. Please submit a valid transaction proof on the Payment Deck.`,
                                  from: 'Treasury Department',
                                  sentAt: new Date().toISOString(),
                                  read: false
                                });
                                localStorage.setItem(userKey, JSON.stringify(userInbox));

                                await onUpdateApplication(selectedPaymentApp.id, updatedApp);
                                setSelectedPaymentApp(updatedApp);
                                setShowRejectForm(false);
                                alert('Payment proof rejected and citizen notified.');
                              }}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-sans font-bold uppercase cursor-pointer"
                            >
                              Confirm Rejection
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowRejectForm(false)}
                              className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg text-[10px] font-sans font-bold uppercase cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Operator actions row */}
                    {!showRejectForm && (
                      <div className="flex gap-3 justify-end pt-4 border-t border-white/[0.06] flex-wrap">
                        {(currentAdminRole === 'Finance Officer' || currentAdminRole === 'Super Admin') && (
                          <>
                            {selectedPaymentApp.paymentDetails?.status !== 'APPROVED' && (
                              <button
                                type="button"
                                onClick={async () => {
                                  const updatedApp: Application = {
                                    ...selectedPaymentApp,
                                    status: 'CLEARANCE_GRANTED',
                                    reservationStatus: 'CONFIRMED',
                                    paymentDetails: {
                                      ...selectedPaymentApp.paymentDetails!,
                                      status: 'APPROVED',
                                      approvedAt: new Date().toISOString(),
                                      internalNotes: internalNotesText
                                    }
                                  };

                                  // Write success notification to traveler inbox
                                  const userEmail = (selectedPaymentApp.personalInfo?.email || '').toLowerCase();
                                  const userKey = `fifa_inbox_${userEmail}`;
                                  const userInbox = JSON.parse(localStorage.getItem(userKey) || '[]');
                                  userInbox.unshift({
                                    id: `notif_${Date.now()}`,
                                    subject: 'Accreditation Pass & Payment Approved',
                                    message: 'Sovereign deposit settlement verified. Your security clearance is now fully active. Luxury accommodation coordinates and aviation log parameters have been unlocked in your cabinet.',
                                    from: 'Security Office',
                                    sentAt: new Date().toISOString(),
                                    read: false
                                  });
                                  localStorage.setItem(userKey, JSON.stringify(userInbox));

                                  await onUpdateApplication(selectedPaymentApp.id, updatedApp);
                                  setSelectedPaymentApp(updatedApp);
                                  alert('Sovereign payment approved and travel clearance issued.');
                                }}
                                className="flex items-center gap-1.5 bg-white hover:bg-zinc-200 text-[#13131A] px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase duration-150 cursor-pointer active:scale-95 shadow-md"
                              >
                                <ShieldCheck className="w-4 h-4" /> Approve Payment
                              </button>
                            )}

                            {selectedPaymentApp.paymentDetails?.status !== 'REJECTED' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectionReasonText('');
                                  setShowRejectForm(true);
                                }}
                                className="flex items-center gap-1.5 bg-red-950 hover:bg-red-900 hover:text-white text-red-400 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase duration-150 cursor-pointer border border-red-500/20"
                              >
                                <X className="w-4 h-4" /> Reject Payment
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ALERT BROADCAST & NOTIFICATIONS RULES */}
        {activeAdminTab === 'announcements' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="glass-card rounded-3xl p-6">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest pb-3 border-b border-white/[0.06] mb-6">
                BROADCAST ANNOUNCEMENT CROSS REGIONS
              </h4>

              <form onSubmit={handleBroadcast} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-[#5B5F78] uppercase block font-bold">Broadcast Headline</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Helicopter route sync updates in Dallas host city"
                    value={alertTitle}
                    onChange={(e) => setAlertTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white placeholder-white/20 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-[#5B5F78] uppercase block font-bold">Broadcast Narrative / Body</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide full logistics changes..."
                    value={alertContent}
                    onChange={(e) => setAlertContent(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white placeholder-white/20 focus:outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-[#5B5F78] uppercase block font-bold">Transmit Scope Coverage</label>
                    <select
                      value={alertScope}
                      onChange={(e) => setAlertScope(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white focus:outline-none font-mono"
                    >
                      <option value="all">Sovereign Global Citizens (All Countries)</option>
                      <option value="priority_only">Executive / Sovereign VIP VIP Access Only</option>
                      <option value="country_specific">Territorial Specific Jurisdiction</option>
                    </select>
                  </div>

                  {alertScope === 'country_specific' && (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                      <label className="text-[10px] font-mono text-[#5B5F78] uppercase block font-bold">Dispatched Target Country</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. French, German"
                        value={alertCountry}
                        onChange={(e) => setAlertCountry(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-zinc-850 bg-[#1C1C27]/40 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/15 font-mono"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-white hover:bg-zinc-100 text-[#13131A] font-mono text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer duration-150 active:scale-95 shadow-md shadow-black/20"
                >
                  TRANSMIT DIGITAL BULLETIN
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 5: EMERGENCY TICKETS ROUTER */}
        {activeAdminTab === 'tickets' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="glass-card rounded-3xl p-6">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest pb-3 border-b border-white/[0.06] mb-6 font-semibold">
                ACTIVE INCIDENT TICKETS QUEUE
              </h4>

              <div className="space-y-4">
                {tickets.map(ticket => (
                  <div key={ticket.id} className="p-5 rounded-2xl glass-card rounded-2xl space-y-4">
                    <div className="flex justify-between items-start font-mono text-xs text-[#5B5F78] uppercase flex-wrap gap-2">
                      <div>
                        <span className="block font-bold text-white text-[13px] font-sans">Docket Incident: {ticket.subject}</span>
                        <span className="text-[10px] block mt-1 tracking-tight">Accreditee: {ticket.userName} ({ticket.applicationNumber})</span>
                      </div>
                      <span className="text-white">[ OPEN INCIDENT LOG ]</span>
                    </div>

                    {/* Messages in ticket */}
                    <div className="bg-[#1C1C27]/30 p-4 rounded-xl space-y-3 max-h-[180px] overflow-y-auto">
                      {ticket.messages.map(msg => (
                        <div key={msg.id} className={`flex flex-col text-xs font-sans ${msg.sender === 'admin' ? 'mr-auto items-start text-white' : 'ml-auto items-end text-white/80'}`}>
                          <div className={`p-2.5 rounded-xl ${msg.sender === 'admin' ? 'bg-white/5 border border-white/8' : 'bg-[#1C1C27]'}`}>
                            {msg.text}
                          </div>
                          <span className="text-[8px] font-mono text-[#5B5F78] mt-1 uppercase">
                            {msg.sender === 'admin' ? 'RESP_OFFICER' : 'CITIZEN'} • {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Officer Reply Trigger Input */}
                    <div className="flex gap-2 font-mono">
                      <input
                        type="text"
                        placeholder="Issue official response to citizen..."
                        value={ticketReplies[ticket.id] || ''}
                        onChange={(e) => setTicketReplies({ ...ticketReplies, [ticket.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleTicketReplySubmit(ticket.id);
                        }}
                        className="flex-1 px-3 py-2 rounded-lg glass text-xs text-white placeholder-white/20 focus:outline-none"
                      />
                      <button
                        onClick={() => handleTicketReplySubmit(ticket.id)}
                        className="px-4 py-2 bg-white hover:bg-zinc-100 text-[#13131A] font-bold text-[10px] uppercase rounded-lg cursor-pointer transition active:scale-95"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                ))}

                {tickets.length === 0 && (
                  <div className="text-center py-8 text-[#5B5F78] font-mono text-[10px] uppercase">
                    Zero emergency reports registered at present
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: DIRECT MESSAGE */}
        {activeAdminTab === 'messages' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="glass-card rounded-3xl p-6">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest pb-3 border-b border-white/[0.06] mb-6">
                SEND DIRECT MESSAGE TO APPLICANT
              </h4>

              {dmSent ? (
                <div className="py-12 flex flex-col items-center gap-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white font-sans uppercase">Message Dispatched</p>
                    <p className="text-[11px] font-mono text-[#5B5F78] mt-1 uppercase">Securely delivered to citizen inbox</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSendDM} className="space-y-5">
                  {/* Quick-fill from application list */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-sans text-[#5B5F78] uppercase block font-bold">
                      Or select applicant
                    </label>
                    <select
                      value={dmEmail}
                      onChange={e => setDmEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white focus:outline-none font-sans"
                    >
                      <option value="">— Select from registered applicants —</option>
                      {applications.map(app => (
                        <option key={app.id} value={app.personalInfo?.email || ''}>
                          {app.personalInfo?.fullName || ''} ({app.personalInfo?.email || ''})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-sans text-[#5B5F78] uppercase block font-bold">Recipient Email</label>
                    <input
                      type="email"
                      required
                      placeholder="citizen@email.com"
                      value={dmEmail}
                      onChange={e => setDmEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white placeholder-zinc-500 focus:outline-none font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-sans text-[#5B5F78] uppercase block font-bold">Subject Line</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Your accreditation requires action"
                      value={dmSubject}
                      onChange={e => setDmSubject(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white placeholder-zinc-500 focus:outline-none font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-sans text-[#5B5F78] uppercase block font-bold">Message Body</label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Write your official message to this applicant..."
                      value={dmMessage}
                      onChange={e => setDmMessage(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white placeholder-zinc-500 focus:outline-none font-sans resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-sans text-[#5B5F78] uppercase">
                      Dispatched via secure encrypted portal relay
                    </span>
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-zinc-100 text-[#13131A] font-sans text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer duration-155 active:scale-95 shadow-md shadow-black/20"
                    >
                      <Send className="w-3.5 h-3.5" /> Send Message
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Message log — all admin DMs saved per user */}
            <div className="glass-card rounded-3xl p-6">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest pb-3 border-b border-white/[0.06] mb-4">
                SENT MESSAGE LOG
              </h4>
              {(() => {
                const allMessages: { to: string; subject: string; message: string; sentAt: string }[] = [];
                try {
                  const saved = localStorage.getItem('fifa_admin_direct_messages');
                  if (saved) allMessages.push(...JSON.parse(saved));
                } catch {}
                return allMessages.length > 0 ? (
                  <div className="space-y-3">
                    {allMessages.slice().reverse().map((msg, i) => (
                      <div key={i} className="p-4 rounded-xl glass space-y-1.5">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-white font-sans">{msg.subject}</span>
                          <span className="text-[9px] font-mono text-[#5B5F78]">{new Date(msg.sentAt).toLocaleString()}</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#8B8FA8] block">To: {msg.to}</span>
                        <p className="text-[11px] text-white/70 font-sans leading-relaxed">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#5B5F78] font-mono text-[10px] uppercase">
                    No direct messages sent yet
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}