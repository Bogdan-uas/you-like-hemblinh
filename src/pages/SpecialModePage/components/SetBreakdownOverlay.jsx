import { useMemo, useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import css from "../SpecialModePage.module.css";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FaCheck, FaXmark, FaCircle } from "react-icons/fa6";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import Lenis from "lenis";
import { BreakdownSectionTitle, BreakdownDivider, BreakdownScoreRow } from "./BreakdownParts.jsx";
import { BREAKDOWN_OT_NAMES, BREAKDOWN_GLOW, BREAKDOWN_OT_SHORT } from "../logic/breakdownStyles.js";
import { PENALTY_DISPLAY_CIRCLES } from "../logic/gameConstants.js";
import { buildExtendedRoundWinnerList } from "../logic/series.js";
import { BREAKDOWN_HIDDEN_LS_KEY } from "../logic/storageKeys.js";

export const SetBreakdownOverlay = ({
    sets,
    index,
    onIndexChange,
    onClose,
    leftTeam,
    rightTeam,
    bestOf,
    stageLabel,
    matchTitle,
    matchNumber,
    isPlayoffs = false,
    pointLabelText = "MATCH POINT!!!",
}) => {
    const isBo1 = bestOf === 1;
    const entry = sets?.[index] ?? null;

    const scrollRef = useRef(null);
    const lenisRef = useRef(null);
    const contentRef = useRef(null);
    const sectionRefs = useRef({});
    const modalRef = useRef(null);
    const [activeSection, setActiveSection] = useState(null);
    const [fullModalHeight, setFullModalHeight] = useState(300);

    useEffect(() => {
        if (!scrollRef.current || !contentRef.current) return;

        const lenis = new Lenis({
            wrapper: scrollRef.current,
            content: contentRef.current,
            duration: 1.8,
            smoothWheel: true,
        });

        lenisRef.current = lenis;

        let rafId;

        const raf = (time) => {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        };

        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
            lenisRef.current = null;
        };
    }, []);

    const [isModalHidden, setIsModalHidden] = useState(() => {
        try {
            return localStorage.getItem(BREAKDOWN_HIDDEN_LS_KEY) === "1";
        } catch {
            return false;
        }
    });

    const toggleModalHidden = () => {
        setIsModalHidden((prev) => {
            const next = !prev;
            try {
                localStorage.setItem(BREAKDOWN_HIDDEN_LS_KEY, next ? "1" : "0");
            } catch {
                /* ignore */
            }
            return next;
        });
    };

    const navRef = useRef(null);

    const [indicator, setIndicator] = useState({
        top: 0,
        height: 0,
    });

    const plan = useMemo(() => {
        if (!entry) return null;

        const log = Array.isArray(entry.roundLog) ? entry.roundLog : [];

        const firstHalf = log.filter((r) => r.part === "firstHalf");
        const secondHalf = log.filter((r) => r.part === "secondHalf");

        const otMap = new Map();
        log
            .filter((r) => typeof r.part === "string" && r.part.startsWith("ot"))
            .forEach((r) => {
                const block = r.overtimeBlock ?? Number(String(r.part).slice(2));
                if (!otMap.has(block)) otMap.set(block, []);
                otMap.get(block).push(r);
            });

        const overtimes = [...otMap.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([block, rounds]) => ({ block, rounds }));

        const extendedRounds = entry.extendedRounds ?? {
            firstHalf: null,
            secondHalf: null,
            overtimes: [],
        };

        const extWinners = buildExtendedRoundWinnerList(extendedRounds).filter(
            (x) => x.winner
        );

        const isATie = entry.wins === entry.losses;
        const isTrueTie = !!entry.tie;
        const hasExtended = isATie && !isTrueTie && extWinners.length > 0;
        const penalties = extendedRounds.penalties ?? null;

        let extLeft = 0;
        let extRight = 0;
        extWinners.forEach((w) => {
            if (w.winner === "left") extLeft += 1;
            else extRight += 1;
        });

        const tieDecidedBy = isATie && !isTrueTie
            ? penalties
                ? "penalties"
                : extWinners.length
                    ? "extended"
                    : null
            : null;

        const tieLeftScore = penalties ? (penalties.leftScore ?? 0) : extLeft;
        const tieRightScore = penalties ? (penalties.rightScore ?? 0) : extRight;

        const sections = [];
        if (firstHalf.length) sections.push({ id: "firstHalf", label: "1st Half" });
        if (secondHalf.length) sections.push({ id: "secondHalf", label: "2nd Half" });
        overtimes.forEach(({ block }) =>
            sections.push({
                id: `ot${block}`,
                label: BREAKDOWN_OT_SHORT[block] ?? `${block}x OT`,
            })
        );
        if (hasExtended) sections.push({ id: "extended", label: "Extended Rounds" });
        if (penalties) sections.push({ id: "penalties", label: "Pens" });

        const lastLogged = log.length ? log[log.length - 1] : null;

        return {
            firstHalf,
            secondHalf,
            overtimes,
            extWinners,
            hasExtended,
            penalties,
            sections,
            lastLogged,
            isATie,
            tieDecidedBy,
            tieLeftScore,
            tieRightScore,
        };
    }, [entry]);

    const updateIndicator = useCallback(() => {
        if (!navRef.current) return;

        const active = navRef.current.querySelector(
            "[data-breakdown-active='true']"
        );

        if (!active) {
            setIndicator({
                top: 0,
                height: 0,
            });
            return;
        }

        const rect = active.getBoundingClientRect();
        const parent = navRef.current.getBoundingClientRect();

        setIndicator({
            top: rect.top - parent.top,
            height: rect.height,
        });
    }, []);

    useLayoutEffect(() => {
        requestAnimationFrame(updateIndicator);
    }, [activeSection, plan, updateIndicator]);

    useEffect(() => {
        const handleResize = () => updateIndicator();

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [updateIndicator]);

    const setsWonByLeft = useMemo(
        () =>
            (sets ?? [])
                .slice(0, index + 1)
                .filter((s) => s.won).length,
        [sets, index]
    );

    const setLinesTotal = Math.max(1, Math.ceil(bestOf / 2));
    const setsToWin = Math.max(1, Math.ceil(bestOf / 2));
    const leftSetsAfter = setsWonByLeft;
    const rightSetsAfter = (sets ?? []).slice(0, index + 1).filter((s) => !s.won && !s.tie).length;

    const setsWonByLeftBefore = useMemo(
        () => (sets ?? []).slice(0, index).filter((s) => s.won).length,
        [sets, index]
    );
    const setsWonByRightBefore = Math.max(0, index - setsWonByLeftBefore);

    useLayoutEffect(() => {
        const node = modalRef.current;
        if (!node) return;

        const measure = () => {
            const height = node.offsetHeight || 300;

            if (!isModalHidden) {
                setFullModalHeight(height);
            }
        };

        measure();

        const id = setTimeout(measure, 0);

        window.addEventListener("resize", measure);

        return () => {
            clearTimeout(id);
            window.removeEventListener("resize", measure);
        };
    }, [index, entry, isModalHidden]);

    const updateActiveSection = useCallback(() => {
        const container = scrollRef.current;
        if (!container || !plan) return;

        let current = plan.sections[0]?.id ?? null;
        const threshold = fullModalHeight + 100;

        plan.sections.forEach((section) => {
            const node = sectionRefs.current[section.id];
            if (!node) return;
            if (node.offsetTop - container.scrollTop <= threshold) {
                current = section.id;
            }
        });

        setActiveSection(current);
    }, [plan, fullModalHeight]);

    useEffect(() => {
        if (!lenisRef.current) return;

        lenisRef.current.scrollTo(0, {
            immediate: true,
            easing: (t) =>
                t < 0.5
                    ? 4 * t * t * t
                    : 1 - Math.pow(-2 * t + 2, 3) / 2,
        });
    }, [index]);

    useEffect(() => {
        requestAnimationFrame(() => updateActiveSection());
    }, [updateActiveSection]);

    const totalPickemPoints = useMemo(() => {
        let leftSets = 0;
        let rightSets = 0;
        let points = 0;

        for (let i = 0; i <= index; i++) {
            const set = sets[i];

            if (!set.won) continue;

            if (set.winner === "left") {
                leftSets++;
            } else {
                rightSets++;
            }

            const clinched =
                leftSets === setsToWin ||
                rightSets === setsToWin;

            points += clinched ? 1 : 2;
        }

        return points;
    }, [sets, index, setsToWin]);

    const scrollToSection = (id) => {
        const container = scrollRef.current;
        const node = sectionRefs.current[id];
        if (!container || !node) return;
        lenisRef.current?.scrollTo(
            Math.max(0, node.offsetTop - fullModalHeight - 60), {
            duration: 1.8,
            easing: (t) =>
                t < 0.5
                    ? 4 * t * t * t
                    : 1 - Math.pow(-2 * t + 2, 3) / 2,
        }
        );
    };

    if (!entry || !plan) return null;

    const won = !!entry.won;
    const isTieSet = !!entry.tie;
    const background = won ? "linear-gradient(180deg,#b8ffd7 0%,#ffffff 120%)" : "linear-gradient(180deg, #ffbfbf 0%, #ffffff 120%)";
    const tieDecided = !!plan.tieDecidedBy;
    const tieWinner = plan.tieLeftScore > plan.tieRightScore ? "left" : plan.tieRightScore > plan.tieLeftScore ? "right" : null;

    const setLabel = index + 1 === bestOf ? "Decider" : `Set ${index + 1}`;

    const isClinchingSet =
        (won && leftSetsAfter === setsToWin) ||
        (!won && rightSetsAfter === setsToWin);

    const isFinalSet = index === (sets?.length ?? 0) - 1;

    const roundsPlayed = (entry.wins ?? 0) + (entry.losses ?? 0);
    const roundsLabel =
        roundsPlayed % 10 === 1 && roundsPlayed % 100 !== 11
            ? "Round"
            : "Rounds";

    const penaltyView = plan.penalties
        ? (() => {
            const leftResults = plan.penalties.leftResults ?? [];
            const rightResults = plan.penalties.rightResults ?? [];
            const completedSuddenDeathPairs = Math.min(
                Math.max(0, leftResults.length - 5),
                Math.max(0, rightResults.length - 5)
            );

            return {
                leftResults,
                rightResults,
                attemptsToDisplay:
                    PENALTY_DISPLAY_CIRCLES + completedSuddenDeathPairs,
                resolved: plan.penalties.penaltyResolved ?? true,
            };
        })()
        : null;

    const loserSideOpacity = (loserSetsBefore) =>
        loserSetsBefore + 1 >= setsToWin ? 0.4 : 0.7;

    const decisiveOpacities = (leftWins) => {
        if (leftWins) {
            return { leftOpacity: 1, rightOpacity: loserSideOpacity(setsWonByRightBefore) };
        }
        return { leftOpacity: loserSideOpacity(setsWonByLeftBefore), rightOpacity: 1 };
    };

    const renderRound = (round, key) => {
        const isDecisive =
            !tieDecided &&
            plan.lastLogged &&
            round.key === plan.lastLogged.key;

        const isFinalSet = index === (sets?.length ?? 0) - 1;

        const isMatchDecidingRound =
            isFinalSet &&
            isDecisive &&
            !plan.hasExtended &&
            !plan.penalties;

        const isLastRoundOfSet =
            !!plan.lastLogged && round.key === plan.lastLogged.key;

        const threshold = 12 + 3 * (round.overtimeBlock ?? 0);
        const leftAtPoint =
            round.scoreLeft === threshold && round.scoreRight < threshold;
        const rightAtPoint =
            round.scoreRight === threshold && round.scoreLeft < threshold;

        const leftLabel = leftAtPoint
            ? setsWonByLeftBefore === setsToWin - 1
                ? pointLabelText
                : "Set point!"
            : "";
        const rightLabel = rightAtPoint
            ? setsWonByRightBefore === setsToWin - 1
                ? pointLabelText
                : "Set point!"
            : "";

        const opacities = isDecisive && !isTieSet
            ? decisiveOpacities(!!won)
            : { leftOpacity: 1, rightOpacity: 1 };

        return (
            <div
                key={key}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "2px",
                    marginTop: "48px",
                }}
            >
                <div
                    style={{
                        position: "relative",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <span
                        className={css.info_text}
                        style={{
                            fontSize: "15px",
                            color: "#555",
                            fontWeight: 600,
                        }}
                    >
                        Round {round.roundNumber}
                    </span>

                    {round.winner === "left" && (
                        <div
                            style={{
                                position: "absolute",
                                left: -32,
                                width: "14px",
                                height: "14px",
                                borderRadius: "50%",
                                marginTop: "-2px",
                                backgroundColor: "#54CC54",
                                boxShadow: BREAKDOWN_GLOW("#54CC54"),
                            }}
                        />
                    )}

                    {round.winner === "right" && (
                        <div
                            style={{
                                position: "absolute",
                                right: -32,
                                width: "14px",
                                height: "14px",
                                borderRadius: "50%",
                                marginTop: "-2px",
                                backgroundColor: "#54CC54",
                                boxShadow: BREAKDOWN_GLOW("#54CC54"),
                            }}
                        />
                    )}
                </div>

                <BreakdownScoreRow
                    leftTeam={leftTeam}
                    rightTeam={rightTeam}
                    leftScore={round.scoreLeft}
                    rightScore={round.scoreRight}
                    scoreSize={44}
                    scoreWidth={49}
                    squaresTotal={round.squares}
                    leftSquares={round.miniLeft}
                    rightSquares={round.miniRight}
                    setLinesTotal={isDecisive ? setLinesTotal : 0}
                    leftSets={leftSetsAfter}
                    rightSets={rightSetsAfter}
                    leftGlow={isDecisive && won && !isTieSet}
                    rightGlow={isDecisive && !won && !isTieSet}
                    isPlayoffs={isPlayoffs}
                    showLabels
                    leftLabel={leftLabel}
                    rightLabel={rightLabel}
                    leftMomentumStreak={!isLastRoundOfSet && round.momentumSide === "left" ? round.momentumValue : null}
                    rightMomentumStreak={!isLastRoundOfSet && round.momentumSide === "right" ? round.momentumValue : null}
                    ggBanner={
                        isMatchDecidingRound
                            ? isTieSet ? { tie: true } : { team: won ? leftTeam : rightTeam }
                            : null
                    }
                    {...opacities}
                />
            </div>
        );
    };

    const tieOpacities =
        tieWinner === "left"
            ? {
                leftOpacity: 1,
                rightOpacity: loserSideOpacity(setsWonByRightBefore),
            }
            : tieWinner === "right"
                ? {
                    leftOpacity: loserSideOpacity(setsWonByLeftBefore),
                    rightOpacity: 1,
                }
                : {
                    leftOpacity: 1,
                    rightOpacity: 1,
                };

    const arrowStyle = (disabled) => ({
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        padding: 0,
        opacity: disabled ? 0.35 : 1,
        cursor: disabled ? "default" : "pointer",
        pointerEvents: disabled ? "none" : "auto",
        zIndex: 3,
    });

    return (
        <>
            <motion.div
                ref={scrollRef}
                onScroll={updateActiveSection}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "#ffffff",
                    overflowY: "auto",
                    zIndex: 80,
                }}
            >
                {plan.sections.length > 1 && (
                    <div
                        ref={navRef}
                        className={css.infoNavigation}
                    >
                        {plan.sections.map((section) => (
                            <button
                                key={section.id}
                                data-breakdown-active={activeSection === section.id}
                                type="button"
                                onClick={() => scrollToSection(section.id)}
                                className={`${css.resultsNavigationButton} ${activeSection === section.id
                                    ? css.resultsNavigationButtonActive
                                    : ""
                                    }`}
                            >
                                {section.label}
                            </button>
                        ))}
                        <motion.div
                            className={css.resultsNavigationIndicator}
                            initial={false}
                            animate={{
                                top: indicator.top,
                                height: indicator.height,
                            }}
                            transition={{
                                duration: 0.22,
                                ease: "easeInOut",
                            }}
                        />
                    </div>
                )}

                <div
                    ref={contentRef}
                    style={{
                        paddingTop: `${fullModalHeight + 60}px`,
                        paddingBottom: "80px",
                        textAlign: "center",
                    }}
                >
                    {plan.firstHalf.length > 0 && (
                        <div ref={(node) => { sectionRefs.current.firstHalf = node; }}>
                            <hr style={{ width: "600px", margin: "0 auto" }} className={css.dashed_divider} />
                            <div style={{ marginTop: "24px" }}>
                                <BreakdownSectionTitle text="First Half" marginTop="0px" />
                            </div>
                            {plan.firstHalf.map((round, i) => renderRound(round, `fh-${i}`))}
                        </div>
                    )}

                    {plan.secondHalf.length > 0 && (
                        <div ref={(node) => { sectionRefs.current.secondHalf = node; }}>
                            <BreakdownDivider from="First Half" to="Second Half" />
                            {plan.secondHalf.map((round, i) => renderRound(round, `sh-${i}`))}
                        </div>
                    )}

                    {plan.overtimes.map(({ block, rounds }, i) => {
                        const previousLabel =
                            i === 0
                                ? "Second Half"
                                : BREAKDOWN_OT_NAMES[plan.overtimes[i - 1].block] ??
                                `${plan.overtimes[i - 1].block}x Overtime`;

                        const label = BREAKDOWN_OT_NAMES[block] ?? `${block}x Overtime`;

                        return (
                            <div
                                key={`ot-${block}`}
                                ref={(node) => { sectionRefs.current[`ot${block}`] = node; }}
                            >
                                <BreakdownDivider from={previousLabel} to={label} />
                                {rounds.map((round, j) => renderRound(round, `ot-${block}-${j}`))}
                            </div>
                        );
                    })}

                    {plan.hasExtended && (
                        <div ref={(node) => { sectionRefs.current.extended = node; }}>
                            <BreakdownDivider
                                from={
                                    plan.overtimes.length
                                        ? BREAKDOWN_OT_NAMES[
                                        plan.overtimes[plan.overtimes.length - 1].block
                                        ] ?? "Overtime"
                                        : "Second Half"
                                }
                                to="Extended Rounds"
                            />

                            {(() => {
                                let left = 0;
                                let right = 0;

                                return plan.extWinners.map((item, i) => {
                                    if (item.winner === "left") left += 1;
                                    else right += 1;

                                    const winnerTeam =
                                        item.winner === "left" ? leftTeam : rightTeam;

                                    const extDecisive =
                                        plan.tieDecidedBy === "extended" &&
                                        i === plan.extWinners.length - 1;

                                    const isFinalSet = index === (sets?.length ?? 0) - 1;

                                    const isMatchDecidingExtendedRound =
                                        isFinalSet && extDecisive;

                                    return (
                                        <div
                                            key={`ext-${i}`}
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                gap: "2px",
                                                marginTop: "14px",
                                            }}
                                        >
                                            <span
                                                className={css.info_text}
                                                style={{ fontSize: "15px", color: "#555", fontWeight: 600 }}
                                            >
                                                {item.label} Extended Round winner is{" "}
                                                <span style={{ color: winnerTeam?.color, fontWeight: 900 }}>
                                                    Team {winnerTeam?.name}
                                                </span>
                                            </span>

                                            <BreakdownScoreRow
                                                leftTeam={leftTeam}
                                                rightTeam={rightTeam}
                                                leftScore={left}
                                                rightScore={right}
                                                scoreSize={44}
                                                scoreWidth={49}
                                                center="text"
                                                centerText="VS"
                                                centerColor="#2e2f42"
                                                isPlayoffs={isPlayoffs}
                                                setLinesTotal={extDecisive ? setLinesTotal : 0}
                                                leftSets={leftSetsAfter}
                                                rightSets={rightSetsAfter}
                                                leftGlow={extDecisive && won}
                                                rightGlow={extDecisive && !won}
                                                ggBanner={
                                                    isMatchDecidingExtendedRound
                                                        ? { team: won ? leftTeam : rightTeam }
                                                        : null
                                                }
                                                {...(extDecisive
                                                    ? decisiveOpacities(!!won)
                                                    : { leftOpacity: 1, rightOpacity: 1 })}
                                            />
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    )}

                    {plan.penalties && (
                        <div ref={(node) => { sectionRefs.current.penalties = node; }}>
                            <BreakdownDivider
                                from="Extended Rounds"
                                to="Penalties"
                            />

                            {(() => {
                                const leftScore = plan.penalties.leftScore ?? 0;
                                const rightScore = plan.penalties.rightScore ?? 0;
                                const leftWon = leftScore > rightScore;

                                return (
                                    <div style={{ marginTop: "14px" }}>
                                        <BreakdownScoreRow
                                            leftTeam={leftTeam}
                                            rightTeam={rightTeam}
                                            leftScore={leftScore}
                                            rightScore={rightScore}
                                            scoreSize={44}
                                            scoreWidth={49}
                                            center="text"
                                            centerText="VS"
                                            centerColor="#2e2f42"
                                            isPlayoffs={isPlayoffs}
                                            penalties={penaltyView}
                                            setLinesTotal={setLinesTotal}
                                            leftSets={leftSetsAfter}
                                            rightSets={rightSetsAfter}
                                            leftGlow={leftWon}
                                            rightGlow={!leftWon}
                                            ggBanner={
                                                isFinalSet
                                                    ? { team: leftWon ? leftTeam : rightTeam }
                                                    : null
                                            }
                                            {...decisiveOpacities(leftWon)}
                                        />
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>
            </motion.div>
            <motion.div
                ref={modalRef}
                className={css.restart_modal}
                initial={{ opacity: 0, x: "-50%", y: -120 }}
                animate={{ opacity: 1, x: "-50%", y: 0 }}
                exit={{ opacity: 0, x: "-50%", y: -100 }}
                transition={{ type: "spring", stiffness: 240, damping: 22, duration: 3 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: "fixed",
                    top: isPlayoffs && isModalHidden ? "124px" : isModalHidden ? "112px" : isBo1 ? "174px" : "198px",
                    left: "50%",
                    transform: "none",
                    width: "620px",
                    maxWidth: "92vw",
                    background,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    transformOrigin: "top",
                    padding: isModalHidden ? "16px 56px 14px" : "20px 56px 22px",
                    zIndex: 81,
                    border: won ? "2px solid #006a32" : "2px solid rgb(188, 108, 108)",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        top: "-16.5px",
                        left: "-16.5px",
                        display: "flex",
                        alignItems: "center",
                        color: won ? "#1f9d55" : "#c62828",
                        zIndex: 3,
                    }}
                >
                    {won ? (
                        <div
                            className={css.modalSuccessPickemIndicator}
                        >
                            <FaCircle size={32} color="#37b737" />
                            <FaCheck size={20} color="#ffffff" />
                        </div>
                    ) : (
                        <div
                            className={css.modalSuccessPickemIndicator}
                        >
                            <FaCircle size={32} color="#be3939" />
                            <FaXmark size={20} color="#fff" />
                        </div>
                    )}
                </div>

                {!isBo1 && (
                    <>
                        <button
                            type="button"
                            aria-label="Previous set"
                            disabled={index <= 0}
                            onClick={() => index > 0 && onIndexChange(index - 1)}
                            style={{ ...arrowStyle(index <= 0), left: "10px" }}
                            className={css.arrowToAnotherSet}
                        >
                            <IoIosArrowBack size={34} />
                        </button>

                        <button
                            type="button"
                            aria-label="Next set"
                            disabled={index >= sets.length - 1}
                            onClick={() => index < sets.length - 1 && onIndexChange(index + 1)}
                            style={{ ...arrowStyle(index >= sets.length - 1), right: "10px" }}
                            className={css.arrowToAnotherSet}
                        >
                            <IoIosArrowForward size={34} />
                        </button>
                    </>
                )}

                {!isModalHidden && (
                    <div className={css.match_modal_header} style={{ marginBottom: "6px" }}>
                        {stageLabel ? (
                            <span
                                className={css.match_modal_title}
                                style={{ fontSize: "16px", marginBottom: "-8px", color: "#ffffff" }}
                            >
                                {stageLabel}
                            </span>
                        ) : null}

                        <h3 className={css.match_modal_title} style={{ margin: 0, color: "#ffffff" }}>
                            {matchTitle}
                            {matchNumber ? (
                                <div
                                    className={css.points}
                                    style={{ marginLeft: "2px", marginTop: "-2px", padding: "4px 8px", color: "#ffffff", backgroundColor: won ? "#2e7d32" : "#7d2e2e" }}
                                >
                                    #{matchNumber}
                                </div>
                            ) : null}
                        </h3>

                        <span
                            className={css.match_modal_title}
                            style={{ margin: 0, fontSize: "18px", marginTop: "-6px", color: "#ffffff" }}
                        >
                            Best of {bestOf}
                        </span>

                        {!isBo1 && (
                            <span
                                className={css.match_modal_title}
                                style={{ margin: 0, fontSize: "24px", marginTop: "-4px", color: "#ffffff" }}
                            >
                                {setLabel}
                            </span>
                        )}

                        {isClinchingSet && !isBo1 && (
                            <span
                                className={css.match_modal_pickem_total}
                                style={{
                                    left: isPlayoffs ? "85%" : "74%",
                                }}
                            >
                                +{totalPickemPoints} Pick&apos;em point{totalPickemPoints !== 1 ? "s" : ""}
                            </span>
                        )}
                        <span
                            className={css.match_modal_pickem}
                            style={{
                                color: won ? "#2e7d32" : "red",
                                left: isPlayoffs ? "85%" : "75%",
                            }}
                        >
                            {won
                                ? (isClinchingSet ? "+1 Pick'em point" : "+2 Pick'em points")
                                : "+0 Pick'em points"}
                        </span>
                    </div>
                )}

                <div style={{ marginTop: isModalHidden ? "0px" : "10px" }}>
                    <BreakdownScoreRow
                        leftTeam={leftTeam}
                        rightTeam={rightTeam}
                        leftScore={entry.wins}
                        rightScore={entry.losses}
                        scoreSize={44}
                        scoreWidth={49}
                        center="text"
                        centerText={`${roundsPlayed} ${roundsLabel}`}
                        centerColor="#ffffff"
                        isPlayoffs={isPlayoffs}
                        setLinesTotal={setLinesTotal}
                        leftSets={leftSetsAfter}
                        rightSets={rightSetsAfter}
                        leftGlow={won && !isTieSet}
                        rightGlow={!won && !isTieSet}
                        isInModal={true}
                        isModalHidden={isModalHidden}
                        {...(isTieSet ? { leftOpacity: 1, rightOpacity: 1 } : decisiveOpacities(!!won))}
                    />
                </div>

                {tieDecided ? (
                    <div
                        className={css.info_text}
                        style={{
                            marginTop: "6px",
                            fontSize: "15px",
                            fontWeight: 700,
                            color: "#555",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                        }}
                    >
                        <span
                            style={{
                                color: leftTeam?.color,
                                fontWeight: 700,
                                marginRight: "28px",
                                textShadow:
                                    tieWinner === "left"
                                        ? BREAKDOWN_GLOW(leftTeam?.color)
                                        : "none",
                                opacity: tieOpacities.leftOpacity,
                                transition: "opacity 400ms ease",
                            }}
                        >
                            {plan.tieLeftScore}
                        </span>
                        <button
                            type="button"
                            onClick={() => scrollToSection(plan.tieDecidedBy)}
                            className={css.link_button}
                            style={{
                                pointerEvents:
                                    activeSection === "penalties" ||
                                        activeSection === "extended"
                                        ? "none"
                                        : "auto",
                                cursor:
                                    activeSection === "penalties" ||
                                        activeSection === "extended"
                                        ? "default"
                                        : "pointer",
                            }}
                        >
                            {plan.tieDecidedBy === "penalties"
                                ? "Penalties"
                                : "Extended Rounds"}
                        </button>
                        <span
                            style={{
                                color: rightTeam?.color,
                                fontWeight: 700,
                                marginLeft: "28px",
                                textShadow:
                                    tieWinner === "right"
                                        ? BREAKDOWN_GLOW(rightTeam?.color)
                                        : "none",
                                opacity: tieOpacities.rightOpacity,
                                transition: "opacity 400ms ease",
                            }}
                        >
                            {plan.tieRightScore}
                        </span>
                    </div>
                ) : (
                    <div
                        className={css.info_text}
                        style={{
                            marginTop: "6px",
                            fontSize: "15px",
                            fontWeight: 700,
                            color: "#555",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            pointerEvents: "none"
                        }}
                    >
                        &nbsp;
                        <button
                            type="button"
                            className={css.link_button}
                            style={{
                                pointerEvents: "none"
                            }}
                        >
                            &nbsp;
                        </button>
                        <span
                            style={{
                                fontWeight: 700,
                                marginLeft: "28px",
                                pointerEvents: "none"
                            }}>
                            &nbsp;
                        </span>
                    </div>
                )}

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                        marginTop: isModalHidden ? "10px" : "14px",
                    }}
                >
                    <button
                        className={css.gamble_button}
                        style={
                            isModalHidden
                                ? { padding: "6px 16px", fontSize: "14px" }
                                : undefined
                        }
                        onClick={() => {
                            onIndexChange(-1);

                            requestAnimationFrame(() => {
                                onClose();
                            });
                        }}
                    >
                        Back?
                    </button>

                    <button
                        type="button"
                        onClick={toggleModalHidden}
                        style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            color: "#8c8c8c",
                            fontSize: "13px",
                            textDecoration: "underline",
                        }}
                    >
                        {isModalHidden ? "Show full modal" : "Hide full modal"}
                    </button>
                </div>
            </motion.div>
        </>
    );
};
