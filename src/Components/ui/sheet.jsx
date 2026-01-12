import React, { createContext, useContext, useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const SheetContext = createContext({})

const Sheet = ({ children }) => {
  const [open, setOpen] = useState(false)
  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  )
}

const SheetTrigger = ({ asChild, children }) => {
  const { setOpen } = useContext(SheetContext)
  
  const handleClick = (e) => {
    if (children?.props?.onClick) children.props.onClick(e)
    setOpen(true)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { onClick: handleClick })
  }
  return <button onClick={() => setOpen(true)} type="button">{children}</button>
}

const SheetContent = ({ side = "right", className, children }) => {
  const { open, setOpen } = useContext(SheetContext)

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[150] flex">
      {/* Overlay com Blur - Padrão DDM para foco total */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={() => setOpen(false)}
      />

      {/* Panel lateral */}
      <div className={cn(
        "fixed z-[160] gap-4 bg-white p-6 shadow-2xl transition ease-in-out duration-300 h-full w-full max-w-sm sm:max-w-md",
        // Lógica de animação e posicionamento
        side === "left" 
          ? "inset-y-0 left-0 border-r animate-in slide-in-from-left" 
          : "inset-y-0 right-0 border-l animate-in slide-in-from-right",
        className
      )}>
        <button
            onClick={() => setOpen(false)}
            className="absolute right-6 top-6 rounded-full p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-all active:scale-90"
        >
          <X className="h-6 w-6" />
          <span className="sr-only">Fechar</span>
        </button>
        <div className="flex flex-col h-full">
            {children}
        </div>
      </div>
    </div>
  )
}

const SheetHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-2 text-left mb-6", className)} {...props} />
)

const SheetTitle = ({ className, ...props }) => (
  <h2 className={cn("text-xl font-black uppercase tracking-tight text-gray-900", className)} {...props} />
)

const SheetDescription = ({ className, ...props }) => (
    <p className={cn("text-sm text-gray-500 font-medium", className)} {...props} />
)

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription }