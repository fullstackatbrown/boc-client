'use client';

import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from "@heroicons/react/24/outline";

interface PopupProps {
  children: ReactNode;
  onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ children, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!mounted) return null;

  const popupRoot = document.getElementById('popup-root');
  if (!popupRoot) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div className="bg-boc_lightbrown p-6 rounded-2xl shadow-lg relative" onClick={(e) => e.stopPropagation()}>
        <XMarkIcon className="w-7 h-7 absolute top-2 right-2" onClick={onClose}/>
        {children}
      </div>
    </div>,
    popupRoot
  );
};

export default Popup;