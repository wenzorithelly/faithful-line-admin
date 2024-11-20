'use client';

import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';

// Define the shape of the context
type Language = 'en' | 'pt';
type LanguageContextType = {
  language: Language | null;
  setLanguage: (lang: Language) => void;
};

// Create the context with default values
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Create a provider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language | null>(null);

  useEffect(() => {
    // Initialize language from localStorage if available
    const storedLang = localStorage.getItem('appLanguage') as Language | null;
    if (storedLang) {
      setLanguage(storedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('appLanguage', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for consuming the context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
