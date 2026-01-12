import React from "react"
import { Slot } from "@radix-ui/react-slot" // Certifique-se de ter rodado: npm install @radix-ui/react-slot
import { cn } from "@/lib/utils"

const Button = React.forwardRef(({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
  // Se asChild for true, usamos o componente Slot, senão usamos a tag button normal
  const Comp = asChild ? Slot : "button"

  const variants = {
    // Principal: Laranja DDM - Para ações de compra e destaque
    default: "bg-orange-500 text-white hover:bg-orange-600 shadow-md active:scale-95 transition-all",
    
    // Perigo: Vermelho - Para excluir itens ou cancelar
    destructive: "bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all",
    
    // Contorno: Elegante para detalhes ou filtros
    outline: "border-2 border-gray-900 bg-transparent hover:bg-gray-900 hover:text-white text-gray-900 font-bold active:scale-95 transition-all",
    
    // Secundário: Cinza Escuro/Preto - Para ações menos urgentes
    secondary: "bg-gray-900 text-white hover:bg-black active:scale-95 transition-all",
    
    // Fantasma: Apenas texto, para links de "voltar" ou "limpar"
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-orange-600",
    
    // Link: Estilo link simples
    link: "text-orange-600 underline-offset-4 hover:underline font-bold",
  }

  const sizes = {
    default: "h-11 px-6 py-2",
    sm: "h-9 rounded-md px-3 text-xs",
    lg: "h-14 rounded-xl px-10 text-lg uppercase tracking-tight", // Botões grandes e imponentes
    icon: "h-11 w-11", // Botão de ícone (ex: carrinho)
  }

  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-black ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
        variants[variant] || variants.default,
        sizes[size] || sizes.default,
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }