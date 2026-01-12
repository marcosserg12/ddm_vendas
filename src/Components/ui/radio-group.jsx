import React from "react"
import { cn } from "@/lib/utils"

const RadioGroupContext = React.createContext(null);

const RadioGroup = React.forwardRef(({ className, value, onValueChange, children, ...props }, ref) => {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div className={cn("grid gap-3", className)} ref={ref} {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
})
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef(({ className, value, ...props }, ref) => {
  const context = React.useContext(RadioGroupContext);
  if (!context) throw new Error("RadioGroupItem must be used within a RadioGroup");
  
  const { value: selectedValue, onValueChange } = context;
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={() => onValueChange(value)}
      ref={ref}
      className={cn(
        // Base: Borda cinza e anel de foco laranja
        "aspect-square h-5 w-5 rounded-full border-2 border-gray-300 text-orange-500 ring-offset-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        // Estado Selecionado
        isSelected ? "border-orange-500" : "hover:border-orange-300",
        className
      )}
      {...props}
    >
      {isSelected && (
        <span className="flex items-center justify-center">
          {/* O "ponto" central do radio */}
          <div className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-in zoom-in-50 duration-200" />
        </span>
      )}
    </button>
  )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }