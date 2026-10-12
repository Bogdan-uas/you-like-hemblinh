import { FaTrophy } from "react-icons/fa";
import { FaChartSimple } from "react-icons/fa6";
import { LeaderboardSelect } from "./LeaderboardSelect.jsx";
import { LEADERBOARD_SORT_TEXT_COLOR, LEADERBOARD_SORT_LABEL_ID, LEADERBOARD_SORT_VALUE_ID, LEADERBOARD_SORT_OPTION_ID } from "../logic/leaderboardSort.js";
import { LEADERBOARD_SORT_OPTIONS } from "../logic/teamData.js";

const LeaderboardSortIcon = ({ value }) => {
    const box = {
        width: 22,
        height: 22,
        flex: "0 0 22px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
    };

    switch (value) {
        case "points":
            return (
                <span style={box} aria-hidden="true">
                    <span
                        style={{
                            width: 18,
                            height: 18,
                            boxSizing: "border-box",
                            borderRadius: "50%",
                            border: "2px solid #999",
                            background: LEADERBOARD_SORT_TEXT_COLOR,
                            color: "#fff",
                            fontSize: 10,
                            fontWeight: 700,
                            paddingBottom: 1,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        p
                    </span>
                </span>
            );
        case "trophies":
            return (
                <span style={box} aria-hidden="true">
                    <FaTrophy size={16} color={LEADERBOARD_SORT_TEXT_COLOR} />
                </span>
            );
        case "seconds":
            return (
                <span style={{ ...box, fontSize: 18 }} aria-hidden="true">
                    🥈
                </span>
            );
        case "thirds":
            return (
                <span style={{ ...box, fontSize: 18 }} aria-hidden="true">
                    🥉
                </span>
            );
        case "stats":
            return (
                <span style={box} aria-hidden="true">
                    <FaChartSimple size={15} color={LEADERBOARD_SORT_TEXT_COLOR} />
                </span>
            );
        default:
            return <span style={box} aria-hidden="true" />;
    }
};

const SORT_IDS = {
    label: LEADERBOARD_SORT_LABEL_ID,
    value: LEADERBOARD_SORT_VALUE_ID,
    option: LEADERBOARD_SORT_OPTION_ID,
    listbox: "leaderboard-sort-listbox",
};

export const LeaderboardSortSelect = ({ value, onChange }) => (
    <LeaderboardSelect
        label="Placement sorting"
        options={LEADERBOARD_SORT_OPTIONS}
        value={value}
        onChange={onChange}
        renderIcon={(option) => <LeaderboardSortIcon value={option} />}
        ids={SORT_IDS}
        top="7%"
    />
);
