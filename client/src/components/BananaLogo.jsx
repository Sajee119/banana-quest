export default function BananaLogo({ size = 60, className = '' }) {
    return (
        <svg viewBox="0 0 64 64" width={size} height={size} className={className}>
            <defs>
                <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFDD48" />
                    <stop offset="100%" stopColor="#F5A800" />
                </linearGradient>
            </defs>
            <path
                d="M14 46c-4-4-2-10 4-14 8-5 14-14 22-16 4-1 6 1 5 5-2 8-12 16-22 22-5 3-8 5-9 3z"
                fill="url(#bg)"
                stroke="#8F4500"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <path d="M40 15c2-3 6-4 8-2s0 6-3 7" fill="#6B3200" />
        </svg>
    );
}