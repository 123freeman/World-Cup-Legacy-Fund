import React from 'react';
import { Application, Language } from '../types';
import { formatLocalCurrency, formatLocalDateValue } from '../localization';
import { Printer, Download, CheckCircle2, ShieldAlert, Fingerprint } from 'lucide-react';

interface DossierPDFProps {
  application: Application;
  lang: Language;
}

export default function DossierPDF({ application, lang }: DossierPDFProps) {
  const printDossier = () => {
    // Hide standard elements and trigger native browser print styled by media queries
    window.print();
  };

  return (
    <div id="dossier_print_wrapper" className="max-w-2xl w-full mx-auto relative z-10 transition-all duration-300">
      
      {/* Printable Area - Designed for clean styling on physical sheets as well */}
      <div 
        id="dossier_accreditation_paper" 
        className="glass-card glass-glow rounded-3xl p-8 relative overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black print:rounded-none"
      >
        {/* Concentric high-security guilloché background watermark */}
        <div className="absolute inset-0 bg-radial-security opacity-[0.05] pointer-events-none print:opacity-[0.02]" />
        
        {/* Holographic Security top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-white/20 via-white/50 to-white/20 print:hidden" />

        {/* Dossier Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-white/[0.06] pb-6 print:border-zinc-300">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-[#796BFF]/10 text-[#B6B3FF] border border-[#796BFF]/20 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase font-bold print:border-zinc-400 print:text-black">
              <Fingerprint className="w-3.5 h-3.5" /> SECURE DOSSIER CLEARANCE
            </div>
            <h2 className="text-xl font-bold uppercase tracking-tight text-white print:text-black font-sans">
              FIFA WORLD CUP 2026 ACQUIRED
            </h2>
            <p className="text-[10px] font-mono text-[#8B8FA8] uppercase tracking-widest print:text-[#5B5F78]">
              EUROPE MEMBER PORTAL • ACCREDITATION DECREE
            </p>
          </div>

          {/* Hologram Barcode & Scanning Frame */}
          <div className="flex flex-col items-end space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-white print:text-black">
              {application.applicationNumber}
            </span>
            {/* Custom SVG Barcode */}
            <svg className="w-36 h-8 text-white fill-current print:text-black" viewBox="0 0 100 20">
              <rect x="0" y="0" width="2" height="20" />
              <rect x="4" y="0" width="1" height="20" />
              <rect x="7" y="0" width="3" height="20" />
              <rect x="12" y="0" width="1" height="20" />
              <rect x="15" y="0" width="2" height="20" />
              <rect x="18" y="0" width="4" height="20" />
              <rect x="24" y="0" width="1" height="20" />
              <rect x="27" y="0" width="2" height="20" />
              <rect x="30" y="0" width="3" height="20" />
              <rect x="35" y="0" width="1" height="20" />
              <rect x="38" y="0" width="2" height="20" />
              <rect x="42" y="0" width="4" height="20" />
              <rect x="48" y="0" width="1" height="20" />
              <rect x="51" y="0" width="3" height="20" />
              <rect x="56" y="0" width="2" height="20" />
              <rect x="60" y="0" width="1" height="20" />
              <rect x="63" y="0" width="4" height="20" />
              <rect x="69" y="0" width="2" height="20" />
              <rect x="73" y="0" width="1" height="20" />
              <rect x="76" y="0" width="3" height="20" />
              <rect x="81" y="0" width="1" height="20" />
              <rect x="84" y="0" width="2" height="20" />
              <rect x="88" y="0" width="4" height="20" />
              <rect x="94" y="0" width="1" height="20" />
              <rect x="97" y="0" width="3" height="20" />
            </svg>
            <span className="text-[8px] font-mono text-[#5B5F78] uppercase tracking-widest print:text-[#5B5F78]">
              ACC_VERIFICATION_DECODER_M26
            </span>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
          
          {/* Left Column: Biometrics & Photo */}
          <div className="flex flex-col items-center space-y-4 border-r border-white/[0.06] pr-0 md:pr-6 md:border-r print:border-zinc-300 print:text-black">
            <div className="relative w-28 h-28 rounded-2xl border border-white/[0.08] bg-[#1C1C27]/40 p-1 overflow-hidden flex items-center justify-center print:border-zinc-400">
              <svg className="absolute inset-0 w-full h-full text-white/10 pointer-events-none" viewBox="0 0 100 100">
                <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" />
                <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" />
                <circle cx="50" cy="45" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </svg>
              {/* Fallback geometric biometric placeholder */}
              <div className="flex flex-col items-center justify-center text-center space-y-1 text-[#5B5F78]">
                <Fingerprint className="w-8 h-8 text-white/80 print:text-black" />
                <span className="text-[8px] font-mono uppercase tracking-wider block">BIOMETRIC PHOTOGRAPH</span>
              </div>
            </div>

            <div className="w-full text-center md:text-left space-y-2.5">
              <div>
                <span className="text-[8px] font-mono text-[#5B5F78] uppercase block">Accreditee Level</span>
                <span className="text-xs font-bold text-white uppercase print:text-black font-sans">{application.priorityLevel}</span>
              </div>
              <div>
                <span className="text-[8px] font-mono text-[#5B5F78] uppercase block">Passport Identification</span>
                <span className="text-xs font-bold text-white uppercase print:text-black font-mono">{application.passportInfo.passportNumber}</span>
              </div>
              <div>
                <span className="text-[8px] font-mono text-[#5B5F78] uppercase block">Nationality Gate</span>
                <span className="text-xs font-bold text-white uppercase print:text-black font-sans">{application.passportInfo.issueCountry}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Information fields */}
          <div className="md:col-span-2 space-y-6 flex flex-col justify-between print:text-black">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[8px] font-mono text-[#5B5F78] uppercase block">Accreditee Full Name</span>
                <span className="text-xs font-bold text-white uppercase print:text-black font-sans">{application.personalInfo.fullName}</span>
              </div>
              <div>
                <span className="text-[8px] font-mono text-[#5B5F78] uppercase block">Registered Email</span>
                <span className="text-xs font-bold text-white print:text-black font-mono">{application.personalInfo.email}</span>
              </div>
              <div>
                <span className="text-[8px] font-mono text-[#5B5F78] uppercase block">Secure Residence Station</span>
                <span className="text-xs font-bold text-white uppercase print:text-black font-sans">
                  {application.addressInfo.street}, {application.addressInfo.city}
                </span>
              </div>
              <div>
                <span className="text-[8px] font-mono text-[#5B5F78] uppercase block">Departure Flight Port</span>
                <span className="text-xs font-bold text-white uppercase print:text-black font-sans">
                  {application.travelOrigin.departureCity} ({application.travelOrigin.preferredAirlineClass})
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[8px] font-mono text-[#5B5F78] uppercase block">Confirmed Fast-Pass Match Entries ({application.matchPreferences.length})</span>
                <span className="text-xs font-bold text-white/80 uppercase print:text-black font-mono block">
                  {application.matchPreferences.map(m => `${m.homeTeam} vs ${m.awayTeam} (${m.stage})`).join(' • ')}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[8px] font-mono text-[#5B5F78] uppercase block">Premium Resort Allocation</span>
                <span className="text-xs font-bold text-white uppercase print:text-black font-sans">
                  {application.accommodationPreferences.tier} ({application.accommodationPreferences.requirements})
                </span>
              </div>
            </div>

            {/* Verification Status Banner */}
            <div className="glass rounded-xl p-3.5 flex items-center justify-between print:border-zinc-300">
              <div className="flex items-center gap-2.5">
                {application.status === 'CLEARANCE_GRANTED' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-[#00E676]" />
                    <div>
                      <span className="text-[9px] font-mono text-white uppercase font-bold block">VISA GATE clearance granted</span>
                      <span className="text-[8px] font-mono text-[#5B5F78] uppercase block">SECURE PASSPORT VALIDATED</span>
                    </div>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 text-white" />
                    <div>
                      <span className="text-[9px] font-mono text-white uppercase font-bold block">Verification Pending manual sync</span>
                      <span className="text-[8px] font-mono text-[#5B5F78] uppercase block">AWAITING ACCREDITATION DECISION ({application.approvalTimeline})</span>
                    </div>
                  </>
                )}
              </div>

              {/* Dynamic QR Code mockup with SVG paths representing high-tech security grids */}
              <div className="w-12 h-12 bg-white p-1 rounded">
                <svg className="w-full h-full text-black" viewBox="0 0 25 25">
                  <path d="M1 1h5v5H1V1zm1 1v3h3V2H2zm7-1H8v1h1V1zm3 0h-1v1h1V1zm1 0h1v1h-1V1zm4 0h-1v2h1V1zm-8 4v1h1v1h1V5h-2zm4 0h1v1h-1V5zm-2 2h2v1h-2V7zm10-6h1v1h-1V1zm0 3h-1v1h1V4zm1 2h-1v1h1V6zM1 8h1v1H1V8z" fill="currentColor"/>
                  <path d="M11 11h2v2h-2v-2zm-3-1v2h1v1h2V10H8zm7 0h2v1h-2v-1zM1 15h5v5H1v-5zm1 1v3h3v-3H2zm8-2h1v1h-1v-1zm4 0h1v2h-1v-2zm-2 3v1h1v1h1v-2h-3zm6-1h1v1h-1v-1zm1 2h-1v1h1v-1z" fill="currentColor"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Cost breakdown stamp */}
        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:border-zinc-300">
          <div>
            <span className="text-[8px] font-mono text-[#5B5F78] uppercase block">Total Settled Tariff</span>
            <span className="text-sm font-extrabold text-white print:text-black font-mono">
              {formatLocalCurrency(application.costBreakdown.totalUSD, lang)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[8px] font-mono text-[#5B5F78] uppercase block">Transmission Fingerprint</span>
            <span className="text-[10px] font-mono text-[#8B8FA8] uppercase print:text-[#5B5F78] block">
              {application.attendanceIndex} / CON-{Math.floor(1000 + Math.random() * 8999)}
            </span>
          </div>
        </div>
      </div>

      {/* Controller Buttons below document */}
      <div id="dossier_print_actions" className="mt-5 flex gap-3 justify-end print:hidden">
        <button
          onClick={printDossier}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-700 text-zinc-300 text-xs font-sans hover:bg-white/10 font-bold cursor-pointer transition active:scale-95"
        >
          <Printer className="w-4 h-4" /> Print / Save Dossier
        </button>
      </div>
    </div>
  );
}