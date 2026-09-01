"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'EN' | 'HI';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  EN: {
    "Overview": "Overview",
    "Study Portfolio": "Study Portfolio",
    "Patients": "Patients",
    "Safety Tracker": "Safety Tracker",
    "Ethics & CTRI": "Ethics & CTRI",
    "Blockchain Ledger": "Blockchain Ledger",
    "Settings": "Settings",
    "Search studies, patients...": "Search studies, patients...",
    "Administrator Panel": "Administrator Panel",
    "System configuration, user management, and blockchain status.": "System configuration, user management, and blockchain status.",
    "Active Studies": "Active Studies",
    "Patients Joined": "Patients Joined",
    "Approvals Needed": "Approvals Needed",
    "Protocol Deviations": "Protocol Deviations",
    "QUICK ACTIONS:": "QUICK ACTIONS:",
    "Add Patient": "Add Patient",
    "Create Trial": "Create Trial",
    "HL7 FHIR Export": "HL7 FHIR Export",
    "due soon": "due soon",
    "Action Req": "Action Req"
  },
  HI: {
    "Overview": "सिंहावलोकन",
    "Study Portfolio": "अध्ययन पोर्टफोलियो",
    "Patients": "मरीज़",
    "Safety Tracker": "सुरक्षा ट्रैकर",
    "Ethics & CTRI": "नैतिकता और सीटीआरआई",
    "Blockchain Ledger": "ब्लॉकचेन लेज़र",
    "Settings": "सेटिंग्स",
    "Search studies, patients...": "अध्ययन, मरीज़ खोजें...",
    "Administrator Panel": "प्रशासक पैनल",
    "System configuration, user management, and blockchain status.": "सिस्टम कॉन्फ़िगरेशन, उपयोगकर्ता प्रबंधन, और ब्लॉकचेन स्थिति।",
    "Active Studies": "सक्रिय अध्ययन",
    "Patients Joined": "जुड़े हुए मरीज़",
    "Approvals Needed": "स्वीकृतियां आवश्यक",
    "Protocol Deviations": "प्रोटोकॉल विचलन",
    "QUICK ACTIONS:": "त्वरित कार्रवाइयां:",
    "Add Patient": "मरीज़ जोड़ें",
    "Create Trial": "परीक्षण बनाएं",
    "HL7 FHIR Export": "HL7 FHIR निर्यात",
    "due soon": "जल्द देय",
    "Action Req": "कार्रवाई आवश्यक"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('EN');

  const t = (key: string) => {
    return translations[lang]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
