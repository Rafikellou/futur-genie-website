import { cva, type VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-semibold transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-orange)] text-white hover:opacity-90 hover:shadow-lg",
        secondary:
          "border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/30",
        outline:
          "border-2 border-[var(--accent-purple)] text-[var(--accent-purple)] hover:bg-[var(--accent-purple)] hover:text-white",
        ghost: "text-white hover:bg-white/10",
      },
      size: {
        sm: "px-4 py-2 text-sm rounded-[var(--radius-md)]",
        md: "px-6 py-3 text-base rounded-[var(--radius-pill)]",
        lg: "px-8 py-4 text-lg rounded-[var(--radius-pill)]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  href?: string;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, href, asChild = false, ...props }, ref) => {
    if (href) {
      return (
        <Link
          href={href}
          className={cn(buttonVariants({ variant, size, className }))}
        >
          {props.children}
        </Link>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
