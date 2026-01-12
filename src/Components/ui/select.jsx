import React, { useState, createContext, useContext, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Check } from "lucide-react"

const SelectContext = createContext(null);

const Select = ({ value, onValueChange, children }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Fecha ao clicar fora, essencial para Selects customizados
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative" ref={containerRef}>{children}</div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = ({ className, children }) => {
  const { open, setOpen } = useContext(SelectContext);
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-11 w-full items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm font-medium transition-all focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-50",
        open && "border-orange-500 ring-4 ring-orange-500/10",
        className
      )}
    >
      {children}
      <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform duration-200", open && "rotate-180 text-orange-500")} />
    </button>
  )
}

const SelectValue = ({ placeholder }) => {
  const { value } = useContext(SelectContext);
  // Aqui você pode adicionar uma lógica para traduzir o Value para o Label se necessário
  return <span className="truncate">{value || <span className="text-gray-400">{placeholder}</span>}</span>
}

const SelectContent = ({ children, className }) => {
  const { open } = useContext(SelectContext);
  if (!open) return null;
  return (
    <div className={cn(
      "absolute z-[110] min-w-[8rem] overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-950 shadow-xl animate-in fade-in-0 zoom-in-95 w-full mt-2", 
      className
    )}>
      <div className="p-1.5">{children}</div>
    </div>
  )
}

const SelectItem = ({ value, children, className }) => {
  const { onValueChange, setOpen, value: selectedValue } = useContext(SelectContext);
  const isSelected = selectedValue === value;

  return (
    <div
      onClick={() => {
        onValueChange(value);
        setOpen(false);
      }}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition-colors hover:bg-orange-50 hover:text-orange-600",
        isSelected && "bg-orange-50 text-orange-600 font-bold",
        className
      )}
    >
      <span className="absolute left-3 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4 stroke-[3px]" />}
      </span>
      {children}
    </div>
  )
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }