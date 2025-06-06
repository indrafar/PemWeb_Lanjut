import React, { useState, ReactNode, createContext, useContext } from 'react';

type SidebarContextType = {
  isOpen: boolean;
  toggle: () => void;
};

// Buat dan export context sekali saja
export const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function SidebarTrigger() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('SidebarTrigger must be used inside SidebarProvider');

  return (
    <button
      onClick={context.toggle}
      className="px-4 py-2 bg-blue-500 text-white rounded"
      aria-label="Toggle Sidebar"
    >
      Toggle Sidebar
    </button>
  );
}
