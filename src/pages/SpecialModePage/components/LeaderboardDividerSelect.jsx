import { LeaderboardSelect } from "./LeaderboardSelect.jsx";
import { TournamentTierBadge } from "./TournamentTypeInfo.jsx";
import { LEADERBOARD_DIVIDER_SETS } from "../logic/leaderboardDividers.js";

const DIVIDER_IDS = {
    label: "leaderboard-dividers-label",
    value: "leaderboard-dividers-value",
    option: (value) => `leaderboard-dividers-option-${String(value).replace(/\s+/g, "-")}`,
    listbox: "leaderboard-dividers-listbox",
};

const DividerSetIcon = ({ value }) => {
    const set = LEADERBOARD_DIVIDER_SETS.find((item) => item.value === value);
    return (
        <span style={{ width: 22, height: 22, flex: "0 0 22px", display: "inline-flex", alignItems: "center", justifyContent: "center" }} aria-hidden="true">
            {set && <TournamentTierBadge tier={set.tier} size={18} />}
        </span>
    );
};

export const LeaderboardDividerSelect = ({ value, onChange }) => (
    <LeaderboardSelect
        label="Stage dividers"
        options={LEADERBOARD_DIVIDER_SETS}
        value={value}
        onChange={onChange}
        renderIcon={(option) => <DividerSetIcon value={option} />}
        ids={DIVIDER_IDS}
        top="calc(7% + 48px)"
    />
);
