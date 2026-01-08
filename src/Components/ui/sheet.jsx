import React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Sheet = ({ children }) => {
  const [open, setOpen] = React.useState(false);

  return React.Children.map(children, child =>
    React.cloneElement(child, { open, setOpen })
  )
}

const SheetTrigger = ({ asChild, children, setOpen }) => {
  const Comp = asChild ? React.Slot : 'button';
  // Simplesmente clona o filho e adiciona o onClick se for asChild
  if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, { onClick: () => setOpen(true) });
  }
  return <button onClick={() => setOpen(true)}>{children}</button>
}

const SheetContent = ({ side = "right", className, children, open, setOpen }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
        {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/80 transition-opacity"
        onClick={() => setOpen(false)}
      />

      {/* Panel */}
      <div className={cn(
        "fixed z-50 gap-4 bg-white p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out duration-300 h-full",
        side === "left" ? "inset-y-0 left-0 h-full w-3/4 border-r" : "inset-y-0 right-0 h-full w-3/4 border-l",
        className
      )}>
        <button
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  )
}

const SheetHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
)

const SheetTitle = ({ className, ...props }) => (
  <h2 className={cn("text-lg font-semibold text-slate-950", className)} {...props} />
)

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle }