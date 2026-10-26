import { useState, useEffect, useLayoutEffect, useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, LayoutGroup } from "framer-motion";
import { FaArrowUp, FaArrowDown, FaAnglesUp, FaAnglesDown, FaBuilding, FaCircle } from "react-icons/fa6";
import css from "../SpecialModePage.module.css";
import { BracketConnectors } from "./BracketConnectors.jsx";
import { QualifierGroupNav } from "./QualifierGroupNav.jsx";
import { StickyBelow } from "./StickyBelow.jsx";
import {
    SKYLINES_FLOOR_COUNT,
    SKYLINES_ROOF,
    getSkylinesFloorName,
    getSkylinesMoves,
    getSkylinesNextFloors,
    getBestOfForSkylines,
    isSkylinesRoundFinished,
    getSkylinesNavEntries,
} from "../logic/skylines.jsx";

const WINDOW_SPRING = { type: "spring", stiffness: 140, damping: 22, mass: 0.9 };

const FLOOR_LINKS = [
    { from: "o-0", to: "w-0", toY: 0.25 },
    { from: "o-1", to: "w-0", toY: 0.75 },
];

const ROOF_LINKS = [
    { from: "sf-0", to: "gf-0", toY: 0.25 },
    { from: "sf-1", to: "gf-0", toY: 0.75 },
];

const MOVE_COLORS = { up: "#37b737", down: "#be3939", arrived: "#909090" };

const SWITCH_OPTIONS = ["official", "skylines"];

const switchLabel = (id) => (id === "skylines"
    ? <span className={css.skylines_switch_option}><FaBuilding aria-hidden="true" />Official Skylines</span>
    : "Official");

export const SkylinesSwitch = ({ value, onChange }) => (
    <QualifierGroupNav
        fixed
        value={value}
        onChange={onChange}
        groups={SWITCH_OPTIONS}
        labelOf={switchLabel}
        anchorId="skylines-switch"
    />
);

export const SkylinesFloorNav = ({ onJump }) => {
    const navRef = useRef(null);
    const [active, setActive] = useState(1);
    const [indicator, setIndicator] = useState({ top: 0, height: 0 });

    useEffect(() => {
        const update = () => {
            const line = window.innerHeight * 0.45;
            let current = 1;
            document.querySelectorAll("[data-skyline-floor]").forEach((floor) => {
                if (floor.getBoundingClientRect().top <= line) current = Number(floor.dataset.skylineFloor);
            });
            setActive(current);
        };

        update();
        window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        return () => {
            window.removeEventListener("scroll", update);
            window.removeEventListener("resize", update);
        };
    }, []);

    useLayoutEffect(() => {
        const button = navRef.current?.querySelector("[data-results-active='true']");
        if (!button) return;
        setIndicator({ top: button.offsetTop, height: button.offsetHeight });
    }, [active]);

    return (
        <nav ref={navRef} className={css.skyline_floor_nav} aria-label="Official Skylines floors">
            {Array.from({ length: SKYLINES_FLOOR_COUNT }, (_, i) => i + 1).map((floor) => (
                <button
                    key={floor}
                    type="button"
                    data-results-active={active === floor}
                    onClick={() => onJump(floor)}
                    className={`${css.resultsNavigationButton} ${active === floor ? css.resultsNavigationButtonActive : ""} ${floor === 1 ? css.skyline_floor_nav_penthouse : ""}`}
                >
                    {getSkylinesFloorName(floor)}
                </button>
            ))}
            <motion.div
                className={`${css.resultsNavigationIndicator} ${css.skyline_floor_nav_indicator} ${active === 1 ? css.skyline_floor_nav_indicator_gold : ""}`}
                initial={false}
                animate={{ top: indicator.top, height: indicator.height }}
                transition={{ type: "tween", duration: 0.25, ease: "easeInOut" }}
            />
        </nav>
    );
};

const MoveIcon = ({ delta, ...iconProps }) => {
    const Icon = delta > 1 ? FaAnglesUp : delta > 0 ? FaArrowUp : delta < -1 ? FaAnglesDown : FaArrowDown;
    return <Icon {...iconProps} />;
};

const floorsText = (delta) => (Math.abs(delta) === 1 ? "1 Floor" : `${Math.abs(delta)} Floors`);

const MoveBadge = ({ delta, arrived = false }) => (
    <div
        className={`${css.playoffsSuccessPickemIndicator} ${css.skyline_move_badge}`}
        title={arrived
            ? `Came ${delta > 0 ? "up" : "down"} ${floorsText(delta)}`
            : `Takes the elevator ${delta > 0 ? "up" : "down"} ${floorsText(delta)}`}
    >
        <FaCircle size={24} color={arrived ? MOVE_COLORS.arrived : delta > 0 ? MOVE_COLORS.up : MOVE_COLORS.down} />
        <MoveIcon delta={delta} size={12} color="#ffffff" />
    </div>
);

