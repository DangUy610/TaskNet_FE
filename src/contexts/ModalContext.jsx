
import React, { createContext, useState, useCallback } from 'react';

export const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [modals, setModals] = useState({});

  const openModal = useCallback((modalId, props = {}) => {
    setModals(prev => ({ ...prev, [modalId]: { open: true, props } }));
  },[]);

  const closeModal = useCallback(modalId => {
    setModals(prev => ({ ...prev, [modalId]: { open: false, props: {} } }));
  }, []);

  return (
    <ModalContext.Provider value={{ modals, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}
