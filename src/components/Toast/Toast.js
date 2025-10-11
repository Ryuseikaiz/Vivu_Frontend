import React, { useState, useEffect } from 'react';
import './Toast.css';

let showToastFn = null;

export const showToast = (message, type = 'info') => {
  if (showToastFn) {
    showToastFn(message, type);
  }
};

const Toast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    showToastFn = (message, type) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
    };

    return () => {
      showToastFn = null;
    };
  }, []);

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'error' && '⚠️'}
            {toast.type === 'success' && '✓'}
            {toast.type === 'info' && 'ℹ️'}
          </div>
          <div className="toast-message">{toast.message}</div>
        </div>
      ))}
    </div>
  );
};

export default Toast;
