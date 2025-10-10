import { cva, type VariantProps } from "class-variance-authority";
import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

const cardVariants = cva(
  "rounded-[var(--radius-lg)] transition-all duration-300",
  {
    variants: {
      variant: {
        glass:
          "bg-white/8 backdrop-blur-[20px] backdrop-saturate-[180%] border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)]",
        solid:
          "bg-[var(--secondary-blue)] border border-white/10 shadow-[var(--shadow-lg)]",
        outline: "border-2 border-white/20 bg-transparent",
      },
      hover: {
        true: "hover:transform hover:-translate-y-1 hover:shadow-xl cursor-pointer",
        false: "",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "solid",
      hover: false,
      padding: "md",
    },
  }
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hover, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, hover, padding, className }))}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

export { Card, cardVariants };
