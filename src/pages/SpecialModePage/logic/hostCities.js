import { EWC_COUNTRIES } from "./ewcHomes.js";
import {
    PEM_SMALL_TYPE_ID,
    PEM_BIG_TYPE_ID,
    GPL_TYPE_ID,
    PBS_TYPE_ID,
    PGX_GM_TYPE_ID,
    ESS_TYPE_ID,
    SWC_TYPE_ID,
    EWC_TYPE_ID,
} from "./tournamentTypes.jsx";
import { SKYLINES_TYPE_ID } from "./skylines.jsx";

export const OFFICIAL_TYPE_ID = "Official";
const HOST_CITIES_LS_KEY = "specialMode_hostCities_v1";

const CITY = {
    budapest: { city: "Budapest", code: "HU", lat: 47.5, lon: 19.04 },
    rio: { city: "Rio de Janeiro", code: "BR", lat: -22.91, lon: -43.17 },
    berlin: { city: "Berlin", code: "DE", lat: 52.52, lon: 13.4 },
    krakow: { city: "Kraków", code: "PL", lat: 50.06, lon: 19.94 },
    stockholm: { city: "Stockholm", code: "SE", lat: 59.33, lon: 18.07 },
    cologne: { city: "Cologne", code: "DE", lat: 50.94, lon: 6.96 },
    katowice: { city: "Katowice", code: "PL", lat: 50.26, lon: 19.02 },
    malta: { city: "Malta", code: "MT", lat: 35.92, lon: 14.49 },
    madrid: { city: "Madrid", code: "ES", lat: 40.42, lon: -3.7 },
    riyadh: { city: "Riyadh", code: "SA", lat: 24.71, lon: 46.68 },
    jeddah: { city: "Jeddah", code: "SA", lat: 21.49, lon: 39.19 },
    paris: { city: "Paris", code: "FR", lat: 48.86, lon: 2.35 },
    london: { city: "London", code: "GB", lat: 51.51, lon: -0.13 },
    abuDhabi: { city: "Abu Dhabi", code: "AE", lat: 24.45, lon: 54.38 },
    tokyo: { city: "Tokyo", code: "JP", lat: 35.68, lon: 139.69 },
    seoul: { city: "Seoul", code: "KR", lat: 37.57, lon: 126.98 },
};

