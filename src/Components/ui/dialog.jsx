import React, { createContext, useContext, useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const DialogContext = createContext({})

const Dialog = ({ children, open, onOpenChange }) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : uncontrolledOpen
  const setIsOpen = isControlled ? onOpenChange : setUncontrolledOpen

  return (
    <DialogContext.Provider value={{ open: isOpen, setOpen: setIsOpen }}>
      {children}
    </DialogContext.Provider>
  )
}

const DialogTrigger = ({ asChild, children, ...props }) => {
  const { setOpen } = useContext(DialogContext)

  const handleClick = (e) => {
      if (children && children.props && children.props.onClick) {
          children.props.onClick(e);
      }
      setOpen(true)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { onClick: handleClick, ...props })
  }

  return (
    <button onClick={() => setOpen(true)} {...props}>
      {children}
    </button>
  )
}

const DialogContent = ({ className, children }) => {
  const { open, setOpen } = useContext(DialogContext)

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay - Desfoque adicionado para foco total no conteúdo industrial */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in-0 duration-300"
        onClick={() => setOpen(false)}
      />

      {/* Janela Modal */}
      <div className={cn(
        "relative z-[110] grid w-full max-w-lg gap-4 border bg-white p-8 shadow-2xl rounded-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300",
        className
      )}>
        <button
            onClick={() => setOpen(false)}
            className="absolute right-6 top-6 rounded-full p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-all active:scale-90"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Fechar</span>
        </button>
        {children}
      </div>
    </div>
  )
}

const DialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-2 text-left", className)} {...props} />
)

const DialogTitle = ({ className, ...props }) => (
  <h2 className={cn("text-2xl font-black leading-tight tracking-tight text-gray-900", className)} {...props} />
)

const DialogDescription = ({ className, ...props }) => (
    <p className={cn("text-sm text-gray-500 font-medium", className)} {...props} />
)

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription }