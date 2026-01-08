import React, { createContext, useContext, useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

// Criamos um contexto para que o Botão (Trigger) consiga abrir a Janela (Content)
const DialogContext = createContext({})

const Dialog = ({ children, open, onOpenChange }) => {
  // Lógica para funcionar tanto controlado (pelo pai) quanto não controlado (sozinho)
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

  // Função para abrir o modal
  const handleClick = (e) => {
      // Se o filho já tiver um onClick, executamos ele também
      if (children && children.props && children.props.onClick) {
          children.props.onClick(e);
      }
      setOpen(true)
  }

  // Se usar asChild, clonamos o botão filho para não criar um button dentro de button
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
       {/* Fundo Escuro (Overlay) - Clicar fecha */}
      <div
        className="fixed inset-0 bg-black/80 transition-opacity animate-in fade-in-0"
        onClick={() => setOpen(false)}
      />

      {/* Janela Modal */}
      <div className={cn(
        "relative z-50 grid w-full gap-4 border bg-white p-6 shadow-lg sm:rounded-lg md:w-full animate-in zoom-in-95 slide-in-from-bottom-2",
        className
      )}>
        <button
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>
  )
}

const DialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)

const DialogTitle = ({ className, ...props }) => (
  <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
)

// Exportando tudo que o MinhaConta.jsx precisa
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle }