import { getAnniversaryTheme, getTournamentNumberStyle } from "../logic/winnersAndPickem.js";

const NUMBER_PATTERN = /(#\d+|Season \d+)/;

export const TournamentNumberText = ({ text }) => {
    if (typeof text !== "string") return text ?? null;

    return (
        <>
            {text.split(NUMBER_PATTERN).map((part, i) =>
                i % 2 === 1 ? (
                    <span key={i} style={getTournamentNumberStyle(getAnniversaryTheme(Number(part.replace(/\D/g, ""))))}>
                        {part}
                    </span>
                ) : (
                    part
                )
            )}
        </>
    );
};
