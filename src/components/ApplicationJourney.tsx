import React, { useState } from 'react';
import { 
  User, MapPin, FileSpreadsheet, Fingerprint, PlaneTakeoff, 
  Ticket, Calendar, Bed, FileText, Landmark, Eye, CheckCircle2, 
  ShieldCheck, UploadCloud, AlertCircle, Sparkles, Check, ChevronLeft, ChevronRight, Camera
} from 'lucide-react';
import { Language, Application, MatchSelection, PriorityLevel, ApplicationStatus } from '../types';
import { formatLocalCurrency } from '../localization';

interface ApplicationJourneyProps {
  currentLanguage: Language;
  userEmail: string;
  onSubmissionSuccess: (app: Application) => void;
  onCancel: () => void;
}

// Predefined official premium matches for strategic selections
const DESIGNATED_MATCHES: MatchSelection[] = [
  { id: 'm1', homeTeam: 'Spain', awayTeam: 'France', venue: 'Estadio Azteca, Mexico City', date: '2026-06-11', stage: 'Group Stage', category: 'Category 1', estimatedPrice: 250 },
  { id: 'm2', homeTeam: 'Germany', awayTeam: 'Netherlands', venue: 'SoFi Stadium, Los Angeles', date: '2026-06-15', stage: 'Group Stage', category: 'Category 1', estimatedPrice: 320 },
  { id: 'm3', homeTeam: 'England', awayTeam: 'Italy', venue: 'Hard Rock Stadium, Miami', date: '2026-06-22', stage: 'Group Stage', category: 'Category 1', estimatedPrice: 350 },
  { id: 'm4', homeTeam: 'Quarterfinal Clash', awayTeam: 'Winner Round of 16', venue: 'Gillette Stadium, Boston', date: '2026-07-09', stage: 'Quarter-Final', category: 'Club Suite', estimatedPrice: 850 },
  { id: 'm5', homeTeam: 'Luxury Semifinal', awayTeam: 'UEFA Sovereign Finalists', venue: 'AT&T Stadium, Dallas', date: '2026-07-14', stage: 'Semi-Final', category: 'Club Suite', estimatedPrice: 1200 },
  { id: 'm6', homeTeam: 'Presidential FIFA Final', awayTeam: 'Global World Cup Finalists', venue: 'MetLife Stadium, New York', date: '2026-07-19', stage: 'Final', category: 'Presidential Box', estimatedPrice: 2800 },
];

export default function ApplicationJourney({ currentLanguage, userEmail, onSubmissionSuccess, onCancel }: ApplicationJourneyProps) {
  const [currentStep, setCurrentStep] = useState(1);

  // Form Fields State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('1995-05-15');
  const [nationality, setNationality] = useState(currentLanguage.name);

  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const [passportNumber, setPassportNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('2032-10-10');
  const [issueCountry, setIssueCountry] = useState(currentLanguage.name);

  // File Upload Statuses (using Base64 representations)
  const [passportScan, setPassportScan] = useState<string | null>(null);
  const [passportPhoto, setPassportPhoto] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [facialScanActive, setFacialScanActive] = useState(false);
  const [scanMessage, setScanMessage] = useState('');

  const [departureCity, setDepartureCity] = useState('Paris');
  const [departureCountry, setDepartureCountry] = useState(currentLanguage.name);
  const [airlineClass, setAirlineClass] = useState<'Economy' | 'Business' | 'Private Jet Offering'>('Business');

  const [selectedMatches, setSelectedMatches] = useState<MatchSelection[]>([DESIGNATED_MATCHES[1]]); // Default select some premium clash
  const [attendanceType, setAttendanceType] = useState<'FULL' | 'GROUP_STAGE_ONLY' | 'KNOCKOUTS_ONLY' | 'VIP_FINALS'>('FULL');
  
  const [accommodationTier, setAccommodationTier] = useState<'Premium Hotel' | 'Luxury Resort' | 'Private Villa' | 'Sovereign Suite'>('Luxury Resort');
  const [accommodationRequirements, setAccommodationRequirements] = useState('Proximity to matches with security convoys.');

  const [additionalSecurityAnswer, setAdditionalSecurityAnswer] = useState('No previous judicial constraints in the EU zone.');
  const [isVipUpgrade, setIsVipUpgrade] = useState(false);

  // Handle Match Toggles
  const handleMatchToggle = (match: MatchSelection) => {
    if (selectedMatches.some(m => m.id === match.id)) {
      setSelectedMatches(selectedMatches.filter(m => m.id !== match.id));
    } else {
      setSelectedMatches([...selectedMatches, match]);
    }
  };

  // Live Pricing Engine
  const calculateCosts = () => {
    const baseUSD = 1000; // Base Entry Accreditation Fee
    const matchCostUSD = selectedMatches.reduce((acc, curr) => acc + curr.estimatedPrice, 0);
    
    let accommodationDayRate = 400;
    if (accommodationTier === 'Luxury Resort') accommodationDayRate = 750;
    if (accommodationTier === 'Private Villa') accommodationDayRate = 1400;
    if (accommodationTier === 'Sovereign Suite') accommodationDayRate = 3500;
    
    // Weighted by stay type
    let durationMultiplierDays = 7;
    if (attendanceType === 'GROUP_STAGE_ONLY') durationMultiplierDays = 10;
    if (attendanceType === 'KNOCKOUTS_ONLY') durationMultiplierDays = 14;
    if (attendanceType === 'FULL') durationMultiplierDays = 21;
    if (attendanceType === 'VIP_FINALS') durationMultiplierDays = 5;

    const accommodationCostUSD = accommodationDayRate * durationMultiplierDays;
    const priorityUpgradeCostUSD = isVipUpgrade ? 5000 : 0;
    
    const totalUSD = baseUSD + matchCostUSD + accommodationCostUSD + priorityUpgradeCostUSD;

    return {
      baseUSD,
      matchCostUSD,
      accommodationCostUSD,
      priorityUpgradeCostUSD,
      totalUSD
    };
  };

  const costs = calculateCosts();

  // Biometric Passport / Selfie Scanning Simulator
  const triggerFacialMatching = () => {
    setFacialScanActive(true);
    setScanMessage('INITIALIZING BIOMETRIC AI SCANNER FROM DEVICE CAMERA...');
    setTimeout(() => {
      setScanMessage('GRIDDING CRITICAL RETINAL & NOSE POINTS...');
      setTimeout(() => {
        setScanMessage('FACIAL GEOMETRY IDENTIFIED WITH 99.8% EU PASSPORT CONCORDANCE.');
        setTimeout(() => {
          // Put clean static portrait base64 as scanned selfie proof
          setSelfie('scanned_facial_profile_ready');
          setFacialScanActive(false);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const handlePassportMockUpload = (type: 'scan' | 'photo') => {
    if (type === 'scan') {
      setPassportScan('secure_e_passport_cryptographic_scan');
    } else {
      setPassportPhoto('verified_epassport_biometric_photo');
    }
  };

  // Submit Dossier
  const handleFormSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedMatches.length === 0) {
      alert('You must select at least one match day to coordinate secure transportation channels.');
      return;
    }

    const applicationNumber = `ACC-${new Date().getFullYear()}-EU-${Math.floor(100000 + Math.random() * 900000)}`;
    const randomApplicationScore = Math.floor(82 + Math.random() * 18); // Premium high-security score indices
    const randomTravelReadyScore = Math.floor(88 + Math.random() * 12);
    const priorityLevel: PriorityLevel = isVipUpgrade ? 'EXECUTIVE_VIP' : 'EXECUTIVE';

    const finalAppObj: Application = {
      id: `app_${Math.random().toString(36).substr(2, 9)}`,
      applicationNumber,
      timestamp: new Date().toISOString(),
      personalInfo: {
        fullName: fullName || 'Marc-Antoine de Saint-Exupéry',
        email: userEmail,
        phone: phone || '+33 6 42 12 90 88',
        birthDate,
        nationality
      },
      addressInfo: {
        street: street || '14 Rue de la Paix',
        city: city || 'Paris',
        postalCode: postalCode || '75002',
        country: nationality
      },
      passportInfo: {
        passportNumber: passportNumber || 'EU-FR9812450',
        expiryDate,
        issueCountry: nationality
      },
      documents: {
        passportScanUrl: passportScan || 'verified_doc_passport_binary',
        passportPhotoUrl: passportPhoto || 'verified_biometric_photo_binary',
        selfieUrl: selfie || 'verified_selfie_scan_binary'
      },
      travelOrigin: {
        departureCity: departureCity || 'Paris',
        departureCountry: departureCountry || nationality,
        preferredAirlineClass: airlineClass
      },
      matchPreferences: selectedMatches,
      attendanceType: attendanceType,
      accommodationPreferences: {
        tier: accommodationTier,
        requirements: accommodationRequirements
      },
      additionalInfo: additionalSecurityAnswer,
      costBreakdown: costs,
      status: 'PENDING_VERIFICATION',
      applicationScore: randomApplicationScore,
      travelReadinessScore: randomTravelReadyScore,
      priorityLevel,
      approvalTimeline: isVipUpgrade ? '4 Hours (Sovereign Corridor)' : '48 Hours',
      reservationStatus: 'PROVISIONAL',
      attendanceIndex: `SEC-${Math.floor(100 + Math.random() * 899)}/A`
    };

    onSubmissionSuccess(finalAppObj);
  };

  return (
    <div id="acc_journey_container" className="max-w-4xl w-full mx-auto relative z-10 animate-in fade-in duration-300">
      
      {/* 12-Step Horizontal Progress HUD */}
      <div id="journey_timeline_hud" className="bg-zinc-950/70 backdrop-blur-md border border-zinc-900 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between font-mono text-[9px] text-[#B6B3FF] uppercase tracking-widest mb-3.5">
          <span>Sovereign Security Gate Cleared: {currentStep} / 12</span>
          <span>ESTIMATED DURATION: {(costs.totalUSD / 1000).toFixed(1)}K VALUE</span>
        </div>
        <div className="relative w-full h-[3px] bg-zinc-900 rounded-full flex justify-between">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#796BFF] to-[#B6B3FF] rounded-full transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 11) * 100}%` }}
          />
          {Array.from({ length: 12 }).map((_, idx) => (
            <div 
              key={idx}
              className={`w-2.5 h-2.5 rounded-full transform -translate-y-[3.5px] border duration-300 ${
                idx + 1 <= currentStep 
                  ? 'bg-[#796BFF] border-[#B6B3FF] scale-125 shadow-[0_0_10px_rgba(121,107,255,0.8)]' 
                  : 'bg-zinc-950 border-zinc-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Glass Form Frame */}
      <div className="bg-zinc-950/80 backdrop-blur-2xl border border-zinc-800 rounded-3xl overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.85)] flex flex-col min-h-[500px]">
        
        {/* Step Section Name */}
        <div id="step_pane_header" className="p-6 bg-gradient-to-b from-zinc-900 to-transparent border-b border-zinc-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#796BFF]/10 border border-[#796BFF]/20 flex items-center justify-center text-[#B6B3FF]">
              {currentStep === 1 && <User className="w-5 h-5" />}
              {currentStep === 2 && <MapPin className="w-5 h-5" />}
              {currentStep === 3 && <FileSpreadsheet className="w-5 h-5" />}
              {currentStep === 4 && <Fingerprint className="w-5 h-5" />}
              {currentStep === 5 && <PlaneTakeoff className="w-5 h-5" />}
              {currentStep === 6 && <Ticket className="w-5 h-5" />}
              {currentStep === 7 && <Calendar className="w-5 h-5" />}
              {currentStep === 8 && <Bed className="w-5 h-5" />}
              {currentStep === 9 && <FileText className="w-5 h-5" />}
              {currentStep === 10 && <Landmark className="w-5 h-5" />}
              {currentStep === 11 && <Eye className="w-5 h-5" />}
              {currentStep === 12 && <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">CHAPTER {currentStep} OF XII</p>
              <h3 className="text-sm md:text-base font-bold font-sans text-white uppercase tracking-tight">
                {currentStep === 1 && 'Sovereign Representative Personal Details'}
                {currentStep === 2 && 'Mailing Residence & Judicial Domicile'}
                {currentStep === 3 && 'Border Control Passport Data'}
                {currentStep === 4 && 'Biometric Identity Scans Proof'}
                {currentStep === 5 && 'Logistical Flight & Origin Coordination'}
                {currentStep === 6 && 'Strategic Match Day Preferences'}
                {currentStep === 7 && 'Total Experience Clearance Type'}
                {currentStep === 8 && 'Sabbatical Quarters Premium Lodgings'}
                {currentStep === 9 && 'Accreditation Risk Self-Assessment'}
                {currentStep === 10 && 'Dynamic Fee Estimate Breakdown'}
                {currentStep === 11 && 'Comprehensive Verification Panel'}
                {currentStep === 12 && 'Sovereign Digital Attestation & Transmission'}
              </h3>
            </div>
          </div>
          <span className="text-xs font-mono text-[#B6B3FF] font-bold bg-[#796BFF]/10 border border-[#796BFF]/20 px-2.5 py-1 rounded-full hidden sm:block">
            {formatLocalCurrency(costs.totalUSD, currentLanguage)}
          </span>
        </div>

        {/* Dynamic Chapter Render Node */}
        <div id="step_form_body" className="p-8 flex-1">
          {/* STEP 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
                Accurate representative identification is compulsory for clearance. Standard names must match legal passports identically.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-sans uppercase tracking-widest text-zinc-400 font-bold">Full Legal Name</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Marc-Antoine de Saint-Exupéry"
                    className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white placeholder-zinc-500 focus:outline-none font-sans"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-sans uppercase tracking-widest text-zinc-400 font-bold">E-Passport Contact Phone</label>
                  <input 
                    type="text" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +33 6 42 12 90 88"
                    className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white placeholder-zinc-500 focus:outline-none font-sans"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-sans uppercase tracking-widest text-zinc-400 font-bold">Birth Date</label>
                  <input 
                    type="date" 
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white focus:outline-none font-sans"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-sans uppercase tracking-widest text-zinc-400 font-bold">Sovereign Nationality Claim</label>
                  <input 
                    type="text" 
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    placeholder="e.g. French"
                    className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white focus:outline-none font-sans"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Address */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
                Specify your territorial residency address. In collaboration with European judicial zones, emergency protocols are indexed here.
              </p>
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-sans uppercase tracking-widest text-zinc-400 font-bold">Street and House Number</label>
                  <input 
                    type="text" 
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. 14 Rue de la Paix"
                    className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white placeholder-zinc-500 focus:outline-none font-sans"
                  />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-sans uppercase tracking-widest text-zinc-400 font-bold">Metropolis / City</label>
                    <input 
                      type="text" 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Paris"
                      className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white placeholder-zinc-500 focus:outline-none font-sans"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-sans uppercase tracking-widest text-zinc-400 font-bold">Postal Dispatch Code</label>
                    <input 
                      type="text" 
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="e.g. 75002"
                      className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white placeholder-zinc-500 focus:outline-none font-sans"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Passport Details */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
                Accreditation requires high-security traveler passports. Passports must possess an expiration timeline exceeding December 2026.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-sans uppercase tracking-widest text-zinc-400 font-bold">Passport Number</label>
                  <input 
                    type="text" 
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value)}
                    placeholder="e.g. EU-FR9812450"
                    className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white placeholder-zinc-500 focus:outline-none font-sans"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-sans uppercase tracking-widest text-zinc-400 font-bold">Official Expiration Date</label>
                  <input 
                    type="date" 
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white focus:outline-none font-sans"
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-sans uppercase tracking-widest text-zinc-400 font-bold">Country of Issuance Authority</label>
                  <input 
                    type="text" 
                    value={issueCountry}
                    onChange={(e) => setIssueCountry(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white focus:outline-none font-sans"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Documents Uploads */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Upload your digital documents. Biometric scanning and security cross-references will be validated in real time by the Accreditation Office.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Passport Binary Scan Box */}
                <div className="p-5 rounded-2xl border border-zinc-800 bg-[#121420] flex flex-col items-center justify-center text-center space-y-3.5">
                  <UploadCloud className="w-8 h-8 text-[#796BFF]" />
                  <div>
                    <h5 className="text-xs font-semibold text-white font-sans">Legal Passport Scanning Page</h5>
                    <p className="text-[10px] text-zinc-500 font-sans mt-1 uppercase font-semibold">MAX. 15MB • PDF, JPG, PNG</p>
                  </div>
                  {passportScan ? (
                    <div className="text-[10px] font-sans text-emerald-400 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
                      <Check className="w-3.5 h-3.5" /> SECURE SHIELD ACTIVE
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handlePassportMockUpload('scan')}
                      className="px-4 py-1.5 border border-[#796BFF]/30 hover:border-[#796BFF]/60 text-[10px] font-sans uppercase text-[#B6B3FF] hover:bg-[#796BFF]/10 duration-150 rounded cursor-pointer font-semibold"
                    >
                      Process Document
                    </button>
                  )}
                </div>

                {/* Passport Photoghraph ID Photo */}
                <div className="p-5 rounded-2xl border border-zinc-800 bg-[#121420] flex flex-col items-center justify-center text-center space-y-3.5">
                  <UploadCloud className="w-8 h-8 text-[#796BFF]" />
                  <div>
                    <h5 className="text-xs font-semibold text-white font-sans">Sovereign Passport Photo Page</h5>
                    <p className="text-[10px] text-zinc-500 font-sans mt-1 uppercase font-semibold">MAX. 15MB • JPG, PNG ONLY</p>
                  </div>
                  {passportPhoto ? (
                    <div className="text-[10px] font-sans text-emerald-400 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
                      <Check className="w-3.5 h-3.5" /> BIOMETRIC ACQUIRED
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handlePassportMockUpload('photo')}
                      className="px-4 py-1.5 border border-[#796BFF]/30 hover:border-[#796BFF]/60 text-[10px] font-sans uppercase text-[#B6B3FF] hover:bg-[#796BFF]/10 duration-150 rounded cursor-pointer font-semibold"
                    >
                      Process Document
                    </button>
                  )}
                </div>

                {/* LIVE Facial Webcam Selfie verification scanner box */}
                <div className="md:col-span-2 p-6 rounded-2xl border border-[#796BFF]/20 bg-zinc-950 flex flex-col items-center justify-center text-center space-y-4">
                  {facialScanActive ? (
                    <div className="space-y-3 font-sans py-4">
                      <div className="relative mx-auto w-12 h-12">
                        <div className="absolute inset-0 rounded-full border-2 border-[#796BFF] border-t-transparent animate-spin" />
                        <Camera className="absolute inset-2 w-8 h-8 text-[#796BFF]" />
                      </div>
                      <p className="text-[10px] text-[#796BFF] font-bold uppercase tracking-wider">{scanMessage}</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-[#796BFF]/10 border border-[#796BFF]/20 flex items-center justify-center text-[#796BFF]">
                        <Camera className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white font-sans uppercase tracking-widest">[ REAL-TIME SECURE SELFIE ACCREDITATION ]</h4>
                        <p className="text-[10px] text-zinc-400 font-sans mt-1 max-w-md mx-auto leading-relaxed">
                          Crosscheck your real physical face against database algorithms to satisfy premium travel and visa accreditation metrics instantly.
                        </p>
                      </div>
                      {selfie ? (
                        <div className="text-[10px] font-sans text-emerald-400 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full uppercase tracking-wider font-bold">
                          <CheckCircle2 className="w-4 h-4" /> FACIAL PROFILE CONFIRMED SECURE
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={triggerFacialMatching}
                          className="px-6 py-2 bg-white hover:bg-zinc-100 text-[#0C0D12] font-sans text-[10px] font-bold uppercase tracking-widest rounded-xl duration-150 cursor-pointer shadow-lg active:scale-95"
                        >
                          Execute Realtime Facial Match
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Travel Origin */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
                Luxury-level attendance includes high-end private flight logistics or coordination of commercial first-class corridors.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-sans uppercase tracking-widest text-zinc-400 font-bold">Departure Airport / City Coordinates</label>
                  <input 
                    type="text" 
                    value={departureCity}
                    onChange={(e) => setDepartureCity(e.target.value)}
                    placeholder="e.g. Paris"
                    className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white placeholder-zinc-500 focus:outline-none font-sans"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-sans uppercase tracking-widest text-zinc-400 font-bold">Departure Sovereign Territory</label>
                  <input 
                    type="text" 
                    value={departureCountry}
                    onChange={(e) => setDepartureCountry(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white focus:outline-none font-sans"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-sans uppercase tracking-widest text-zinc-400 font-bold">Coordination Jet / Cabin Tier</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['Economy', 'Business', 'Private Jet Offering'] as const).map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setAirlineClass(tier)}
                        className={`py-3 px-3 rounded-xl border text-[10px] md:text-xs font-sans font-bold uppercase transition text-center cursor-pointer ${
                          airlineClass === tier 
                            ? 'bg-[#796BFF]/12 text-[#B6B3FF] border-[#796BFF]/40 shadow-glow' 
                            : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Match Preferences */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Select your designated match dates. Luxury tickets & VIP boxes with fast-track stadium clearance will be allocated upon approval.
              </p>

              <div id="matches_bento_grid" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DESIGNATED_MATCHES.map((match) => {
                  const isSelected = selectedMatches.some(m => m.id === match.id);
                  return (
                    <div
                      key={match.id}
                      onClick={() => handleMatchToggle(match)}
                      className={`p-4 rounded-2xl border text-left cursor-pointer duration-200 transition ${
                        isSelected 
                          ? 'bg-[#796BFF]/12 border-[#796BFF]/50 shadow-[0_4px_15px_rgba(121,107,255,0.15)] glass-glow' 
                          : 'bg-zinc-900/30 border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] font-sans bg-zinc-950 text-[#B6B3FF] border border-[#796BFF]/20 px-2 py-0.5 rounded uppercase font-semibold">
                          {match.stage}
                        </span>
                        <span className="text-[10px] font-sans text-zinc-500 font-bold">
                          {formatLocalCurrency(match.estimatedPrice, currentLanguage)}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white font-sans">{match.homeTeam} vs {match.awayTeam}</h4>
                      <p className="text-[10px] font-sans text-zinc-400 mt-1 uppercase tracking-tight font-medium">{match.venue}</p>
                      <div className="mt-3.5 flex items-center justify-between font-sans text-[9px] text-zinc-500 uppercase font-semibold">
                        <span>DATE: {match.date}</span>
                        <span className={isSelected ? 'text-[#B6B3FF] font-bold' : ''}>
                          {isSelected ? '✓ SELECTED FOR DEPLOYMENT' : '+ COORDINATE ACCESS'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 7: Attendance Type */}
          {currentStep === 7 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
                Choose the timeframe of your high-end security visa clearance. Pricing models adapt with stay duration.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { code: 'GROUP_STAGE_ONLY', tag: 'Group Stage Only', desc: '10 Days clearance, Group Stage priority tickets' },
                  { code: 'KNOCKOUTS_ONLY', tag: 'Knockout Stages Only', desc: '14 Days clearance, Round of 16 through Semis' },
                  { code: 'VIP_FINALS', tag: 'VIP Semis & Finals', desc: '5 Days ultra clearance, Presidential Suite allocation' },
                  { code: 'FULL', tag: 'Full World Cup Journey', desc: '21 Days unrestricted VIP status, luxury coverage' }
                ].map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setAttendanceType(item.code as any)}
                    className={`p-4 rounded-2xl border text-left duration-150 cursor-pointer ${
                      attendanceType === item.code 
                        ? 'bg-[#796BFF]/12 border-[#796BFF]/50' 
                        : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <span className="block text-xs font-bold text-white uppercase font-sans mb-1">{item.tag}</span>
                    <p className="text-[10px] text-zinc-400 font-sans tracking-tight">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 8: Accommodations */}
          {currentStep === 8 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
                We manage official premium resort allocation. Accommodations are isolated with VIP security corridors.
              </p>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { code: 'Premium Hotel', tag: 'Premium Executive Room', desc: '5-star high comfort close to primary hosts' },
                    { code: 'Luxury Resort', tag: 'Ambassador Beach Resort', desc: 'Fully serviced private resort bungalows' },
                    { code: 'Private Villa', tag: 'Secure Sovereign Villa', desc: 'Gated fortress complex with helipad coordinate' },
                    { code: 'Sovereign Suite', tag: 'Presidential Penthouse', desc: 'Top floor secure suites with 24/7 private butler & convoy' }
                  ].map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setAccommodationTier(item.code as any)}
                      className={`p-3.5 rounded-2xl border text-left duration-150 cursor-pointer ${
                        accommodationTier === item.code 
                          ? 'bg-[#796BFF]/12 border-[#796BFF]/50' 
                          : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <span className="block text-xs font-bold text-white uppercase font-sans mb-1">{item.tag}</span>
                      <p className="text-[10px] text-zinc-400 font-sans leading-tight">{item.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-sans uppercase tracking-widest text-[#B6B3FF] font-bold">Specific Dietary or Convoy Escort Demands</label>
                  <textarea
                    rows={2}
                    value={accommodationRequirements}
                    onChange={(e) => setAccommodationRequirements(e.target.value)}
                    placeholder="e.g. Kosher meal structures, bulletproof transport shuttles from terminal."
                    className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white placeholder-zinc-500 focus:outline-none font-sans"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 9: Security assessment */}
          {currentStep === 9 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
                As a high-security embassy-grade clearance system, users must attest to zero previous judicial constraints to confirm rapid deployment status.
              </p>
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/20 text-[10px] font-sans text-zinc-400 uppercase tracking-tight font-semibold">
                  "I confirm that I possess zero active judicial limits in Europe, do not reside under global sanction list, and represent a premium logistics status."
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-sans uppercase tracking-widest text-zinc-400 font-bold">Official Attestation Confirmation</label>
                  <input 
                    type="text" 
                    value={additionalSecurityAnswer}
                    onChange={(e) => setAdditionalSecurityAnswer(e.target.value)}
                    placeholder="Enter short confirmation details"
                    className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white focus:outline-none font-sans"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 10: Pricing calculations */}
          {currentStep === 10 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Fees are converted dynamically to your native currency. Upgrading activates Priority Sovereign status for elite verification times.
              </p>

              <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950 flex flex-col space-y-4">
                <div className="flex justify-between items-center text-xs font-sans text-zinc-500 uppercase font-semibold">
                  <span>Accreditation Base Fee</span>
                  <span>{formatLocalCurrency(costs.baseUSD, currentLanguage)}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-sans text-zinc-500 uppercase font-semibold">
                  <span>Matches Fast-Pass Seat Costs</span>
                  <span>{formatLocalCurrency(costs.matchCostUSD, currentLanguage)}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-sans text-zinc-500 uppercase font-semibold">
                  <span>Sovereign Stay Residence Costs</span>
                  <span>{formatLocalCurrency(costs.accommodationCostUSD, currentLanguage)}</span>
                </div>
                {isVipUpgrade && (
                  <div className="flex justify-between items-center text-xs font-sans text-[#B6B3FF] uppercase font-bold">
                    <span>Sovereign VIP Passway Premium</span>
                    <span>{formatLocalCurrency(costs.priorityUpgradeCostUSD, currentLanguage)}</span>
                  </div>
                )}
                <div className="pt-4 border-t border-zinc-900 flex justify-between items-center">
                  <span className="text-sm font-bold text-white uppercase tracking-wider">Estimated Sovereignty Rate</span>
                  <span className="text-base font-extrabold text-[#B6B3FF]">{formatLocalCurrency(costs.totalUSD, currentLanguage)}</span>
                </div>
              </div>

              {/* VIP Upgrade Toggle */}
              <div 
                onClick={() => setIsVipUpgrade(!isVipUpgrade)}
                className={`p-4 rounded-xl border cursor-pointer duration-150 flex items-center justify-between ${
                  isVipUpgrade 
                    ? 'bg-[#796BFF]/12 border-[#796BFF]/40' 
                    : 'bg-zinc-900/30 border-zinc-800/60 hover:bg-zinc-900/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${isVipUpgrade ? 'bg-[#796BFF] border-[#796BFF]' : 'border-zinc-700'}`}>
                    {isVipUpgrade && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-white uppercase">Activate Sovereign VIP Priority Access Corridor</span>
                    <p className="text-[9px] text-[#B6B3FF] font-sans mt-0.5 uppercase font-bold">4-HOUR ULTRA-RAPID APPROVALS BY OFFICIAL ACCREDITATION COUNCILS</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 11: Application Review */}
          {currentStep === 11 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Confirm your representative details. Once transmitted, documents under judicial verification can only be modified by specific appeal.
              </p>

              <div className="grid grid-cols-2 gap-4 text-xs font-sans p-5 rounded-2xl border border-zinc-900 bg-[#121420]">
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase block font-bold">Representative Name</span>
                  <span className="text-white">{fullName || 'Marc-Antoine de Saint-Exupéry'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase block font-bold">Constituency</span>
                  <span className="text-white">{nationality}</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase block font-bold">Passport Identification</span>
                  <span className="text-white">{passportNumber || 'EU-FR9812450'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase block font-bold">Departing Air Hub</span>
                  <span className="text-white">{departureCity} ({airlineClass})</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[9px] text-zinc-500 uppercase block font-bold">Selected Access matches ({selectedMatches.length})</span>
                  <span className="text-[#B6B3FF] font-semibold">
                    {selectedMatches.map(m => `${m.homeTeam} vs ${m.awayTeam}`).join(', ')}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[9px] text-zinc-500 uppercase block font-bold">Lodging Base</span>
                  <span className="text-white">{accommodationTier} ({accommodationRequirements})</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 12: Final Submission */}
          {currentStep === 12 && (
            <div className="space-y-6 text-center py-6 animate-in fade-in slide-in-from-right-4 duration-300 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-[#796BFF]/10 border border-[#796BFF]/30 flex items-center justify-center mx-auto text-[#B6B3FF]">
                <ShieldCheck className="w-8 h-8 animate-pulse" />
              </div>

              <div>
                <h4 className="text-sm font-bold font-sans text-white uppercase tracking-widest">TRANSMIT UNDER SOVEREIGN SECURITY DECREE</h4>
                <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed">
                  By clicking submit, I certify that my identity documents match global border databases, and I request priority entry into the World Cup 2026.
                </p>
              </div>

              <div className="bg-[#796BFF]/5 border border-[#796BFF]/15 rounded-xl p-3 text-[10px] font-sans text-[#B6B3FF] uppercase tracking-tight font-bold">
                CONSTITUENCIES ACCREDITATION KEY: WORLD-CUP-SEC-M26
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Actuators */}
        <div id="journey_footer_buttons" className="p-6 border-t border-zinc-900 bg-zinc-950/90 flex justify-between items-center">
          <button
            type="button"
            onClick={() => {
              if (currentStep > 1) {
                setCurrentStep(currentStep - 1);
              } else {
                onCancel();
              }
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-700 text-zinc-300 text-xs font-sans hover:bg-white/10 font-bold cursor-pointer transition active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {currentStep < 12 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex items-center gap-2 bg-white hover:bg-zinc-100 text-[#0C0D12] px-6 py-2.5 rounded-full text-xs font-sans font-bold tracking-wider cursor-pointer duration-150 transition shadow-lg active:scale-95"
            >
              Next Step <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFormSubmission}
              className="flex items-center gap-2 bg-white hover:bg-zinc-100 text-[#0C0D12] px-8 py-3.5 rounded-full text-xs font-sans font-bold tracking-wider cursor-pointer duration-200 transition shadow-[0_4px_25px_rgba(255,255,255,0.15)] active:scale-95"
            >
              Sovereign Submit <ShieldCheck className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
