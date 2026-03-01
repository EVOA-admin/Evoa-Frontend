import React from "react";

export default function O21Icon({ size = 24, className = "", color = null }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="o21-grad" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3B82F6" />
                    <stop offset="0.5" stopColor="#2DD4BF" />
                    <stop offset="1" stopColor="#3B82F6" />
                </linearGradient>
            </defs>
            {/* Main big star */}
            <path
                d="M24 10C24 18 16 24 10 24C16 24 24 30 24 38C24 30 32 24 38 24C32 24 24 18 24 10Z"
                stroke={color || "url(#o21-grad)"}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Small top-right star */}
            <path
                d="M36 12C36 14.5 33.5 16 31 16C33.5 16 36 17.5 36 20C36 17.5 38.5 16 41 16C38.5 16 36 14.5 36 12Z"
                fill={color || "#3B82F6"}
            />
        </svg>
    );
}
