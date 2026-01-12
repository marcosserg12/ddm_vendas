import React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      ref={ref}
      className={cn(
        // Estilo Base: Bordas mais arredondadas e anel de foco laranja
        "peer h-5 w-5 shrink-0 rounded-md border-2 border-gray-300 ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        // Estado Ativo: Laranja vibrante
        checked 
          ? "bg-orange-500 border-orange-500 text-white shadow-sm" 
          : "bg-white hover:border-orange-300",
        className
      )}
      {...props}
    >
      {checked && (
        <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
        >
            <Check className="h-3.5 w-3.5 mx-auto stroke-[3px]" />
        </motion.div>
      )}
    </button>
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }