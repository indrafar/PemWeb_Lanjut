import React, { useState, ReactNode, createContext, useContext } from 'react';

type SidebarContextType = {
  isOpen: boolean;
  toggle: () => void;
};

// Add 'export' here
export const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function   SidebarProvider({ children }: { children: ReactNode }) {
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
    <button onClick={context.toggle}>
      Toggle Sidebar
    </button>
  );
}

// ✅ INI WAJIB DITAMBAHKAN agar bisa di-import
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}