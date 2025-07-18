import React, { useEffect } from 'react';

interface SnackbarProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  open: boolean;
  onClose: () => void;
}

const Snackbar: React.FC<SnackbarProps> = ({ message, type = 'info', open, onClose }) => {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!open) return null;

  let bgColor = 'bg-gray-800';
  if (type === 'success') bgColor = 'bg-green-600';
  if (type === 'error') bgColor = 'bg-red-600';

  return (
    <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded text-white shadow-lg z-50 ${bgColor}`}>
      {message}
    </div>
  );
};

export default Snackbar;
