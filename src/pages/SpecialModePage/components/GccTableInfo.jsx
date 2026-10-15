import { useState } from "react";
import css from "../SpecialModePage.module.css";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaXmark, FaCircleInfo } from "react-icons/fa6";
import { lightenHex, darkenHex } from "../logic/colors.js";

const formGradient = (color) => `linear-gradient(180deg, ${lightenHex(color, 0.18)} 0%, ${color} 45%, ${darkenHex(color, 0.35)} 100%)`;

const SampleRow = ({ rowClass = "", children }) => (
    <table className={`${css.cst_table} ${css.gcc_info_sample}`}>
        <tbody>
            <tr className={rowClass}>
                <td>{children}</td>
            </tr>
        </tbody>
    </table>
);

const Entry = ({ sample, children }) => (
    <>
        <div className={css.gcc_info_sample_cell}>{sample}</div>
        <div className={css.gcc_info_text}>{children}</div>
    </>
);

export const GccTableInfo = () => {
    const [open, setOpen] = useState(false);

    return (
        <span
            className={css.gcc_info}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <FaCircleInfo size={15} style={{ color: "Highlight" }} />
            <AnimatePresence>
                {open && (
                    <motion.div
                        className={css.gcc_info_box}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                    >
                        <span className={css.gcc_info_title}>Places right now</span>
                        <div className={css.gcc_info_grid}>
                            <Entry sample={<SampleRow rowClass={css.gcc_row_qf}>1-4</SampleRow>}>
                                In the Quarterfinal places at the moment
                            </Entry>
                            <Entry sample={<SampleRow rowClass={css.gcc_row_po}>5-12</SampleRow>}>
                                In the Knockout Play-off places at the moment
                            </Entry>
                            <Entry sample={<SampleRow>13-16</SampleRow>}>
                                Out of the top 12 at the moment, but still alive
                            </Entry>
                        </div>

                        <span className={css.gcc_info_title}>Guaranteed</span>
                        <div className={css.gcc_info_grid}>
                            <Entry sample={<SampleRow rowClass={css.gcc_row_qf_done}><FaCheck size={11} color="#2e7d32" /></SampleRow>}>
                                Quarterfinals clinched: the team finishes in the top 4, whatever happens
                            </Entry>
                            <Entry sample={<SampleRow rowClass={css.gcc_row_po_done}><FaCheck size={11} color="#a07800" /></SampleRow>}>
                                Knockout Play-offs clinched: places 5-12 for sure, the top 4 can&apos;t be reached anymore
                            </Entry>
                            <Entry sample={<SampleRow rowClass={css.gcc_row_qf}><FaCheck size={11} color="#a07800" style={{ opacity: 0.5 }} /></SampleRow>}>
                                At least the Knockout Play-offs are safe, the Quarterfinals are still possible
                            </Entry>
                            <Entry sample={<SampleRow rowClass={css.cst_row_eliminated}><FaXmark size={12} color="#be3939" /></SampleRow>}>
                                Eliminated: the top 12 can&apos;t be reached anymore
                            </Entry>
                        </div>
                        <span className={css.gcc_info_note}>
                            Only the wins are known in advance, so a tie in wins always counts against the team.
                            A team is marked only when it&apos;s certain.
                        </span>

                        <span className={css.gcc_info_title}>Everything else</span>
                        <div className={css.gcc_info_grid}>
                            <Entry sample={<SampleRow rowClass={css.gcc_row_playing}>&nbsp;</SampleRow>}>
                                The two teams of the current match
                            </Entry>
                            <Entry sample={<span className={css.gcc_info_cut} />}>
                                The cut after 4th place (Quarterfinals) and after 12th place (Knockout Play-offs)
                            </Entry>
                            <Entry
                                sample={
                                    <span className={css.gcc_form}>
                                        <span className={css.gcc_form_slot} style={{ backgroundImage: formGradient("#54CC54") }}>
                                            <FaCheck size={8} color="#fff" />
                                        </span>
                                        <span className={css.gcc_form_slot} style={{ backgroundImage: formGradient("#983333") }}>
                                            <FaXmark size={9} color="#fff" />
                                        </span>
                                        <span className={`${css.gcc_form_slot} ${css.gcc_form_next}`} style={{ background: "#d81b60" }} />
                                    </span>
                                }
                            >
                                Form, one circle per Matchday: won, lost, and the coloured dot of the opponent still to play
                            </Entry>
                            <Entry sample={<span className={css.gcc_pot}>2</span>}>
                                The Pot of the team
                            </Entry>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
    );
};
