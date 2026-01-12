import React from "react"
import { cn } from "@/lib/utils"

const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto rounded-xl border border-gray-200 shadow-sm">
    <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  // DDM: Cabeçalho com fundo leve para destacar os títulos das colunas
  <thead ref={ref} className={cn("bg-gray-50/80 [&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
))
TableBody.displayName = "TableBody"

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr 
    ref={ref} 
    className={cn(
      "border-b transition-colors hover:bg-orange-50/30 data-[state=selected]:bg-orange-50", 
      className
    )} 
    {...props} 
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th 
    ref={ref} 
    className={cn(
      "h-12 px-4 text-left align-middle font-bold text-gray-900 uppercase text-[10px] tracking-widest [&:has([role=checkbox])]:pr-0", 
      className
    )} 
    {...props} 
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td ref={ref} className={cn("p-4 align-middle text-gray-700 font-medium [&:has([role=checkbox])]:pr-0", className)} {...props} />
))
TableCell.displayName = "TableCell"

export { Table, TableHeader, TableBody, TableHead, TableRow, TableCell }