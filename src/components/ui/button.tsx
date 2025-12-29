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
          "bg-bnoon-teal text-white hover:bg-bnoon-teal/90 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 shadow-md focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border-2 border-bnoon-teal bg-transparent text-bnoon-teal hover:bg-bnoon-teal hover:text-white shadow-sm",
        secondary:
          "bg-bnoon-navy text-white hover:bg-bnoon-navy/90 shadow-md hover:shadow-lg",
        ghost:
          "text-bnoon-navy hover:bg-bnoon-teal/10 hover:text-bnoon-teal",
        link:
          "text-bnoon-teal underline-offset-4 hover:underline",
        bnoonPrimary:
          "bg-gradient-to-r from-bnoon-teal to-cyan-500 text-white hover:shadow-xl hover:shadow-bnoon-teal/25 hover:-translate-y-0.5 active:translate-y-0",
        bnoonOutline:
          "border-2 border-bnoon-navy bg-transparent text-bnoon-navy hover:bg-bnoon-navy hover:text-white",
      },
      size: {
        default: "h-11 px-5 py-2.5 rounded-full",
        sm: "h-9 px-4 rounded-full gap-1.5 text-xs",
        lg: "h-12 px-8 rounded-full text-base",
        xl: "h-14 px-10 rounded-full text-lg",
        icon: "size-10 rounded-full",
        "icon-sm": "size-8 rounded-full",
        "icon-lg": "size-12 rounded-full",
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