const FloorPlate = ({ floor, lit }) => (
    <div className={`${css.skyline_plate} ${floor === 1 ? css.skyline_plate_penthouse : ""} ${lit ? css.skyline_plate_lit : ""}`}>
        <span className={css.skyline_plate_number}>{floor === 1 ? "PH" : floor === SKYLINES_FLOOR_COUNT ? "G" : floor}</span>
        <span className={css.skyline_plate_name}>{getSkylinesFloorName(floor)}</span>
        <span className={css.skyline_plate_bo}>BO{getBestOfForSkylines("o", floor)}</span>
    </div>
);

const TeamWindow = ({ team, seed, move, arrival, lit }) => (
    <div className={`${css.skyline_window} ${lit ? css.skyline_window_lit : ""}`}>
        <span className={css.skyline_window_seed}>#{seed}</span>
        {team ? (
            <motion.div
                layoutId={`skyline-team-${team.id}`}
                transition={WINDOW_SPRING}
                className={css.skyline_window_team}
                style={{ background: team.color, transition: "none" }}
                title={`Team ${team.name}`}
            />
        ) : (
            <div className={css.skyline_window_empty}>?</div>
        )}
        <span className={css.skyline_window_name}>{team?.name ? `Team ${team.name}` : "TBD"}</span>
        {move ? <MoveBadge delta={move} /> : arrival ? <MoveBadge delta={arrival} arrived /> : null}
    </div>
);

const BracketColumn = ({ title, children }) => (
    <div className={css.column_container} style={{ width: 170, transition: "none" }}>
        <h4 className={`${css.column_title} ${css.qualifier_column_title} ${css.skyline_column_title}`}>{title}</h4>
        <div className={css.columnRo16} style={{ width: "100%", transition: "none" }}>
            {children}
        </div>
    </div>
);

const FloorBracket = ({ floorRound, renderMatch }) => (
    <div className={css.skyline_bracket}>
        <BracketConnectors links={FLOOR_LINKS} />
        <BracketColumn title="Opening">
            {floorRound.o.map((match, idx) => renderMatch(floorRound, match, "o", idx))}
        </BracketColumn>
        <BracketColumn title="Winners' Match">
            {renderMatch(floorRound, floorRound.w[0], "w", 0)}
        </BracketColumn>
        <BracketColumn title="Losers' Match">
            {renderMatch(floorRound, floorRound.l[0], "l", 0)}
        </BracketColumn>
    </div>
);

const RoofBracket = ({ rooftop, renderRoofMatch }) => (
    <div className={css.skyline_bracket}>
        <BracketConnectors links={ROOF_LINKS} />
        <BracketColumn title="Semifinals">
            {rooftop.sf.map((match, idx) => renderRoofMatch(rooftop, match, "sf", idx))}
        </BracketColumn>
        <BracketColumn title="Grand Final">
            {renderRoofMatch(rooftop, rooftop.gf[0], "gf", 0)}
        </BracketColumn>
        <BracketColumn title="Third Place Decider">
            {renderRoofMatch(rooftop, rooftop.thirdPlace[0], "thirdPlace", 0)}
        </BracketColumn>
    </div>
);

const ShaftCar = ({ team, delta }) => (
    <div className={`${css.skyline_shaft_car} ${delta > 0 ? css.skyline_shaft_car_up : css.skyline_shaft_car_down}`} title={`Team ${team.name} goes ${delta > 0 ? "up" : "down"} ${floorsText(delta)}`}>
        <span className={css.skyline_shaft_dot} style={{ background: team.color }} />
        <span className={css.skyline_shaft_arrow} style={{ background: delta > 0 ? MOVE_COLORS.up : MOVE_COLORS.down }}>
            <MoveIcon delta={delta} size={10} />
        </span>
    </div>
);

const Shaft = ({ cars }) => (
    <div className={css.skyline_shaft}>
        <span className={css.skyline_shaft_rail} aria-hidden="true" />
        <div className={css.skyline_shaft_group}>
            {cars.filter((car) => car.delta > 0).sort((a, b) => b.delta - a.delta).map((car) => <ShaftCar key={car.team.id} {...car} />)}
        </div>
        <div className={`${css.skyline_shaft_group} ${css.skyline_shaft_group_down}`}>
            {cars.filter((car) => car.delta < 0).sort((a, b) => b.delta - a.delta).map((car) => <ShaftCar key={car.team.id} {...car} />)}
        </div>
    </div>
);

export const SkylinesBuilding = ({ skylines, roundView, currentMatchId, renderMatch, renderRoofMatch }) => {
    const isRoof = roundView === SKYLINES_ROOF;
    const lastRoundIndex = (skylines?.rounds?.length ?? 1) - 1;
    const roundIndex = isRoof ? lastRoundIndex : Math.min(roundView ?? lastRoundIndex, lastRoundIndex);
    const round = skylines?.rounds?.[roundIndex];
    const roundDone = isSkylinesRoundFinished(round);
    const moves = roundDone ? getSkylinesMoves(round) : {};
    const previous = roundIndex > 0 ? skylines.rounds[roundIndex - 1] : null;
    const arrivals = previous ? getSkylinesMoves(previous) : {};
    const floorsTeams = isRoof && roundDone ? getSkylinesNextFloors(round) : round?.floors.map((f) => f.teams);
    const rooftop = skylines?.rooftop;
    const roofLit = isRoof && !!currentMatchId && !!rooftop && ["sf", "thirdPlace", "gf"].some((stage) => rooftop[stage].some((m) => m.id === currentMatchId));

    if (!round) return null;

    return (
        <div className={css.skyline_scene}>
            <div className={css.skyline_crown}>
                <div className={css.skyline_antenna} aria-hidden="true"><span /></div>
                <div className={css.skyline_railing} aria-hidden="true" />
                <div className={`${css.skyline_roof} ${isRoof && rooftop ? css.skyline_roof_open : ""} ${roofLit ? css.skyline_roof_lit : ""}`}>
                    <span className={css.skyline_roof_sign}>Rooftop Final</span>
                    {isRoof && rooftop ? (
                        <RoofBracket rooftop={rooftop} renderRoofMatch={renderRoofMatch} />
                    ) : (
                        <span className={css.skyline_roof_hint}>
                            After Round 4, the 4 teams of the Penthouse climb up here and play for the title.
                        </span>
                    )}
                </div>
            </div>

            <LayoutGroup id="skylines-tower">
                <div className={css.skyline_tower}>
                    {(floorsTeams || []).map((teams, i) => {
                        const floor = i + 1;
                        const floorRound = round.floors[i];
                        const lit = !isRoof && !!currentMatchId && [...floorRound.o, ...floorRound.w, ...floorRound.l].some((m) => m.id === currentMatchId);
                        const cars = isRoof ? [] : teams.filter((team) => moves[team?.id]).map((team) => ({ team, delta: moves[team.id] }));

                        return (
                            <section
                                key={floor}
                                className={`${css.skyline_floor} ${floor === 1 ? css.skyline_floor_penthouse : ""} ${floor === SKYLINES_FLOOR_COUNT ? css.skyline_floor_ground : ""} ${lit ? css.skyline_floor_lit : ""}`}
                                data-skyline-floor={floor}
                            >
                                <span className={css.skyline_ledge} aria-hidden="true" />
                                <FloorPlate floor={floor} lit={lit} />
                                <div className={css.skyline_windows}>
                                    {teams.map((team, seed) => (
                                        <TeamWindow
                                            key={team?.id ?? `empty-${seed}`}
                                            team={team}
                                            seed={seed + 1}
                                            move={isRoof ? null : moves[team?.id] ?? null}
                                            arrival={isRoof || roundDone ? null : arrivals[team?.id] ?? null}
                                            lit={lit}
                                        />
                                    ))}
                                </div>
                                {isRoof ? (
                                    <div className={css.skyline_floor_final}>
                                        {floor === 1 ? "Climbed up to the Rooftop Final" : "Final position after Round 4"}
                                    </div>
                                ) : (
                                    <FloorBracket floorRound={floorRound} renderMatch={renderMatch} />
                                )}
                                <Shaft cars={cars} />
                            </section>
                        );
                    })}
                </div>
            </LayoutGroup>

            <div className={css.skyline_lobby} aria-hidden="true">
                <span className={css.skyline_lobby_window} />
                <span className={css.skyline_door} />
                <span className={css.skyline_lobby_window} />
            </div>
            <div className={css.skyline_steps} aria-hidden="true" />
        </div>
    );
};

export const SkylinesRoundNav = ({ skylines, value, onChange }) => {
    const entries = getSkylinesNavEntries(skylines);
    const labels = Object.fromEntries(entries.map((entry) => [entry.id, entry.label]));

    return (
        <QualifierGroupNav
            value={value}
            onChange={onChange}
            groups={entries.map((entry) => entry.id)}
            labelOf={(id) => labels[id]}
        />
    );
};

export const SkylinesHallSummary = ({ skylines, renderBuilding, anchor }) => {
    const [roundView, setRoundView] = useState(skylines?.rooftop ? SKYLINES_ROOF : 0);

    return (
        <div className={css.skylines_hall}>
            <StickyBelow anchor={anchor} style={{ width: "calc(100% + 12vw)", margin: "0 -6vw", paddingTop: 6 }}>
                <SkylinesRoundNav skylines={skylines} value={roundView} onChange={setRoundView} />
            </StickyBelow>
            {renderBuilding(roundView)}
        </div>
    );
};
