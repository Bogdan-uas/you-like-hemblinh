import MagicString from "magic-string";
import { parseAst } from "vite";

export const RUBBER_BASE_PX = 16;

const MIN_SCALED_PX = 1;
const PX_IN_TEXT = /(-?\d*\.?\d+)px\b/g;

const UNITLESS = new Set([
    "animationIterationCount", "aspectRatio", "borderImageOutset", "borderImageSlice", "borderImageWidth",
    "boxFlex", "boxFlexGroup", "boxOrdinalGroup", "columnCount", "columns", "flex", "flexGrow", "flexPositive",
    "flexShrink", "flexNegative", "flexOrder", "gridArea", "gridRow", "gridRowEnd", "gridRowSpan", "gridRowStart",
    "gridColumn", "gridColumnEnd", "gridColumnSpan", "gridColumnStart", "fontWeight", "lineClamp", "lineHeight",
    "opacity", "order", "orphans", "scale", "tabSize", "widows", "zIndex", "zoom", "fillOpacity", "floodOpacity",
    "stopOpacity", "strokeDasharray", "strokeDashoffset", "strokeMiterlimit", "strokeOpacity", "strokeWidth",
    "WebkitLineClamp",
]);

const SKIP_TEMPLATES = new Set(["paddingTop@SetBreakdownOverlay.jsx"]);

const MEASURED_EXPRESSION = /\b(rect|Rect|offset[A-Z]\w*|getBoundingClientRect|client(Width|Height)|scroll[A-Z]\w*|layout|tooltipCoords|headerHeight|indicator|heightRef|pos)\b/;

const MEASURED_FILES = new Set(["PbsDraftShow.jsx", "StickyBelow.jsx", "TeamStatsHoverPopover.jsx"]);

const RUNTIME_ID = "virtual:rubber-runtime";
const RESOLVED_RUNTIME_ID = "\u0000" + RUNTIME_ID;

const RUNTIME_CODE = [
    "const PX = /(-?\\d*\\.?\\d+)px\\b/g;",
    `const toRem = (px) => Number((px / ${RUBBER_BASE_PX}).toFixed(6)) + "rem";`,
    "export const __rubber = (value) => {",
    `    if (typeof value === "number") return Math.abs(value) > ${MIN_SCALED_PX} ? toRem(value) : value;`,
    `    if (typeof value === "string" && value.includes("px")) return value.replace(PX, (match, n) => (Math.abs(Number(n)) > ${MIN_SCALED_PX} ? toRem(Number(n)) : match));`,
    "    return value;",
    "};",
    "export const __rubberScale = (value) => typeof value === \"number\" ? value * (parseFloat(getComputedStyle(document.documentElement).fontSize) / 16 || 1) : value;",
].join("\n");

const MOTION_KEYS = new Set(["animate", "initial", "exit", "whileHover", "whileTap", "whileInView", "whileFocus", "whileDrag"]);

const MOTION_UNITLESS = new Set([
    "opacity", "scale", "scaleX", "scaleY", "rotate", "rotateX", "rotateY", "rotateZ", "skew", "skewX", "skewY",
    "pathLength", "pathOffset", "pathSpacing", "zIndex", "flexGrow", "fontWeight", "lineHeight", "originX", "originY",
]);

const SCALED_NUMBER_PROPS = { ReactFitty: new Set(["minSize", "maxSize"]) };

const toRem = (px) => `${Number((px / RUBBER_BASE_PX).toFixed(6))}rem`;

export const pxTextToRem = (text) =>
    text.replace(PX_IN_TEXT, (match, value) => (Math.abs(Number(value)) > MIN_SCALED_PX ? toRem(Number(value)) : match));

const insideUrl = (value, index) => {
    const before = value.slice(0, index);
    const open = before.lastIndexOf("url(");
    return open !== -1 && before.indexOf(")", open) === -1;
};

export const rubberPostcss = () => ({
    postcssPlugin: "rubber-px-to-rem",
    Declaration(decl) {
        if (!decl.value.includes("px") || decl.prop.startsWith("--rubber")) return;
        const next = decl.value.replace(PX_IN_TEXT, (match, value, offset) =>
            Math.abs(Number(value)) > MIN_SCALED_PX && !insideUrl(decl.value, offset) ? toRem(Number(value)) : match
        );
        if (next !== decl.value) decl.value = next;
    },
});
rubberPostcss.postcss = true;

const keyName = (node) => (node.type === "Identifier" ? node.name : node.type === "Literal" ? String(node.value) : null);

const walk = (node, visit, parent = null) => {
    if (!node || typeof node.type !== "string") return;
    if (visit(node, parent) === false) return;
    for (const key of Object.keys(node)) {
        if (key === "start" || key === "end" || key === "loc") continue;
        const child = node[key];
        if (Array.isArray(child)) child.forEach((item) => walk(item, visit, node));
        else if (child && typeof child.type === "string") walk(child, visit, node);
    }
};

const isJsxCall = (node) =>
    node.type === "CallExpression" &&
    node.callee.type === "Identifier" &&
    /^_?jsx(s|DEV)?$/.test(node.callee.name);