const PGX_CITY_INFO = {
    Atlanta: ["US", 33.75, -84.39],
    Austin: ["US", 30.27, -97.74],
    Boston: ["US", 42.36, -71.06],
    Columbus: ["US", 39.96, -83.0],
    Dallas: ["US", 32.78, -96.8],
    "Fort Worth": ["US", 32.76, -97.33],
    "Las Vegas": ["US", 36.17, -115.14],
    "Los Angeles": ["US", 34.05, -118.24],
    "New York": ["US", 40.71, -74.01],
    Orlando: ["US", 28.54, -81.38],
    Washington: ["US", 38.91, -77.04],
    Montreal: ["CA", 45.5, -73.57],
    Toronto: ["CA", 43.65, -79.38],
    Vancouver: ["CA", 49.28, -123.12],
    Cologne: ["DE", 50.94, 6.96],
    Katowice: ["PL", 50.26, 19.02],
    Berlin: ["DE", 52.52, 13.4],
    Hamburg: ["DE", 53.55, 9.99],
    Leipzig: ["DE", 51.34, 12.37],
    Copenhagen: ["DK", 55.68, 12.57],
    Aarhus: ["DK", 56.16, 10.2],
    Odense: ["DK", 55.4, 10.39],
    Stockholm: ["SE", 59.33, 18.07],
    Malmö: ["SE", 55.6, 13.0],
    Jönköping: ["SE", 57.78, 14.16],
    Oslo: ["NO", 59.91, 10.75],
    Helsinki: ["FI", 60.17, 24.94],
    London: ["GB", 51.51, -0.13],
    Birmingham: ["GB", 52.49, -1.89],
    Paris: ["FR", 48.86, 2.35],
    Marseille: ["FR", 43.3, 5.37],
    Lyon: ["FR", 45.76, 4.84],
    Antwerp: ["BE", 51.22, 4.4],
    Brussels: ["BE", 50.85, 4.35],
    Amsterdam: ["NL", 52.37, 4.9],
    Rotterdam: ["NL", 51.92, 4.48],
    Utrecht: ["NL", 52.09, 5.12],
    Madrid: ["ES", 40.42, -3.7],
    Valencia: ["ES", 39.47, -0.38],
    Barcelona: ["ES", 41.39, 2.17],
    Málaga: ["ES", 36.72, -4.42],
    Lisbon: ["PT", 38.72, -9.14],
    Porto: ["PT", 41.15, -8.61],
    Bucharest: ["RO", 44.43, 26.1],
    "Cluj-Napoca": ["RO", 46.77, 23.62],
    Belgrade: ["RS", 44.79, 20.45],
    Budapest: ["HU", 47.5, 19.04],
    Kraków: ["PL", 50.06, 19.94],
    Warsaw: ["PL", 52.23, 21.01],
    Prague: ["CZ", 50.08, 14.44],
    Vienna: ["AT", 48.21, 16.37],
    Zürich: ["CH", 47.38, 8.54],
    Milan: ["IT", 45.46, 9.19],
    Rome: ["IT", 41.9, 12.5],
    Istanbul: ["TR", 41.01, 28.98],
    Sofia: ["BG", 42.7, 23.32],
    Athens: ["GR", 37.98, 23.73],
    Dublin: ["IE", 53.35, -6.26],
    Shanghai: ["CN", 31.23, 121.47],
    Chengdu: ["CN", 30.57, 104.07],
    Chongqing: ["CN", 29.56, 106.55],
    Beijing: ["CN", 39.9, 116.4],
    Shenzhen: ["CN", 22.54, 114.06],
    Macau: ["MO", 22.2, 113.54],
    "Hong Kong": ["HK", 22.32, 114.17],
    Taipei: ["TW", 25.03, 121.57],
    Singapore: ["SG", 1.35, 103.82],
    Bangkok: ["TH", 13.76, 100.5],
    "Kuala Lumpur": ["MY", 3.14, 101.69],
    Manila: ["PH", 14.6, 120.98],
    Jakarta: ["ID", -6.21, 106.85],
    Tokyo: ["JP", 35.68, 139.69],
    Osaka: ["JP", 34.69, 135.5],
    Seoul: ["KR", 37.57, 126.98],
    Busan: ["KR", 35.18, 129.08],
    Riyadh: ["SA", 24.71, 46.68],
    "Abu Dhabi": ["AE", 24.45, 54.38],
    Dubai: ["AE", 25.2, 55.27],
    Doha: ["QA", 25.29, 51.53],
    Melbourne: ["AU", -37.81, 144.96],
    Sydney: ["AU", -33.87, 151.21],
    Brisbane: ["AU", -27.47, 153.03],
    Perth: ["AU", -31.95, 115.86],
};

export const HOST_CITIES = {
    [OFFICIAL_TYPE_ID]: [CITY.budapest],
    [SKYLINES_TYPE_ID]: [CITY.budapest],
    [PEM_SMALL_TYPE_ID]: [CITY.rio, CITY.berlin, CITY.krakow, CITY.stockholm],
    [PEM_BIG_TYPE_ID]: [CITY.cologne, CITY.katowice],
    [GPL_TYPE_ID]: [CITY.stockholm, CITY.katowice],
    [PBS_TYPE_ID]: [CITY.malta],
    [ESS_TYPE_ID]: [CITY.madrid, CITY.budapest],
    [SWC_TYPE_ID]: [CITY.malta],
    [EWC_TYPE_ID]: [CITY.riyadh, CITY.paris, CITY.berlin, CITY.jeddah, CITY.london, CITY.abuDhabi, CITY.tokyo, CITY.seoul],
};

export const isHostedType = (typeId) => !!HOST_CITIES[typeId];

const keyOf = (typeId, number) => `${typeId}#${number}`;

const readStore = () => {
    try {
        const saved = JSON.parse(localStorage.getItem(HOST_CITIES_LS_KEY) ?? "null");
        return saved && typeof saved === "object" ? saved : {};
    } catch {
        return {};
    }
};

