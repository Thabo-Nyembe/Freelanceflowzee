import React from "react";
import { cn } from "@/lib/utils";

// Simplified HeroBeam - renders immediately without JavaScript
// Spotlight effect removed to improve LCP
export const HeroBeam = ({
    children,
    className,
    containerClassName,
}: {
    children: React.ReactNode;
    className?: string;
    containerClassName?: string;
}) => {
    return (
        <div
            className={cn(
                "relative h-[40rem] flex items-center justify-center w-full",
                containerClassName
            )}
        >
            <div className="absolute inset-0 bg-dot-thick-neutral-300 dark:bg-dot-thick-neutral-800 pointer-events-none" />
            <div className={cn("relative z-20", className)}>{children}</div>
        </div>
    );
};
