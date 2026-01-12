import React from "react"
import { cn } from "@/lib/utils"

function Badge({ className, variant = "default", ...props }) {
  const variants = {
    // Laranja DDM (Destaque/Marca)
    default: "border-transparent bg-orange-500 text-white hover:bg-orange-600 shadow-sm",
    
    // Cinza Claro (Filtros/Informações Secundárias)
    secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200",
    
    // Vermelho (Esgotado/Urgência)
    destructive: "border-transparent bg-red-600 text-white hover:bg-red-700",
    
    // Verde (Em Estoque/Sucesso/Desconto PIX)
    success: "border-transparent bg-green-600 text-white hover:bg-green-700",
    
    // Borda (Técnico/Especificações)
    outline: "border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50",
  }

  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2", 
        variants[variant] || variants.default, 
        className
      )} 
      {...props} 
    />
  )
}

export { Badge }