const writeStore = (store) => {
    try {
        localStorage.setItem(HOST_CITIES_LS_KEY, JSON.stringify(store));
    } catch {
        return;
    }
};

const hashOf = (text) => {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
};

const withCountry = (entry, relation = "host") => {
    if (!entry) return null;
    const country = EWC_COUNTRIES[entry.code];
    return { ...entry, country: country?.name ?? entry.code, flag: country?.flag ?? null, relation };
};

const cityByName = (typeId, name) => (HOST_CITIES[typeId] ?? []).find((entry) => entry.city === name) ?? null;

export const pgxHostOf = (city, relation = "host") => {
    const info = PGX_CITY_INFO[city];
    if (!info) return null;
    const [code, lat, lon] = info;
    return withCountry({ city, code, lat, lon }, relation);
};

export const hostCityFor = (typeId, number, { draw = false, relation = "host" } = {}) => {
    const list = HOST_CITIES[typeId];
    if (!list || !(Number(number) > 0)) return null;
    if (list.length === 1) return withCountry(list[0], relation);
    const store = readStore();
    const key = keyOf(typeId, number);
    const stored = cityByName(typeId, store[key]?.city);
    if (stored) return withCountry(stored, relation);
    if (draw) {
        const picked = list[Math.floor(Math.random() * list.length)];
        writeStore({ ...store, [key]: { ...(store[key] ?? {}), city: picked.city } });
        return withCountry(picked, relation);
    }
    return withCountry(list[hashOf(key) % list.length], relation);
};

const MAIN_EVENTS = ["main", "gpl", "pbs", "ess", "swc", "ewc"];

export const hostLinkOf = (record) => {
    if (!record) return null;
    const event = record.event;
    if (!event) return { typeId: OFFICIAL_TYPE_ID, number: record.number, relation: "host" };
    if (MAIN_EVENTS.includes(event)) return { typeId: record.type, number: record.number, relation: "host" };
    if (event === "skylines") return { typeId: SKYLINES_TYPE_ID, number: record.number, relation: "host" };
    if (event === "qualifier") {
        if (record.owner === "gpl") return null;
        const typeId = record.owner === "pbs" ? PBS_TYPE_ID : record.type;
        return { typeId, number: record.number, relation: "main" };
    }
    if (event === "essLq") return { typeId: ESS_TYPE_ID, number: record.number, relation: "main" };
    if (event === "essCh") return { typeId: ESS_TYPE_ID, number: record.number, relation: "host" };
    if (event === "swcSc") return { typeId: SWC_TYPE_ID, number: record.number, relation: "main" };
    if (event === "ewcOq") return { typeId: EWC_TYPE_ID, number: record.number, relation: "main" };
    if (event === "pgxCm") return { typeId: PGX_GM_TYPE_ID, number: record.number, city: record.city, relation: "main" };
    if (event === "pgxIm" || event === "pgxGm") return { typeId: PGX_GM_TYPE_ID, number: record.number, city: record.city, relation: "host" };
    return null;
};

export const hostOfLink = (link, options = {}) => {
    if (!link) return null;
    if (link.typeId === PGX_GM_TYPE_ID) return pgxHostOf(link.city, link.relation);
    return hostCityFor(link.typeId, link.number, { ...options, relation: link.relation });
};

export const hostOfRecord = (record) => {
    const link = hostLinkOf(record);
    if (!link) return null;
    if (record.host?.city && record.host?.code) return withCountry(record.host, link.relation);
    return hostOfLink(link);
};

export const hostRecordField = (typeId, number) => {
    const host = hostCityFor(typeId, number);
    return host ? { city: host.city, code: host.code, lat: host.lat, lon: host.lon } : null;
};

export const isHostRevealed = (typeId, number) => !!readStore()[keyOf(typeId, number)]?.revealed;

export const markHostRevealed = (typeId, number) => {
    const store = readStore();
    const key = keyOf(typeId, number);
    writeStore({ ...store, [key]: { ...(store[key] ?? {}), revealed: true } });
};

export const hostPlaceText = (host) => (host ? (host.city === host.country ? host.city : `${host.city}, ${host.country}`) : "");
