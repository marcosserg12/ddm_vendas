import React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        // Base: Padding maior (px-4) para o texto não "colar" na borda
        // border-2 e rounded-xl para consistência com o restante da UI
        "flex min-h-[120px] w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm ring-offset-white transition-all",
        // Placeholder
        "placeholder:text-gray-400 font-medium",
        // Foco: Laranja DDM com brilho suave (ring)
        "focus-visible:outline-none focus-visible:border-orange-500 focus-visible:ring-4 focus-visible:ring-orange-500/10",
        // Desativado
        "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50",
        // Scrollbar discreta (opcional, mas recomendado para design limpo)
        "resize-y scrollbar-thin scrollbar-thumb-gray-200",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }