import React from "react"
import { cn } from "@/lib/utils"

const Label = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        // Mudança: font-bold para clareza e text-gray-800 para contraste
        // O peer-disabled faz com que o label também fique opaco se o Input estiver desativado
        "text-xs font-bold leading-none uppercase tracking-wide text-gray-800 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 select-none",
        className
      )}
      {...props}
    />
  )
})
Label.displayName = "Label"

export { Label }