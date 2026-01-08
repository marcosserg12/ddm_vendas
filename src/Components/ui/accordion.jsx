import React, { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Accordion = ({ children, className, type = "single", defaultValue = [] }) => {
  // Se for type="multiple", usamos array. Se single, string.
  // Simplificando: sempre tratando como array para esse exemplo funcionar rápido
  const [openItems, setOpenItems] = useState(Array.isArray(defaultValue) ? defaultValue : [defaultValue]);

  const toggleItem = (value) => {
    if (type === "multiple") {
      if (openItems.includes(value)) {
        setOpenItems(openItems.filter(item => item !== value));
      } else {
        setOpenItems([...openItems, value]);
      }
    } else {
      setOpenItems(openItems.includes(value) ? [] : [value]);
    }
  }

  return (
    <div className={cn("space-y-1", className)}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { openItems, toggleItem })
      )}
    </div>
  )
}

const AccordionItem = ({ children, value, openItems, toggleItem, disabled, className }) => {
  const isOpen = openItems.includes(value);
  return (
    <div className={cn("border-b", className)}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { isOpen, onClick: () => !disabled && toggleItem(value), disabled })
      )}
    </div>
  )
}

const AccordionTrigger = ({ children, isOpen, onClick, disabled, className }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline text-left w-full",
      disabled && "opacity-50 cursor-not-allowed",
      className
    )}
  >
    {children}
    <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
  </button>
)

const AccordionContent = ({ children, isOpen, className }) => {
  if (!isOpen) return null;
  return (
    <div className={cn("overflow-hidden text-sm transition-all pb-4", className)}>
      {children}
    </div>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }