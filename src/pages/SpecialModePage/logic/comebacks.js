export const COMEBACK_NAMES = { 1: "Comeback", 2: "Big comeback", 3: "Huge comeback" };

export const COMEBACK_RULE_TEXT = "from 2 sets behind, or from 1 in a Best of 3";

export const comebackMaxFor = (bestOf) => (bestOf >= 7 ? 3 : bestOf >= 5 ? 2 : bestOf >= 3 ? 1 : 0);

const sizeAt = (bestOf, toWin, mine, theirs) => {
    const deficit = theirs - mine;
    if (bestOf === 3) return deficit >= 1 ? 1 : 0;
    if (deficit < 2) return 0;
    const facingLastSet = theirs === toWin - 1;
    if (facingLastSet && mine === 0 && toWin >= 4) return 3;
    return deficit >= 3 || facingLastSet ? 2 : 1;
};

export const comebackSizeOf = (bestOf, setsWon = []) => {
    if (!(bestOf >= 3)) return 0;
    const toWin = Math.floor(bestOf / 2) + 1;
    let mine = 0;
    let theirs = 0;
    let size = 0;
    for (const won of setsWon) {
        if (won === true) mine += 1;
        else if (won === false) theirs += 1;
        if (mine >= toWin || theirs >= toWin) break;
        size = Math.max(size, sizeAt(bestOf, toWin, mine, theirs));
    }
    return mine > theirs ? size : 0;
};

export const comebackValueLabel = (value, bestOf) => (value > 1 && bestOf >= 7 ? `+1-${value}` : `+${value}`);

export const wonSetFromBehind = (roundLog, winner, { regulationToWin, overtimeToWin, minDeficit, pointDeficit }) => {
    if (!Array.isArray(roundLog) || !roundLog.length || (winner !== "left" && winner !== "right")) return false;
    let part = null;
    let base = 0;
    let toWin = regulationToWin;
    let prevMine = 0;
    let prevTheirs = 0;
    for (const round of roundLog) {
        const mine = (winner === "left" ? round.scoreLeft : round.scoreRight) ?? 0;
        const theirs = (winner === "left" ? round.scoreRight : round.scoreLeft) ?? 0;
        if (round.part !== part) {
            part = round.part;
            const overtime = /^ot\d+$/.test(String(part));
            base = overtime ? Math.min(prevMine, prevTheirs) : 0;
            toWin = overtime ? overtimeToWin : regulationToWin;
        }
        const deficit = theirs - mine;
        const theirsHere = theirs - base;
        if (deficit >= minDeficit || (theirsHere >= toWin - 1 && deficit >= pointDeficit)) return true;
        prevMine = mine;
        prevTheirs = theirs;
    }
    return false;
};
