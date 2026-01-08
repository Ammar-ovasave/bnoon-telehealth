import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-bnoon-navy text-white hover:bg-bnoon-navy/90 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 shadow-md focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border-2 border-bnoon-navy bg-transparent text-bnoon-navy hover:bg-bnoon-navy hover:text-white shadow-sm",
        secondary:
          "bg-secondary text-white hover:bg-secondary/90 shadow-md hover:shadow-lg",
        ghost:
          "text-bnoon-navy hover:bg-bnoon-navy/10 hover:text-bnoon-navy",
        link:
          "text-bnoon-navy underline-offset-4 hover:underline",
        bnoonPrimary:
          "bg-gradient-to-r from-bnoon-navy to-[#006699] text-white hover:shadow-xl hover:shadow-bnoon-navy/25 hover:-translate-y-0.5 active:translate-y-0",
        bnoonOutline:
          "border-2 border-bnoon-navy bg-transparent text-bnoon-navy hover:bg-bnoon-navy hover:text-white",
      },
      size: {
        default: "h-11 px-5 py-2.5 rounded-base",
        sm: "h-9 px-4 rounded-base gap-1.5 text-xs",
        lg: "h-12 px-8 rounded-base text-base",
        xl: "h-14 px-10 rounded-base text-lg",
        icon: "size-10 rounded-base",
        "icon-sm": "size-8 rounded-base",
        "icon-lg": "size-12 rounded-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn("cursor-pointer", buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