const DYNAMIC_TYPES = new Set([
    "Identifier", "MemberExpression", "CallExpression", "BinaryExpression", "LogicalExpression", "ChainExpression", "UnaryExpression",
]);

export const rubberJsx = () => ({
    name: "rubber-inline-px-to-rem",
    enforce: "post",
    resolveId(id) {
        return id === RUNTIME_ID ? RESOLVED_RUNTIME_ID : null;
    },
    load(id) {
        return id === RESOLVED_RUNTIME_ID ? RUNTIME_CODE : null;
    },
    transform(code, id) {
        const file = id.split("?")[0];
        if (!/[\\/]src[\\/].*\.(jsx?|tsx?)$/.test(file) || !/style|size/i.test(code)) return null;

        let ast;
        try {
            ast = parseAst(code);
        } catch {
            return null;
        }

        const fileName = file.split(/[\\/]/).pop();
        const out = new MagicString(code);
        let changed = false;
        let usesRuntime = false;
        let usesScale = false;
        const iconNames = new Set();
        const measuredFile = MEASURED_FILES.has(fileName);

        for (const node of ast.body) {
            if (node.type === "ImportDeclaration" && /react-icons/.test(node.source.value)) {
                node.specifiers.forEach((spec) => iconNames.add(spec.local.name));
            }
        }

        const isIconExpression = (node) =>
            node?.type === "Identifier" ? iconNames.has(node.name)
                : node?.type === "ConditionalExpression" ? isIconExpression(node.consequent) && isIconExpression(node.alternate)
                    : false;

        walk(ast, (node) => {
            if (node.type === "VariableDeclarator" && node.id.type === "Identifier" && isIconExpression(node.init)) {
                iconNames.add(node.id.name);
            }
        });

        const wrapRuntime = (node, prop, shorthand) => {
            if (measuredFile || (UNITLESS.has(prop) || MOTION_UNITLESS.has(prop)) || prop.startsWith("--")) return;
            const text = code.slice(node.start, node.end);
            if (MEASURED_EXPRESSION.test(text)) return;
            if (shorthand) out.overwrite(node.start, node.end, `${text}: __rubber(${text})`);
            else {
                out.appendLeft(node.start, "__rubber(");
                out.appendRight(node.end, ")");
            }
            changed = true;
            usesRuntime = true;
        };

        const replaceValue = (node, prop, shorthand = false, literalsOnly = false) => {
            if (node.type === "ArrayExpression" && literalsOnly) {
                node.elements.forEach((element) => element && replaceValue(element, prop, false, true));
                return;
            }
            if (node.type === "Literal" && typeof node.value === "number") {
                if ((UNITLESS.has(prop) || MOTION_UNITLESS.has(prop)) || prop.startsWith("--") || Math.abs(node.value) <= MIN_SCALED_PX) return;
                out.overwrite(node.start, node.end, JSON.stringify(toRem(node.value)));
                changed = true;
                return;
            }
            if (node.type === "UnaryExpression" && node.operator === "-" && node.argument.type === "Literal" && typeof node.argument.value === "number") {
                if ((UNITLESS.has(prop) || MOTION_UNITLESS.has(prop)) || prop.startsWith("--") || Math.abs(node.argument.value) <= MIN_SCALED_PX) return;
                out.overwrite(node.start, node.end, JSON.stringify(toRem(-node.argument.value)));
                changed = true;
                return;
            }
            if (node.type === "Literal" && typeof node.value === "string") {
                if (!node.value.includes("px")) return;
                const next = pxTextToRem(node.value);
                if (next !== node.value) {
                    out.overwrite(node.start, node.end, JSON.stringify(next));
                    changed = true;
                }
                return;
            }
            if (node.type === "TemplateLiteral") {
                const skipDynamic = measuredFile || prop.startsWith("--") || SKIP_TEMPLATES.has(`${prop}@${fileName}`);
                node.quasis.forEach((quasi, i) => {
                    const raw = quasi.value.raw;
                    let next = raw.replace(PX_IN_TEXT, (match, value) =>
                        Math.abs(Number(value)) > MIN_SCALED_PX ? toRem(Number(value)) : match
                    );
                    if (!skipDynamic && i > 0 && next.startsWith("px")) {
                        const expr = node.expressions[i - 1];
                        if (!MEASURED_EXPRESSION.test(code.slice(expr.start, expr.end))) {
                            out.appendLeft(expr.start, "(");
                            out.appendRight(expr.end, `) / ${RUBBER_BASE_PX}`);
                            next = `rem${next.slice(2)}`;
                        }
                    }
                    if (next !== raw) {
                        out.overwrite(quasi.start, quasi.end, next);
                        changed = true;
                    }
                });
                return;
            }
            if (node.type === "ConditionalExpression") {
                replaceValue(node.consequent, prop, false, literalsOnly);
                replaceValue(node.alternate, prop, false, literalsOnly);
                return;
            }
            if (!literalsOnly && DYNAMIC_TYPES.has(node.type)) wrapRuntime(node, prop, shorthand);
        };

        const processStyleObject = (obj) => {
            for (const prop of obj.properties) {
                if (prop.type === "SpreadElement") {
                    processStyleValue(prop.argument);
                    continue;
                }
                if (prop.computed) continue;
                const name = keyName(prop.key);
                if (!name) continue;
                replaceValue(prop.value, name, prop.shorthand);
            }
        };

        const objectDeclarations = new Map();
        walk(ast, (node) => {
            if (node.type === "VariableDeclarator" && node.id.type === "Identifier" && node.init?.type === "ObjectExpression") {
                objectDeclarations.set(node.id.name, node.init);
            }
        });
        const processedObjects = new Set();

        const processStyleValue = (value) => {
            if (!value) return;
            if (value.type === "Identifier" && objectDeclarations.has(value.name)) {
                const init = objectDeclarations.get(value.name);
                if (!processedObjects.has(init)) {
                    processedObjects.add(init);
                    processStyleObject(init);
                }
                return;
            }
            if (value.type === "ObjectExpression") {
                if (processedObjects.has(value)) return;
                processedObjects.add(value);
                processStyleObject(value);
            }
            else if (value.type === "ConditionalExpression") {
                processStyleValue(value.consequent);
                processStyleValue(value.alternate);
            } else if (value.type === "LogicalExpression") processStyleValue(value.right);
        };

        const processMotionValue = (value) => {
            if (value?.type === "ConditionalExpression") {
                processMotionValue(value.consequent);
                processMotionValue(value.alternate);
                return;
            }
            if (value?.type !== "ObjectExpression") return;
            for (const prop of value.properties) {
                if (prop.type !== "Property" || prop.computed) continue;
                const name = keyName(prop.key);
                if (!name || MOTION_UNITLESS.has(name)) continue;
                if (name === "transition" || name === "clipPath") continue;
                replaceValue(prop.value, name, false, true);
            }
        };

        const styleFunctions = [];

        walk(ast, (node) => {
            if (node.type === "Property" && !node.computed && /^(style|[a-z]\w*Style)$/.test(keyName(node.key) || "")) {
                processStyleValue(node.value);
            }
            if (node.type === "VariableDeclarator" && node.id.type === "Identifier" && /style$/i.test(node.id.name)) {
                const init = node.init;
                if (init?.type === "ArrowFunctionExpression" || init?.type === "FunctionExpression") styleFunctions.push(init);
                else processStyleValue(init);
            }
            if (node.type === "FunctionDeclaration" && /Style$/.test(node.id?.name || "")) styleFunctions.push(node);
            if (node.type === "Property" && !node.computed && MOTION_KEYS.has(keyName(node.key) || "")) processMotionValue(node.value);
            if (isJsxCall(node) && node.arguments[0]?.type === "Literal" && node.arguments[0].value === "svg" && node.arguments[1]?.type === "ObjectExpression") {
                for (const prop of node.arguments[1].properties) {
                    const name = prop.type === "Property" ? keyName(prop.key) : null;
                    if (name !== "width" && name !== "height") continue;
                    if (prop.value.type === "Literal" && typeof prop.value.value === "string" && /^\d+(\.\d+)?$/.test(prop.value.value)) {
                        out.overwrite(prop.value.start, prop.value.end, JSON.stringify(toRem(Number(prop.value.value))));
                        changed = true;
                    } else replaceValue(prop.value, name, prop.shorthand);
                }
            }
            if (isJsxCall(node) && node.arguments[0]?.type === "Identifier" && SCALED_NUMBER_PROPS[node.arguments[0].name] && node.arguments[1]?.type === "ObjectExpression") {
                const names = SCALED_NUMBER_PROPS[node.arguments[0].name];
                for (const prop of node.arguments[1].properties) {
                    if (prop.type !== "Property" || !names.has(keyName(prop.key))) continue;
                    out.appendLeft(prop.value.start, "__rubberScale(");
                    out.appendRight(prop.value.end, ")");
                    changed = true;
                    usesScale = true;
                }
            }
            if (isJsxCall(node) && node.arguments[0]?.type === "Identifier" && iconNames.has(node.arguments[0].name)) {
                const props = node.arguments[1];
                if (props?.type === "ObjectExpression") {
                    for (const prop of props.properties) {
                        if (prop.type === "Property" && keyName(prop.key) === "size") replaceValue(prop.value, "size");
                    }
                }
            }
        });

        for (const fn of styleFunctions) {
            if (fn.body.type !== "BlockStatement") processStyleValue(fn.body.type === "ParenthesizedExpression" ? fn.body.expression : fn.body);
            else walk(fn.body, (node) => {
                if (node.type === "ReturnStatement") processStyleValue(node.argument);
                if (node.type !== fn.body.type && /Function/.test(node.type)) return false;
            });
        }

        if (!changed) return null;
        if (usesRuntime || usesScale) out.prepend(`import { ${[usesRuntime && "__rubber", usesScale && "__rubberScale"].filter(Boolean).join(", ")} } from "${RUNTIME_ID}";\n`);
        return { code: out.toString(), map: out.generateMap({ hires: true, source: id }) };
    },
});
