import React, { useState } from 'react';
import { LANGUAGES } from '../localization';
import { Language } from '../types';
import { Globe, Search, ChevronDown, Check } from 'lucide-react';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  variant?: 'light' | 'dark';
}

export default function LanguageSelector({ currentLanguage, onLanguageChange, variant = 'light' }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = LANGUAGES.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.localName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="language_and_currency_master_selector" className="relative">
      {/* Dropdown Actuator Trigger */}
      <button
        id="language_dropdown_actuator"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border duration-200 text-xs font-medium select-none cursor-pointer ${
          variant === 'dark'
            ? 'border-zinc-800 bg-[#121420]/80 text-zinc-200 hover:border-[#796BFF]/40 hover:bg-zinc-900'
            : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'
        }`}
      >
        <Globe className="w-4 h-4 text-[#796BFF] animate-spin-slow" />
        <span className="flex items-center gap-1.5">
          <span>{currentLanguage.flag}</span>
          <span className={`hidden sm:inline font-bold ${variant === 'dark' ? 'text-white' : 'text-zinc-800'}`}>{currentLanguage.localName}</span>
          <span className={variant === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}>({currentLanguage.currency})</span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Selector Window */}
      {isOpen && (
        <>
          {/* Close tap filter backdrop */}
          <div
            id="backdrop_dismiss_languages"
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div
            id="language_selection_drawer"
            className="absolute right-0 mt-2 w-80 max-h-96 overflow-hidden flex flex-col z-50 rounded-2xl border border-zinc-800 bg-[#0C0D12]/95 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-3 duration-200"
          >
            {/* Header section with currency disclaimer */}
            <div id="lang_drawer_header" className="p-4 border-b border-zinc-900 bg-[#0C0D12]/90">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono tracking-widest text-[#B6B3FF] font-bold uppercase">
                  EUROPEAN SOVEREIGN CONSTITUENCIES
                </span>
                <span className="text-[9px] font-mono bg-[#796BFF]/10 text-[#B6B3FF] border border-[#796BFF]/20 px-1.5 py-0.5 rounded-full">
                  35 NATIVE PACKS
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-sans mb-3 font-medium">
                Accreditations are processed in native languages. Exchange rates are recalculated in real time.
              </p>

              {/* Search Box */}
              <div id="language_search_bar" className="relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-3 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter sovereign languages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-zinc-850 bg-zinc-900/60 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#796BFF]/40 text-left font-mono"
                />
              </div>
            </div>

            {/* Language Scroll-able Registry Node */}
            <div id="language_scroll_container" className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin scrollbar-thumb-zinc-800">
              {filteredLanguages.length > 0 ? (
                filteredLanguages.map((lang) => {
                  const isSelected = lang.code === currentLanguage.code;
                  return (
                    <button
                      key={lang.code}
                      id={`lang_option_${lang.code}`}
                      onClick={() => {
                        onLanguageChange(lang);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-[#796BFF]/15 text-[#B6B3FF] border-l-2 border-[#796BFF]'
                          : 'text-zinc-300 hover:bg-zinc-900/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base select-none">{lang.flag}</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold font-sans">{lang.localName}</span>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase">
                            {lang.name} • UTC {lang.currency === 'GBP' ? '±0' : '+1'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold bg-zinc-900 text-[#B6B3FF] border border-zinc-800 px-1.5 py-0.5 rounded">
                          {lang.currency} ({lang.symbol})
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#796BFF]" />}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center text-zinc-600 font-mono text-[10px] uppercase">
                  No compatible constituency found
                </div>
              )}
            </div>

            {/* Footer containing conversion rate context */}
            <div id="lang_drawer_footer" className="p-2.5 border-t border-zinc-900 bg-zinc-950/40 font-mono text-[9px] text-zinc-500 text-center uppercase tracking-widest">
              BASE INDEX RATE: 1 USD = {currentLanguage.rate.toFixed(2)} {currentLanguage.currency}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
