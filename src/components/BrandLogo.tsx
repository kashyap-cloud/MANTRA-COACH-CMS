import { cn } from "@/lib/utils";

interface Props {
    className?: string;
    size?: "sm" | "md" | "lg";
}

export default function BrandLogo({ className, size = "md" }: Props) {
    const sizeClasses = {
        sm: "text-lg",
        md: "text-2xl",
        lg: "text-4xl",
    };

    return (
        <div className={cn("font-bold tracking-tight flex items-center", sizeClasses[size], className)}>
            <span className="text-[#1e3a8a]">Mantra</span>
            <span className="text-[#0ea5e9]">Coach</span>
        </div>
    );
}
