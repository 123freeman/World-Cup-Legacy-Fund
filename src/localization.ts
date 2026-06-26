import { Language } from './types';

export const LANGUAGES: Language[] = [
  { code: 'EN', name: 'English', localName: 'English', flag: '🇬🇧', currency: 'GBP', symbol: '£', rate: 0.79 },
  { code: 'FR', name: 'French', localName: 'Français', flag: '🇫🇷', currency: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'DE', name: 'German', localName: 'Deutsch', flag: '🇩🇪', currency: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'ES', name: 'Spanish', localName: 'Español', flag: '🇪🇸', currency: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'IT', name: 'Italian', localName: 'Italiano', flag: '🇮🇹', currency: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'PT', name: 'Portuguese', localName: 'Português', flag: '🇵🇹', currency: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'NL', name: 'Dutch', localName: 'Nederlands', flag: '🇳🇱', currency: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'PL', name: 'Polish', localName: 'Polski', flag: '🇵🇱', currency: 'PLN', symbol: 'zł', rate: 4.02 },
  { code: 'RO', name: 'Romanian', localName: 'Română', flag: '🇷🇴', currency: 'RON', symbol: 'lei', rate: 4.58 },
  { code: 'SE', name: 'Swedish', localName: 'Svenska', flag: '🇸🇪', currency: 'SEK', symbol: 'kr', rate: 10.45 },
  { code: 'NO', name: 'Norwegian', localName: 'Norsk', flag: '🇳🇴', currency: 'NOK', symbol: 'kr', rate: 10.60 },
  { code: 'DK', name: 'Danish', localName: 'Dansk', flag: '🇩🇰', currency: 'DKK', symbol: 'kr', rate: 6.87 },
  { code: 'FI', name: 'Finnish', localName: 'Suomi', flag: '🇫🇮', currency: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'GR', name: 'Greek', localName: 'Ελληνικά', flag: '🇬🇷', currency: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'CZ', name: 'Czech', localName: 'Čeština', flag: '🇨🇿', currency: 'CZK', symbol: 'Kč', rate: 23.10 },
  { code: 'SK', name: 'Slovak', localName: 'Slovenčina', flag: '🇸🇰', currency: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'HU', name: 'Hungarian', localName: 'Magyar', flag: '🇭🇺', currency: 'HUF', symbol: 'Ft', rate: 362.50 },
  { code: 'HR', name: 'Croatian', localName: 'Hrvatski', flag: '🇭🇷', currency: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'RS', name: 'Serbian', localName: 'Српски', flag: '🇷🇸', currency: 'RSD', symbol: 'дин.', rate: 108.30 },
  { code: 'BG', name: 'Bulgarian', localName: 'Български', flag: '🇧🇬', currency: 'BGN', symbol: 'лв', rate: 1.80 },
  { code: 'SI', name: 'Slovenian', localName: 'Slovenščina', flag: '🇸🇮', currency: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'UA', name: 'Ukrainian', localName: 'Українська', flag: '🇺🇦', currency: 'UAH', symbol: '₴', rate: 39.80 },
  { code: 'LT', name: 'Lithuanian', localName: 'Lietuvių', flag: '🇱🇹', currency: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'LV', name: 'Latvian', localName: 'Latviešu', flag: '🇱🇻', currency: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'EE', name: 'Estonian', localName: 'Eesti', flag: '🇪🇪', currency: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'IS', name: 'Icelandic', localName: 'Íslenska', flag: '🇮🇸', currency: 'ISK', symbol: 'kr', rate: 139.00 },
  { code: 'AL', name: 'Albanian', localName: 'Shqip', flag: '🇦🇱', currency: 'ALL', symbol: 'Lek', rate: 94.50 },
  { code: 'TR', name: 'Turkish', localName: 'Türkçe', flag: '🇹🇷', currency: 'TRY', symbol: '₺', rate: 32.50 },
  { code: 'CAT', name: 'Catalan', localName: 'Català', flag: '🇪🇸', currency: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'EU', name: 'Basque', localName: 'Euskara', flag: '🇪🇸', currency: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'GL', name: 'Galician', localName: 'Galego', flag: '🇪🇸', currency: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'IE', name: 'Irish', localName: 'Gaeilge', flag: '🇮🇪', currency: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'CY', name: 'Welsh', localName: 'Cymraeg', flag: '🏴', currency: 'GBP', symbol: '£', rate: 0.79 },
  { code: 'LU', name: 'Luxembourgish', localName: 'Lëtzebuergesch', flag: '🇱🇺', currency: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'MT', name: 'Maltese', localName: 'Malti', flag: '🇲🇹', currency: 'EUR', symbol: '€', rate: 0.92 }
];

export interface TranslationSet {
  title: string;
  badge: string;
  subtitle: string;
  beginClearance: string;
  applyNow: string;
  portalStatus: string;
  personalInfo: string;
  addressInfo: string;
  passportInfo: string;
  identityVerification: string;
  travelOrigin: string;
  matchPreferences: string;
  attendanceType: string;
  accommodationPrefs: string;
  additionalInfo: string;
  costBreakdown: string;
  reviewSubmit: string;
  submitClearance: string;
  verificationOfficer: string;
  paymentDetails: string;
  vipLounge: string;
  statsTitle: string;
  approvedGateways: string;
  countdownLabel: string;
  unauthorizedUser: string;
}

export const TRANSLATIONS: Record<string, TranslationSet> = {
  EN: {
    title: 'FIFA 2026 OFFICIAL ACCREDITATION GATEWAY',
    badge: 'UEFA CONSTITUENCY ENTRANCE',
    subtitle: 'Ultra-premium travel clearance and exclusive event logistics for European attendees.',
    beginClearance: 'BEGIN SECURE ACCREDITATION',
    applyNow: 'APPLY FOR TOUR ACCREDITATION',
    portalStatus: 'VISA GATE STATUS: OPERATIONAL',
    personalInfo: 'I. Personal Accreditation',
    addressInfo: 'II. Territorial Address',
    passportInfo: 'III. Official Passport Details',
    identityVerification: 'IV. Biometric Proof & Verification',
    travelOrigin: 'V. Departure Logistics',
    matchPreferences: 'VI. Strategic Matches Matchday',
    attendanceType: 'VII. Attendance Duration',
    accommodationPrefs: 'VIII. Premium Quarters',
    additionalInfo: 'IX. Security Information',
    costBreakdown: 'X. Premium Tariffs & Fees',
    reviewSubmit: 'XI. Dossier Verification',
    submitClearance: 'SUBMIT APPLICATION SECURELY',
    verificationOfficer: 'SYSTEM ADMIN LOG',
    paymentDetails: 'EXCLUSIVE BLOCKCHAIN SETTLEMENT',
    vipLounge: 'PREMIUM EVENT CHANNELS ACTIVE',
    statsTitle: 'PORTAL METRICS',
    approvedGateways: 'APPROVED EUROPEAN CORRIDORS',
    countdownLabel: 'TIME UNTIL GRAND OPENING',
    unauthorizedUser: 'SECURE AUTHENTICATION REQ.'
  },
  FR: {
    title: 'PORTAIL D\'ACCRÉDITATION SOUVERAIN FIFA 2026',
    badge: 'ACCÈS DE LA CIRCONCRIPTION DE L\'UEFA',
    subtitle: 'Autorisation de haute sécurité et logistique souveraine de prestige pour l\'Europe.',
    beginClearance: 'DÉBUTER L\'ACCRÉDITATION DE SÉCURITÉ',
    applyNow: 'DEMANDER L\'AUTORISATION',
    portalStatus: 'STATUT DU PORTAIL: OPÉRATIONNEL',
    personalInfo: 'I. Accréditation Personnelle',
    addressInfo: 'II. Adresse Territoriale',
    passportInfo: 'III. Détails du Passeport Souverain',
    identityVerification: 'IV. Preuves Biométriques & Vérification',
    travelOrigin: 'V. Logistique de Départ',
    matchPreferences: 'VI. Matchs Stratégiques Sélectionnés',
    attendanceType: 'VII. Durée de l\'Autorisation',
    accommodationPrefs: 'VIII. Quartiers Sabbatiques de Prestige',
    additionalInfo: 'IX. Annexe de Sécurité',
    costBreakdown: 'X. Tarifs Souverains Haute Valeur',
    reviewSubmit: 'XI. Vérification du Dossier',
    submitClearance: 'TRANSMETTRE LA DEMANDE CHIFFRÉE',
    verificationOfficer: 'JOURNAL DE L\'OFFICIER DE SÉCURITÉ',
    paymentDetails: 'RÈGLEMENT BLOCKCHAIN EXCLUSIF',
    vipLounge: 'ACCÈS AU MODE SOUVERAIN ACTIF',
    statsTitle: 'MESURES DU PORTAIL',
    approvedGateways: 'COULOIRS EUROPÉENS APPROUVÉS',
    countdownLabel: 'TEMPS AVANT L\'OUVERTURE SOLENNELLE',
    unauthorizedUser: 'AUTHENTIFICATION REQUISE'
  },
  DE: {
    title: 'FIFA 2026 SOUVERÄNER AKKREDITIERUNGSZUGANG',
    badge: 'UEFA-CONSTITUENCY-EINGANG',
    subtitle: 'Hochsicherheitsfreigabe und exklusive souveräne Logistik für europäische Teilnehmer.',
    beginClearance: 'SICHERHEITS-AKKREDITIERUNG STARTEN',
    applyNow: 'FREIGABE BEANTRAGEN',
    portalStatus: 'PORTAL-STATUS: BETRIEBSBEREIT',
    personalInfo: 'I. Persönliche Akkreditierung',
    addressInfo: 'II. Territorialer Wohnsitz',
    passportInfo: 'III. Souveräne Reisepass-Angaben',
    identityVerification: 'IV. Biometrischer Nachweis & Abgleich',
    travelOrigin: 'V. Abflug-Logistik',
    matchPreferences: 'VI. Strategische Spielauswahl',
    attendanceType: 'VII. Freigabezeitraum',
    accommodationPrefs: 'VIII. Sabbatische Premium-Quartiere',
    additionalInfo: 'IX. Sicherheitsanhang',
    costBreakdown: 'X. Premium-Souveränitätsgebühren',
    reviewSubmit: 'XI. Überprüfung des Dossiers',
    submitClearance: 'VERSCHLÜSSELTE BEWERBUNG ÜBERMITTELN',
    verificationOfficer: 'PROTOKOLL DES PRÜFUNGSBEAUFTRAGTEN',
    paymentDetails: 'EXKLUSIVE BLOCKCHAIN-ABWICKLUNG',
    vipLounge: 'SOUVERÄNER MODUS AKTIV',
    statsTitle: 'PORTAL-KENNZAHLEN',
    approvedGateways: 'ZUGELASSENE EUROPÄISCHE KORRIDORE',
    countdownLabel: 'BIS ZUR FEIERLICHEN ERÖFFNUNG',
    unauthorizedUser: 'SICHERE AUTHENTIFIZIERUNG ERFORDERLICH'
  },
  ES: {
    title: 'PORTAL DE ACREDITACIÓN SOBERANA FIFA 2026',
    badge: 'ACCESO DE CONSTITUYENTES DE LA UEFA',
    subtitle: 'Acreditación de alta seguridad y logística soberana de lujo para asistentes europeos.',
    beginClearance: 'INICIAR COMPROBACIÓN DE SEGURIDAD',
    applyNow: 'SOLICITAR AUTORIZACIÓN',
    portalStatus: 'ESTADO DE ENTRADA: OPERATIVO',
    personalInfo: 'I. Acreditación Personal',
    addressInfo: 'II. Dirección Territorial',
    passportInfo: 'III. Detalles de Pasaporte Soberano',
    identityVerification: 'IV. Pruebas Biométricas y Verificación',
    travelOrigin: 'V. Logística de Salida',
    matchPreferences: 'VI. Partidos Estratégicos Seleccionados',
    attendanceType: 'VII. Duración de la Credencial',
    accommodationPrefs: 'VIII. Alojamiento de Súper Lujo',
    additionalInfo: 'IX. Anexo de Seguridad',
    costBreakdown: 'X. Tarifas Soberanas de Alta Gama',
    reviewSubmit: 'XI. Verificación de Dossier',
    submitClearance: 'NOTIFICAR SOLICITUD CIFRADA',
    verificationOfficer: 'REGISTRO DEL OFICIAL DE AUTORIZACIÓN',
    paymentDetails: 'LIQUIDACIÓN EXCLUSIVA DE BLOCKCHAIN',
    vipLounge: 'ACCESO SOBERANO ACTIVO',
    statsTitle: 'MÉTRICAS DEL SISTEMA',
    approvedGateways: 'CORREDORES EUROPEOS AUTORIZADOS',
    countdownLabel: 'TIEMPO HASTA LA GRAN APERTURA',
    unauthorizedUser: 'AUTENTICACIÓN REQUERIDA'
  }
};

// Fallback logic for unsupported translation sets (returns translation or English format)
export function getTranslations(langCode: string): TranslationSet {
  const code = langCode.toUpperCase();
  return TRANSLATIONS[code] || TRANSLATIONS.EN;
}

export function formatLocalCurrency(usdAmount: number, lang: Language): string {
  const localVal = usdAmount * lang.rate;
  return new Intl.NumberFormat(lang.code === 'EN' ? 'en-GB' : 'de-DE', {
    style: 'currency',
    currency: lang.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(localVal);
}

export function formatLocalDateValue(dateStr: string, langCode: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat(langCode === 'EN' ? 'en-GB' : 'de-DE', {
      dateStyle: 'long'
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function formatLocalNumberValue(num: number, langCode: string): string {
  return new Intl.NumberFormat(langCode === 'EN' ? 'en-GB' : 'de-DE').format(num);
}
