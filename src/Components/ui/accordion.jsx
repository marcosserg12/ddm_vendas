import React, { createContext, useContext, useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// Criamos um contexto para evitar o cloneElement
const AccordionContext = createContext(null)

const Accordion = ({ children, className, type = "single", defaultValue = [] }) => {
  const [openItems, setOpenItems] = useState(
    Array.isArray(defaultValue) ? defaultValue : [defaultValue]
  );

  const toggleItem = (value) => {
    if (type === "multiple") {
      setOpenItems(prev => 
        prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
      );
    } else {
      setOpenItems(prev => prev.includes(value) ? [] : [value]);
    }
  }

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={cn("space-y-1", className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

const AccordionItem = ({ children, value, disabled, className }) => {
  const { openItems, toggleItem } = useContext(AccordionContext)
  const isOpen = openItems.includes(value);

  // Passamos o estado para os filhos via Contexto ou Props se preferir manter a estrutura
  return (
    <div className={cn("border-b border-gray-200", className)}>
      {React.Children.map(children, child =>
        React.isValidElement(child) 
          ? React.cloneElement(child, { isOpen, value, onClick: () => !disabled && toggleItem(value), disabled })
          : child
      )}
    </div>
  )
}

const AccordionTrigger = ({ children, isOpen, onClick, disabled, className }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    type="button"
    className={cn(
      "flex flex-1 items-center justify-between py-4 font-bold transition-all hover:text-orange-600 text-left w-full group",
      disabled && "opacity-50 cursor-not-allowed",
      className
    )}
  >
    <div className="flex items-center gap-2">
        {children}
    </div>
    <ChevronDown className={cn(
        "h-4 w-4 shrink-0 transition-transform duration-300 text-gray-400 group-hover:text-orange-500", 
        isOpen && "rotate-180 text-orange-500"
    )} />
  </button>
)

const AccordionContent = ({ children, isOpen, className }) => {
  return (
    <div className={cn(
        "overflow-hidden text-sm transition-all duration-300 ease-in-out",
        isOpen ? "max-h-[1000px] opacity-100 pb-4" : "max-h-0 opacity-0",
        className
    )}>
      {children}
    </div>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }