import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const DropdownMenu = ({ children }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

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
        React.isValidElement(child) ? React.cloneElement(child, { open, setOpen }) : child
      )}
    </div>
  );
};

const DropdownMenuTrigger = ({ asChild, children, setOpen, open }) => {
  const handleClick = (e) => {
    e.preventDefault();
    setOpen(!open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { onClick: handleClick });
  }

  return (
    <button onClick={handleClick} type="button" className="focus:outline-none">
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
        "absolute z-[100] mt-2 min-w-[12rem] overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 text-gray-950 shadow-xl animate-in fade-in-0 zoom-in-95 duration-200",
        alignmentClasses[align],
        className
      )}
      onClick={() => setOpen(false)}
    >
      {children}
    </div>
  );
};

const DropdownMenuItem = ({ asChild, className, children, onClick, ...props }) => {
  const itemClasses = cn(
    "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm font-bold text-gray-700 outline-none transition-all hover:bg-orange-50 hover:text-orange-600 active:scale-[0.98] w-full text-left",
    className
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: cn(itemClasses, children.props.className),
      ...props
    });
  }

  return (
    <button className={itemClasses} onClick={onClick} {...props}>
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