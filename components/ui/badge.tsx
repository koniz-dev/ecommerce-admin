import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// Omit the built-in 'ref' so that people can’t pass a string ref by mistake:
type BaseSpanProps = Omit<React.ComponentProps<"span">, "ref">

export type BadgeProps = BaseSpanProps &
  VariantProps<typeof badgeVariants> & {
    /** Render as the child slot instead of a span */
    asChild?: boolean
  }

/**
 * A polymorphic Badge that can render as a <span> or as any childless component via Radix’s <Slot>.
 * We forward a ref of type HTMLElement (will point to the actual rendered DOM node).
 */
export const Badge = React.forwardRef<HTMLElement, BadgeProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "span"
    return (
      <Comp
        ref={ref}
        data-slot="badge"
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    )
  }
)

Badge.displayName = "Badge"
