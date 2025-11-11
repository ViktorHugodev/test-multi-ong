import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input h-11 w-full min-w-0 rounded-lg border-2 bg-background px-4 py-3 text-base shadow-sm transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus:border-primary focus:ring-2 focus:ring-primary/50",
        "hover:border-primary/50 transition-colors",
        "aria-invalid:ring-destructive/50 aria-invalid:border-destructive focus:aria-invalid:ring-destructive/50",
        "dark:bg-background-dark/30 dark:border-input",
        className
      )}
      {...props}
    />
  )
}

export { Input }
