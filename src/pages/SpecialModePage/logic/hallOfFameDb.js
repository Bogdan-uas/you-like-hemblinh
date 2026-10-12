const HALL_OF_FAME_DB_NAME = "specialModeHallOfFame";
const HALL_OF_FAME_STORE = "tournaments";

const openHallOfFameDb = () =>
    new Promise((resolve, reject) => {
        if (!("indexedDB" in window)) {
            reject(new Error("IndexedDB is not available in this browser."));
            return;
        }
        const request = indexedDB.open(HALL_OF_FAME_DB_NAME, 1);
        request.onupgradeneeded = () => {
            if (!request.result.objectStoreNames.contains(HALL_OF_FAME_STORE)) {
                request.result.createObjectStore(HALL_OF_FAME_STORE, { keyPath: "id" });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

export const hallRecordTime = (record) => {
    const time = Date.parse(record?.finishedAt ?? "");
    return Number.isFinite(time) ? time : 0;
};

export const sortHallOfFame = (list) =>
    [...list].sort((a, b) => hallRecordTime(b) - hallRecordTime(a) || (b.number ?? 0) - (a.number ?? 0));

export const readHallOfFame = async () => {
    const db = await openHallOfFameDb();
    return new Promise((resolve, reject) => {
        const request = db.transaction(HALL_OF_FAME_STORE, "readonly")
            .objectStore(HALL_OF_FAME_STORE).getAll();
        request.onsuccess = () => resolve(sortHallOfFame(request.result || []));
        request.onerror = () => reject(request.error);
    });
};

export const saveHallTournament = async (record) => {
    const db = await openHallOfFameDb();
    return new Promise((resolve, reject) => {
        const request = db.transaction(HALL_OF_FAME_STORE, "readwrite")
            .objectStore(HALL_OF_FAME_STORE).put(record);
        request.onsuccess = () => resolve(record);
        request.onerror = () => reject(request.error);
    });
};

export const deleteHallTournament = async (id) => {
    const db = await openHallOfFameDb();
    return new Promise((resolve, reject) => {
        const request = db.transaction(HALL_OF_FAME_STORE, "readwrite")
            .objectStore(HALL_OF_FAME_STORE).delete(id);
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
};

export const clearHallOfFameStore = async () => {
    const db = await openHallOfFameDb();
    return new Promise((resolve, reject) => {
        const request = db.transaction(HALL_OF_FAME_STORE, "readwrite")
            .objectStore(HALL_OF_FAME_STORE).clear();
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
};
