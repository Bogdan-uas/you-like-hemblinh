import { useId } from "react";

const GradientIcon = ({
    path,
    gradient,
    glowColor,
    size = 30,
}) => {
    const id = useId();

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 320 512"
            style={{
                overflow: "visible",
                filter: `drop-shadow(0 0 3.5px ${glowColor})`,
            }}
        >
            <defs>
                <linearGradient
                    id={id}
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                >
                    <stop offset="0%" stopColor={gradient.top} />
                    <stop offset="45%" stopColor={gradient.middle} />
                    <stop offset="100%" stopColor={gradient.bottom} />
                </linearGradient>
            </defs>

            <path
                d={path}
                fill={`url(#${id})`}
            />
        </svg>
    );
};

export default GradientIcon;