import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const DropdownMenu = ({ children }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { open, setOpen })
      )}
    </div>
  );
};

const DropdownMenuTrigger = ({ asChild, children, setOpen, open }) => {
  const Comp = asChild ? React.Slot : "button";
  // Se for asChild, clonamos o elemento filho e adicionamos o onClick
  if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, { onClick: () => setOpen(!open) });
  }
  return (
    <button onClick={() => setOpen(!open)} type="button">
      {children}
    </button>
  );
};

const DropdownMenuContent = ({ align = "center", children, className, open, setOpen }) => {
  if (!open) return null;

  const alignmentClasses = {
    start: "left-0",
    end: "right-0",
    center: "left-1/2 -translate-x-1/2",
  };

  return (
    <div
      className={cn(
        "absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white p-1 text-slate-950 shadow-md animate-in fade-in-0 zoom-in-95",
        alignmentClasses[align],
        className
      )}
      onClick={() => setOpen(false)} // Fecha ao clicar em um item
    >
      {children}
    </div>
  );
};

const DropdownMenuItem = ({ asChild, className, children, onClick, ...props }) => {
    const Comp = asChild ? "div" : "button"; // Simplificação para não precisar de Slot

    // Se for asChild (Link), renderizamos o filho diretamente com as classes
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            className: cn(
                "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-left",
                className
            ),
            ...props
        });
    }

  return (
    <button
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-left",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
};