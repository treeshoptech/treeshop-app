"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface AIContextData {
  currentPage?: string;
  currentProject?: any;
  currentCustomer?: any;
  currentLoadout?: any;
  recentActions?: string[];
  quickActions?: Array<{
    label: string;
    action: string;
    route?: string;
  }>;
}

interface AIContextValue {
  context: AIContextData;
  updateContext: (data: Partial<AIContextData>) => void;
  addRecentAction: (action: string) => void;
}

const AIContext = createContext<AIContextValue | undefined>(undefined);

export function AIContextProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<AIContextData>({
    recentActions: [],
    quickActions: [
      { label: 'Create New Lead', action: 'How do I create a new lead?', route: '/dashboard/leads' },
      { label: 'Calculate Pricing', action: 'Help me calculate pricing for a project', route: '/dashboard/calculators' },
      { label: 'Explain AFISS', action: 'What are AFISS factors?' },
      { label: 'View Dashboard', action: 'Navigate me to the dashboard', route: '/dashboard' },
    ],
  });

  const updateContext = (data: Partial<AIContextData>) => {
    setContext((prev) => ({ ...prev, ...data }));
  };

  const addRecentAction = (action: string) => {
    setContext((prev) => ({
      ...prev,
      recentActions: [action, ...(prev.recentActions || [])].slice(0, 10),
    }));
  };

  return (
    <AIContext.Provider value={{ context, updateContext, addRecentAction }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAIContext() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAIContext must be used within AIContextProvider');
  }
  return context;
}
