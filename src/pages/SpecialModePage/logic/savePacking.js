const MARK = "~rl";
const VERSION = 1;
const DICT_LIMIT = 24;

const isPlainObject = (value) => !!value && typeof value === "object" && !Array.isArray(value);

const sameKeys = (keys, row) => {
    const own = Object.keys(row);
    if (own.length !== keys.length) return false;
    for (let i = 0; i < keys.length; i++) if (own[i] !== keys[i]) return false;
    return true;
};

const roundKeyOf = (prefix, row) =>
    `${prefix}-${typeof row.part === "string" && row.part.startsWith("ot") ? row.part : "reg"}-r${row.roundNumber}`;

const scoresOf = (rows) => {
    let left = 0;
    let right = 0;
    return rows.map((row) => {
        if (row.winner === "left") left += 1;
        else if (row.winner === "right") right += 1;
        return [left, right];
    });
};

const packRoundLog = (log) => {
    if (!Array.isArray(log) || !log.length || !isPlainObject(log[0])) return null;
    const keys = Object.keys(log[0]);
    if (!log.every((row) => isPlainObject(row) && sameKeys(keys, row))) return null;

    const derived = {};
    if (keys.includes("key") && keys.includes("part") && keys.includes("roundNumber")) {
        const prefix = typeof log[0].key === "string" ? log[0].key.split("-")[0] : null;
        if (prefix && log.every((row) => row.key === roundKeyOf(prefix, row))) derived.key = prefix;
    }
    if (keys.includes("scoreLeft") && keys.includes("scoreRight") && keys.includes("winner")) {
        const scores = scoresOf(log);
        if (log.every((row, i) => row.scoreLeft === scores[i][0] && row.scoreRight === scores[i][1])) {
            derived.scoreLeft = 1;
            derived.scoreRight = 1;
        }
    }

    const columns = keys.filter((key) => !(key in derived));
    const dicts = {};
    columns.forEach((key) => {
        const values = [];
        for (const row of log) {
            const value = row[key];
            if (typeof value !== "string") return;
            if (!values.includes(value)) {
                values.push(value);
                if (values.length > DICT_LIMIT) return;
            }
        }
        if (values.length && values.some((value) => value.length > 2)) dicts[key] = values;
    });

    const rows = log.map((row) => columns.map((key) => (dicts[key] ? dicts[key].indexOf(row[key]) : row[key])));
    return { [MARK]: VERSION, keys, columns, derived, dicts, rows };
};

const unpackRoundLog = (packed) => {
    const { keys, columns, derived = {}, dicts = {}, rows } = packed;
    const partial = rows.map((row) => {
        const entry = {};
        columns.forEach((key, i) => {
            entry[key] = dicts[key] ? dicts[key][row[i]] : row[i];
        });
        return entry;
    });
    const scores = derived.scoreLeft ? scoresOf(partial) : null;
    return partial.map((entry, i) => {
        const out = {};
        keys.forEach((key) => {
            if (key === "key" && derived.key) out.key = roundKeyOf(derived.key, entry);
            else if (key === "scoreLeft" && scores) out.scoreLeft = scores[i][0];
            else if (key === "scoreRight" && scores) out.scoreRight = scores[i][1];
            else out[key] = entry[key];
        });
        return out;
    });
};

const isPackedRoundLog = (value) =>
    isPlainObject(value) && value[MARK] === VERSION && Array.isArray(value.keys) && Array.isArray(value.columns) && Array.isArray(value.rows);

const packValue = (value) => {
    if (Array.isArray(value)) {
        let out = null;
        for (let i = 0; i < value.length; i++) {
            const next = packValue(value[i]);
            if (next !== value[i]) {
                out ??= value.slice();
                out[i] = next;
            }
        }
        return out ?? value;
    }
    if (isPlainObject(value)) {
        let out = null;
        for (const key in value) {
            const current = value[key];
            const next = key === "roundLog" ? packRoundLog(current) ?? packValue(current) : packValue(current);
            if (next !== current) {
                out ??= { ...value };
                out[key] = next;
            }
        }
        return out ?? value;
    }
    return value;
};

export const stringifySave = (state) => JSON.stringify(packValue(state));

const unpackValue = (value) => {
    if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) unpackValue(value[i]);
        return;
    }
    if (isPlainObject(value)) {
        for (const key in value) {
            const current = value[key];
            if (key === "roundLog" && isPackedRoundLog(current)) value[key] = unpackRoundLog(current);
            else if (current && typeof current === "object") unpackValue(current);
        }
    }
};

export const parseSave = (text) => {
    const parsed = JSON.parse(text);
    unpackValue(parsed);
    return parsed;
};
