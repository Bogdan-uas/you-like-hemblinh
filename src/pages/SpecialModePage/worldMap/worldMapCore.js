import { useEffect, useState } from "react";

const FLAG_URLS = import.meta.glob("./flags/*.svg", { eager: true, query: "?url", import: "default" });

export const flagUrlOf = (code) => (code ? FLAG_URLS[`./flags/${code.toLowerCase()}.svg`] ?? null : null);

let dataPromise = null;
let dataCache = null;

export const loadWorldMap = () => {
    if (!dataPromise) {
        dataPromise = import("./worldMapData.js").then((m) => {
            dataCache = m;
            return m;
        });
    }
    return dataPromise;
};

export const useWorldMap = () => {
    const [data, setData] = useState(dataCache);
    useEffect(() => {
        if (data) return undefined;
        let alive = true;
        loadWorldMap().then((m) => alive && setData(m));
        return () => {
            alive = false;
        };
    }, [data]);
    return data;
};

export const projectLatLon = (projection, lat, lon) => {
    const lambda = (lon * Math.PI) / 180;
    const phi = (lat * Math.PI) / 180;
    const phi2 = phi * phi;
    const phi4 = phi2 * phi2;
    const x = lambda * (0.8707 - 0.131979 * phi2 + phi4 * (-0.013791 + phi4 * (0.003971 * phi2 - 0.001529 * phi4)));
    const y = phi * (1.007226 + phi2 * (0.015085 + phi4 * (-0.044475 + 0.028874 * phi2 - 0.005916 * phi4)));
    return [projection.x + projection.scale * x, projection.y - projection.scale * y];
};

export const cameraForBox = ([x0, y0, x1, y1], width, height, fill = 0.62, center = [0.5, 0.5]) => {
    const w = Math.max(x1 - x0, 1e-3);
    const h = Math.max(y1 - y0, 1e-3);
    const ox = width * center[0];
    const oy = height * center[1];
    const roomW = 2 * Math.min(ox, width - ox);
    const roomH = 2 * Math.min(oy, height - oy);
    const k = Math.min((roomW * fill) / w, (roomH * fill) / h);
    return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, k, ox, oy };
};

export const clampCamera = (cam, world, size) => {
    const k = Math.max(world.k * 0.9, Math.min(world.k * 90, cam.k));
    return { ...cam, k, cx: Math.max(0, Math.min(size.width, cam.cx)), cy: Math.max(0, Math.min(size.height, cam.cy)) };
};

export const cameraTransform = ({ cx, cy, k, ox, oy }) => `translate(${ox - cx * k} ${oy - cy * k}) scale(${k})`;

const RHO = Math.SQRT2;

export const zoomPath = (a, b, width) => {
    const ux0 = a.cx;
    const uy0 = a.cy;
    const w0 = width / a.k;
    const ux1 = b.cx;
    const uy1 = b.cy;
    const w1 = width / b.k;
    const dx = ux1 - ux0;
    const dy = uy1 - uy0;
    const d2 = dx * dx + dy * dy;
    const lerpO = (t) => ({ ox: a.ox + (b.ox - a.ox) * t, oy: a.oy + (b.oy - a.oy) * t });
    if (d2 < 1e-12) {
        const S = Math.log(w1 / w0) / RHO;
        return {
            duration: Math.abs(S) * 1000,
            at: (t) => ({ cx: ux0 + t * dx, cy: uy0 + t * dy, k: width / (w0 * Math.exp(RHO * t * S)), ...lerpO(t) }),
        };
    }
    const d1 = Math.sqrt(d2);
    const b0 = (w1 * w1 - w0 * w0 + RHO ** 4 * d2) / (2 * w0 * RHO * RHO * d1);
    const b1 = (w1 * w1 - w0 * w0 - RHO ** 4 * d2) / (2 * w1 * RHO * RHO * d1);
    const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
    const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
    const S = (r1 - r0) / RHO;
    return {
        duration: S * 1000,
        at: (t) => {
            const s = t * S;
            const coshr0 = Math.cosh(r0);
            const u = (w0 / (RHO * RHO * d1)) * (coshr0 * Math.tanh(RHO * s + r0) - Math.sinh(r0));
            const w = (w0 * coshr0) / Math.cosh(RHO * s + r0);
            return { cx: ux0 + u * dx, cy: uy0 + u * dy, k: width / w, ...lerpO(t) };
        },
    };
};

export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
