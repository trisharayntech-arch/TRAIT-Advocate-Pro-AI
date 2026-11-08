import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-2xl',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#263522]/60 backdrop-blur-sm flex items-center justify-center p-4">

      <div
        className={`bg-[#FFFCF5] rounded-2xl shadow-2xl border border-[#E9DCC6] w-full ${maxWidth} overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200`}
      >

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E9DCC6] flex items-center justify-between bg-[#F8EFDF]">

          <h3 className="text-base font-bold text-[#34452F] tracking-tight">
            {title}
          </h3>

          <button
            onClick={onClose}
            className="text-[#7D806B] hover:text-[#D94F1E] p-1.5 rounded-lg hover:bg-[#EAA34B]/15 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto text-[#263522]">
          {children}
        </div>

      </div>
    </div>
  );
};