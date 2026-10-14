import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default:     "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:     "border-2 border-border bg-transparent hover:bg-white/5 hover:border-white/20 text-foreground",
        secondary:   "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:       "bg-transparent hover:bg-white/5 text-foreground",
        link:        "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 text-sm font-semibold",
        sm:      "h-9 px-4 text-xs",
        lg:      "h-14 px-8 text-base font-bold",
        icon:    "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends HTMLMotionProps<"button">,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
