import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const spinnerVariants = cva(
  "animate-spin rounded-full border-t-2 border-b-2 border-primary",
  {
    variants: {
      size: {
        xs: "w-4 h-4",
        sm: "w-8 h-8 md:h-6 md:w-6",
        default: "w-10 h-10 md:h-8: md:w-8",
        lg: "w-12 h-12 md:h-10 md:w-10",
        xl: "w-16 h-16 md:h-24 md:w-24",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  asChild?: boolean;
  className?: string;
}

export function Spinner({ size, className }: SpinnerProps) {
  return <div className={cn(spinnerVariants({ size, className }))} />;
}
