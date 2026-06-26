import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, Copy, Check, Upload, FileText, AlertCircle, ArrowLeft, Loader2
} from 'lucide-react';
import { Application, Language } from '../types';
import { formatLocalCurrency } from '../localization';
import { fileUploadService } from '../supabase';

interface PaymentPageProps {
  application: Application;
  lang: Language;
  onPaymentSubmit: (updatedApp: Application) => void;
  onCancel: () => void;
}

const CRYPTO_METHODS = [
  {
    id: 'ETH',
    name: 'Ethereum',
    ticker: 'ETH',
    image: '/eth.jpg',
    address: '0xbBCc2120256F11D86214232b3aa60fB8E2CF9A19',
    rate: 3500, // $3500 USD
  },
  {
    id: 'BTC',
    name: 'Bitcoin',
    ticker: 'BTC',
    image: '/btc.jpg',
    address: 'bc1q6apj3cz2y28ejzwsshsjplp83qu0jxkguc5966',
    rate: 65000, // $65000 USD
  },
  {
    id: 'SOL',
    name: 'Solana',
    ticker: 'SOL',
    image: '/sol.jpg',
    address: '9byxewEGDN49hdD9mf17z9SbBSjQNtywdUrVxAjw6uuv',
    rate: 140, // $140 USD
  }
] as const;

