import { HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
    width?: string;
    height?: string;
    borderRadius?: string;
}

export function Skeleton({ width, height, borderRadius, className, style, ...props }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse bg-gray-700/50 ${className || ""}`}
            style={{
                width: width || "100%",
                height: height || "20px",
                borderRadius: borderRadius || "4px",
                ...style,
            }}
            {...props}
        />
    );
}
