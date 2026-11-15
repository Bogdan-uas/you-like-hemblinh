import { FaCheck, FaXmark } from "react-icons/fa6";
import { NeededPerkTag } from "../progress/HudPerks.jsx";
import { HostBadge } from "../worldMap/HostCity.jsx";
import { TournamentTierBadge } from "../components/TournamentTypeInfo.jsx";
import { getAnniversaryTheme, getTournamentNumberStyle } from "../logic/winnersAndPickem.js";
import { teamFill, formatHallDate, glowOf, anniversaryFrameOf } from "./hallCardStyle.js";
import { PlaceMedal } from "../components/Trophies.jsx";
import css from "./HallCard.module.css";

const lengthTier = (name) => ((name ?? "").length > 9 ? "long" : (name ?? "").length > 6 ? "mid" : "short");

const PLACE_MARK = { 2: <PlaceMedal place={2} size={26} />, 3: <PlaceMedal place={3} size={26} />, 4: <PlaceMedal place={4} size={26} /> };

const PlaceRow = ({ place, label, team }) => (
    <span className={css.place} data-place={place} style={{ "--team": team?.color ?? "#8a8d99" }}>
        <span className={css.place_mark}>{PLACE_MARK[place] ?? place}</span>
        <span className={css.place_circle} style={{ background: teamFill(team) }} />
        <span className={css.place_text}>
            <span className={css.place_name} data-len={lengthTier(team?.name)}>Team {team?.name ?? "—"}</span>
            <span className={css.place_label} style={{ textShadow: glowOf(team?.color) }}>
                {label}
            </span>
        </span>
    </span>
);

const TeamGrid = ({ teams, size }) => (
    <span className={css.grid} data-count={teams.length}>
        {teams.map((team, index) => (
            <span key={`${team?.id ?? "t"}-${index}`} className={css.grid_team} style={{ "--team": team?.color ?? "#8a8d99" }}>
                <span className={css.grid_circle} style={{ width: size, height: size, background: teamFill(team) }} />
                <span className={css.grid_name} data-len={lengthTier(team?.name)} style={{ textShadow: glowOf(team?.color) }}>
                    Team {team?.name ?? "—"}
                </span>
            </span>
        ))}
    </span>
);

export function HallCard({ item, accent, tier, tierText, title, numberText, trophy, host, hostTitle, champion, places = [], qualified = null, badge = null, onOpen, dimmed = false, chosen = false }) {
    const won = !!item.pickemWon;
    const needed = Number(item.neededPickemPoints) || 0;
    const achieved = Number(item.achievedPickemPoints) || 0;
    const diff = achieved - needed;
    const date = formatHallDate(item.finishedAt);
    const official = tier === "official";
    const theme = getAnniversaryTheme(Number(item.number) || 0);

    return (
        <button
            type="button"
            className={css.card}
            data-hall-id={item.id}
            data-won={won}
            data-official={official || undefined}
            data-anniversary={theme ? "" : undefined}
            data-dimmed={dimmed || undefined}
            data-chosen={chosen || undefined}
            onClick={onOpen}
            style={{
                "--accent": accent.base,
                "--accent-2": accent.deep,
                "--accent-ink": accent.ink ?? "#ffffff",
                "--accent-glow": accent.glow ?? accent.base,
                ...anniversaryFrameOf(theme),
            }}
        >
            {official ? <span className={css.official_ribbon}>Official</span> : null}
            <span className={css.head} data-morph="head">
                <span className={css.head_pattern} aria-hidden="true" />
                <span className={css.head_top}>
                    <span className={css.tier} data-morph-key="tier">
                        <TournamentTierBadge tier={tier} size={15} />
                        {tierText}
                    </span>
                    {date ? <span className={css.date} data-morph-key="date">{date}</span> : null}
                </span>
                <span className={css.head_body}>
                    <span className={css.title} data-morph-key="title" data-long={`${title} ${numberText}`.length > 30}>
                        {title}
                        {numberText ? (
                            <>
                                {" "}
                                <span className={css.number} style={getTournamentNumberStyle(theme)}>
                                    {numberText}
                                </span>
                            </>
                        ) : null}
                    </span>
                    <span className={css.trophy} data-morph-key="trophy">{trophy}</span>
                </span>
                {host ? <HostBadge host={host} title={hostTitle} variant="dark" className={css.host} morphKey="host" /> : <span className={css.host_space} />}
            </span>

            <span className={css.pickem} data-won={won} data-morph="bar">
                <span className={css.pickem_icon} data-morph-key="pickem-icon">{won ? <FaCheck aria-hidden="true" /> : <FaXmark aria-hidden="true" />}</span>
                <span className={css.pickem_text}>
                    <b className={css.pickem_title} data-morph-key="pickem-title">{won ? "Pick'em won" : "Pick'em lost"}</b>
                    <span data-morph-fade="">
                        <b className={css.pickem_num}>{achieved}</b> achieved · <b className={css.pickem_num}>{needed}</b>
                        <span className={css.perk}>
                            <NeededPerkTag value={needed} cut={item.neededPerk ?? null} fallback={false} />
                        </span>{" "}
                        needed
                    </span>
                </span>
                <span className={css.pickem_diff} data-morph-key="pickem-diff">{diff > 0 ? `+${diff}` : diff}</span>
            </span>

            {champion ? (
                <span className={css.champion} data-morph-fade="" data-minor={tier === "tier2" || tier === "tier15" || undefined} data-badge={badge ? "" : undefined} style={{ "--team": champion.color }}>
                    <span className={css.champion_rays} aria-hidden="true" />
                    <span className={css.champion_name} data-len={lengthTier(champion.name)}>Team {champion.name}</span>
                    <span className={css.champion_circle} style={{ background: teamFill(champion) }} />
                    <span className={css.champion_word} style={{ textShadow: glowOf(champion.color) }}>
                        {tier === "tier2" || tier === "tier15" ? "1st place" : "Champion"}
                    </span>
                    {badge}
                </span>
            ) : null}

            {qualified ? (
                <span className={css.qualified} data-morph-fade="">
                    <span className={css.qualified_word}>{qualified.title}</span>
                    <TeamGrid teams={qualified.teams} size={qualified.teams.length > 2 ? 34 : 46} />
                    {qualified.extraTeams?.length ? (
                        <>
                            <span className={css.section_label}>{qualified.extraTitle}</span>
                            <TeamGrid teams={qualified.extraTeams} size={28} />
                        </>
                    ) : null}
                </span>
            ) : null}

            {places.length ? (
                <span className={css.places} data-morph-fade="">
                    {places.map((entry) => (
                        <PlaceRow key={entry.place} {...entry} />
                    ))}
                </span>
            ) : null}
        </button>
    );
}
