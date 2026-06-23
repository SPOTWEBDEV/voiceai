"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  onDismiss: (id: string) => void;
}

export function Toast({ id, title, description, variant = "default", onDismiss }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg",
        variant === "destructive"
          ? "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
          : "border-border bg-background text-foreground"
      )}
    >
      <div className="flex-1">
        {title && <p className="text-sm font-semibold">{title}</p>}
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        ✕
      </button>
    </div>
  );
}

// Global toast state
type ToastData = Omit<ToastProps, "onDismiss">;
let toastListeners: ((toasts: ToastData[]) => void)[] = [];
let toasts: ToastData[] = [];

function emit() {
  toastListeners.forEach((l) => l([...toasts]));
}

export function toast(data: Omit<ToastData, "id">) {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { ...data, id }];
  emit();
}

export function useToast() {
  const [list, setList] = React.useState<ToastData[]>(toasts);
  React.useEffect(() => {
    toastListeners.push(setList);
    return () => { toastListeners = toastListeners.filter((l) => l !== setList); };
  }, []);
  const dismiss = React.useCallback((id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, []);
  return { toasts: list, dismiss };
}

export function Toaster() {
  const { toasts: list, dismiss } = useToast();
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
      {list.map((t) => (
        <Toast key={t.id} {...t} onDismiss={dismiss} />
      ))}
    </div>
  );
}
