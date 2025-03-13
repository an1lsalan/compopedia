import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, children, variant = "primary", size = "md", isLoading = false, disabled, ...props }, ref) => {
        const baseStyles =
            "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:border-gray-500 dark:hover:text-gray-100";

        const variants = {
            primary: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
            secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500",
            outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-500",
            ghost: "text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-500",
            danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
        };

        const sizes = {
            sm: "text-sm h-8 px-3",
            md: "text-sm h-10 px-4",
            lg: "text-base h-12 px-6",
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], isLoading && "opacity-70 cursor-not-allowed", className)}
                disabled={isLoading || disabled}
                {...props}
            >
                {isLoading ? <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" /> : null}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

export { Button };
