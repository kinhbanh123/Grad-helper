import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "ghost" | "outline" | "secondary" | "destructive";
    size?: "default" | "sm" | "lg" | "icon";
}

export function Button({ className, variant = "ghost", size = "icon", ...props }: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
    const variants = {
        default: "bg-slate-900 text-white hover:bg-slate-900/90 shadow",
        ghost: "hover:bg-slate-100 hover:text-slate-900 text-slate-500",
        outline: "border border-slate-200 bg-transparent shadow-sm hover:bg-slate-100 hover:text-slate-900",
        secondary: "bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-100/80",
        destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
    };
    const sizes = {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
    };

    return (
        <button
            className={twMerge(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        />
    );
}
