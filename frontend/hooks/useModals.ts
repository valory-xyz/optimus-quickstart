import { useState } from 'react';

export const useModals = () => {
  const [isMigrationSuccessModalOpen, setIsMigrationSuccessModalOpen] =
    useState(false);

  return {
    isMigrationSuccessModalOpen,
    setIsMigrationSuccessModalOpen,
  };
};
