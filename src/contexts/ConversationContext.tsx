
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ConversationContextType {
  activeConversation: string | null;
  setActiveConversation: (id: string | null) => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
};

interface ConversationProviderProps {
  children: ReactNode;
}

export const ConversationProvider: React.FC<ConversationProviderProps> = ({ children }) => {
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

  const value = {
    activeConversation,
    setActiveConversation,
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
};