export default function PaymentPage({ application, lang, onPaymentSubmit, onCancel }: PaymentPageProps) {
  const [selectedMethod, setSelectedMethod] = useState<'ETH' | 'BTC' | 'SOL'>('ETH');
  const [copied, setCopied] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalUSD = application.costBreakdown.totalUSD;
  const depositUSD = totalUSD * 0.1;
  const remainingUSD = totalUSD * 0.9;

  const currentMethod = CRYPTO_METHODS.find(m => m.id === selectedMethod)!;
  const cryptoAmount = Number((depositUSD / currentMethod.rate).toFixed(6));

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(currentMethod.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (selectedFile: File): boolean => {
    setError('');
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'pdf'];
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase() || '';
    
    if (!allowedExtensions.includes(fileExtension)) {
      setError('Invalid file type. Please upload a PNG, JPG, JPEG, or PDF proof of payment.');
      return false;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File is too large. Max file size is 10MB.');
      return false;
    }
    
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handlePaymentProofSubmit = async () => {
    if (!file) {
      setError('Please upload a proof of payment file.');
      return;
    }

    setUploading(true);
    setError('');

    // Simulate smooth progress animation
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 150);

    try {
      const fileExtension = file.name.split('.').pop() || 'png';
      const path = `proofs/${application.id}_${Date.now()}.${fileExtension}`;
      
      const fileUrl = await fileUploadService.uploadDocument(file, path);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        const paymentDetails = {
          method: selectedMethod,
          proofUrl: fileUrl,
          uploadedAt: new Date().toISOString(),
          status: 'PENDING_VERIFICATION' as const,
          depositAmountUSD: depositUSD,
          amountCrypto: cryptoAmount
        };

        // Create new system notification for proof upload
        const userInboxKey = `fifa_inbox_${application.personalInfo.email.toLowerCase()}`;
        const userInbox = JSON.parse(localStorage.getItem(userInboxKey) || '[]');
        userInbox.unshift({
          id: `notif_${Date.now()}`,
          subject: 'Payment Proof Uploaded',
          message: `Your deposit payment proof of ${formatLocalCurrency(depositUSD, lang)} (${cryptoAmount} ${selectedMethod}) has been successfully uploaded and is pending verification.`,
          from: 'System Security',
          sentAt: new Date().toISOString(),
          read: false
        });
        localStorage.setItem(userInboxKey, JSON.stringify(userInbox));

        const updatedApp: Application = {
          ...application,
          status: 'PENDING_VERIFICATION',
          paymentDetails
        };

        onPaymentSubmit(updatedApp);
        setUploading(false);
      }, 500);

    } catch (err) {
      clearInterval(progressInterval);
      setUploading(false);
      setError('Failed to upload document. Please try again.');
      console.error(err);
    }
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${currentMethod.address}`;

  const isPendingVerification = application.paymentDetails?.status === 'PENDING_VERIFICATION';
  const isRejected = application.paymentDetails?.status === 'REJECTED';

  return (
    <div className="max-w-4xl w-full mx-auto relative z-10 animate-in fade-in duration-300">
      
      <button 
        onClick={onCancel}
        className="flex items-center gap-2 mb-6 text-xs font-mono text-[#8B8FA8] hover:text-white uppercase tracking-wider bg-transparent border-none cursor-pointer duration-150"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Cabinet
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          
          {isPendingVerification ? (
            <div className="glass-card rounded-3xl p-8 border border-[#796BFF]/20 relative overflow-hidden text-center space-y-6">
              <div className="absolute inset-0 bg-scanlines opacity-[0.02] pointer-events-none" />
              <div className="relative mx-auto w-20 h-20 rounded-full border border-dashed border-[#796BFF]/30 flex items-center justify-center bg-[#121420]">
                <ShieldCheck className="w-10 h-10 text-[#796BFF] animate-pulse" />
                <div className="absolute -inset-1 rounded-full border border-[#796BFF]/10 animate-spin-slow" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider font-sans">
                  Proof of Payment Under Verification
                </h3>
                <span className="inline-block px-3 py-1 bg-[#796BFF]/10 text-[#B6B3FF] border border-[#796BFF]/20 rounded-full font-mono text-[9px] font-bold uppercase tracking-widest animate-pulse">
                  PENDING SECURE AUDIT
                </span>
              </div>

              <p className="text-xs text-[#8B8FA8] leading-relaxed max-w-md mx-auto font-sans">
                Your deposit transfer proof has been successfully received by the World Cup Legacy Fund treasury. Our financial officers are currently auditing the transaction on the blockchain ledger. This process typically takes 2–4 hours.
              </p>

              <div className="pt-6 border-t border-white/[0.06] text-left max-w-sm mx-auto space-y-3 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#5B5F78]">METHOD SELECTED:</span>
                  <span className="text-white font-bold">{application.paymentDetails?.method} Network</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5B5F78]">DEPOSIT AMOUNT:</span>
                  <span className="text-white font-bold">{formatLocalCurrency(application.paymentDetails?.depositAmountUSD || depositUSD, lang)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5B5F78]">UPLOAD TIMESTAMP:</span>
                  <span className="text-white">{application.paymentDetails?.uploadedAt ? new Date(application.paymentDetails.uploadedAt).toLocaleString() : new Date().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5B5F78]">ACC_CORRIDORS:</span>
                  <span className="text-amber-400 font-bold">LOCKED (AWAITING TARIFF)</span>
                </div>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-sans text-center text-[#8B8FA8] max-w-md mx-auto">
                Once approved, you will receive a secure system notification and all premium accommodation, aviation logs, and local sites will unlock automatically.
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-3xl p-6 space-y-6">
              
              {isRejected && (
                <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-200 text-xs rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold uppercase tracking-wider text-red-300">Previous Deposit Payment Rejected</p>
                    <p className="text-[#E2C7C7]"><strong>Reason:</strong> {application.paymentDetails?.rejectionReason || 'No reason provided.'}</p>
                    <p className="text-[10px] text-[#A98E8E] uppercase mt-1">Please audit your transfer details and upload a valid proof of payment below.</p>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-sans">
                  Select Deposit Method
                </h3>
                <p className="text-xs text-[#8B8FA8]">
                  Choose your preferred network to settle the 10% commitment deposit.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {CRYPTO_METHODS.map((method) => {
                  const isSelected = selectedMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex flex-col items-center justify-between p-4 rounded-2xl border text-center transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? 'bg-[#796BFF]/15 border-[#796BFF] scale-[1.03] shadow-[0_0_20px_rgba(121,107,255,0.25)]' 
                          : 'bg-[#121420] border-white/5 hover:border-white/10 hover:-translate-y-0.5'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden mb-3 border border-white/10">
                        <img src={method.image} alt={method.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-bold text-white block">{method.name}</span>
                      <span className="text-[10px] font-mono text-[#5B5F78] uppercase mt-1 tracking-widest block">{method.ticker}</span>
                    </button>
                  );
                })}
              </div>

              <div className="p-5 rounded-2xl bg-[#121420] border border-white/5 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1 font-mono">
                    <span className="text-[9px] text-[#5B5F78] uppercase block">OFFICIAL CONTRACT ADDRESS ({currentMethod.ticker})</span>
                    <span className="text-xs text-white block select-all break-all pr-2">{currentMethod.address}</span>
                  </div>
                  <button
                    onClick={handleCopyAddress}
                    className="flex items-center gap-1.5 px-4 py-2 border border-white/10 hover:border-white/20 text-xs font-bold text-white rounded-xl bg-transparent duration-150 cursor-pointer active:scale-95 shrink-0"
                  >
                    {copied ? (
                      <><Check className="w-3.5 h-3.5 text-green-400" /> Copied!</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5 text-[#8B8FA8]" /> Copy Address</>
                    )}
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 border-t border-white/[0.04]">
                  <div className="p-3 bg-white rounded-xl shrink-0">
                    <img src={qrCodeUrl} alt="Deposit QR Code" className="w-28 h-28" />
                  </div>
                  
                  <div className="space-y-3 text-center sm:text-left font-mono">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-[#5B5F78] uppercase block">TRANSACTION VALUE</span>
                      <p className="text-xl font-bold text-white">{cryptoAmount} {currentMethod.ticker}</p>
                      <span className="text-[10px] text-[#8B8FA8] uppercase font-bold">≈ {formatLocalCurrency(depositUSD, lang)} USD</span>
                    </div>
                    <div className="p-3 bg-white/5 border border-white/8 rounded-xl text-[10px] leading-relaxed text-[#8B8FA8] max-w-sm">
                      Please transfer the exact amount above to avoid blockchain auditing delays. Securely copy the address or scan the QR code to proceed.
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-mono text-[#5B5F78] uppercase block font-bold">
                  UPLOAD OFFICIAL PROOF OF PAYMENT
                </span>
                
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerFileSelect}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer duration-150 ${
                    dragActive 
                      ? 'border-[#796BFF] bg-[#796BFF]/5' 
                      : 'border-white/10 hover:border-white/20 bg-[#121420]/50'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".png, .jpg, .jpeg, .pdf"
                    className="hidden" 
                  />

                  {file ? (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white border border-white/10">
                        <FileText className="w-5 h-5 text-[#B6B3FF]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white truncate max-w-xs">{file.name}</p>
                        <p className="text-[9px] font-mono text-[#5B5F78] mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="text-[10px] font-mono text-red-400 hover:text-red-300 font-semibold underline uppercase mt-2 bg-transparent border-none cursor-pointer"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#8B8FA8]">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-white font-semibold">Drag & drop your transfer receipt here, or <span className="text-[#796BFF] underline">browse</span></p>
                        <p className="text-[10px] text-[#5B5F78] mt-1">Accepted formats: PNG, JPG, JPEG, PDF (Max. 10MB)</p>
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-200 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {uploading ? (
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-[10px] font-mono text-[#8B8FA8]">
                    <span className="flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin text-[#796BFF]" /> SECURING BLOCKCHAIN FILE DISPATCH...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#796BFF] to-[#B6B3FF] transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              ) : (
                <button
                  onClick={handlePaymentProofSubmit}
                  disabled={!file}
                  className="w-full py-4 bg-white hover:bg-zinc-100 text-[#13131A] font-bold text-xs uppercase rounded-full tracking-wider duration-150 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
                >
                  Submit Payment Proof
                </button>
              )}

            </div>
          )}

        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-3xl p-5 space-y-5 animate-in fade-in duration-300">
            <span className="text-[9px] font-mono text-white font-bold tracking-widest uppercase block">
              DEPOSIT PAYMENT SUMMARY
            </span>

            <div className="space-y-4 font-mono text-[11px]">
              
              <div className="space-y-2 border-b border-white/[0.06] pb-4">
                <div className="flex justify-between">
                  <span className="text-[#5B5F78]">TOTAL PACKAGE PRICE:</span>
                  <span className="text-white font-bold">{formatLocalCurrency(totalUSD, lang)}</span>
                </div>
                <div className="flex justify-between text-[#B6B3FF] font-bold">
                  <span>REQUIRED DEPOSIT (10%):</span>
                  <span>{formatLocalCurrency(depositUSD, lang)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5B5F78]">REMAINING BALANCE (90%):</span>
                  <span className="text-white/60">{formatLocalCurrency(remainingUSD, lang)}</span>
                </div>
              </div>

              <div className="space-y-2 border-b border-white/[0.06] pb-4">
                <div className="flex justify-between">
                  <span className="text-[#5B5F78]">APPLICATION ID:</span>
                  <span className="text-white text-right break-all max-w-[120px]">{application.applicationNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5B5F78]">APPLICANT:</span>
                  <span className="text-white text-right truncate max-w-[120px]" title={application.personalInfo.fullName}>
                    {application.personalInfo.fullName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5B5F78]">PRIORITY TIER:</span>
                  <span className="text-white font-bold">{application.priorityLevel}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <div>
                  <span className="text-[#5B5F78] uppercase block mb-1">ACC_CORRIDORS:</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded font-bold uppercase text-[9px] border ${
                    application.paymentDetails?.status === 'APPROVED' 
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' 
                      : application.paymentDetails?.status === 'PENDING_VERIFICATION'
                      ? 'bg-amber-950/40 border-amber-500/30 text-amber-400'
                      : application.paymentDetails?.status === 'REJECTED'
                      ? 'bg-red-950/40 border-red-500/30 text-red-400'
                      : 'bg-zinc-900 border-white/5 text-zinc-500'
                  }`}>
                    {application.paymentDetails?.status === 'APPROVED' 
                      ? 'UNLOCKED / EN ROUTE' 
                      : application.paymentDetails?.status === 'PENDING_VERIFICATION'
                      ? 'AWAITING TARIFF REVIEW'
                      : application.paymentDetails?.status === 'REJECTED'
                      ? 'REJECTED / ACTION REQUIRED'
                      : 'LOCKED / DEPOSIT REQUIRED'}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
