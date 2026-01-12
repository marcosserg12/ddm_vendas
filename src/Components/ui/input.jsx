import React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        // Base: Altura levemente maior (h-11) para melhor usabilidade mobile
        // Borda cinza média para contraste em fundos brancos ou cinzas
        "flex h-11 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm ring-offset-white transition-all",
        // Placeholder
        "placeholder:text-gray-400 font-medium",
        // Foco: Laranja DDM com anel suave
        "focus-visible:outline-none focus-visible:border-orange-500 focus-visible:ring-4 focus-visible:ring-orange-500/10",
        // Estados desativados e arquivos
        "file:border-0 file:bg-transparent file:text-sm file:font-bold disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }