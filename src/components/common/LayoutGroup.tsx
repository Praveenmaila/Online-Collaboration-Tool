import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LayoutGroupContextType {
  activeId: string | null;
  register: (id: string) => void;
  unregister: (id: string) => void;
  setActive: (id: string) => void;
}

const LayoutGroupContext = createContext<LayoutGroupContextType | null>(null);

export const useLayoutGroup = () => {
  const context = useContext(LayoutGroupContext);
  if (!context) {
    throw new Error('useLayoutGroup must be used within a LayoutGroupProvider');
  }
  return context;
};

interface LayoutGroupProps {
  children: ReactNode;
  defaultActiveId?: string;
}

export const LayoutGroup: React.FC<LayoutGroupProps> = ({ 
  children, 
  defaultActiveId = null 
}) => {
  const [activeId, setActiveId] = useState<string | null>(defaultActiveId);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  
  const register = (id: string) => {
    setRegisteredIds(prev => {
      if (!prev.includes(id)) {
        return [...prev, id];
      }
      return prev;
    });
  };
  
  const unregister = (id: string) => {
    setRegisteredIds(prev => prev.filter(item => item !== id));
  };
  
  const setActive = (id: string) => {
    setActiveId(id);
  };
  
  return (
    <LayoutGroupContext.Provider value={{ activeId, register, unregister, setActive }}>
      {children}
    </LayoutGroupContext.Provider>
  );
};

interface LayoutItemProps {
  children: ReactNode;
  id: string;
  className?: string;
}

export const LayoutItem: React.FC<LayoutItemProps> = ({ children, id, className = '' }) => {
  const { activeId, register, unregister, setActive } = useLayoutGroup();
  
  React.useEffect(() => {
    register(id);
    return () => unregister(id);
  }, [id]);
  
  const isActive = activeId === id;
  
  return (
    <div 
      className={`transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'} ${className}`}
    >
      {children}
    </div>
  );
};