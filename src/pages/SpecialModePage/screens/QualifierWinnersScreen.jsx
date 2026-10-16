import css from "../SpecialModePage.module.css";
import { TournamentNumberText } from "../components/TournamentNumberText.jsx";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { QualifierBadge } from "../components/QualifierBadge.jsx";

export function QualifierWinnersScreen({ winners, labels, actions }) {
    const { showWinnerText, hasPlayedWinnerAnimation, winnersText, tournamentResults, showProceed } = winners;
    const { pemLabel, renderQualifierWinnersBlock } = labels;
    const { handleProceed } = actions;


    return (
        <div className={css.winnerScreen}>
            <QualifierBadge height={26} />
            {showWinnerText && (
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className={css.winnerHeadline}
                >
                    {hasPlayedWinnerAnimation ? (
                        <span>
                            The 4 qualifiers of {pemLabel}
                        </span>
                    ) : <TournamentNumberText text={winnersText} />}
                </motion.h2>
            )}

            {renderQualifierWinnersBlock(tournamentResults.qualifiers, { animated: !hasPlayedWinnerAnimation })}

            {showProceed && (
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={css.gamble_button}
                    onClick={handleProceed}
                    style={{ zIndex: 10, marginTop: "48px" }}
                >
                    Proceed
                </motion.button>
            )}
        </div>
    );
}
