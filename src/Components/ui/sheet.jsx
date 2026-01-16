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

const SheetClose = ({ asChild, children, ...props }) => {
  const { setOpen } = useContext(SheetContext)

  const handleClick = (e) => {
    if (children?.props?.onClick) children.props.onClick(e)
    setOpen(false)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { onClick: handleClick, ...props })
  }

  return (
    <button type="button" onClick={() => setOpen(false)} {...props}>
      {children}
    </button>
  )
}

const SheetContent = ({ side = "right", className, children }) => {
  const { open, setOpen } = useContext(SheetContext)

  if (!open) return null;

  return (
    // Z-INDEX AUMENTADO PARA 9999
    <div className="fixed inset-0 z-[9999] flex justify-start">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={() => setOpen(false)}
      />

      {/* Panel lateral */}
      <div className={cn(
        "relative z-[10000] bg-white p-6 shadow-2xl transition ease-in-out duration-300 h-full w-[85%] max-w-sm flex flex-col",
        side === "left"
          ? "border-r animate-in slide-in-from-left"
          : "ml-auto border-l animate-in slide-in-from-right", // ml-auto joga para direita se for side="right"
        className
      )}>
        <button
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-all"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Fechar</span>
        </button>

        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto pr-1">
            {children}
        </div>
      </div>
    </div>
  )
}

const SheetHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1 text-left mb-6 mt-2", className)} {...props} />
)

const SheetTitle = ({ className, ...props }) => (
  <h2 className={cn("text-lg font-black uppercase tracking-tight text-gray-900", className)} {...props} />
)

const SheetDescription = ({ className, ...props }) => (
    <p className={cn("text-xs text-gray-500 font-medium", className)} {...props} />
)

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetDescription }