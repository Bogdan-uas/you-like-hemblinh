export const AnimatedCheckIcon = (props) => (
    <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: "white" }}
        {...props}
    >
        <path
            d="M20 6L9 17l-5-5"
            style={{
                strokeDasharray: 24,
                strokeDashoffset: 24,
                animation: "penaltyCheckmark 0.5s ease forwards",
            }}
        />
        <style>{`@keyframes penaltyCheckmark { to { stroke-dashoffset: 0; } }`}</style>
    </svg>
);

export const AnimatedCrossIcon = (props) => (
    <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: "white" }}
        {...props}
    >
        <line
            x1="18" y1="6" x2="6" y2="18"
            style={{
                strokeDasharray: 24,
                strokeDashoffset: 24,
                animation: "penaltyCrossmark 0.5s ease forwards",
            }}
        />
        <line
            x1="6" y1="6" x2="18" y2="18"
            style={{
                strokeDasharray: 24,
                strokeDashoffset: 24,
                animation: "penaltyCrossmark 0.4s ease forwards",
                animationDelay: "0.2s",
            }}
        />
        <style>{`@keyframes penaltyCrossmark { to { stroke-dashoffset: 0; } }`}</style>
    </svg>
);
