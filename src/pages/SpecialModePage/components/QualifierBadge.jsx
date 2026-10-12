import { useEffect } from "react";
import { roundedPolygonPath, QUALIFIER_SCRIPT_FONT, ensureQualifierScriptFont } from "../logic/qualifierBadge.js";

export const QualifierBadge = ({ height = 30, color = "#2e2f42", textColor = "#ffffff", style = {} }) => {
    useEffect(() => {
        ensureQualifierScriptFont();
    }, []);

    const width = Math.round(height * 3.4);
    const inset = Math.round(height * 0.4);
    const radius = Math.max(2, Math.round(height * 0.2));
    const shape = roundedPolygonPath(
        [[0, 0], [width, 0], [width - inset, height], [inset, height]],
        radius
    );

    return (
        <span
            title="Qualifier"
            style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width,
                height,
                flexShrink: 0,
                verticalAlign: "middle",
                transition: "none",
                ...style,
            }}
        >
            <svg
                aria-hidden="true"
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                style={{ position: "absolute", inset: 0, overflow: "visible", transition: "none" }}
            >
                <path d={shape} fill={color} />
            </svg>
            <span
                style={{
                    position: "relative",
                    fontFamily: QUALIFIER_SCRIPT_FONT,
                    fontSize: Math.round(height * 0.74),
                    fontWeight: 400,
                    fontStyle: "normal",
                    lineHeight: 1,
                    letterSpacing: 0,
                    textTransform: "none",
                    textShadow: "none",
                    whiteSpace: "nowrap",
                    userSelect: "none",
                    color: textColor,
                    marginTop: -Math.round(height * 0.04),
                    transition: "none",
                }}
            >
                Qualifier
            </span>
        </span>
    );
};
