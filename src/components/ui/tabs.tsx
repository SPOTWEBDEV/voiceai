"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

const TabsContext = React.createContext<{ value: string; onValueChange: (v: string) => void }>({ value: "", onValueChange: () => {} });

function Tabs({ defaultValue, value: controlled, onValueChange, children, className }: {
  defaultValue?: string; value?: string; onValueChange?: (v: string) => void;
  children: React.ReactNode; className?: string;
}) {
  const [internal, setInternal] = React.useState(defaultValue || "");
  const value = controlled !== undefined ? controlled : internal;
  const setValue = onValueChange || setInternal;
  return <TabsContext.Provider value={{ value, onValueChange: setValue }}><div className={className}>{children}</div></TabsContext.Provider>;
}

function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className)}>{children}</div>;
}

function TabsTrigger({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const { value: selected, onValueChange } = React.useContext(TabsContext);
  return (
    <button onClick={() => onValueChange(value)} className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50", selected === value ? "bg-background text-foreground shadow" : "hover:bg-background/50", className)}>
      {children}
    </button>
  );
}

function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const { value: selected } = React.useContext(TabsContext);
  if (selected !== value) return null;
  return <div className={cn("mt-2", className)}>{children}</div>;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
