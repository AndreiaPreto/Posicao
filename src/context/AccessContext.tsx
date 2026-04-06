import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface UserAccess {
  user_id: string;
  diagnostico_comprado: boolean;
  mappingCredits: number;
  clube_ativo: boolean;
  reprogramacao_pessoal_comprada: boolean;
  reprogramar_eu_comprado: boolean;
}

interface AccessContextType {
  access: UserAccess | null;
  loading: boolean;
  refreshAccess: (uid?: string) => Promise<void>;
  simulatePurchase: (type: 'diagnostico' | 'clube') => void;
}

const AccessContext = createContext<AccessContextType | undefined>(undefined);

export const AccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [access, setAccess] = useState<UserAccess | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAccess = async (uid?: string) => {
    try {
      const url = uid ? `/api/user-access?uid=${uid}` : '/api/user-access';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAccess(data);
    } catch (error) {
      console.error('Failed to fetch access:', error);
      // Set default anonymous access on error
      setAccess({
        user_id: "error",
        diagnostico_comprado: false,
        mappingCredits: 0,
        clube_ativo: false,
        reprogramacao_pessoal_comprada: false,
        reprogramar_eu_comprado: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchAccess(user.uid);
      } else {
        fetchAccess();
      }
    });

    return () => unsubscribe();
  }, []);

  const simulatePurchase = (type: 'diagnostico' | 'clube' | 'reprogramacao_pessoal' | 'reprogramar_eu') => {
    // Simulation disabled for production
    console.log(`Simulation of ${type} purchase requested but disabled.`);
  };

  return (
    <AccessContext.Provider value={{ access, loading, refreshAccess: (uid?: string) => fetchAccess(uid || auth.currentUser?.uid), simulatePurchase }}>
      {children}
    </AccessContext.Provider>
  );
};

export const useAccess = () => {
  const context = useContext(AccessContext);
  if (context === undefined) {
    throw new Error('useAccess must be used within an AccessProvider');
  }
  return context;
};
