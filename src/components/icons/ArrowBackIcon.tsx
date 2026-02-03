interface ArrowBackIconProps {
    className?: string;
}

/**
 * Arrow Back Icon
 * Left-pointing arrow for navigation
 */
export default function ArrowBackIcon({ className }: ArrowBackIconProps) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 12H5m7 7-7-7 7-7" />
        </svg>
    );
}
