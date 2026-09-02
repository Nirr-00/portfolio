"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface DialogOptions {
  type: "alert" | "confirm";
  message: string;
  title?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface DialogContextType {
  showAlert: (message: string, title?: string) => Promise<void>;
  showConfirm: (message: string, title?: string) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogOptions | null>(null);

  const showAlert = useCallback((message: string, title?: string) => {
    return new Promise<void>((resolve) => {
      setDialog({
        type: "alert",
        message,
        title,
        onConfirm: () => {
          setDialog(null);
          resolve();
        },
      });
    });
  }, []);

  const showConfirm = useCallback((message: string, title?: string) => {
    return new Promise<boolean>((resolve) => {
      setDialog({
        type: "confirm",
        message,
        title,
        onConfirm: () => {
          setDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setDialog(null);
          resolve(false);
        },
      });
    });
  }, []);

  return (
    <DialogContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      {/* Dialog Modal UI */}
      {dialog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-700 w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            {dialog.title && (
              <h3 className="text-lg font-semibold text-white mb-2">{dialog.title}</h3>
            )}
            <p className="text-gray-200 mb-6 whitespace-pre-wrap">{dialog.message}</p>
            
            <div className="flex justify-end gap-3">
              {dialog.type === "confirm" && (
                <button
                  onClick={dialog.onCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  취소
                </button>
              )}
              <button
                onClick={dialog.onConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
}
