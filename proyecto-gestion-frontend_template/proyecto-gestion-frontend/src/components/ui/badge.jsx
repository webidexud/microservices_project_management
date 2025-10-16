import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = ({ className, variant = "default", ...props }) => {
  const variants = {
    default: "bg-primary text-white",
    secondary: "bg-primary-soft text-primary-dark",
    success: "bg-green-100 text-success",
    danger: "bg-red-100 text-danger",
    warning: "bg-yellow-100 text-warning",
    info: "bg-blue-100 text-info",
    outline: "border border-border text-text-primary",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }