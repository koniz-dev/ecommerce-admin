'use client';

import { StoreModal } from '@/components/modals/storeModal';
import { useEffect, useState, Fragment } from 'react';

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Fragment>
      <StoreModal />
    </Fragment>
  );
};
