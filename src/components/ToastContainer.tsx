import React from "react";
import { useToast, type ToastType } from "../context/ToastContext";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa";

const ToastIcon: React.FC<{ type: ToastType }> = ({ type }) => {
  switch (type) {
    case "success":
      return <FaCheckCircle className="text-vf-lime" />;
    case "error":
      return <FaExclamationCircle className="text-red-500" />;
    case "info":
    default:
      return <FaInfoCircle className="text-vf-cyan" />;
  }
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-9999 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto min-w-[300px] bg-[#111] border-l-4 border-vf-border shadow-2xl p-4 flex items-center gap-3 animate-slide-in-right transition-all transform hover:scale-[1.02]"
          style={{
            borderColor:
              toast.type === "success"
                ? "#ccff00"
                : toast.type === "error"
                ? "#ef4444"
                : "#06b6d4",
          }}
        >
          <div className="text-lg">
            <ToastIcon type={toast.type} />
          </div>
          <p className="grow text-xs sm:text-sm font-mono text-white">
            {toast.message}
          </p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-neutral-500 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
        </div>
      ))}
    </div>
  );
};
