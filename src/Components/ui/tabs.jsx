import React, { createContext, useContext } from "react"
import { cn } from "@/lib/utils"

const TabsContext = createContext({});

const Tabs = ({ value, onValueChange, children, className }) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  )
}

const TabsList = ({ className, children }) => (
  <div className={cn(
    "inline-flex h-12 items-center justify-center rounded-xl bg-gray-100 p-1.5 text-gray-500 shadow-inner", 
    className
  )}>
    {children}
  </div>
)

const TabsTrigger = ({ value, className, children }) => {
  const { value: selectedValue, onValueChange } = useContext(TabsContext);
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      onClick={() => onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2 text-sm font-bold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
        isSelected 
          ? "bg-white text-orange-600 shadow-md scale-[1.02]" 
          : "text-gray-500 hover:bg-white/50 hover:text-gray-700",
        className
      )}
    >
      {children}
    </button>
  )
}

const TabsContent = ({ value, className, children }) => {
  const { value: selectedValue } = useContext(TabsContext);
  if (selectedValue !== value) return null;

  return (
    <div className={cn(
      "mt-4 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 animate-in fade-in-50 slide-in-from-top-1 duration-300", 
      className
    )}>
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }