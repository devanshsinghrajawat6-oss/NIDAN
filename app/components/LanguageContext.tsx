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
    "Portfolio KPIs": "Portfolio KPIs",
    "Milestones": "Milestones",
    "Patients": "Patients",
    "e-Consent Hub": "e-Consent Hub",
    "Safety & NPvCC": "Safety & NPvCC",
    "Audit Trail (ALCOA+)": "Audit Trail (ALCOA+)",
    "Blockchain Ledger": "Blockchain Ledger",
    "Advanced Analytics": "Advanced Analytics",
    "Export Centre": "Export Centre",
    "Settings": "Settings",
    "Portfolio": "Portfolio",
    "Compliance & Safety": "Compliance & Safety",
    "Data & Analytics": "Data & Analytics",
    "System": "System",
    "Search studies, patients...": "Search studies, patients...",
    "Search studies, patients, MedDRA codes…": "Search studies, patients, MedDRA codes…",
    "Active Studies": "Active Studies",
    "Patients Enrolled": "Patients Enrolled",
    "Approvals Pending": "Approvals Pending",
    "Protocol Deviations": "Protocol Deviations",
    "Quick Actions": "Quick Actions",
    "Enroll Patient": "Enroll Patient",
    "New Trial": "New Trial",
    "Run Compliance Check": "Run Compliance Check",
    "Report AE/SAE": "Report AE/SAE",
    "My Clinical Tasks": "My Clinical Tasks",
    "Pending IEC Approvals": "Pending IEC Approvals",
    "Safety Signals Watchlist": "Safety Signals Watchlist",
    "Compliance Score": "Compliance Score",
    "due soon": "due soon",
    "Action Req": "Action Req",
    "Research With": "Research With",
    "Precision & Trust": "Precision & Trust",
    "Welcome back": "Welcome back",
    "Sign in to NIDANA": "Sign in to NIDANA",
    "Email Address": "Email Address",
    "Password": "Password",
    "Sign In": "Sign In"
  },
  HI: {
    "Overview": "सिंहावलोकन",
    "Study Portfolio": "अध्ययन पोर्टफोलियो",
    "Portfolio KPIs": "पोर्टफोलियो KPIs",
    "Milestones": "माइलस्टोन्स",
    "Patients": "मरीज़",
    "e-Consent Hub": "ई-सहमति हब",
    "Safety & NPvCC": "सुरक्षा और एनपीवीसीसी",
    "Audit Trail (ALCOA+)": "ऑडिट ट्रेल (ALCOA+)",
    "Blockchain Ledger": "ब्लॉकचेन लेज़र",
    "Advanced Analytics": "उन्नत एनालिटिक्स",
    "Export Centre": "निर्यात केंद्र",
    "Settings": "सेटिंग्स",
    "Portfolio": "पोर्टफोलियो",
    "Compliance & Safety": "अनुपालन और सुरक्षा",
    "Data & Analytics": "डेटा और एनालिटिक्स",
    "System": "सिस्टम",
    "Search studies, patients...": "अध्ययन, मरीज़ खोजें...",
    "Search studies, patients, MedDRA codes…": "अध्ययन, मरीज़, MedDRA कोड खोजें…",
    "Active Studies": "सक्रिय अध्ययन",
    "Patients Enrolled": "नामांकित मरीज़",
    "Approvals Pending": "लंबित स्वीकृतियां",
    "Protocol Deviations": "प्रोटोकॉल विचलन",
    "Quick Actions": "त्वरित कार्रवाइयां",
    "Enroll Patient": "मरीज़ पंजीकृत करें",
    "New Trial": "नया परीक्षण",
    "Run Compliance Check": "अनुपालन जांच चलाएं",
    "Report AE/SAE": "AE/SAE रिपोर्ट करें",
    "My Clinical Tasks": "मेरे नैदानिक कार्य",
    "Pending IEC Approvals": "लंबित IEC स्वीकृतियां",
    "Safety Signals Watchlist": "सुरक्षा सिग्नल वॉचलिस्ट",
    "Compliance Score": "अनुपालन स्कोर",
    "due soon": "जल्द देय",
    "Action Req": "कार्रवाई आवश्यक",
    "Research With": "के साथ अनुसंधान",
    "Precision & Trust": "सटीकता और विश्वास",
    "Welcome back": "वापसी पर स्वागत है",
    "Sign in to NIDANA": "NIDANA में साइन इन करें",
    "Email Address": "ईमेल पता",
    "Password": "पासवर्ड",
    "Sign In": "साइन इन करें"
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
