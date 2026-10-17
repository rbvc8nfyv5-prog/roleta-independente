(() => {
"use strict";
/*
=========================================================
                 ANÁLISE BETA V6.4.7
=========================================================
BASE: V6.4.6 COMPLETA. Funções e quadros preservados.

NOVO E INTEGRADO AOS MOTORES / TREINADORES / SELETOR:
- Zonas simultâneas, perda de força, retorno e quebra.
- Deslocamento, bordas de saída e amplitude das zonas.
- Triangulação e persistência de formas e tendências.
- Memória auxiliar até 700; janela operacional mantém 70.
- Transições por região e espelho / antiespelho nos pesos.
- Geometria exata 5x5 + 1x3, sempre 28 números únicos.
- Pontuações geométricas normalizadas entre os motores.
- Diversidade no consenso; classificação das falhas.
- Autoajuste global preservado e ajustes locais em teste.
- Ajuste local exige aprendizado e confirmação separados.
- Seletor compara entradas, contexto e adequação estrutural.
- Motivos, fatores e alternativas registrados na decisão.
- Treinamento virtual alinhado à 2ª casa e gale pulado.
- G1 por evento único e pela defesa escolhida.
- Resumos por padrão; todos os detalhes continuam acessíveis.
- Cache de cálculos e de painéis; dados repetidos compactados.

PRESERVADO:
- Os 12 motores, originais, 12 adaptativas e personalizadas.
- AUTO RANKING exclusivamente entre AUTO 1–4.
- Todos os treinadores e suas regras independentes.
- Treinador numérico original continua sem GREEN/LOSS.
- As três defesas G1 e o congelamento dos ciclos abertos.
- Histórico manual, laboratório, linha do tempo e desfazer.
- Bloqueios NÃO JOGAR e migração da 6.4.6.
- Financeiro somente junto das fichas / G1.

Estados e índices são hipóteses descritivas da sequência.
Esquerda/direita referem-se à ordem W, não à bola real.
As escolhas usam somente resultados já conhecidos.
Não há garantia de acerto ou redução de LOSS.
=========================================================
*/ const VERSION = "6.4.7", KEY = "ANALISE_BETA_V647", N10 = "NUMBER10", SELECTOR = "SELECTOR", WINDOW = 70;
const OLD_KEYS = [ "ANALISE_BETA_V646", "ANALISE_BETA_V645", "ANALISE_BETA_V644", "ANALISE_BETA_V643", "ANALISE_BETA_V642", "ANALISE_BETA_V641", "ANALISE_BETA_V640", "ANALISE_BETA_V639", "ANALISE_BETA_V638", "ANALISE_BETA_V637", "ANALISE_BETA_V636", "ANALISE_BETA_V635", "ANALISE_BETA_V634", "ANALISE_BETA_V633" ];
const W = [ 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26, 0 ];
const RED = new Set([ 1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36 ]);
const REGIONS = {
TIERS: [ 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33 ],
ORFAOS: [ 17, 34, 6, 1, 20, 14, 31, 9 ],
VOISINS: [ 22, 18, 29, 7, 25, 2, 21, 4, 19 ],
ZERO: [ 28, 12, 35, 3, 26, 0, 32, 15 ]
};
const FAMILIES = [ "NORMAL", "DINAMICO", "RX_NORMAL", "RX_DINAMICO" ], RADII = [ 4, 5, 6 ];
const ORIGINALS = [ [ "FIXED", "AUTO RANKING" ], [ "GEO", "MELHOR GEOMETRIA" ], [ "BEST", "MELHOR DESEMPENHO" ], [ "STABLE", "ESTABILIDADE" ], [ "SWITCH", "TROCA INTELIGENTE" ], [ "CONSENSUS", "CONSENSO" ], [ "UNION", "UNIÃO" ] ];
const ADAPTATIVES = Array.from({
length: 12
}, (_, i) => ({
id: "A" + String(i + 1).padStart(2, "0"),
name: "ADAPTATIVA " + String(i + 1).padStart(2, "0"),
window: [ 10, 10, 10, 20, 20, 20, 30, 30, 20, 30, 20, 30 ][i],
margin: [ .05, .1, .15, .05, .1, .15, .05, .1, .08, .12, .1, .08 ][i],
maxRank: [ 12, 12, 12, 12, 12, 12, 12, 12, 12, 6, 4, 8 ][i]
}));
const G1_MODES = [ "CONGELADA", "AJUSTE FINO", "RECONSTRUÇÃO" ], BEHAVIORS = [ "CONTINUIDADE", "DESLOCAMENTO", "RUPTURA" ];
const $ = id => document.getElementById(id), mod = n => (n % 37 + 37) % 37, ix = n => W.indexOf(n), avg = a => a.length ? a.reduce((s, n) => s + n, 0) / a.length : 0, clamp = (n, a, b) => Math.max(a, Math.min(b, n)), copy = x => x == null ? x : JSON.parse(JSON.stringify(x)), fmt = n => Number.isFinite(n) ? n.toFixed(2).replace(".", ",") : "—", pct = (a, b) => b ? fmt(100 * a / b) + "%" : "—";
const nearBand = n => n === 0 ? "0" : n <= 2 ? "1-2" : n <= 4 ? "3-4" : n <= 8 ? "5-8" : "9+";
function esc(x) {
return String(x ?? "").replace(/[&<>"']/g, c => ({
"&": "&amp;",
"<": "&lt;",
">": "&gt;",
'"': "&quot;",
"'": "&#39;"
}[c]));
}
function cleanNumbers(a) {
return Array.isArray(a) ? a.filter(n => Number.isInteger(n) && n >= 0 && n <= 36) : [];
}
function neighbors(n, r) {
const p = ix(n);
return p < 0 ? [] : Array.from({
length: 2 * r + 1
}, (_, i) => W[mod(p + i - r)]);
}
function distance(a, b) {
const x = ix(a), y = ix(b);
if (x < 0 || y < 0) return 18;
const d = Math.abs(x - y);
return Math.min(d, 37 - d);
}
function direction(a, b) {
const x = ix(a), y = ix(b);
if (x < 0 || y < 0) return 0;
const f = mod(y - x), r = mod(x - y);
return f <= r ? f : -r;
}
function region(n) {
return Object.keys(REGIONS).find(k => REGIONS[k].includes(n)) || "ZERO";
}
const MIRROR = new Set;
for (const n of [ 11, 12, 13, 21, 22, 23, 31, 32, 33 ]) for (const x of neighbors(n, 1)) MIRROR.add(x);
function mirror(n) {
return MIRROR.has(n) ? "ESPELHO" : "ANTIESPELHO";
}
function freshN10() {
return {
books: {},
archive: [],
pending: [],
events: [],
choice: null,
sequence: 0,
viewTrigger: "CURRENT",
viewAll: false
};
}
function fresh() {
return {
spatialMemory: {
numbers: [],
lastTurn: 0
},
details: {},
adjustment: {
books: {}
},
selection: freshSelection(),
history: [],
historyTurns: [],
sources: [],
totalTurns: 0,
manualCount: 0,
manualLog: [],
undoStack: [],
strategy: "TRAINER",
rank: 3,
manual: null,
adaptive: "A05",
created: [],
activeCreated: null,
g1: true,
g1Trainer: true,
galeSkip: false,
secondHouse: false,
stake: 1,
multiplier: 1,
phase: "ENTRY",
cycle: null,
defense: null,
previous: null,
trainerChoice: null,
trainerTurns: 0,
trainerChanges: 0,
trainerPending: false,
trainerHistory: [],
numberChoice: null,
numberChanges: 0,
numberHistory: [],
numberCombinations: [],
numberComparisons: [],
n10: freshN10(),
virtual: {},
entryRows: [],
g1Rows: [],
g1Pending: [],
realG1: [],
decisions: [],
ledger: [],
open: {
selector: true,
general: true,
trainer: true,
numbertrainer: true,
numbertrainer10: true,
triangulation: true,
spatial: true,
g1ranking: true,
g1numbers: true,
motors: false,
jumps: false,
mirrors: false,
timeline: true,
lab: false
}
};
}
function signature10(play) {
return play.blocks.map(b => b.radius + ":" + b.center).sort().join("|");
}
function validPlay(p) {
return !!p && typeof p === "object" && Array.isArray(p.numbers) && p.numbers.length === 28 && p.numbers.every(n => Number.isInteger(n) && n >= 0 && n <= 36) && new Set(p.numbers).size === 28 && Array.isArray(p.blocks) && p.blocks.length === 6 && p.blocks.filter(b => b.radius === 2).length === 5 && p.blocks.filter(b => b.radius === 1).length === 1 && p.blocks.every(b => Number.isInteger(b.center) && ix(b.center) >= 0 && Array.isArray(b.numbers) && b.numbers.join(",") === neighbors(b.center, b.radius).join(",")) && p.blocks.flatMap(b => b.numbers).every(n => p.numbers.includes(n));
}
function restoreShape(shape, score) {
const blocks = shape.split("|").map(part => {
const [radius, center] = part.split(":").map(Number);
return {
center: center,
radius: radius,
numbers: neighbors(center, radius)
};
});
const play = {
blocks: blocks,
numbers: blocks.flatMap(b => b.numbers),
score: score
};
if (!validPlay(play)) throw Error("GEOMETRIA SALVA INVÁLIDA.");
return play;
}
function read(key) {
try {
const data = JSON.parse(localStorage.getItem(key) || "null"), contexts = data?.__betaFormat === 647 ? data.contexts : null;
function revive(v) {
if (!v || typeof v !== "object") return v;
if (typeof v.__betaPlay === "string") return restoreShape(v.__betaPlay, v.score);
if (Number.isInteger(v.__betaContext) && Array.isArray(contexts)) {
const keys = contexts[v.__betaContext];
if (!Array.isArray(keys) || !keys.every(x => typeof x === "string")) throw Error("CONTEXTO SALVO INVÁLIDO.");
return [ ...keys ];
}
if (Array.isArray(v)) return v.map(revive);
for (const k of Object.keys(v)) v[k] = revive(v[k]);
return v;
}
return revive(contexts ? data.state : data);
} catch {
return null;
}
}
function pack10(value) {
return JSON.parse(JSON.stringify(value, (k, v) => k === "play" && validPlay(v) ? {
shape10: signature10(v),
score: v.score
} : v));
}
function unpack10(value) {
return !value || typeof value !== "object" ? freshN10() : JSON.parse(JSON.stringify(value), (k, v) => v && typeof v.shape10 === "string" ? restoreShape(v.shape10, v.score) : v);
}
let state = fresh(), busy = false, saveError = "", legacyData = null;
function normalizeState(data) {
const original = cleanNumbers(data.history), r = {
...fresh(),
...data,
history: original.slice(-WINDOW),
open: {
...fresh().open,
...data.open || {}
}
};
for (const n of [ "historyTurns", "sources", "manualLog", "undoStack", "created", "trainerHistory", "numberHistory", "numberCombinations", "numberComparisons", "entryRows", "g1Rows", "g1Pending", "realG1", "decisions", "ledger" ]) if (!Array.isArray(r[n])) r[n] = [];
r.totalTurns = Math.max(original.length, Number(data.totalTurns) || 0, Number(r.ledger.at(-1)?.turn) || 0);
r.sources = r.history.length ? r.sources.slice(-r.history.length) : [];
while (r.sources.length < r.history.length) r.sources.unshift("HISTÓRICO");
r.historyTurns = r.historyTurns.length === original.length ? r.historyTurns.slice(-WINDOW) : r.history.map((_, i) => r.totalTurns - r.history.length + i + 1);
r.manualCount = Math.max(0, Number(r.manualCount) || 0);
r.undoStack = r.undoStack.slice(-WINDOW);
if (!r.virtual || typeof r.virtual !== "object") r.virtual = {};
r.spatialMemory = normalizeMemory(data.spatialMemory, original, r.totalTurns);
r.details = {
...data.details || {}
};
r.adjustment = normalizeAdjustment(data.adjustment);
r.selection = {
...freshSelection(),
...data.selection || {}
};
for (const f of [ "entries", "rows", "history" ]) if (!Array.isArray(r.selection[f])) r.selection[f] = [];
for (const f of [ "cycles", "previous" ]) if (!r.selection[f] || typeof r.selection[f] !== "object") r.selection[f] = {};
try {
r.n10 = {
...freshN10(),
...unpack10(data.n10)
};
if (!r.n10.books || typeof r.n10.books !== "object") r.n10.books = {};
for (const n of [ "archive", "pending", "events" ]) if (!Array.isArray(r.n10[n])) r.n10[n] = [];
for (const b of Object.values(r.n10.books)) {
if (!b.records || typeof b.records !== "object") b.records = {};
for (const v of Object.values(b.records)) {
v.blocked = !!v.blocked || v.status === "REJECTED";
if (!Array.isArray(v.samples)) v.samples = [];
}
}
} catch (e) {
r.n10 = freshN10();
saveError = String(e.message || e);
}
return r;
}
const saved = read(KEY);
if (saved && Array.isArray(saved.history)) state = normalizeState(saved); else for (const key of OLD_KEYS) {
const old = read(key);
if (old?.history?.length) {
legacyData = old;
break;
}
}
function save() {
try {
const contexts = [], ids = new Map;
const payload = {
__betaFormat: 647,
state: state,
contexts: contexts
};
localStorage.setItem(KEY, JSON.stringify(payload, function(k, v) {
if (k === "evidence" && validPlay(this?.play)) return undefined;
if (k === "spatialKeys" && Array.isArray(v) && v.every(x => typeof x === "string")) {
const key = JSON.stringify(v);
let id = ids.get(key);
if (id == null) {
id = contexts.length;
ids.set(key, id);
contexts.push(v);
}
return {
__betaContext: id
};
}
return validPlay(v) ? {
__betaPlay: signature10(v),
score: v.score
} : v;
}));
saveError = "";
return true;
} catch (e) {
saveError = String(e.message || e);
return false;
}
}
function settings() {
return Object.fromEntries([ "strategy", "rank", "manual", "adaptive", "created", "activeCreated", "g1", "g1Trainer", "galeSkip", "secondHouse", "stake", "multiplier", "open", "details" ].map(k => [ k, copy(state[k]) ]));
}
function cycleIsFree() {
return state.phase === "ENTRY" && state.cycle === null;
}
const FIVE = W.map(n => ({
center: n,
radius: 2,
numbers: neighbors(n, 2)
})), THREE = W.map(n => ({
center: n,
radius: 1,
numbers: neighbors(n, 1)
}));
for (const b of [ ...FIVE, ...THREE ]) b.mask = b.numbers.reduce((s, n) => s | 1n << BigInt(ix(n)), 0n);
function geometry(weights, mandatory = []) {
const key = weights.join(",") + "@" + mandatory.join(",");
if (geometryCache.has(key)) return copy(geometryCache.get(key));
let best = null;
for (let c = 0; c < 37; c++) {
const small = THREE[c];
if (!mandatory.every(n => small.numbers.includes(n))) continue;
const free = Array.from({
length: 34
}, (_, j) => W[mod(c + 2 + j)]), prefix = [ 0 ];
for (const n of free) prefix.push(prefix.at(-1) + (weights[ix(n)] || 0));
const dp = Array.from({
length: 6
}, () => Array(35).fill(-Infinity));
for (let pos = 0; pos <= 34; pos++) dp[0][pos] = 0;
for (let k = 1; k <= 5; k++) for (let pos = 34 - 5 * k; pos >= 0; pos--) {
const take = prefix[pos + 5] - prefix[pos] + dp[k - 1][pos + 5], skip = dp[k][pos + 1];
dp[k][pos] = Math.max(take, skip);
}
const value = small.numbers.reduce((a, n) => a + (weights[ix(n)] || 0), 0) + dp[5][0];
if (best && value <= best.score + 1e-12) continue;
const blocks = [ {
center: small.center,
radius: 1,
numbers: [ ...small.numbers ]
} ];
let k = 5, pos = 0;
while (k) {
const take = prefix[pos + 5] - prefix[pos] + dp[k - 1][pos + 5];
if (take >= dp[k][pos + 1] - 1e-12) {
const center = free[pos + 2];
blocks.push({
center: center,
radius: 2,
numbers: neighbors(center, 2)
});
pos += 5;
k--;
} else pos++;
}
best = {
blocks: blocks,
numbers: blocks.flatMap(b => b.numbers),
score: value
};
}
const play = validPlay(best) ? best : null;
boundedCache(geometryCache, key, play, 96);
return copy(play);
}
function missing(play) {
return validPlay(play) ? W.filter(n => !play.numbers.includes(n)) : [ ...W ];
}
/* V6.4.7: contração/expansão e amplitude não são probabilidades. */ function hopTrend(a, b) {
const x = Math.abs(a), y = Math.abs(b);
return !x && !y ? "PARADO" : !x ? "SAÍDA" : !y ? "PARADA" : y < x ? "CONTRAÇÃO" : y > x ? "EXPANSÃO" : "MANUTENÇÃO";
}
function lengthBand(n) {
return n === 0 ? "0" : n <= 6 ? "1-6" : n <= 18 ? "7-18" : n <= 36 ? "19-36" : n <= 72 ? "37-72" : "73+";
}
function routeFeatures(numbers) {
const steps = numbers.slice(1).map((n, i) => direction(numbers[i], n)), net = steps.reduce((s, n) => s + n, 0), length = steps.reduce((s, n) => s + Math.abs(n), 0), signs = new Set(steps.filter(Boolean).map(Math.sign)), sameDirection = signs.size === 1, closure = numbers.length ? distance(numbers[0], numbers.at(-1)) : 0, contour = sameDirection && Math.abs(net) >= 31 && closure <= 6, completedTurns = Math.floor(Math.abs(net) / 37), nearestTurns = Math.round(net / 37), residual = net - nearestTurns * 37, trends = steps.slice(1).map((n, i) => hopTrend(steps[i], n)), labels = [];
if (closure === 0) labels.push("FECHAMENTO EXATO"); else if (closure <= 2) labels.push("FECHAMENTO A 1-2 CASAS"); else if (closure <= 6) labels.push("FECHAMENTO A 3-6 CASAS");
if (contour) labels.push("FECHAMENTO POR CONTORNO");
if (completedTurns) labels.push("VOLTA ACUMULADA " + completedTurns);
if (trends.length) labels.push(trends.at(-1));
return {
numbers: [ ...numbers ],
steps: steps,
net: net,
length: length,
sameDirection: sameDirection,
closure: closure,
contour: contour,
completedTurns: completedTurns,
nearestTurns: nearestTurns,
residual: residual,
trends: trends,
amplitude: Math.max(0, ...steps.map(Math.abs)),
efficiency: length ? Math.abs(net) / length : 0,
labels: labels
};
}
function normalizeSpace(w) {
const mean = avg(w) || 1;
return w.map(v => v / mean);
}
function routeSimilarity(a, b) {
if (a.steps.length !== b.steps.length) return 0;
const order = avg(a.steps.map((v, i) => Math.abs(v - b.steps[i]))), trend = avg(a.trends.map((v, i) => v === b.trends[i] ? 1 : 0));
return Math.exp(-Math.abs(a.net - b.net) / 10 - Math.abs(a.closure - b.closure) / 4 - Math.abs(a.length - b.length) / 12 - order / 6) * (a.contour === b.contour ? 1 : .35) * (a.sameDirection === b.sameDirection ? 1 : .5) * (.5 + .5 * (a.trends.length ? trend : 1));
}
function routeRead(h) {
const current = [];
for (let size = 3; size <= Math.min(8, h.length); size++) current.push(routeFeatures(h.slice(-size)));
const weights = Array(37).fill(1), matched = new Set;
let examples = 0;
for (const r of current) {
const size = r.numbers.length;
for (let end = size - 1; end < h.length - 1; end++) {
const old = routeFeatures(h.slice(end - size + 1, end + 1)), similarity = routeSimilarity(old, r), recency = Math.exp(-(h.length - 2 - end) / 30), projected = W[mod(ix(h.at(-1)) + direction(h[end], h[end + 1]))];
if (similarity > .35) {
examples++;
matched.add(end + 1);
}
for (let j = 0; j < 37; j++) weights[j] += similarity * recency * Math.exp(-distance(W[j], projected) / 2) / Math.sqrt(size);
}
}
const triangle = current.find(r => r.numbers.length === 3), chain = current.find(r => r.numbers.length === 4), key = triangle ? "R:C" + Number(triangle.contour) + "|F" + nearBand(triangle.closure) + "|D" + Math.sign(triangle.net) + "|V" + Math.min(2, chain?.completedTurns || 0) + "|L" + lengthBand(triangle.length) + "|H" + triangle.trends.join(",") : "R:SEM PERCURSO";
return {
current: current,
examples: examples,
uniqueExamples: matched.size,
weights: normalizeSpace(weights),
key: key,
triangle: triangle || null,
chain: chain || null
};
}
const triangleCache = new Map;
function pointTriangle(n) {
const a = 2 * Math.PI * ix(n) / 37;
return {
x: Math.sin(a),
y: Math.cos(a)
};
}
function angleTriangle(a, b, c) {
const u = {
x: a.x - b.x,
y: a.y - b.y
}, v = {
x: c.x - b.x,
y: c.y - b.y
}, d = Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y);
return d < 1e-12 ? null : Math.acos(clamp((u.x * v.x + u.y * v.y) / d, -1, 1)) * 180 / Math.PI;
}
function triangleFeatures(a, b, c) {
const s1 = direction(a, b), s2 = direction(b, c), closure = distance(a, c), p = pointTriangle(a), q = pointTriangle(b), r = pointTriangle(c), area = Math.abs((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x)) / 2;
let type = "MUDANÇA DE SETOR";
if (a === b && b === c) type = "REPETIÇÃO"; else if (a === c) type = "RETORNO EXATO"; else if (b === c) type = "REPETIÇÃO FINAL"; else if (!s1) type = "SAÍDA DA REPETIÇÃO"; else if (Math.sign(s1) === Math.sign(s2)) type = "CONTINUAÇÃO"; else if (closure < Math.abs(s1)) type = "RETORNO PARCIAL"; else type = "INVERSÃO COM AFASTAMENTO";
const route = routeFeatures([ a, b, c ]);
return {
a: a,
b: b,
c: c,
s1: s1,
s2: s2,
closure: closure,
area: area,
type: type,
route: route,
trend: hopTrend(s1, s2),
ratio: Math.abs(s1) ? Math.abs(s2) / Math.abs(s1) : null,
contour: route.contour,
labels: [ type, ...route.labels ],
chords: [ Math.hypot(p.x - q.x, p.y - q.y), Math.hypot(q.x - r.x, q.y - r.y), Math.hypot(p.x - r.x, p.y - r.y) ],
angles: [ angleTriangle(q, p, r), angleTriangle(p, q, r), angleTriangle(p, r, q) ],
degenerate: area < 1e-10
};
}
function triangleContext(h) {
if (h.length < 3) return "SEM TRINCA";
const f = triangleFeatures(...h.slice(-3));
return f.type + "|F:" + nearBand(f.closure) + "|C:" + Number(f.contour) + "|S:" + Math.sign(f.route.net) + "|H:" + f.trend + "|L:" + lengthBand(f.route.length);
}
function triangleAnalysis(h) {
const key = h.join(",");
if (triangleCache.has(key)) return triangleCache.get(key);
const triples = [];
for (let i = 0; i + 2 < h.length; i++) triples.push({
...triangleFeatures(h[i], h[i + 1], h[i + 2]),
position: i + 3
});
const weights = Array(37).fill(1), counts = {};
for (const t of triples) for (const label of t.labels) counts[label] = (counts[label] || 0) + 1;
let matches = 0, exactPairs = 0;
if (h.length >= 2) {
const a = h.at(-2), b = h.at(-1), jump = direction(a, b), candidates = W.map(n => triangleFeatures(a, b, n));
for (const t of triples) {
const hop = Math.exp(-Math.abs(t.s1 - jump) / 4) * (Math.sign(t.s1) === Math.sign(jump) ? 1 : .2), physical = Math.exp(-(distance(a, t.a) + distance(b, t.b)) / 10), recency = Math.exp(-(h.length - t.position) / 30), exact = t.a === a && t.b === b;
if (exact) exactPairs++;
if (hop > .3) matches++;
for (let j = 0; j < 37; j++) {
const f = candidates[j], second = Math.exp(-Math.abs(f.s2 - t.s2) / 3.5), close = Math.exp(-Math.abs(f.closure - t.closure) / 4), area = Math.exp(-Math.abs(f.area - t.area) * 2), angle = f.angles[1] == null || t.angles[1] == null ? f.degenerate === t.degenerate ? 1 : .2 : Math.exp(-Math.abs(f.angles[1] - t.angles[1]) / 30), shape = (f.type === t.type ? 1 : .15) * .45 + (f.contour === t.contour ? 1 : .15) * .25 + (f.trend === t.trend ? 1 : .15) * .3, amplitude = Math.exp(-Math.abs(f.route.length - t.route.length) / 10);
weights[j] += recency * (hop * .7 + physical * .3) * (second * .3 + close * .15 + area * .1 + angle * .1 + shape * .2 + amplitude * .15);
if (exact) weights[j] += recency * 2 * Math.exp(-distance(W[j], t.c) / 1.8);
}
}
}
const r = {
triples: triples,
last: triples.at(-1) || null,
weights: normalizeSpace(weights),
counts: counts,
matches: matches,
exactPairs: exactPairs,
context: triangleContext(h),
samples: triples.length
};
triangleCache.set(key, r);
if (triangleCache.size > 180) triangleCache.delete(triangleCache.keys().next().value);
return r;
}
function applyTriangle(weights, h, strength = .28) {
const a = triangleAnalysis(h);
if (!a.samples) return weights;
const scale = avg(weights.map(x => Math.max(0, x))) || 1, reliability = Math.min(1, a.samples / 20);
for (let j = 0; j < 37; j++) weights[j] = Math.max(.001, weights[j] + scale * strength * reliability * clamp(a.weights[j] - 1, -.75, 2));
return weights;
}
function triangleCoverage(play, h) {
if (!validPlay(play)) return 0;
const w = triangleAnalysis(h).weights;
return play.numbers.reduce((s, n) => s + w[ix(n)], 0) / w.reduce((s, n) => s + n, 0);
}
/* Arcos: formação >=30% (mínimo 3); enfraquecido abaixo disso;
   encerra após duas avaliações fracas ou imediatamente com 12 fora. */ function arcCandidates(h) {
const recent = h.slice(-20);
return W.map((_, start) => {
const numbers = Array.from({
length: 8
}, (_, j) => W[mod(start + j)]);
return {
start: start,
numbers: numbers,
count: recent.filter(n => numbers.includes(n)).length,
total: recent.length
};
}).sort((a, b) => b.count - a.count || a.start - b.start);
}
function arcMinimum(a) {
return Math.max(3, Math.ceil(a.total * .3));
}
function selectArc(h, active) {
if (h.length < 6) return null;
const ranked = arcCandidates(h), best = ranked[0], old = active ? ranked.find(a => a.start === active.start) : null, qualified = best.count >= arcMinimum(best);
if (!active || active.active === false) return qualified ? best : null;
if (old.count < arcMinimum(old)) {
if (qualified && best.start !== old.start) return best;
return active.weak >= 1 || active.outside >= 12 ? null : old;
}
return qualified && (best.count > old.count + 1 || active.outside >= 3 && best.count > old.count) ? best : old;
}
function arcContext(a, event = a.event) {
return "S" + a.start + "|E" + event + "|Q" + (a.count >= arcMinimum(a) ? "FORTE" : "FRACO") + "|D" + Math.min(3, a.outside) + "|I" + Math.min(3, a.inside);
}
function trackArcs(h) {
let active = null, last = null;
const events = [], episodes = [], transitions = {}, contextTransitions = {};
function setArc(candidate, position) {
if (!candidate) {
if (active) {
active.active = false;
active.strength = 0;
active.event = "ENCERRADO";
episodes.push(copy(active));
events.push({
position: position,
number: null,
arcId: active.id,
start: active.start,
event: "ENCERRADO",
inside: false,
gap: active.lastGap,
outside: active.outside
});
last = active;
active = null;
}
return;
}
if (active?.start === candidate.start) {
active.count = candidate.count;
active.total = candidate.total;
active.weak = candidate.count < arcMinimum(candidate) ? active.weak + 1 : 0;
active.health = active.weak ? "ENFRAQUECIDO" : "FORTE";
active.strength = active.weak ? .25 : 1;
return;
}
if (active) {
active.active = false;
active.event = "SUBSTITUÍDO";
episodes.push(copy(active));
last = active;
}
active = {
...candidate,
id: "ARC@" + position + ":" + candidate.start,
formedBefore: position,
active: true,
health: "FORTE",
strength: 1,
weak: 0,
lastInside: null,
seenInside: false,
event: "NOVO ARCO",
inside: 0,
outside: 0,
entries: 0,
exits: 0,
returns: 0,
lastGap: 0,
maxGap: 0,
drift: last ? direction(W[last.start], W[candidate.start]) : 0
};
}
for (let i = 0; i < h.length; i++) {
setArc(selectArc(h.slice(0, i), active), i + 1);
if (!active) continue;
const number = h[i], inside = active.numbers.includes(number), priorEvent = active.event;
if (active.lastInside != null) {
for (const [map, key] of [ [ transitions, priorEvent ], [ contextTransitions, arcContext(active, priorEvent) ] ]) {
const b = map[key] || (map[key] = {
total: 0,
hits: 0
});
b.total++;
if (inside) b.hits++;
}
}
if (inside) {
if (active.lastInside === false) {
active.lastGap = active.outside;
active.entries++;
if (active.seenInside) {
active.returns++;
active.event = "REENTRADA";
} else active.event = "ENTRADA";
} else if (active.lastInside === true) active.event = "PERMANÊNCIA"; else {
active.entries++;
active.event = "ENTRADA";
}
active.inside = active.lastInside === true ? active.inside + 1 : 1;
active.outside = 0;
active.seenInside = true;
} else {
if (active.lastInside === true) {
active.exits++;
active.event = "SAÍDA";
} else active.event = active.outside >= 3 ? "AFASTAMENTO" : "FORA";
active.outside++;
active.inside = 0;
active.maxGap = Math.max(active.maxGap, active.outside);
}
active.lastInside = inside;
events.push({
position: i + 1,
number: number,
arcId: active.id,
start: active.start,
event: active.event,
health: active.health,
inside: inside,
gap: active.lastGap,
outside: active.outside
});
}
setArc(selectArc(h, active), h.length + 1);
return {
active: active,
last: last,
events: events,
episodes: episodes,
transitions: transitions,
contextTransitions: contextTransitions,
ranked: arcCandidates(h)
};
}
/* Polos: convergência <=6, fusão <=4; fusão encerra a alternância.
   A concentração fundida é acompanhada, sem fingir dois polos separados. */ function trackPoles(h) {
let active = null, concentration = null;
const events = [], episodes = [];
for (let i = 0; i < h.length; i++) {
const n = h[i];
if (concentration?.active) {
if (distance(n, concentration.center) <= 4) {
concentration.center = n;
concentration.visits++;
concentration.outside = 0;
} else if (++concentration.outside >= 2) concentration.active = false;
}
if (active?.active) {
const previous = distance(...active.anchors), expected = 1 - active.lastSide, de = distance(n, active.anchors[expected]), ds = distance(n, active.anchors[active.lastSide]);
if (de <= 4 && de <= ds) {
const interrupted = ![ "ALTERNÂNCIA", "FORMADO", "CONVERGÊNCIA", "DIVERGÊNCIA" ].includes(active.event), shift = direction(active.anchors[expected], n);
active.drift[expected] += shift;
active.lastShift[expected] = shift;
active.anchors[expected] = n;
active.lastSide = expected;
active.alternations++;
active.outside = 0;
active.event = interrupted ? "RETOMADA" : "ALTERNÂNCIA";
} else if (ds <= 4) {
const side = active.lastSide, shift = direction(active.anchors[side], n);
active.lastShift[side] = shift;
active.drift[side] += shift;
active.anchors[side] = n;
active.interruptions++;
active.outside = 0;
active.event = "INTERRUPÇÃO";
} else {
active.outside++;
active.event = active.outside >= 2 ? "RUPTURA" : "SAÍDA DOS POLOS";
if (active.outside >= 2) active.active = false;
}
active.separation = distance(...active.anchors);
active.movement = active.separation < previous ? "CONVERGÊNCIA" : active.separation > previous ? "DIVERGÊNCIA" : "MANUTENÇÃO";
if (active.active && active.separation <= 4) {
active.active = false;
active.event = "FUSÃO";
concentration = {
active: true,
center: n,
formed: i + 1,
visits: 1,
outside: 0,
origins: [ ...active.anchors ]
};
} else if (active.active && active.outside === 0 && active.separation <= 6 && active.movement === "CONVERGÊNCIA") active.event = "CONVERGÊNCIA";
if (!active.active) episodes.push(copy(active));
events.push({
position: i + 1,
number: n,
event: active.event,
movement: active.movement,
separation: active.separation,
anchors: [ ...active.anchors ],
drift: [ ...active.drift ]
});
}
if (!active?.active && i >= 3) {
const [a, b, c, d] = h.slice(i - 3, i + 1);
if (distance(a, c) <= 2 && distance(b, d) <= 2 && Math.min(distance(a, b), distance(c, d)) >= 8) {
active = {
id: "POLES@" + (i + 1),
active: true,
start: i - 2,
anchors: [ c, d ],
initial: [ a, b ],
lastSide: 1,
drift: [ direction(a, c), direction(b, d) ],
lastShift: [ direction(a, c), direction(b, d) ],
alternations: 2,
interruptions: 0,
outside: 0,
event: "FORMADO",
movement: "MANUTENÇÃO",
separation: distance(c, d)
};
concentration = null;
events.push({
position: i + 1,
number: n,
event: "FORMADO",
movement: active.movement,
separation: active.separation,
anchors: [ c, d ],
drift: [ ...active.drift ]
});
}
}
}
return {
active: active,
events: events,
episodes: episodes,
concentration: concentration
};
}
function chainFeatures(h) {
if (h.length < 4) return null;
const [a, b, c, d] = h.slice(-4), first = triangleFeatures(a, b, c), second = triangleFeatures(b, c, d), hops = [ direction(a, b), direction(b, c), direction(c, d) ], route = routeFeatures([ a, b, c, d ]);
return {
numbers: [ a, b, c, d ],
hops: hops,
first: first,
second: second,
route: route,
key: first.type + ":" + nearBand(first.closure) + ":" + first.trend + ">" + second.type + ":" + nearBand(second.closure) + ":" + second.trend + "|L" + lengthBand(route.length) + "|S" + hops.map(Math.sign).join(",")
};
}
const spaceCache = new Map, rawSpaceCache = new Map;
const COMPONENTS = [ "triangle", "chain", "pole", "arc", "route" ], BASE_SHARES = [ .35, .2, .15, .15, .15 ];
function rawSpatial(h) {
const key = h.join(",");
if (rawSpaceCache.has(key)) return rawSpaceCache.get(key);
const route = routeRead(h), tri = triangleAnalysis(h), arcs = trackArcs(h), poles = trackPoles(h), chain = chainFeatures(h), cw = Array(37).fill(1), pw = Array(37).fill(1), aw = Array(37).fill(1);
let chainExamples = 0;
if (chain) for (let end = 3; end < h.length - 1; end++) {
const old = chainFeatures(h.slice(end - 3, end + 1)), diff = avg(chain.hops.map((s, j) => Math.abs(s - old.hops[j]))), shape = (old.first.type === chain.first.type ? .5 : 0) + (old.second.type === chain.second.type ? .5 : 0), similarity = Math.exp(-diff / 4) * (.25 + .75 * shape) * (.5 + .5 * Number(old.route.trends.join(",") === chain.route.trends.join(","))), recency = Math.exp(-(h.length - 2 - end) / 30), projected = W[mod(ix(h.at(-1)) + direction(h[end], h[end + 1]))];
if (similarity > .25) chainExamples++;
for (let j = 0; j < 37; j++) cw[j] += similarity * recency * Math.exp(-distance(W[j], projected) / 2);
}
const p = poles.active;
if (p?.active) {
const expected = 1 - p.lastSide, anchor = p.anchors[expected], shift = clamp(p.lastShift[expected], -2, 2), projected = W[mod(ix(anchor) + shift)], strength = Math.min(1, p.alternations / 5) * (p.event === "SAÍDA DOS POLOS" ? .25 : p.event === "INTERRUPÇÃO" ? .45 : p.event === "CONVERGÊNCIA" ? .6 : 1);
for (let j = 0; j < 37; j++) pw[j] += strength * (Math.exp(-distance(W[j], anchor) / 2) + .4 * Math.exp(-distance(W[j], projected) / 2));
}
const concentration = poles.concentration;
if (!p?.active && concentration?.active) {
const strength = Math.min(.7, concentration.visits / 8) / (1 + concentration.outside);
for (let j = 0; j < 37; j++) pw[j] += strength * Math.exp(-distance(W[j], concentration.center) / 2);
}
const a = arcs.active;
let arcEvidence = {
hits: 0,
total: 0,
score: 8 / 37
};
if (a) {
const zone = zoneSnapshot(h, a.start);
a.health = zone.health;
a.strength *= zone.health === "QUEBRA CONFIRMADA" ? .15 : zone.health === "QUEBRA EM CONFIRMAÇÃO" ? .35 : zone.health === "PERDENDO FORÇA" ? .45 : 1;
const base = 8 / 37, b = arcs.contextTransitions[arcContext(a)] || {
hits: 0,
total: 0
}, historical = (b.hits + base * 10) / (b.total + 10), density = (a.count + base * 8) / (a.total + 8), confidence = Math.min(1, a.total / 16) * a.strength, sectorMass = clamp(historical * .75 + density * .25, .05, .7);
arcEvidence = {
...b,
score: historical
};
for (let j = 0; j < 37; j++) {
const target = a.numbers.includes(W[j]) ? sectorMass * 37 / 8 : (1 - sectorMass) * 37 / 29;
aw[j] = 1 + (target - 1) * confidence;
}
}
const chainWeights = normalizeSpace(cw), poleWeights = normalizeSpace(pw), arcWeights = normalizeSpace(aw), keys = [ "T:" + tri.context ];
if (route.triangle) keys.push(route.key);
if (chain) keys.push("C:" + chain.key);
if (p?.active) keys.push("P:" + p.event + "|D:" + nearBand(p.separation) + "|M:" + p.movement + "|F:" + Math.sign(p.drift[0]) + "," + Math.sign(p.drift[1])); else if (concentration?.active) keys.push("P:FUSÃO|S:" + ix(concentration.center) + "|F:" + Math.min(2, concentration.outside));
if (a) keys.push("A:" + arcContext(a)); else keys.push("A:SEM ARCO ATIVO");
const r = {
tri: tri,
arcs: arcs,
poles: poles,
chain: chain,
route: route,
chainExamples: chainExamples,
chainWeights: chainWeights,
poleWeights: poleWeights,
arcWeights: arcWeights,
arcEvidence: arcEvidence,
keys: keys,
components: [ tri.weights, chainWeights, poleWeights, arcWeights, route.weights ]
};
rawSpaceCache.set(key, r);
if (rawSpaceCache.size > 240) rawSpaceCache.delete(rawSpaceCache.keys().next().value);
return r;
}
/* Cada amostra adaptativa prevê h[end] usando exclusivamente h[0..end-1].
   Um resultado conta uma vez por componente, mesmo com percursos sobrepostos.
   Log-score regularizado; não usa resultado futuro nem aposta retrospectiva. */ function adaptiveSpatial(h) {
const sums = Array(5).fill(0), details = [];
let samples = 0;
for (let end = Math.max(8, h.length - 24); end < h.length; end++) {
const r = rawSpatial(h.slice(0, end)), n = ix(h[end]);
for (let k = 0; k < 5; k++) sums[k] += clamp(Math.log(Math.max(.01, r.components[k][n])), -2, 2);
samples++;
}
const confidence = samples / (samples + 16), gains = sums.map(s => Math.exp(clamp((samples ? s / samples : 0) * 4 * confidence, -.5, .5))), unnormalized = BASE_SHARES.map((b, k) => b * gains[k]), total = unnormalized.reduce((s, n) => s + n, 0), shares = unnormalized.map(n => n / total);
for (let k = 0; k < 5; k++) details.push({
component: COMPONENTS[k],
base: BASE_SHARES[k],
share: shares[k],
samples: samples,
meanLogGain: samples ? sums[k] / samples : 0
});
return {
shares: shares,
details: details,
samples: samples,
confidence: confidence
};
}
function spatialRead(h) {
h = h.slice(-WINDOW);
const key = computationRevision + "|" + h.join(",");
if (spaceCache.has(key)) return spaceCache.get(key);
const raw = rawSpatial(h), adaptive = adaptiveSpatial(h), structure = structuralRead(h), auxiliary = auxiliaryWeights(h), strength = Math.min(.2, Math.max(0, h.length - 5) / 100), base = W.map((_, j) => raw.components.reduce((sum, w, k) => sum + w[j] * adaptive.shares[k], 0)), weights = normalizeSpace(base.map((v, j) => v * (1 - strength) + structure.weights[j] * strength * .65 + auxiliary.weights[j] * strength * .35)), r = {
...raw,
adaptive: adaptive,
weights: weights,
structure: structure,
auxiliary: auxiliary,
keys: [ ...raw.keys, structure.key ]
};
return boundedCache(spaceCache, key, r, 120);
}
function clearSpatialCaches() {
invalidateComputations();
geometryCache.clear();
structureCache.clear();
triangleCache.clear();
spaceCache.clear();
rawSpaceCache.clear();
}
function applySpatial(weights, h, strength = .3) {
if (h.length < 3) return weights;
const r = spatialRead(h), scale = avg(weights.map(v => Math.max(0, v))) || 1, reliability = Math.min(1, (h.length - 2) / 20);
for (let j = 0; j < 37; j++) weights[j] = Math.max(.001, weights[j] + scale * strength * reliability * clamp(r.weights[j] - 1, -.75, 2));
return weights;
}
function spatialCoverage(play, h) {
if (!validPlay(play)) return 0;
const w = spatialRead(h).weights;
return play.numbers.reduce((s, n) => s + w[ix(n)], 0) / w.reduce((s, n) => s + n, 0);
}
function spatialMatch(keys, current) {
if (!keys?.length) return 0;
const importance = {
T: .15,
C: .15,
P: .15,
A: .15,
R: .15,
Z: .25
};
return current.reduce((sum, k) => {
const weight = importance[k[0]] || 0;
if (keys.includes(k)) return sum + weight;
const prefix = k.split("|")[0], parts = k.split("|");
const similar = keys.filter(old => old[0] === k[0] && old.split("|")[0] === prefix);
if (!similar.length) return sum;
const ratio = Math.max(...similar.map(old => parts.filter(p => old.split("|").includes(p)).length / parts.length));
return sum + weight * .35 * ratio;
}, 0);
}
function spatialMetrics(rows, h, hit = r => r.result !== "LOSS") {
const keys = spatialRead(h).keys;
let support = 0, weightedHits = 0, total = 0, hits = 0;
for (const row of rows) {
const w = spatialMatch(row.spatialKeys || (row.triangleKey ? [ "T:" + row.triangleKey ] : []), keys);
if (!w) continue;
support += w;
total++;
if (hit(row)) {
weightedHits += w;
hits++;
}
}
return {
total: total,
hits: hits,
loss: total - hits,
support: support,
score: (weightedHits + 28 / 37 * 8) / (support + 8)
};
}
function analyze(h) {
const transitions = [];
for (let i = Math.max(1, h.length - 45); i < h.length; i++) {
const a = h[i - 1], b = h[i], physical = direction(a, b);
transitions.push({
from: a,
to: b,
numeric: b - a,
physical: physical,
distance: Math.abs(physical),
mirrorFrom: mirror(a),
mirrorTo: mirror(b)
});
}
function streak(field) {
const sign = Math.sign(transitions.at(-1)?.[field] || 0);
let length = 0;
if (sign) for (let i = transitions.length - 1; i >= 0; i--) {
if (Math.sign(transitions[i][field]) !== sign) break;
length++;
}
return {
dir: sign,
length: length
};
}
const regions = {};
for (const name of Object.keys(REGIONS)) {
let absence = 0;
for (let i = h.length - 1; i >= 0; i--) {
if (region(h[i]) === name) break;
absence++;
}
regions[name] = {
absence: absence,
recent: h.slice(-12).filter(n => region(n) === name).length
};
}
const last3 = transitions.slice(-3), previous3 = transitions.slice(-6, -3);
return {
transitions: transitions,
last6: transitions.slice(-6),
numericStreak: streak("numeric"),
physicalStreak: streak("physical"),
mean3: avg(last3.map(x => x.distance)),
previous3: avg(previous3.map(x => x.distance)),
acceleration: avg(last3.map(x => x.distance)) - avg(previous3.map(x => x.distance)),
regions: regions
};
}
function weightsFor(h, family, radius) {
const weights = Array(37).fill(.01), recent = h.slice(-60);
for (let k = 0; k < recent.length; k++) {
const p = ix(recent[recent.length - 1 - k]), decay = Math.exp(-k / (radius * 2.3));
for (let j = 0; j < 37; j++) {
const d = Math.min(Math.abs(p - j), 37 - Math.abs(p - j));
if (d <= 6) weights[j] += decay * (7 - d) / 7;
}
}
if (family.includes("DINAMICO")) for (let k = 0; k < Math.min(radius + 2, h.length); k++) {
const p = ix(h[h.length - 1 - k]);
for (let j = 0; j < 37; j++) {
const d = Math.min(Math.abs(p - j), 37 - Math.abs(p - j));
if (d <= 3) weights[j] += (4 - d) / (k + 2) * 1.7;
}
}
if (family.startsWith("RX")) {
const length = Math.min(radius, h.length - 2), matches = [];
if (length >= 2) {
for (let i = 0; i + length < h.length - 1; i++) {
let score = 0;
for (let j = 0; j < length; j++) score += Math.max(0, 6 - distance(h[h.length - length + j], h[i + j])) / 6;
matches.push({
score: score / length,
next: h[i + length]
});
}
matches.sort((a, b) => b.score - a.score);
for (const m of matches.slice(0, 12)) {
const p = ix(m.next);
for (let j = 0; j < 37; j++) {
const d = Math.min(Math.abs(p - j), 37 - Math.abs(p - j));
if (d <= 3) weights[j] += (4 - d) * m.score * .45;
}
}
}
}
if (h.length >= 3) {
const a = analyze(h), last = h.at(-1), nb = a.last6.filter(x => x.numeric > 0).length - a.last6.filter(x => x.numeric < 0).length, pb = a.last6.filter(x => x.physical > 0).length - a.last6.filter(x => x.physical < 0).length, expected = clamp(Math.round(avg(a.last6.map(x => x.distance))), 1, 18);
for (const n of W) {
const pd = direction(last, n), d = Math.abs(pd);
let b = 0;
if (nb && Math.sign(n - last) === Math.sign(nb)) b += .1;
if (pb && Math.sign(pd) === Math.sign(pb)) b += .12;
if (Math.abs(d - expected) <= 2) b += .09;
if (a.numericStreak.length >= 2 && Math.sign(n - last) === a.numericStreak.dir) b += .07;
if (a.physicalStreak.length >= 2 && Math.sign(pd) === a.physicalStreak.dir) b += .07;
if (a.acceleration >= 3 && d >= 10) b += .07;
if (a.acceleration <= -3 && d <= 5) b += .07;
weights[ix(n)] += b * radius / 5;
}
}
return applySpatial(weights, h, .3 + (radius - 4) * .035 + (family.startsWith("RX") ? .035 : 0));
}
function motors(h) {
if (h.length < 8) return [];
const cacheKey = computationRevision + "|" + h.join(",");
if (motorCache.has(cacheKey)) return motorCache.get(cacheKey);
const result = [], s = spatialRead(h);
for (const family of FAMILIES) for (const radius of RADII) {
if (family.startsWith("RX") && h.length < radius * 2 + 4) continue;
const play = geometry(weightsFor(h, family, radius));
if (!validPlay(play)) continue;
result.push(adjustMotor({
key: family + "_" + radius,
family: family,
radius: radius,
score: play.score,
triangleScore: triangleCoverage(play, h),
spatialScore: spatialCoverage(play, h),
triangleKey: triangleContext(h),
spatialKeys: [ ...s.keys ],
spatialVersion: VERSION,
componentShares: [ ...s.adaptive.shares ],
adaptiveSamples: s.adaptive.samples,
play: play
}, h));
}
for (const m of result) {
const w = weightsFor(h, m.family, m.radius);
m.rawScore = m.score;
m.score = m.play.numbers.reduce((sum, n) => sum + w[ix(n)], 0) / w.reduce((sum, n) => sum + n, 0);
m.normalizedGeometry = true;
m.evidence = decisionEvidence(m, h);
}
result.sort((a, b) => b.score - a.score || a.key.localeCompare(b.key));
result.forEach((m, i) => {
m.rank = i + 1;
});
const diverse = motorDiversity(result);
for (const m of diverse) m.evidence.features.diversity = m.diversity;
return boundedCache(motorCache, cacheKey, diverse, 12);
}
function generateNumberCombination(h) {
if (h.length < 8) return null;
const trigger = h.at(-1), weights = Array(37).fill(.02), recent = h.slice(-60);
for (let k = 0; k < recent.length; k++) {
const p = ix(recent[recent.length - 1 - k]), decay = Math.exp(-k / 18);
for (let j = 0; j < 37; j++) {
const d = Math.min(Math.abs(p - j), 37 - Math.abs(p - j));
if (d <= 5) weights[j] += decay * (6 - d) / 6;
}
}
if (h.length >= 2) {
const expected = mod(ix(trigger) + direction(h.at(-2), trigger));
for (let j = 0; j < 37; j++) {
const d = Math.min(Math.abs(expected - j), 37 - Math.abs(expected - j));
if (d <= 4) weights[j] += (5 - d) * .14;
}
}
for (let i = 0; i < h.length - 1; i++) {
if (h[i] !== trigger) continue;
const p = ix(h[i + 1]), decay = Math.exp(-(h.length - 1 - i) / 28);
for (let j = 0; j < 37; j++) {
const d = Math.min(Math.abs(p - j), 37 - Math.abs(p - j));
if (d <= 3) weights[j] += decay * (4 - d) / 4 * .9;
}
}
applySpatial(weights, h, .35);
const play = geometry(weights);
return validPlay(play) ? {
key: "NUMERO_GERADO_" + trigger,
name: "COMBINAÇÃO DO " + trigger,
trigger: trigger,
score: play.score,
spatialScore: spatialCoverage(play, h),
play: play
} : null;
}
function registerNumberCombination(h, turn) {
const g = generateNumberCombination(h);
if (g) state.numberCombinations.push({
id: "NC_" + turn,
turn: turn,
origin: g.trigger,
motor: g.key,
play: copy(g.play),
centers: g.play.blocks.map(b => b.center),
covered: [ ...g.play.numbers ],
triangleKey: triangleContext(h),
spatialKeys: [ ...spatialRead(h).keys ]
});
}
function numberTransitions(h, trigger) {
h = memoryHistory(h);
const rows = [];
for (let i = 0; i < h.length - 1; i++) if (h[i] === trigger) rows.push({
next: h[i + 1],
age: h.length - 1 - i,
position: i + 2,
triggerPosition: i + 1
});
return rows;
}
function compareNumberCombination(record, trigger, h) {
const transitions = numberTransitions(h, trigger), covered = new Set(record.covered), matchedNumbers = [], missedNumbers = [];
let matches = 0, weightedMatches = 0, totalWeight = 0;
for (const t of transitions) {
const w = Math.exp(-t.age / 35);
totalWeight += w;
if (covered.has(t.next)) {
matches++;
weightedMatches += w;
matchedNumbers.push(t.next);
} else missedNumbers.push(t.next);
}
const total = transitions.length, base = 28 / 37, historical = (matches + base * 3) / (total + 3), recent = (weightedMatches + base * 2) / (totalWeight + 2), numericalScore = historical * .65 + recent * .35, spatialScore = spatialCoverage(record.play, h);
return {
...record,
trigger: trigger,
total: total,
matches: matches,
misses: total - matches,
weightedMatches: weightedMatches,
numericalScore: numericalScore,
triangleScore: triangleCoverage(record.play, h),
spatialScore: spatialScore,
score: numericalScore * .7 + spatialScore * .2 + playStructure(record.play, h).score * .1,
matchedNumbers: matchedNumbers,
missedNumbers: missedNumbers
};
}
function rankNumberCombinations(h, trigger = h.at(-1)) {
return trigger == null ? [] : state.numberCombinations.filter(r => validPlay(r.play)).map(r => compareNumberCombination(r, trigger, h)).sort((a, b) => b.score - a.score || b.matches - a.matches || b.turn - a.turn);
}
function bestNumberCombination(h) {
if (h.length < 8) return null;
const trigger = h.at(-1), best = rankNumberCombinations(h, trigger)[0];
return best ? {
key: "NUM_T" + best.turn + "_N" + best.origin,
name: "COMBINAÇÃO DO " + best.origin,
rank: 0,
score: best.score,
spatialScore: best.spatialScore,
sourceNumber: best.origin,
sourceTurn: best.turn,
trigger: trigger,
matches: best.matches,
tests: best.total,
play: copy(best.play),
type: "NUMBER"
} : null;
}
function updateNumberChoice() {
const s = bestNumberCombination(state.history);
if (!s) {
state.numberChoice = null;
return null;
}
const old = state.numberChoice;
if (old && (old.sourceTurn !== s.sourceTurn || old.trigger !== s.trigger)) state.numberChanges++;
state.numberChoice = {
trigger: s.trigger,
sourceNumber: s.sourceNumber,
sourceTurn: s.sourceTurn,
motor: s.key,
score: s.score,
matches: s.matches,
tests: s.tests,
spatialScore: s.spatialScore,
play: copy(s.play)
};
return s;
}
function recordNumberComparison(before, n, turn) {
const trigger = before.at(-1), s = bestNumberCombination(before);
if (trigger == null || !s) return;
state.numberComparisons.push({
turn: turn,
trigger: trigger,
sourceNumber: s.sourceNumber,
sourceTurn: s.sourceTurn,
next: n,
covered: s.play.numbers.includes(n),
centers: s.play.blocks.map(b => b.center),
triangleKey: triangleContext(before),
spatialKeys: [ ...spatialRead(before).keys ]
});
}
function definitions() {
return [ ...ORIGINALS.map(([rule, name]) => ({
id: "ORIGINAL:" + rule,
name: name,
rule: rule,
type: "ORIGINAL"
})), ...Array.from({
length: 4
}, (_, i) => ({
id: "RANK:" + (i + 1),
name: "AUTO " + (i + 1) + "º",
rank: i + 1,
type: "RANK"
})), ...ADAPTATIVES.map(config => ({
id: "ADAPTIVE:" + config.id,
name: config.name,
config: config,
type: "ADAPTIVE"
})), ...state.created.map(c => ({
id: "CREATED:" + c.id,
name: c.name,
config: c.config,
type: "CREATED"
})) ];
}
function motorRate(key, limit = 12) {
const available = state.ledger.filter(r => r.motorHits && key in r.motorHits), rows = available.slice(-limit);
if (!rows.length) return .5;
const global = rows.filter(r => r.motorHits[key]).length / rows.length, local = spatialMetrics(available, state.history, r => !!r.motorHits[key]), w = .4 * local.support / (local.support + 8);
const errors = rows.flatMap(r => r.motorDiagnostics?.[key] ? [ r.motorDiagnostics[key] ] : []), edge = errors.filter(e => e.kind !== "COBERTO").length;
return clamp(global * (1 - w) + local.score * w - .015 * edge / (errors.length + 8), 0, 1);
}
function chooseMotor(def, cs, previous) {
if (!cs.length) return null;
const fixed = cs[clamp(state.rank - 1, 0, cs.length - 1)];
if (def.rank) return cs[clamp(def.rank - 1, 0, cs.length - 1)];
if (def.rule === "FIXED") return chooseAutoMotor(cs);
if (def.config) {
const c = def.config, ranked = cs.filter(m => m.rank <= c.maxRank).map(m => ({
motor: m,
score: motorRate(m.key, 3) * .55 + motorRate(m.key, c.window) * .45
})).sort((a, b) => b.score - a.score || a.motor.rank - b.motor.rank), best = ranked[0], old = ranked.find(x => x.motor.key === previous);
if (old && best && best.score < old.score + c.margin) return old.motor;
return best?.motor || fixed;
}
if (def.rule === "GEO") return cs[0];
if (def.rule === "BEST") return [ ...cs ].sort((a, b) => motorRate(b.key, 20) - motorRate(a.key, 20))[0];
if (def.rule === "STABLE") return cs.find(m => m.key === previous && m.rank <= 5) || fixed;
if (def.rule === "SWITCH") {
const old = cs.find(m => m.key === previous) || fixed, best = [ ...cs ].sort((a, b) => motorRate(b.key, 12) - motorRate(a.key, 12))[0];
return motorRate(best.key, 12) > motorRate(old.key, 12) + .12 ? best : old;
}
if ([ "CONSENSUS", "UNION" ].includes(def.rule)) {
const w = Array(37).fill(0), selected = def.rule === "UNION" ? cs.slice(0, 3) : cs;
for (const m of selected) {
const redundancy = selected.filter(o => sameCoverage(o.play, m.play)).length, novelty = .75 + .25 * (m.diversity || 0);
for (const n of m.play.numbers) w[ix(n)] += novelty / (Math.max(1, redundancy) * (1 + m.rank * .1));
}
applySpatial(w, state.history, .25);
const play = geometry(w);
if (play) return adjustMotor({
key: def.rule,
rank: 0,
score: play.score,
spatialScore: spatialCoverage(play, state.history),
spatialKeys: [ ...spatialRead(state.history).keys ],
play: play
}, state.history);
}
return fixed;
}
function fineG1(original, trigger, h = state.history) {
if (!validPlay(original?.play)) return null;
const w = Array(37).fill(.01), mandatory = neighbors(trigger, 1);
for (const n of original.play.numbers) w[ix(n)] += 100;
applySpatial(w, h, .2);
for (const n of mandatory) w[ix(n)] += 1e5;
const play = geometry(w, mandatory);
return play ? {
key: original.key,
rank: original.rank,
play: play,
spatialScore: spatialCoverage(play, h)
} : copy(original);
}
function g1History(strategy = null, mode = null, limit = 400) {
return state.g1Rows.filter(r => r.turn <= state.totalTurns && (strategy == null || r.strategy === strategy) && (mode == null || r.mode === mode)).slice(-limit);
}
function uniqueGales(strategy = null, limit = 100) {
const map = new Map;
for (const r of g1History(strategy, null, 5e3)) {
const k = r.strategy + "|" + r.eventId, current = map.get(k);
if (!current || r.mode === r.chosenMode) map.set(k, r);
}
return [ ...map.values() ].slice(-limit);
}
function numberG1Rows(strategy, trigger, mode = null, limit = 200) {
return state.g1Rows.filter(r => r.turn <= state.totalTurns && r.strategy === strategy && r.trigger === trigger && (mode == null || r.mode === mode)).slice(-limit);
}
function numberG1Metrics(strategy, trigger, mode, limit = 100) {
const rows = numberG1Rows(strategy, trigger, mode, limit), hits = rows.filter(r => r.hit).length;
return {
total: rows.length,
hits: hits,
loss: rows.length - hits,
rate: rows.length ? hits / rows.length : null
};
}
function numberG1Events(strategy, trigger, limit = 100) {
const map = new Map;
for (const r of numberG1Rows(strategy, trigger, null, 1e3)) {
const old = map.get(r.eventId);
if (!old || r.mode === r.chosenMode) map.set(r.eventId, r);
}
return [ ...map.values() ].slice(-limit);
}
function behaviorReading(original, h, strategy, trigger = null) {
const rows = uniqueGales(strategy, 45), recent = rows.slice(-12), last6 = rows.slice(-6), loss12 = recent.filter(r => !r.hit).length, loss6 = last6.filter(r => !r.hit).length, uncovered = new Set(missing(original.play)), outside6 = h.slice(-6).filter(n => uncovered.has(n)).length;
let streak = 0;
for (let i = rows.length - 1; i >= 0; i--) {
if (rows[i].hit) break;
streak++;
}
const nr = trigger == null ? [] : numberG1Events(strategy, trigger, 20), recentN = nr.slice(-8), numberLoss = recentN.filter(r => !r.hit).length;
let type = "CONTINUIDADE";
if (streak >= 3 || last6.length >= 5 && loss6 / last6.length >= .6 || h.length >= 6 && outside6 >= 4 || recentN.length >= 4 && numberLoss / recentN.length >= .6) type = "RUPTURA"; else if (recent.length >= 5 && loss12 / recent.length >= .32 || outside6 >= 2 || recentN.length >= 3 && numberLoss / recentN.length >= .34) type = "DESLOCAMENTO";
const s = spatialRead(h);
return {
type: type,
streak: streak,
outside6: outside6,
loss12: loss12,
total12: recent.length,
loss6: loss6,
total6: last6.length,
numberTotal: recentN.length,
numberLoss: numberLoss,
numberHit: recentN.length - numberLoss,
triangle: s.tri.last?.labels.join(" + ") || "SEM TRINCA",
poles: s.poles.active?.event || "SEM POLOS",
arc: s.arcs.active ? s.arcs.active.health + " / " + s.arcs.active.event : s.arcs.last?.event || "SEM ARCO"
};
}
function reconstructG1(original, trigger, h, strategy) {
if (!validPlay(original?.play)) return null;
const r = behaviorReading(original, h, strategy, trigger), w = Array(37).fill(.1), recent = h.slice(-60), gales = uniqueGales(strategy, 180), transitions = numberTransitions(h, trigger);
for (const n of W) {
const f60 = recent.filter(x => x === n).length, f24 = h.slice(-24).filter(x => x === n).length, f8 = h.slice(-8).filter(x => x === n).length, losses = gales.filter(row => !row.hit && row.outcome === n).length, conditional = transitions.reduce((s, t) => s + (t.next === n ? Math.exp(-t.age / 35) : 0), 0);
let v = f60 * .3 + f24 * .55 + f8 * .85 + losses * .35 + conditional * 2.2;
if (r.type === "DESLOCAMENTO") v += f8 * .35 + conditional * .35;
if (r.type === "RUPTURA") v += f8 * .6 + losses * .45 + conditional * .65;
w[ix(n)] += v;
}
for (let k = 0; k < recent.length; k++) {
const p = ix(recent[recent.length - 1 - k]), decay = Math.exp(-k / (r.type === "RUPTURA" ? 8 : 14));
for (let j = 0; j < 37; j++) {
const d = Math.min(Math.abs(p - j), 37 - Math.abs(p - j));
if (d <= 3) w[j] += decay * (4 - d) / 4 * .65;
}
}
for (const n of neighbors(trigger, 2)) w[ix(n)] += .4;
applySpatial(w, h, .4);
const play = geometry(w);
return validPlay(play) ? {
key: "G1_INDEPENDENTE",
rank: 0,
play: play,
behavior: r.type,
spatialScore: spatialCoverage(play, h)
} : null;
}
function defenses(original, trigger, h, strategy) {
if (!validPlay(original?.play)) return [];
const r = behaviorReading(original, h, strategy, trigger), recon = reconstructG1(original, trigger, h, strategy);
return [ {
mode: "CONGELADA",
motor: copy(original),
behavior: r.type
}, {
mode: "AJUSTE FINO",
motor: fineG1(original, trigger, h),
behavior: r.type
}, ...recon ? [ {
mode: "RECONSTRUÇÃO",
motor: recon,
behavior: r.type
} ] : [] ];
}
function defenseMetrics(strategy, mode, limit = 100) {
const rows = g1History(strategy, mode, limit), hits = rows.filter(r => r.hit).length;
return {
total: rows.length,
hits: hits,
loss: rows.length - hits,
rate: rows.length ? hits / rows.length : null
};
}
function rankDefenses(options, strategy, h, trigger = null) {
return options.map(o => {
const rows = g1History(strategy, o.mode, 100), recent = rows.slice(-12), hits = rows.filter(r => r.hit).length, hits12 = recent.filter(r => r.hit).length, base = 28 / 37, historical = (hits + base * 12) / (rows.length + 12), short = (hits12 + base * 8) / (recent.length + 8), coverage = h.length ? h.slice(-18).filter(n => o.motor.play.numbers.includes(n)).length / Math.min(18, h.length) : base, byNumber = trigger == null ? {
total: 0,
hits: 0,
loss: 0
} : numberG1Metrics(strategy, trigger, o.mode, 100), conditional = (byNumber.hits + base * 8) / (byNumber.total + 8);
let bonus = 0;
if (o.behavior === "CONTINUIDADE" && o.mode === "CONGELADA") bonus = .012;
if (o.behavior === "DESLOCAMENTO" && o.mode === "AJUSTE FINO") bonus = .01;
if (o.behavior === "RUPTURA" && o.mode === "RECONSTRUÇÃO") bonus = .02;
const nw = trigger == null ? 0 : Math.min(.48, byNumber.total / (byNumber.total + 8)), global = historical * .55 + short * .25 + coverage * .2, original = global * (1 - nw) + conditional * nw + bonus, spatialScore = spatialCoverage(o.motor.play, h), local = spatialMetrics(rows, h, r => r.hit), lw = .2 * local.support / (local.support + 8), structure = playStructure(o.motor.play, h), combined = original * .7 + spatialScore * .2 + structure.score * .1;
return {
...o,
score: combined * (1 - lw) + local.score * lw,
spatialScore: spatialScore,
contextTotal: local.total,
total: rows.length,
hits: hits,
loss: rows.length - hits,
numberTotal: byNumber.total,
numberHits: byNumber.hits,
numberLoss: byNumber.loss,
numberScore: conditional,
uncovered: missing(o.motor.play)
};
}).sort((a, b) => b.score - a.score || b.numberTotal - a.numberTotal);
}
function chooseG1(original, trigger, h, strategy) {
const ranked = rankDefenses(defenses(original, trigger, h, strategy), strategy, h, trigger);
if (!ranked.length) return null;
let c = ranked[0];
const frozen = ranked.find(x => x.mode === "CONGELADA");
if (frozen && c !== frozen && c.total < 8 && c.numberTotal < 4 && c.score - frozen.score < .025) c = frozen;
return {
motor: copy(c.motor),
mode: c.mode,
behavior: c.behavior,
score: c.score,
spatialScore: c.spatialScore,
triangleKey: triangleContext(h),
spatialKeys: [ ...spatialRead(h).keys ],
numberTotal: c.numberTotal,
numberHits: c.numberHits,
numberLoss: c.numberLoss,
uncovered: c.uncovered,
alternatives: ranked.map(o => ({
mode: o.mode,
score: o.score,
spatialScore: o.spatialScore,
contextTotal: o.contextTotal,
total: o.total,
hits: o.hits,
loss: o.loss,
numberTotal: o.numberTotal,
numberHits: o.numberHits,
numberLoss: o.numberLoss
}))
};
}
function book10(trigger) {
return state.n10.books[trigger] || (state.n10.books[trigger] = {
records: {}
});
}
function register10(trigger, motor, turn) {
if (!validPlay(motor?.play)) return null;
const id = signature10(motor.play), b = book10(trigger);
const record = b.records[id] || (b.records[id] = {
id: id,
trigger: trigger,
motor: copy(motor),
created: turn,
status: "TESTING",
blocked: false,
samples: [],
green: 0,
g1: 0,
loss: 0,
vg: 0,
vg1: 0,
vl: 0,
last: 0,
lastResult: null,
lastVirtual: null,
lastVirtualTurn: 0
});
syncCoverageBlocks10(trigger);
return record;
}
function archive10(cs, h) {
const turn = state.totalTurns, origin = h.at(-1), seen = new Set(state.n10.archive.map(r => r.turn + "@" + r.id)), g = state.numberCombinations.find(r => r.turn === turn), candidates = [ ...cs, ...g ? [ {
key: g.motor,
rank: 0,
play: g.play
} ] : [] ];
for (const m of candidates) {
if (!validPlay(m.play)) continue;
const id = signature10(m.play), key = turn + "@" + id;
if (seen.has(key)) continue;
seen.add(key);
state.n10.archive.push({
id: id,
turn: turn,
origin: origin,
motor: copy(m)
});
}
}
function scoreRecord10(r, h) {
const base = 28 / 37, f = (r.green + r.g1 + base * 8) / (r.green + r.g1 + r.loss + 8), v = (r.vg + r.vg1 + base * 8) / (r.vg + r.vg1 + r.vl + 8), events = state.n10.events.filter(e => e.kind === "FORWARD" && e.trigger === r.trigger && e.recordId === r.id), c = spatialMetrics(events, h);
return f * .4 + v * .1 + spatialCoverage(r.motor.play, h) * .25 + c.score * .15 + playStructure(r.motor.play, h).score * .1;
}
function select10(h, cs) {
if (h.length < 8) return null;
const trigger = h.at(-1);
syncCoverageBlocks10(trigger);
const records = Object.values(book10(trigger).records);
let selected = records.filter(r => r.status === "APPROVED" && !r.blocked).sort((a, b) => scoreRecord10(b, h) - scoreRecord10(a, h) || b.last - a.last)[0];
if (!selected) selected = records.filter(r => !r.blocked && r.status !== "REJECTED" && r.vg + r.vg1 > 0).sort((a, b) => scoreRecord10(b, h) - scoreRecord10(a, h) || b.last - a.last)[0];
if (!selected) {
const primary = chooseMotor({
rule: "FIXED"
}, cs, null), candidates = [ primary, ...cs, ...state.n10.archive.slice().reverse().map(r => r.motor) ].filter(Boolean);
for (const m of candidates) {
const r = register10(trigger, m, state.totalTurns);
if (r && !r.blocked && r.status !== "REJECTED") {
selected = r;
break;
}
}
}
return selected ? {
...copy(selected.motor),
key: "N10_" + trigger + "_" + selected.id,
trigger: trigger,
recordId: selected.id,
type: N10,
status: selected.status,
lastResult: selected.lastResult,
spatialScore: spatialCoverage(selected.motor.play, h),
spatialKeys: [ ...spatialRead(h).keys ]
} : null;
}
function prepare10(h, cs = motors(h)) {
if (h.length < 8) {
state.n10.choice = null;
return null;
}
archive10(cs, h);
state.n10.choice = select10(h, cs);
return state.n10.choice;
}
function choice10() {
const c = state.n10.choice;
if (!c || c.trigger !== state.history.at(-1)) return null;
const r = book10(c.trigger).records[c.recordId];
return !r || r.blocked || r.status === "REJECTED" ? null : copy(c);
}
function config10() {
return {
stake: state.stake,
multiplier: state.multiplier,
g1: state.g1,
g1Trainer: state.g1Trainer,
galeSkip: state.galeSkip,
secondHouse: state.secondHouse
};
}
function defense10(motor, n, h, config, cutoff = null) {
const rows = state.g1Rows;
if (cutoff != null) state.g1Rows = rows.filter(r => r.turn < cutoff);
try {
return config.g1Trainer ? chooseG1(motor, n, h, N10) : {
motor: config.g1 ? fineG1(motor, n, h) : copy(motor),
mode: config.g1 ? "AJUSTE FINO" : "CONGELADA",
behavior: behaviorReading(motor, h, N10, n).type,
triangleKey: triangleContext(h),
spatialKeys: [ ...spatialRead(h).keys ]
};
} finally {
state.g1Rows = rows;
}
}
function options10(motor, n, h, cutoff) {
const rows = state.g1Rows;
state.g1Rows = rows.filter(r => r.turn < cutoff);
try {
return defenses(motor, n, h, N10);
} finally {
state.g1Rows = rows;
}
}
function begin10(before, turn, source, cs) {
const selected = prepare10(before, cs);
if (!selected) return;
state.n10.pending.push({
id: "N10@" + ++state.n10.sequence,
turn: turn,
trigger: before.at(-1),
recordId: selected.recordId,
entry: copy(selected),
history: [ ...before ],
triangleKey: triangleContext(before),
spatialKeys: [ ...spatialRead(before).keys ],
config: config10(),
phase: state.secondHouse ? "SECOND_SKIP" : "ENTRY",
initialSkip: !!state.secondHouse,
results: [],
actual: source === "TEMPO REAL" && state.strategy === N10 && !state.manual && state.phase === "ENTRY",
source: source,
defense: null,
options: null
});
}
function transition10(test, n, turn) {
test.results.push(n);
const h = [ ...test.history, ...test.results ].slice(-WINDOW);
if (test.phase === "SECOND_SKIP") {
if (test.initialSkip) {
test.initialSkip = false;
return null;
}
test.phase = "SECOND_ENTRY";
return null;
}
if (test.phase === "GALE_SKIP") {
test.phase = "GALE";
return null;
}
if (test.phase === "GALE") return test.defense.play.numbers.includes(n) ? "GREEN G1" : "LOSS";
if (test.entry.play.numbers.includes(n)) return "GREEN";
test.failureTurn = turn;
test.failureTrigger = n;
test.options = options10(test.entry, n, h, turn);
const realDecision = test.actual && state.cycle?.entryTurn === test.turn ? state.cycle.decision : null, d = realDecision || defense10(test.entry, n, h, test.config, turn);
test.defense = copy(d?.motor || test.entry);
test.decision = copy(d);
test.phase = test.config.galeSkip ? "GALE_SKIP" : "GALE";
return null;
}
function simulate10(test, motor) {
const t = {
...copy(test),
actual: false,
entry: copy(motor),
results: [],
phase: test.config.secondHouse ? "SECOND_SKIP" : "ENTRY",
initialSkip: !!test.config.secondHouse,
defense: null,
options: null
};
let result = null;
for (let i = 0; i < test.results.length; i++) {
result = transition10(t, test.results[i], test.turn + i);
if (result) break;
}
return result;
}
function alternatives10(test, turn) {
const seen = new Set([ test.recordId ]);
let tested = 0, green = 0, g1 = 0, loss = 0;
for (const item of state.n10.archive) {
if (item.turn >= test.turn || seen.has(item.id)) continue;
seen.add(item.id);
const r = register10(test.trigger, item.motor, item.turn);
if (!r || r.blocked || r.status === "REJECTED") continue;
const outcome = simulate10(test, item.motor);
if (!outcome) continue;
tested++;
r.samples.push([ turn, "V", outcome ]);
if (outcome === "GREEN") {
r.vg++;
green++;
} else if (outcome === "GREEN G1") {
r.vg1++;
g1++;
} else {
r.vl++;
loss++;
r.blocked = true;
r.status = "REJECTED";
r.rejectedTurn = turn;
r.virtualRejected = true;
}
r.lastVirtual = outcome;
r.lastVirtualTurn = turn;
}
state.n10.events.push({
turn: turn,
trigger: test.trigger,
kind: "RETROSPECTIVE",
virtual: true,
triangleKey: test.triangleKey,
spatialKeys: copy(test.spatialKeys || []),
tested: tested,
green: green,
g1: g1,
loss: loss,
reference: test.id
});
}
function finish10(test, result, turn) {
const r = book10(test.trigger).records[test.recordId];
if (!r) return;
r.samples.push([ turn, "F", result ]);
r.last = turn;
r.lastResult = result;
if (result === "LOSS") {
r.loss++;
r.blocked = true;
r.status = "REJECTED";
r.rejectedTurn = turn;
} else {
if (result === "GREEN") r.green++; else r.g1++;
if (!r.blocked && r.status !== "REJECTED") r.status = "APPROVED";
}
state.n10.events.push({
turn: turn,
trigger: test.trigger,
recordId: test.recordId,
kind: "FORWARD",
virtual: !test.actual,
source: test.source,
result: result,
profit: profit(result, test.config),
triangleKey: test.triangleKey,
spatialKeys: copy(test.spatialKeys || []),
defense: test.decision?.mode || null,
id: test.id
});
if (result === "LOSS") alternatives10(test, turn);
}
function settle10(n, turn) {
const remaining = [];
for (const t of state.n10.pending) {
const outcome = transition10(t, n, turn);
if (!outcome) {
remaining.push(t);
continue;
}
if (t.phase === "GALE" && t.options) for (const o of t.options) state.g1Rows.push({
turn: turn,
eventId: t.id,
strategy: N10,
mode: o.mode,
chosenMode: t.decision?.mode,
behavior: o.behavior,
trigger: t.failureTrigger,
outcome: n,
hit: o.motor.play.numbers.includes(n),
uncovered: missing(o.motor.play),
entryMotor: t.entry.key,
triangleKey: t.decision?.triangleKey || t.triangleKey,
spatialKeys: copy(t.decision?.spatialKeys || t.spatialKeys || [])
});
finish10(t, outcome, turn);
}
state.n10.pending = remaining;
}
function recordStatus10(r) {
return r.blocked || r.status === "REJECTED" ? "REPROVADA" : r.status === "APPROVED" ? "APROVADA" : r.vg + r.vg1 > 0 ? "EM TESTE • ALTERNATIVA VIRTUAL" : "EM TESTE";
}
function refreshRecords10(cutoff) {
for (const [trigger, b] of Object.entries(state.n10.books)) for (const [id, r] of Object.entries(b.records)) {
r.blocked = !!r.blocked || r.status === "REJECTED";
r.samples = (r.samples || []).filter(s => s[0] >= cutoff);
for (const k of [ "green", "g1", "loss", "vg", "vg1", "vl", "last", "lastVirtualTurn" ]) r[k] = 0;
r.lastResult = null;
r.lastVirtual = null;
for (const [turn, kind, result] of r.samples) if (kind === "F") {
if (result === "GREEN") r.green++; else if (result === "GREEN G1") r.g1++; else r.loss++;
r.last = turn;
r.lastResult = result;
} else {
if (result === "GREEN") r.vg++; else if (result === "GREEN G1") r.vg1++; else r.vl++;
r.lastVirtual = result;
r.lastVirtualTurn = turn;
}
r.status = r.blocked ? "REJECTED" : r.green + r.g1 > 0 ? "APPROVED" : "TESTING";
const inUse = state.n10.pending.some(t => t.trigger === Number(trigger) && t.recordId === id);
if (!r.blocked && !r.samples.length && r.created < cutoff && !inUse) delete b.records[id];
}
}
function pruneRolling() {
while (state.history.length > WINDOW) {
state.history.shift();
state.sources.shift();
state.historyTurns.shift();
}
const cutoff = state.historyTurns[0] || state.totalTurns + 1;
for (const f of [ "ledger", "entryRows", "g1Rows", "numberCombinations", "numberComparisons", "numberHistory", "realG1", "decisions", "trainerHistory" ]) state[f] = state[f].filter(r => Number.isFinite(r.turn) && r.turn >= cutoff);
state.n10.archive = state.n10.archive.filter(r => r.turn >= cutoff);
state.n10.events = state.n10.events.filter(r => r.turn >= cutoff);
refreshRecords10(cutoff);
pruneSelections(cutoff);
pruneAdjustment(cutoff);
}
function virtualCycle(id) {
return state.virtual[id] || (state.virtual[id] = {
phase: "ENTRY",
previous: null,
defense: null,
entry: null,
trigger: null,
entryTrigger: null,
triangleKey: null,
spatialKeys: []
});
}
function trainerRanking() {
return definitions().map(def => {
const all = state.entryRows.filter(r => r.strategy === def.id && r.closed), rows = all.slice(-30), recent = rows.slice(-12), hits = rows.filter(r => r.result !== "LOSS").length, losses = recent.filter(r => r.result === "LOSS").length, originalScore = (hits + 8 * (28 / 37)) / (rows.length + 8) - losses * .008, context = spatialMetrics(all, state.history), w = .4 * context.support / (context.support + 8);
return {
...def,
score: originalScore * (1 - w) + context.score * w,
originalScore: originalScore,
contextScore: context.score,
contextTotal: context.total,
contextSupport: context.support,
contextHits: context.hits,
contextLoss: context.loss,
total: rows.length,
hits: hits,
loss: rows.length - hits
};
}).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}
function activeDefinition() {
const defs = definitions();
if (state.strategy === SELECTOR) {
const chosen = state.selection.choice;
if (chosen?.id === "TRAINER") return defs.find(d => d.id === state.trainerChoice) || defs[0];
return selectionDefinitions().find(d => d.id === chosen?.id) || {
id: SELECTOR,
name: "ESCOLHER TREINADOR E ESTRATÉGIAS",
type: SELECTOR
};
}
if (state.strategy === "AUTO") return defs.find(d => d.id === "RANK:" + state.rank) || defs[0];
if (state.strategy === N10) return {
id: N10,
name: "TREINADOR GLOBAL NÚMEROS 1.0",
type: N10
};
if (state.strategy === "NUMBER") return {
id: "NUMBER",
name: "TREINADOR GLOBAL NÚMEROS",
type: "NUMBER"
};
if (state.strategy === "TRAINER") return defs.find(d => d.id === state.trainerChoice) || defs[0];
if (state.strategy === "ADAPTIVE") return defs.find(d => d.id === "ADAPTIVE:" + state.adaptive) || defs[0];
if (state.strategy === "CREATED") return defs.find(d => d.id === state.activeCreated) || defs[0];
return defs.find(d => d.id === "ORIGINAL:" + state.strategy) || defs[0];
}
function updateTrainer() {
if (!cycleIsFree() || state.manual) return;
const ranked = trainerRanking().map(r => {
const direct = selectionStats(r.id, state.history);
return {
...r,
score: direct.entries >= 3 ? r.score * .3 + direct.score * .7 : r.score,
direct: direct
};
}).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
const best = ranked[0], current = ranked.find(r => r.id === state.trainerChoice);
if (!best) return;
const margin = current ? responsiveMargin(current.direct) : .012;
if (current && (best.id === current.id || best.score - current.score <= margin)) {
state.trainerPending = false;
return;
}
const reason = current ? margin < .012 ? "QUEDA NA PRIMEIRA / CONCORRENTE MELHOR" : "CONCORRENTE COM VANTAGEM" : "ESCOLHA INICIAL";
if (current) state.trainerChanges++;
state.trainerChoice = best.id;
state.trainerTurns = 0;
state.trainerPending = false;
state.trainerHistory.push({
turn: state.totalTurns,
from: current?.id || "INICIAL",
to: best.id,
score: best.score,
reason: reason,
triangleKey: triangleContext(state.history),
spatialKeys: [ ...spatialRead(state.history).keys ],
contextTotal: best.contextTotal
});
}
function activeMotor(cs) {
if (state.manual) return cs.find(m => m.key === state.manual) || cs[0] || null;
if (state.strategy === SELECTOR) return copy(state.selection.choice?.motor || null);
if (state.strategy === N10) return choice10();
if (state.strategy === "NUMBER") return bestNumberCombination(state.history);
return chooseMotor(activeDefinition(), cs, state.previous);
}
function profit(result, config = null) {
const u = Number(config?.stake ?? state.stake) || 1, g = Number(config?.multiplier ?? state.multiplier) || 1;
return result === "GREEN" ? 8 * u : result === "GREEN G1" ? (8 * g - 28) * u : result === "LOSS" ? -28 * (1 + g) * u : 0;
}
function settlePending(n, turn) {
for (const p of state.g1Pending) state.g1Rows.push({
turn: turn,
eventId: p.eventId,
strategy: p.strategy,
mode: p.mode,
behavior: p.behavior,
trigger: p.trigger,
outcome: n,
hit: p.numbers.includes(n),
uncovered: p.uncovered,
entryMotor: p.entryMotor || null,
triangleKey: p.triangleKey || "SEM TRINCA",
spatialKeys: copy(p.spatialKeys || [])
});
state.g1Pending = [];
}
function standardDecision(motor, n, h, strategy) {
return state.g1Trainer ? chooseG1(motor, n, h, strategy) : {
motor: state.g1 ? fineG1(motor, n, h) : copy(motor),
mode: state.g1 ? "AJUSTE FINO" : "CONGELADA",
behavior: behaviorReading(motor, h, strategy, n).type,
triangleKey: triangleContext(h),
spatialKeys: [ ...spatialRead(h).keys ]
};
}
function openRealGale(motor, n, after, turn) {
const strategy = state.cycle.strategy;
state.cycle.trigger = n;
const d = standardDecision(motor, n, after, strategy);
state.cycle.decision = d;
state.defense = copy(d?.motor || motor);
state.phase = state.galeSkip ? "GALE_SKIP" : "GALE";
state.decisions.push({
turn: turn,
strategy: strategy,
mode: d?.mode || "CONGELADA",
behavior: d?.behavior || "CONTINUIDADE",
trigger: n,
numberTests: d?.numberTotal || 0,
triangleKey: d?.triangleKey,
spatialKeys: copy(d?.spatialKeys || [])
});
}
function spin(n, source = "HISTÓRICO") {
if (!Number.isInteger(n) || n < 0 || n > 36) throw Error("NÚMERO INVÁLIDO");
invalidateComputations();
const before = [ ...state.history ], triggerBefore = before.at(-1), turn = state.totalTurns + 1, cs = motors(before), defs = definitions(), phaseBefore = state.phase, cycleBefore = copy(state.cycle), numberBefore = bestNumberCombination(before), spatial = spatialRead(before), triangleKey = triangleContext(before), spatialKeys = [ ...spatial.keys ], after = [ ...before, n ].slice(-WINDOW);
const cycleConfig = copy(cycleBefore?.config || config10());
let result = "AGUARDANDO", played = null;
begin10(before, turn, source, cs);
if (state.phase === "ENTRY") updateTrainer();
const selectorForecasts = selectionForecasts(before, cs);
refreshSelections(before, cs, selectorForecasts);
for (const t of state.n10.pending) if (t.turn === turn) t.actual = source === "TEMPO REAL" && !state.manual && state.phase === "ENTRY" && (state.strategy === N10 || state.strategy === SELECTOR && state.selection.choice?.id === N10) && t.recordId === state.n10.choice?.recordId;
if (state.phase === "ENTRY") {
const motor = activeMotor(cs);
if (motor) {
played = copy(motor);
state.previous = motor.key;
state.cycle = {
strategy: activeDefinition().id,
original: copy(motor),
trigger: null,
decision: null,
evidence: copy(motor.evidence),
config: copy(cycleConfig),
entryTrigger: triggerBefore,
entryTurn: turn,
triangleKey: triangleKey,
spatialKeys: copy(spatialKeys)
};
if (state.secondHouse) {
state.defense = copy(motor);
state.phase = "SECOND_SKIP";
result = "2ª CASA";
} else if (motor.play.numbers.includes(n)) {
result = "GREEN";
state.cycle = null;
} else {
result = "GALE";
openRealGale(motor, n, after, turn);
}
}
} else if (state.phase === "SECOND_SKIP") {
played = copy(state.defense);
result = "CASA PULADA";
state.phase = "SECOND_ENTRY";
} else if (state.phase === "SECOND_ENTRY") {
played = copy(state.defense);
if (played?.play.numbers.includes(n)) {
result = "GREEN";
state.phase = "ENTRY";
state.cycle = null;
state.defense = null;
} else {
result = "GALE";
openRealGale(played, n, after, turn);
}
} else if (state.phase === "GALE_SKIP") {
played = copy(state.defense);
result = "GALE PULADO";
state.phase = "GALE";
} else if (state.phase === "GALE") {
played = copy(state.defense);
result = played?.play.numbers.includes(n) ? "GREEN G1" : "LOSS";
state.realG1.push({
turn: turn,
strategy: state.cycle?.strategy,
mode: state.cycle?.decision?.mode,
behavior: state.cycle?.decision?.behavior,
trigger: state.cycle?.trigger,
outcome: n,
result: result,
triangleKey: state.cycle?.triangleKey,
spatialKeys: copy(state.cycle?.spatialKeys || [])
});
state.phase = "ENTRY";
state.cycle = null;
state.defense = null;
}
settlePending(n, turn);
recordNumberComparison(before, n, turn);
settle10(n, turn);
settleSelections(selectorForecasts, before, n, turn);
settleMotorAdjustment([ ...cs, ...selectorForecasts.map(f => f.motor).filter(Boolean) ], n, turn, before);
const motorHits = {}, motorDiagnostics = {};
for (const m of cs) {
motorHits[m.key] = m.play.numbers.includes(n);
motorDiagnostics[m.key] = classifyMiss(m.play, n);
}
state.ledger.push({
turn: turn,
number: n,
source: source,
trigger: triggerBefore,
strategy: cycleBefore?.strategy || activeDefinition().id,
motor: played?.key || "—",
phase: phaseBefore,
result: result,
profit: profit(result, cycleConfig),
play: played?.play || null,
numberCandidate: numberBefore?.sourceNumber ?? null,
numberCandidateTurn: numberBefore?.sourceTurn ?? null,
triangleKey: triangleKey,
triangleType: spatial.tri.last?.labels.join(" + ") || "SEM TRINCA",
spatialKeys: copy(spatialKeys),
cycleTriangleKey: cycleBefore?.triangleKey || triangleKey,
cycleSpatialKeys: copy(cycleBefore?.spatialKeys || spatialKeys),
motorHits: motorHits,
motorDiagnostics: motorDiagnostics,
decisionEvidence: copy(played?.evidence || cycleBefore?.evidence || cycleBefore?.original?.evidence || null),
componentShares: [ ...spatial.adaptive.shares ],
adaptiveSamples: spatial.adaptive.samples,
selectionTarget: copy(played?.selectionTarget || cycleBefore?.original?.selectionTarget || null),
autoRank: played?.autoRank || cycleBefore?.original?.autoRank || null
});
state.totalTurns = turn;
state.spatialMemory = state.spatialMemory || normalizeMemory(null, before, turn - 1);
state.spatialMemory.numbers.push(n);
state.spatialMemory.numbers = state.spatialMemory.numbers.slice(-700);
state.spatialMemory.lastTurn = turn;
invalidateComputations();
state.history.push(n);
state.historyTurns.push(turn);
state.sources.push(source);
pruneRolling();
registerNumberCombination(state.history, turn);
updateNumberChoice();
prepare10(state.history);
state.trainerTurns++;
if (state.phase !== "ENTRY" && state.trainerTurns >= 3) state.trainerPending = true;
refreshSelections();
}
function undoSnapshot() {
const {undoStack: undoStack, ...data} = state;
return copy(data);
}
function inverseChanges(before, after, path = [], ops = []) {
if (JSON.stringify(before) === JSON.stringify(after)) return ops;
if (Array.isArray(before) && Array.isArray(after)) {
const a = before.map(v => JSON.stringify(v)), b = after.map(v => JSON.stringify(v));
let drop = -1;
for (let d = 0; d <= a.length; d++) {
const count = a.length - d;
if (count > b.length) continue;
if (count && a[d] !== b[0]) continue;
let equal = true;
for (let j = 0; j < count; j++) if (a[d + j] !== b[j]) {
equal = false;
break;
}
if (equal) {
drop = d;
break;
}
}
const shared = a.length - drop;
ops.push({
kind: "slide",
path: [ ...path ],
removeTail: after.length - shared,
restoreHead: copy(before.slice(0, drop))
});
return ops;
}
if (before && after && typeof before === "object" && typeof after === "object" && !Array.isArray(before) && !Array.isArray(after)) {
for (const k of new Set([ ...Object.keys(before), ...Object.keys(after) ])) {
if (!(k in before)) ops.push({
kind: "delete",
path: [ ...path, k ]
}); else if (!(k in after)) ops.push({
kind: "set",
path: [ ...path, k ],
value: copy(before[k])
}); else inverseChanges(before[k], after[k], [ ...path, k ], ops);
}
return ops;
}
ops.push({
kind: "set",
path: [ ...path ],
value: copy(before)
});
return ops;
}
function applyInverse(ops) {
for (const op of ops) {
let parent = state;
for (const k of op.path.slice(0, -1)) parent = parent[k];
const key = op.path.at(-1);
if (op.kind === "slide") {
const a = parent[key];
if (op.removeTail) a.splice(a.length - op.removeTail, op.removeTail);
a.unshift(...copy(op.restoreHead));
} else if (op.kind === "delete") delete parent[key]; else parent[key] = copy(op.value);
}
}
function undo() {
if (busy) return;
if (!state.undoStack.length) {
alert("NÃO HÁ LANÇAMENTO MANUAL DISPONÍVEL PARA DESFAZER.");
return;
}
const t = state.undoStack.pop();
applyInverse(t.ops);
clearSpatialCaches();
save();
render();
}
function waitFrame() {
return new Promise(r => requestAnimationFrame(() => r()));
}
function setBusy(v, message = "") {
busy = v;
if (message && $("status")) $("status").textContent = message;
for (const b of document.querySelectorAll(".key,#import,#undo,#clear,#restore")) b.disabled = v;
}
async function loadHistory(numbers, {customSettings: customSettings = null, customManualLog: customManualLog = null} = {}) {
if (busy) return;
const previous = state, all = cleanNumbers(numbers).slice(-700), clean = all.slice(-WINDOW), opts = customSettings || settings();
setBusy(true, "IMPORTANDO HISTÓRICO");
await waitFrame();
try {
state = {
...fresh(),
...opts,
manualLog: copy(customManualLog || [])
};
state.spatialMemory = normalizeMemory({
numbers: all.slice(0, -clean.length)
}, [], 0);
clearSpatialCaches();
for (let i = 0; i < clean.length; i++) {
spin(clean[i], "HISTÓRICO");
if (i % 5 === 4) {
$("status").textContent = "IMPORTANDO " + (i + 1) + "/" + clean.length;
await new Promise(r => setTimeout(r, 0));
}
}
save();
} catch (e) {
state = previous;
clearSpatialCaches();
alert("ERRO NA IMPORTAÇÃO: " + String(e.message || e));
} finally {
setBusy(false);
render();
}
}
async function addManual(n) {
if (busy) return;
if (state.history.length < 8) {
alert("IMPORTE UM HISTÓRICO PRIMEIRO.");
return;
}
busy = true;
const before = undoSnapshot();
try {
spin(n, "TEMPO REAL");
const r = state.ledger.at(-1);
state.manualLog.push({
id: Date.now() + "_" + state.totalTurns,
turn: state.totalTurns,
number: n,
result: r.result,
profit: r.profit,
strategy: r.strategy,
motor: r.motor,
phase: r.phase,
numberCandidate: r.numberCandidate,
triangleKey: r.triangleKey,
spatialKeys: copy(r.spatialKeys),
timestamp: Date.now()
});
state.manualCount++;
const after = undoSnapshot();
state.undoStack.push({
turn: state.totalTurns,
number: n,
ops: inverseChanges(before, after)
});
state.undoStack = state.undoStack.slice(-WINDOW);
save();
} catch (e) {
const stack = state.undoStack;
state = {
...before,
undoStack: stack
};
clearSpatialCaches();
alert("ERRO AO INSERIR NÚMERO: " + String(e.message || e));
} finally {
busy = false;
render();
}
}
function parseInput(text) {
return (String(text).match(/\d+/g) || []).map(Number).filter(n => Number.isInteger(n) && n >= 0 && n <= 36);
}
async function importHistory(numbers) {
if (busy) return;
const clean = cleanNumbers(numbers);
if (!clean.length) {
alert("INFORME NÚMEROS DE 0 A 36.");
return;
}
if (!confirm("IMPORTAR " + Math.min(WINDOW, clean.length) + " NÚMEROS?\n\nJANELA: 70 MAIS RECENTES; MEMÓRIA AUXILIAR: ATÉ 700.\nOS REGISTROS MANUAIS ANTERIORES DESTA VERSÃO SERÃO APAGADOS.")) return;
$("paste").value = "";
await loadHistory(clean);
}
function clearAll() {
if (busy) return;
if (!confirm("ZERAR HISTÓRICO, TREINADORES, BLOQUEIOS E REGISTROS MANUAIS?")) return;
state = fresh();
clearSpatialCaches();
save();
render();
}
/* V6.4.7 — seleção entre controladores; AUTO RANKING entre AUTO 1–4.
   Avaliação prospectiva virtual, com uma máquina de ciclo por candidato.
   GREEN na entrada é distinto de GREEN G1; nenhum resultado futuro. */ function freshSelection() {
return {
choice: null,
entries: [],
rows: [],
cycles: {},
previous: {},
history: [],
changes: 0,
autoRank: 1
};
}
function selectionDefinitions() {
return [ ...definitions(), {
id: "TRAINER",
name: "TREINADOR GLOBAL",
type: "CONTROLLER"
}, {
id: "NUMBER",
name: "TREINADOR GLOBAL NÚMEROS",
type: "NUMBER"
}, {
id: N10,
name: "TREINADOR GLOBAL NÚMEROS 1.0",
type: N10
} ];
}
function selectionStats(id, h = state.history) {
const entries = state.selection.entries.filter(r => r.strategy === id).slice(-30), cohort = new Set(entries.map(r => r.decisionTurn ?? r.turn)), cycles = state.selection.rows.filter(r => r.strategy === id && cohort.has(r.decisionTurn ?? r.turn)), base = 28 / 37;
let mass = 0, hits = 0;
for (let i = 0; i < entries.length; i++) {
const w = Math.exp(-(entries.length - 1 - i) / 7);
mass += w;
if (entries[i].entryHit) hits += w;
}
const global = (hits + base * 8) / (mass + 8), recent = entries.slice(-5), previous = entries.slice(-10, -5), short = (recent.filter(r => r.entryHit).length + base * 4) / (recent.length + 4), prior = (previous.filter(r => r.entryHit).length + base * 4) / (previous.length + 4), local = spatialMetrics(entries, h, r => r.entryHit), lw = Math.min(.25, local.support / (local.support + 12) * .25), direct = (global * .45 + short * .55) * (1 - lw) + local.score * lw;
const green = entries.filter(r => r.entryHit).length, g1 = cycles.filter(r => r.result === "GREEN G1").length, loss = cycles.filter(r => r.result === "LOSS").length, cycleRate = (cycles.filter(r => r.result !== "LOSS").length + base * 8) / (cycles.length + 8), recentMiss = recent.filter(r => !r.entryHit).length;
let missStreak = 0;
for (let i = entries.length - 1; i >= 0 && !entries[i].entryHit; i--) missStreak++;
const trend = short - prior, declining = recent.length >= 3 && (recentMiss >= 2 || missStreak >= 2 || trend < -.08);
return {
entries: entries.length,
green: green,
firstMiss: entries.length - green,
g1: g1,
loss: loss,
cycles: cycles.length,
contextTotal: local.total,
contextSupport: local.support,
directScore: direct,
cycleRate: cycleRate,
recentMiss: recentMiss,
missStreak: missStreak,
trend: trend,
declining: declining,
pending: Math.max(0, entries.length - cycles.length),
confidence: entries.length / (entries.length + 12),
score: direct * .94 + cycleRate * .06 - .025 * recentMiss / (recent.length + 4) - .008 * Math.min(3, missStreak)
};
}
function responsiveMargin(current) {
return current?.declining ? .003 : .012;
}
function sameCoverage(a, b) {
return validPlay(a) && validPlay(b) && coverageIdentity(a) === coverageIdentity(b);
}
function selectResponsive(ranked, currentId) {
const best = ranked.find(r => r.eligible), current = ranked.find(r => r.id === currentId && r.eligible);
if (!best) return {
chosen: null,
reason: "SEM JOGADA ELEGÍVEL",
margin: 0
};
if (!current) return {
chosen: best,
reason: "ESCOLHA INICIAL",
margin: 0
};
const margin = responsiveMargin(current), gap = best.score - current.score;
if (best.id === current.id) return {
chosen: current,
reason: "CONTINUIDADE: LÍDER DO RANKING",
margin: margin
};
if (gap <= margin) return {
chosen: current,
reason: current.declining ? "EM QUEDA / AGUARDANDO VANTAGEM DA CONCORRENTE" : "CONTINUIDADE: DIFERENÇA PEQUENA",
margin: margin
};
if (sameCoverage(best.motor?.play, current.motor?.play)) return {
chosen: best,
reason: "CONCORRENTE MELHOR / COBERTURA ATUAL EQUIVALENTE",
margin: margin
};
return {
chosen: best,
reason: current.declining ? "QUEDA NA PRIMEIRA / CONCORRENTE MELHOR" : "CONCORRENTE COM VANTAGEM",
margin: margin
};
}
function autoRanking(cs, h = state.history) {
return cs.slice(0, 4).map((motor, i) => {
const rank = i + 1, stats = selectionStats("RANK:" + rank, h), coverage = spatialCoverage(motor.play, h);
return {
...stats,
rank: rank,
id: "RANK:" + rank,
name: "AUTO " + rank + "º",
motor: motor,
coverage: coverage,
evidence: decisionEvidence(motor, h, stats),
score: stats.score * .8 + coverage * .1 + playStructure(motor.play, h).score * .1
};
}).sort((a, b) => b.score - a.score || a.rank - b.rank);
}
function chooseAutoMotor(cs, h = state.history) {
const ranked = autoRanking(cs, h);
if (!ranked.length) return null;
const best = ranked[0], current = ranked.find(r => r.rank === state.selection.autoRank), chosen = current && best.score - current.score <= responsiveMargin(current) ? current : best;
return {
...chosen.motor,
autoRank: chosen.rank,
autoScore: chosen.score,
autoEntries: chosen.entries
};
}
function selectionForecasts(h, cs) {
return selectionDefinitions().map(def => {
let motor = null;
let defenseStrategy = def.id;
if (def.id === "TRAINER") {
const base = definitions().find(d => d.id === state.trainerChoice) || definitions()[0];
motor = chooseMotor(base, cs, state.selection.previous[def.id]);
defenseStrategy = base.id;
} else if (def.id === "NUMBER") motor = bestNumberCombination(h); else if (def.id === N10) motor = choice10(); else motor = chooseMotor(def, cs, state.selection.previous[def.id]);
return {
...def,
motor: motor ? copy(motor) : null,
defenseStrategy: defenseStrategy
};
});
}
function selectionRanking(h = state.history, forecasts = null) {
if (!forecasts) forecasts = selectionForecasts(h, motors(h));
return forecasts.map(def => {
const stats = selectionStats(def.id, h), eligible = validPlay(def.motor?.play), coverage = eligible ? spatialCoverage(def.motor.play, h) : 0, evidence = eligible ? decisionEvidence(def.motor, h, stats) : null;
return {
...def,
...stats,
eligible: eligible,
coverage: coverage,
evidence: evidence,
score: eligible ? stats.score * .8 + coverage * .1 + evidence.score * .1 : -1
};
}).sort((a, b) => Number(b.eligible) - Number(a.eligible) || b.score - a.score || a.id.localeCompare(b.id));
}
function refreshSelections(h = state.history, cs = motors(h), forecasts = null) {
if (h.length < 8) {
if (cycleIsFree()) state.selection.choice = null;
return [];
}
if (!forecasts) forecasts = selectionForecasts(h, cs);
const ranked = selectionRanking(h, forecasts);
if (!cycleIsFree()) return ranked;
const auto = chooseAutoMotor(cs, h);
if (auto) state.selection.autoRank = auto.autoRank;
const decision = selectResponsive(ranked, state.selection.choice?.id), chosen = decision.chosen;
state.selection.reason = decision.reason + (chosen?.evidence ? " • " + chosen.evidence.reason : "");
state.selection.margin = decision.margin;
if (!chosen) {
state.selection.choice = null;
return ranked;
}
const old = state.selection.choice, selectionTarget = {
id: chosen.id,
name: chosen.name
};
state.selection.choice = {
evidence: copy(chosen.evidence),
alternatives: ranked.filter(r => r.eligible).slice(0, 4).map(r => ({
id: r.id,
name: r.name,
score: r.score,
direct: r.directScore,
coverage: r.coverage,
structure: r.evidence?.score,
samples: r.entries,
reason: r.evidence?.reason
})),
reason: state.selection.reason,
declining: chosen.declining,
missStreak: chosen.missStreak,
id: chosen.id,
name: chosen.name,
score: chosen.score,
entries: chosen.entries,
green: chosen.green,
firstMiss: chosen.firstMiss,
g1: chosen.g1,
loss: chosen.loss,
contextTotal: chosen.contextTotal,
turn: state.totalTurns,
signature: h.join(","),
motor: {
...copy(chosen.motor),
evidence: copy(chosen.evidence),
selectionTarget: selectionTarget,
defenseStrategy: chosen.defenseStrategy
}
};
if (!old || old.id !== chosen.id || old.motor?.autoRank !== chosen.motor?.autoRank) {
if (old) state.selection.changes++;
state.selection.history.push({
turn: state.totalTurns,
from: old?.id || "INICIAL",
to: chosen.id,
name: chosen.name,
score: chosen.score,
reason: state.selection.reason,
evidence: copy(chosen.evidence),
autoRank: chosen.motor?.autoRank || null,
spatialKeys: [ ...spatialRead(h).keys ]
});
}
return ranked;
}
function selectionPaperStep(test, n, turn, before) {
if (test.phase === "SECOND_SKIP") {
if (test.initialSkip) {
test.initialSkip = false;
return null;
}
test.phase = "SECOND_ENTRY";
return null;
}
if (test.phase === "GALE_SKIP") {
test.phase = "GALE";
return null;
}
if (test.phase === "GALE") {
if (test.strategy !== N10) for (const o of test.options || []) state.g1Rows.push({
turn: turn,
eventId: "PAPER@" + test.strategy + "@" + test.turn,
strategy: test.strategy,
mode: o.mode,
chosenMode: test.decision?.mode,
behavior: o.behavior,
trigger: test.failureTrigger,
outcome: n,
hit: o.motor.play.numbers.includes(n),
uncovered: missing(o.motor.play),
entryMotor: test.entry.key,
triangleKey: test.defenseTriangle,
spatialKeys: copy(test.defenseKeys || test.spatialKeys)
});
return test.defense.play.numbers.includes(n) ? "GREEN G1" : "LOSS";
}
const hit = test.entry.play.numbers.includes(n);
state.selection.entries.push({
turn: turn,
decisionTurn: test.turn,
strategy: test.strategy,
motor: test.entry.key,
entryHit: hit,
trigger: test.trigger,
spatialKeys: copy(test.spatialKeys),
autoRank: test.entry.autoRank || null,
miss: classifyMiss(test.entry.play, n),
virtual: true
});
if (hit) return "GREEN";
const h = [ ...before, n ].slice(-WINDOW), config = test.config;
test.options = defenses(test.entry, n, h, test.defenseStrategy);
const real = state.cycle?.entryTurn === test.turn && state.cycle?.original?.key === test.entry.key && state.cycle?.decision;
const decision = real || (config.g1Trainer ? chooseG1(test.entry, n, h, test.defenseStrategy) : {
motor: config.g1 ? fineG1(test.entry, n, h) : copy(test.entry),
mode: config.g1 ? "AJUSTE FINO" : "CONGELADA",
behavior: behaviorReading(test.entry, h, test.defenseStrategy, n).type
});
test.defense = copy(decision?.motor || test.entry);
test.decision = copy(decision);
test.failureTrigger = n;
test.defenseTriangle = triangleContext(h);
test.defenseKeys = [ ...spatialRead(h).keys ];
test.phase = config.galeSkip ? "GALE_SKIP" : "GALE";
return null;
}
function settleSelections(forecasts, before, n, turn) {
for (const def of forecasts) {
let test = state.selection.cycles[def.id];
if (!test) {
if (!validPlay(def.motor?.play)) continue;
test = {
strategy: def.id,
name: def.name,
turn: turn,
trigger: before.at(-1),
triangleKey: triangleContext(before),
entry: copy(def.motor),
defenseStrategy: def.defenseStrategy,
spatialKeys: [ ...spatialRead(before).keys ],
config: config10(),
phase: state.secondHouse ? "SECOND_SKIP" : "ENTRY",
initialSkip: !!state.secondHouse,
defense: null
};
state.selection.cycles[def.id] = test;
state.selection.previous[def.id] = def.motor.key;
}
const result = selectionPaperStep(test, n, turn, before);
if (!result) continue;
state.selection.rows.push({
turn: turn,
decisionTurn: test.turn,
strategy: def.id,
name: def.name,
motor: test.entry.key,
result: result,
closed: true,
profit: profit(result, test.config),
spatialKeys: copy(test.spatialKeys),
autoRank: test.entry.autoRank || null,
virtual: true
});
if (def.id !== "TRAINER" && def.id !== N10) state.entryRows.push({
turn: turn,
decisionTurn: test.turn,
strategy: def.id,
trigger: test.trigger,
motor: test.entry.key,
result: result,
closed: true,
profit: profit(result, test.config),
triangleKey: test.triangleKey || "SEM TRINCA",
spatialKeys: copy(test.spatialKeys)
});
state.virtual[def.id] = {
phase: "ENTRY",
previous: test.entry.key
};
delete state.selection.cycles[def.id];
}
}
function pruneSelections(cutoff) {
for (const f of [ "entries", "rows", "history" ]) state.selection[f] = state.selection[f].filter(r => Number.isFinite(r.turn) && r.turn >= cutoff);
}
function controllerIsActive(id) {
return !state.manual && (state.strategy === id || state.strategy === SELECTOR && displayedSelection()?.id === id);
}
function displayedSelection() {
return state.cycle?.original?.selectionTarget || state.selection.choice || null;
}
function effectiveAutoRank(motor = null) {
if (state.manual) return null;
const original = state.cycle?.original || motor;
if (original?.autoRank) return original.autoRank;
const target = state.strategy === SELECTOR ? displayedSelection()?.id : null;
if (target?.startsWith("RANK:")) return Number(target.split(":")[1]);
if (state.strategy === "AUTO") return state.rank;
return null;
}
function strategyButtonActive(choice) {
if (state.manual) return false;
if (choice === SELECTOR) return state.strategy === SELECTOR;
if (state.strategy === SELECTOR) {
const id = displayedSelection()?.id;
return choice === id || "ORIGINAL:" + choice === id || "ADAPTIVE:" + choice === id;
}
return state.strategy === "ADAPTIVE" ? choice === state.adaptive : choice === state.strategy;
}
function createdButtonActive(id) {
return !state.manual && (state.strategy === "CREATED" && state.activeCreated === "CREATED:" + id || state.strategy === SELECTOR && displayedSelection()?.id === "CREATED:" + id);
}
function selectionHTML() {
if (!state.details?.["selector"]) return compactPanel("selector");
const ranked = selectionRanking(), chosen = displayedSelection(), auto = autoRanking(motors(state.history)), used = effectiveAutoRank(state.defense || activeMotor(motors(state.history)));
return decisionDetailsHTML("selector") + `<div class="box"><b>ESCOLHER TREINADOR E ESTRATÉGIAS</b><p>STATUS: ${state.strategy === SELECTOR && !state.manual ? "CONTROLANDO A JOGADA" : "COMPARAÇÃO VIRTUAL"}</p><p>ESCOLHIDO: <strong>${esc(chosen?.name || "AGUARDANDO HISTÓRICO")}</strong></p><p>${cycleIsFree() ? "CICLO LIVRE: ESCOLHA PARA A PRÓXIMA ENTRADA" : "CICLO ABERTO: CONTROLADOR E COMBINAÇÃO PRESERVADOS"}</p><p>COMPARA ORIGINAIS, 12 ADAPTATIVAS, AUTO 1–4, PERSONALIZADAS E OS TRÊS TREINADORES INDEPENDENTES. O SELETOR NÃO SE INCLUI NO PRÓPRIO RANKING.</p><p>PRIORIDADE: GREEN NA ENTRADA. FALHAS NA PRIMEIRA ENTRADA, GREEN G1 E LOSS APARECEM SEPARADAMENTE. REGULARIZAÇÃO E MARGEM DE TROCA EVITAM REAGIR A UMA ÚNICA OBSERVAÇÃO.</p><p>OS TESTES ABAIXO SÃO PROSPECTIVOS VIRTUAIS, RESPEITAM 2ª CASA / GALE PULADO E NÃO SÃO CONTADOS COMO APOSTAS REAIS.</p><p>MOTIVO: ${esc(state.selection.reason || "AGUARDANDO")}</p><p>JANELA RECENTE: 5 ENTRADAS; GREEN DIRETO PRIORIZADO. MARGEM DE TROCA DIMINUI QUANDO HÁ QUEDA. SEM TROCA OBRIGATÓRIA POR TEMPO.</p><p>TROCAS DO SELETOR: ${state.selection.changes}</p>${adjustmentHTML(motors(state.history))}</div>${tableHTML([ "#", "CANDIDATO", "STATUS", "ENTRADAS", "GREEN DIRETO", "FALHOU 1ª", "GREEN G1", "LOSS FINAL", "CONTEXTO", "TENDÊNCIA", "FALHAS RECENTES", "ÍNDICE" ], ranked.map((r, i) => [ i + 1, esc(r.name), r.eligible ? chosen?.id === r.id ? "EM USO" : "DISPONÍVEL" : "SEM JOGADA ELEGÍVEL", r.entries, r.green, r.firstMiss, r.g1, r.loss, r.contextTotal, r.declining ? "EM QUEDA" : r.trend > .04 ? "SUBINDO" : "CONTINUIDADE", r.recentMiss + " / " + Math.min(5, r.entries), r.eligible ? pct(r.score, 1) : "—" ]))}<div class="title">AUTO RANKING • ESCOLHA ENTRE OS QUATRO AUTO</div><div class="box"><p>AUTO EM USO: ${used || "—"}</p><p>MELHOR ÍNDICE AGORA: ${auto[0]?.name || "AGUARDANDO"}</p><p>SEM ORDEM OBRIGATÓRIA E SEM ROTAÇÃO FORÇADA. O MESMO AUTO PODE PERMANECER SE CONTINUAR MELHOR. A ESCOLHA COMPROMETIDA NÃO MUDA NO MEIO DO CICLO.</p></div>${tableHTML([ "AUTO", "ENTRADAS", "GREEN DIRETO", "FALHOU 1ª", "GREEN G1", "LOSS", "ÍNDICE" ], auto.map(r => [ r.name + (used === r.rank ? " • EM USO" : ""), r.entries, r.green, r.firstMiss, r.g1, r.loss, pct(r.score, 1) ]))}<div class="title">ÚLTIMAS TROCAS DO SELETOR</div>${state.selection.history.slice(-15).reverse().map(r => `<div class="listrow">GIRO ${r.turn} • ${esc(r.from)} → ${esc(r.name)}${r.autoRank ? " • AUTO " + r.autoRank : ""} • ÍNDICE ${pct(r.score, 1)} • ${esc(r.reason || "AVALIAÇÃO")}</div>`).join("")}<div class="muted">ÍNDICE COMPARATIVO HISTÓRICO, NÃO GARANTIA DE ACERTO DO PRÓXIMO RESULTADO.</div>`;
}
/* V6.4.7: ajustes são rotações na ordem W; esquerda = - / direita = +.
   A alternativa é formada ANTES do resultado. Apenas testes virtuais.
   Não altera a geometria 5x5+1x3 e nunca muda um ciclo comprometido. */ function normalizeAdjustment(data) {
const r = {
books: {}
};
for (const [key, b] of Object.entries(data?.books || {})) r.books[key] = {
rows: Array.isArray(b.rows) ? b.rows.filter(x => Array.isArray(x.hits) && x.hits.length === 37) : [],
shift: Number.isInteger(b.shift) ? clamp(b.shift, -18, 18) : 0
};
return r;
}
function coverageIdentity(play) {
return [ ...play.numbers ].sort((a, b) => a - b).join(",");
}
function syncCoverageBlocks10(trigger) {
const records = Object.values(book10(trigger).records), blocked = new Set(records.filter(r => r.blocked || r.status === "REJECTED").filter(r => validPlay(r.motor?.play)).map(r => coverageIdentity(r.motor.play)));
for (const r of records) if (validPlay(r.motor?.play) && blocked.has(coverageIdentity(r.motor.play))) {
r.blocked = true;
r.status = "REJECTED";
}
}
function rotatePlay(play, shift) {
if (!shift) return copy(play);
const blocks = play.blocks.map(b => {
const center = W[mod(ix(b.center) + shift)];
return {
center: center,
radius: b.radius,
numbers: neighbors(center, b.radius)
};
});
return {
blocks: blocks,
numbers: blocks.flatMap(b => b.numbers),
score: play.score
};
}
function adjustmentKey(motor) {
return motor.adjustmentKey || motor.key;
}
function adjustmentStats(key, h) {
const book = state.adjustment?.books[key], rows = (book?.rows || []).filter(r => r.turn <= state.totalTurns).slice(-WINDOW), keys = spatialRead(h).keys, base = 28 / 37;
const scores = Array.from({
length: 37
}, (_, i) => {
const shift = i - 18;
let hit = 0, mass = 0, paired = 0;
for (let j = 0; j < rows.length; j++) {
const r = rows[j], w = Math.exp(-(rows.length - 1 - j) / 14) * (.65 + .35 * spatialMatch(r.spatialKeys, keys));
mass += w;
if (r.hits[i]) hit += w;
paired += w * (Number(r.hits[i]) - Number(r.hits[18]));
}
const recent = rows.slice(-6), rh = recent.filter(r => r.hits[i]).length, score = (hit + base * 10) / (mass + 10), short = (rh + base * 6) / (recent.length + 6);
return {
shift: shift,
score: score * .75 + short * .25 - 35e-5 * Math.abs(shift),
paired: paired / (mass || 1),
hits: rows.filter(r => r.hits[i]).length,
samples: rows.length
};
}).sort((a, b) => b.score - a.score || Math.abs(a.shift) - Math.abs(b.shift) || a.shift - b.shift);
const normal = scores.find(r => r.shift === 0), training = rows.slice(0, -4), validation = rows.slice(-4);
const trained = scores.map(r => ({
...r,
train: training.reduce((sum, row, j) => sum + Math.exp(-(training.length - 1 - j) / 14) * row.hits[r.shift + 18], 0) - 35e-5 * Math.abs(r.shift)
})).sort((a, b) => b.train - a.train || Math.abs(a.shift) - Math.abs(b.shift));
const best = trained[0], current = scores.find(r => r.shift === (book?.shift || 0)) || normal;
const confirmed = validation.length === 4 && validation.filter(r => r.hits[best.shift + 18]).length >= 3 && validation.reduce((sum, r) => sum + r.hits[best.shift + 18] - r.hits[18], 0) >= 1;
// 12 training observations + 4 subsequent virtual confirmations; never the future.
const supported = rows.length >= 16;
let chosen = normal, reason = supported ? "NORMAL SEM VANTAGEM CONFIRMADA" : "EM TESTE: 12 PARA APRENDER + 4 PARA CONFIRMAR";
if (supported && current.shift && current.score > normal.score + .015 && current.paired > .02) {
chosen = current;
reason = "CONTINUIDADE DO AJUSTE";
}
if (supported && confirmed && best.shift && best.score > normal.score + .035 && best.paired > .06 && best.score > chosen.score + .012) {
chosen = best;
reason = "VANTAGEM VIRTUAL SOBRE O NORMAL";
}
return {
key: key,
shift: chosen.shift,
samples: rows.length,
score: chosen.score,
normalScore: normal.score,
gain: chosen.score - normal.score,
reason: reason,
bestShift: best.shift,
bestGain: best.score - normal.score,
scores: scores
};
}
function adjustMotor(motor, h) {
if (!validPlay(motor?.play)) return motor;
const key = adjustmentKey(motor), a = adjustmentStats(key, h), basePlay = copy(motor.play), play = rotatePlay(basePlay, a.shift);
return localAdjustment({
...motor,
basePlay: basePlay,
adjustmentKey: key,
adjustment: {
shift: a.shift,
samples: a.samples,
gain: a.gain,
reason: a.reason
},
play: play,
triangleScore: triangleCoverage(play, h),
spatialScore: spatialCoverage(play, h)
}, h);
}
function settleMotorAdjustment(forecasts, n, turn, h) {
state.adjustment = state.adjustment || {
books: {}
};
const seen = new Set;
for (const m of forecasts) {
if (!validPlay(m?.basePlay)) continue;
const key = adjustmentKey(m);
if (seen.has(key)) continue;
seen.add(key);
const book = state.adjustment.books[key] || (state.adjustment.books[key] = {
rows: [],
shift: 0
});
if (book.rows.some(r => r.turn === turn)) continue;
const covered = new Set(m.basePlay.numbers), hits = Array.from({
length: 37
}, (_, i) => covered.has(W[mod(ix(n) - (i - 18))]) ? 1 : 0);
const nearest = m.basePlay.blocks.map(b => direction(b.center, n)).sort((a, b) => Math.abs(a) - Math.abs(b) || a - b)[0];
const globalShift = m.adjustment?.shift || 0, globalPlay = rotatePlay(m.basePlay, globalShift), variants = localVariants(globalPlay), localHits = variants.map(v => v.play ? Number(v.play.numbers.includes(n)) : null);
book.rows.push({
turn: turn,
hits: hits,
nearest: nearest,
localHits: localHits,
globalShift: globalShift,
globalHit: Number(globalPlay.numbers.includes(n)),
miss: classifyMiss(m.play, n),
spatialKeys: [ ...spatialRead(h).keys ]
});
book.shift = m.adjustment?.shift || 0;
}
}
function pruneAdjustment(cutoff) {
for (const b of Object.values(state.adjustment?.books || {})) b.rows = b.rows.filter(r => r.turn >= cutoff);
}
function shiftText(shift) {
return shift === 0 ? "NORMAL / SEM DESLOCAMENTO" : Math.abs(shift) + " CASA(S) À " + (shift < 0 ? "ESQUERDA" : "DIREITA");
}
function adjustmentMotorHTML(m) {
if (!m?.adjustment) return "";
const a = m.adjustment, rows = state.adjustment?.books[adjustmentKey(m)]?.rows.slice(-20) || [], counts = [ 0, 1, 2 ].map(d => rows.filter(r => Math.abs(r.nearest) === d).length);
return `<div class="muted">AUTOAJUSTE: ${shiftText(a.shift)} ${m.localAdjustment ? " • BLOCO " + (m.localAdjustment.block + 1) + " / " + shiftText(m.localAdjustment.shift) : ""} • TESTES VIRTUAIS ${a.samples} • VANTAGEM ${fmt(100 * a.gain)} P.P. • ${esc(a.reason)} • CENTRO / 1º / 2º VIZINHO (ÚLTIMOS ${rows.length}): ${counts.join(" / ")}</div>`;
}
function adjustmentHTML(ms) {
return `<div class="box"><b>AUTOAJUSTE INCORPORADO AOS 12 MOTORES</b><p>37 POSIÇÕES RELATIVAS: NORMAL E -18 A +18 CASAS. TESTES FORMADOS ANTES DO RESULTADO. 12 OBSERVAÇÕES DE APRENDIZADO + 4 SEGUINTES DE CONFIRMAÇÃO; VANTAGEM SOBRE O NORMAL E PERSISTÊNCIA PARA EVITAR PERSEGUIR O ÚLTIMO NÚMERO.</p><p>ESQUERDA / DIREITA REFEREM-SE À ORDEM W. A JOGADA DO CICLO FICA CONGELADA. TREINADORES NUMÉRICOS MANTÊM SUAS REGRAS INDEPENDENTES.</p>${ms.map(m => `<div class="listrow"><b>${esc(m.key)}</b>${adjustmentMotorHTML(m)}</div>`).join("")}</div>`;
}
function financeHTML() {
const windowRows = state.ledger.filter(r => r.source === "TEMPO REAL"), windowMetrics = metrics(windowRows), all = metrics(state.manualLog), imported = metrics(state.ledger.filter(r => r.source === "HISTÓRICO"));
return `<div class="box"><b>RESULTADO FINANCEIRO • FICHAS / G1</b><p>MANUAIS NA JANELA: <strong class="${windowMetrics.net < 0 ? "bad" : "good"}">${fmt(windowMetrics.net)}</strong></p><p>MANUAIS ARQUIVADOS: <strong class="${all.net < 0 ? "bad" : "good"}">${fmt(all.net)}</strong></p><p>HISTÓRICO IMPORTADO / SIMULADO: ${fmt(imported.net)}</p><p>POR CICLO COM AS FICHAS ATUAIS: GREEN ${fmt(profit("GREEN"))} • GREEN G1 ${fmt(profit("GREEN G1"))} • LOSS ${fmt(profit("LOSS"))}</p><div class="muted">REGISTROS ANTERIORES CONSERVAM O VALOR CALCULADO NA ENTRADA. GREEN G1 INDICA COBERTURA NA DEFESA; O SALDO DO CICLO PODE SER NEGATIVO.</div></div>`;
}
/* V6.4.7 — leitura estrutural causal, memória auxiliar e apresentação leve.
   Zonas e índices são descrições comparativas; não são probabilidades.
   Nenhuma hipótese muda a jogada ou a defesa de um ciclo aberto. */ let computationRevision = 0;
const motorCache = new Map, geometryCache = new Map, structureCache = new Map, panelCache = new Map;
let strategySignature = "";
function invalidateComputations() {
computationRevision++;
motorCache.clear();
panelCache.clear();
}
function boundedCache(cache, key, value, limit = 80) {
if (cache.size >= limit) cache.delete(cache.keys().next().value);
cache.set(key, value);
return value;
}
function normalizeMemory(data, h = [], turn = 0) {
const numbers = cleanNumbers(data?.numbers);
return {
numbers: (numbers.length ? numbers : cleanNumbers(h)).slice(-700),
lastTurn: turn
};
}
function memoryHistory(h) {
const m = state.spatialMemory?.numbers || [];
return h.length === state.history.length && h.every((n, i) => n === state.history[i]) && m.length >= h.length ? m : h;
}
function auxiliaryWeights(h) {
const all = memoryHistory(h), w = Array(37).fill(1), trigger = h.at(-1), pair = h.slice(-2);
let exact = 0, shape = 0, mass = 0;
if (trigger == null) return {
weights: w,
exact: exact,
shape: shape,
samples: 0
};
const current = h.length >= 3 ? triangleFeatures(...h.slice(-3)) : null;
for (let i = 0; i < all.length - 1; i++) {
const age = all.length - 2 - i, decay = Math.exp(-age / 180);
let strength = 0;
if (all[i] === trigger) {
exact++;
strength += decay;
}
if (i >= 1 && all[i - 1] === pair[0] && all[i] === pair[1]) strength += decay * 2;
if (current && i >= 2) {
const t = triangleFeatures(all[i - 2], all[i - 1], all[i]);
if (t.type === current.type && t.trend === current.trend && Math.abs(t.closure - current.closure) <= 2) {
shape++;
strength += decay * .18;
}
}
if (!strength) continue;
mass += strength;
for (let j = 0; j < 37; j++) w[j] += strength * Math.exp(-distance(W[j], all[i + 1]) / 1.5);
}
return {
weights: normalizeSpace(w),
exact: exact,
shape: shape,
samples: all.length,
mass: mass
};
}
function zoneSnapshot(h, start, size = 8) {
const numbers = Array.from({
length: size
}, (_, j) => W[mod(start + j)]), inside = n => numbers.includes(n), recent = h.slice(-10), previous = h.slice(-20, -10);
const now = recent.filter(inside).length, prior = previous.filter(inside).length, rate = (now + size / 37 * 4) / (recent.length + 4), oldRate = (prior + size / 37 * 4) / (previous.length + 4);
let outside = 0;
for (let i = h.length - 1; i >= 0 && !inside(h[i]); i--) outside++;
const delta = rate - oldRate, visits = h.slice(-20).filter(inside).length;
let health = visits < 3 ? "EM FORMAÇÃO" : delta < -.18 ? "PERDENDO FORÇA" : delta > .15 ? "GANHANDO FORÇA" : "ESTÁVEL";
if (outside >= 2 && delta < -.12) health = "QUEBRA EM CONFIRMAÇÃO";
if (outside >= 3 && delta < -.18) health = "QUEBRA CONFIRMADA";
if (outside === 0 && prior >= 2 && delta < -.1) health = "RETORNO EM AVALIAÇÃO";
const current = pointTriangle(W[mod(start + Math.floor(size / 2))]), width = a => {
const positions = a.filter(inside).map(n => numbers.indexOf(n));
return positions.length ? Math.max(...positions) - Math.min(...positions) : 0;
}, spread = width(recent), previousSpread = width(previous), amplitude = spread < previousSpread - 1 ? "CONTRAÇÃO" : spread > previousSpread + 1 ? "EXPANSÃO" : "MANUTENÇÃO", last = h.at(-1), edge = [ numbers[0], numbers.at(-1) ].sort((a, b) => distance(a, last) - distance(b, last))[0], exit = inside(last) ? null : {
edge: edge,
distance: Math.min(...numbers.map(n => distance(n, last))),
side: Math.sign(direction(edge, last))
};
return {
start: start,
size: size,
numbers: numbers,
now: now,
prior: prior,
visits: visits,
rate: rate,
delta: delta,
outside: outside,
health: health,
spread: spread,
previousSpread: previousSpread,
amplitude: amplitude,
exit: exit,
center: W[mod(start + Math.floor(size / 2))],
point: current
};
}
function structuralRead(h) {
const key = h.join(",");
if (structureCache.has(key)) return structureCache.get(key);
let zones = [], events = [];
for (let end = 6; end <= h.length; end++) {
const prefix = h.slice(0, end), ranked = arcCandidates(prefix), next = [];
for (const candidate of ranked) {
if (next.some(z => z.numbers.filter(n => candidate.numbers.includes(n)).length >= 5)) continue;
const z = zoneSnapshot(prefix, candidate.start);
if (z.visits < 3) continue;
const previous = zones.map(p => ({
p: p,
overlap: p.numbers.filter(n => z.numbers.includes(n)).length
})).sort((a, b) => b.overlap - a.overlap)[0];
const matched = previous && previous.overlap >= 5 ? previous.p : null;
z.id = matched?.id || "ZONE@" + end + ":" + z.start;
z.born = matched?.born || end;
z.drift = matched ? direction(matched.center, z.center) : 0;
z.travel = (matched?.travel || 0) + z.drift;
z.movement = z.drift ? "DESLOCAMENTO " + shiftText(z.drift) : "SEM DESLOCAMENTO CONFIRMADO";
if (matched && matched.health !== z.health) events.push({
position: end,
id: z.id,
from: matched.health,
to: z.health,
center: z.center
});
next.push(z);
if (next.length === 3) break;
}
// Mantém uma zona antiga enfraquecendo enquanto as concorrentes são avaliadas.
for (const prior of zones) {
if (next.some(z => z.id === prior.id)) continue;
const z = {
...zoneSnapshot(prefix, prior.start),
id: prior.id,
born: prior.born,
drift: 0,
movement: "PERDA DE PRIORIDADE"
};
if (z.health.includes("QUEBRA") || z.health === "PERDENDO FORÇA") {
next.push(z);
if (prior.health !== z.health) events.push({
position: end,
id: z.id,
from: prior.health,
to: z.health,
center: z.center
});
}
}
zones = next.slice(0, 5);
}
const weights = Array(37).fill(1), last = h.at(-1), tri = h.length >= 3 ? triangleFeatures(...h.slice(-3)) : null;
for (const z of zones) {
const strength = clamp((z.visits - 3) / 12, 0, .55), factor = z.health === "QUEBRA CONFIRMADA" ? .15 : z.health === "QUEBRA EM CONFIRMAÇÃO" ? .35 : z.health === "PERDENDO FORÇA" ? .45 : 1;
for (let j = 0; j < 37; j++) weights[j] += strength * factor * (z.numbers.includes(W[j]) ? 1 : -8 / 29);
}
// Transições regionais e espelho usam referência proporcional ao tamanho do grupo.
const regionCounts = Object.fromEntries(Object.keys(REGIONS).map(k => [ k, REGIONS[k].length / 37 * 10 ]));
const mirrorPrior = MIRROR.size / 37;
let mirrorHits = mirrorPrior * 10, mirrorTotal = 10, regionTotal = 10;
for (let i = 0; i < h.length - 1; i++) {
const age = h.length - 2 - i, d = Math.exp(-age / 30);
if (region(h[i]) === region(last)) {
regionCounts[region(h[i + 1])] += d;
regionTotal += d;
}
if (mirror(h[i]) === mirror(last)) {
mirrorTotal += d;
if (MIRROR.has(h[i + 1])) mirrorHits += d;
}
}
for (let j = 0; j < 37; j++) {
const rp = regionCounts[region(W[j])] / regionTotal / (REGIONS[region(W[j])].length / 37);
const mp = MIRROR.has(W[j]) ? mirrorHits / mirrorTotal / (mirrorPrior || 1) : (1 - mirrorHits / mirrorTotal) / (1 - mirrorPrior || 1);
weights[j] *= clamp(.84 + .08 * rp + .08 * mp, .7, 1.3);
}
let trendRun = 0, shapeRun = 0;
for (let i = h.length - 1; i >= 2; i--) {
const t = triangleFeatures(h[i - 2], h[i - 1], h[i]);
if (t.trend !== tri?.trend) break;
trendRun++;
}
for (let i = h.length - 1; i >= 2; i--) {
const t = triangleFeatures(h[i - 2], h[i - 1], h[i]);
if (t.type !== tri?.type) break;
shapeRun++;
}
const main = zones[0], keyContext = "Z:" + (main?.health || "SEM ZONA") + "|D:" + Math.sign(main?.drift || 0) + "|H:" + (tri?.trend || "SEM TRINCA") + "|N:" + Math.min(3, trendRun);
return boundedCache(structureCache, key, {
zones: zones,
events: events.slice(-30),
weights: normalizeSpace(weights),
key: keyContext,
trendRun: trendRun,
shapeRun: shapeRun,
regionSamples: regionTotal - 10,
mirrorSamples: mirrorTotal - 10
}, 180);
}
function playStructure(play, h) {
if (!validPlay(play)) return {
score: 0,
coverage: 0,
risk: 1,
reason: "SEM GEOMETRIA"
};
const s = spatialRead(h), structure = s.structure || structuralRead(h), coverage = play.numbers.reduce((v, n) => v + structure.weights[ix(n)], 0) / 37;
const gaps = missing(play);
let run = 0, longest = 0;
for (let i = 0; i < 74; i++) {
run = gaps.includes(W[i % 37]) ? run + 1 : 0;
longest = Math.max(longest, run);
}
const zones = structure.zones.map(z => ({
health: z.health,
coverage: z.numbers.filter(n => play.numbers.includes(n)).length / z.size,
center: z.center,
amplitude: z.amplitude,
exit: z.exit,
drift: z.drift,
travel: z.travel
}));
const risk = zones.filter(z => z.health === "GANHANDO FORÇA").reduce((v, z) => Math.max(v, 1 - z.coverage), 0), score = clamp(coverage - .025 * risk, 0, 1);
const main = structure.zones[0], reason = (main ? main.health + " • ZONA " + main.center : "SEM ZONA CONFIRMADA") + " • " + (s.tri.last?.trend || "SEM TRINCA") + " • LACUNA MÁXIMA " + Math.min(9, longest);
return {
score: score,
coverage: coverage,
risk: risk,
gap: Math.min(9, longest),
zones: zones,
reason: reason
};
}
function classifyMiss(play, n) {
const covered = play.numbers.includes(n);
if (covered) return {
kind: "COBERTO",
edge: 0,
offset: 0
};
const edge = Math.min(...play.numbers.map(x => distance(x, n))), nearest = play.blocks.map(b => ({
b: b,
offset: direction(b.center, n)
})).sort((a, b) => Math.abs(a.offset) - Math.abs(b.offset))[0];
const gapNeighbors = neighbors(n, 1).filter(x => play.numbers.includes(x)).length;
return {
kind: gapNeighbors === 2 ? "INTERVALO ENTRE BLOCOS" : edge === 1 ? "BORDA" : edge <= 2 ? "LACUNA PRÓXIMA" : "AFASTAMENTO",
edge: edge,
offset: nearest.offset
};
}
function motorDiversity(ms) {
return ms.map(m => ({
...m,
diversity: ms.length > 1 ? avg(ms.filter(o => o !== m).map(o => 1 - m.play.numbers.filter(n => o.play.numbers.includes(n)).length / 28)) : 0
}));
}
function localVariants(play) {
const list = [];
for (let block = 0; block < play.blocks.length; block++) for (const shift of [ -2, -1, 1, 2 ]) {
const blocks = play.blocks.map((b, i) => {
const center = i === block ? W[mod(ix(b.center) + shift)] : b.center;
return {
center: center,
radius: b.radius,
numbers: neighbors(center, b.radius)
};
});
const candidate = {
blocks: blocks,
numbers: blocks.flatMap(b => b.numbers),
score: play.score
};
list.push({
id: block + ":" + shift,
block: block,
shift: shift,
play: validPlay(candidate) ? candidate : null
});
}
return list;
}
function localAdjustment(motor, h) {
const rows = (state.adjustment.books[adjustmentKey(motor)]?.rows || []).filter(r => r.localHits && r.globalShift === (motor.adjustment?.shift || 0)), variants = localVariants(motor.play);
if (rows.length < 32) return motor;
const training = rows.slice(0, -8), validation = rows.slice(-8), ranked = variants.filter(v => v.play).map(v => {
const i = variants.indexOf(v), train = training.filter(r => r.localHits[i] != null), check = validation.filter(r => r.localHits[i] != null);
const gain = avg(train.map(r => r.localHits[i] - r.globalHit)), confirmed = check.length >= 6 && check.filter(r => r.localHits[i]).length >= 5 && check.reduce((a, r) => a + r.localHits[i] - r.globalHit, 0) >= 2;
return {
...v,
i: i,
gain: gain,
confirmed: confirmed,
samples: train.length
};
}).filter(v => v.samples >= 20).sort((a, b) => b.gain - a.gain || Math.abs(a.shift) - Math.abs(b.shift));
const best = ranked[0];
if (!best || !best.confirmed || best.gain < .1) return motor;
return {
...motor,
play: best.play,
localAdjustment: {
block: best.block,
shift: best.shift,
samples: rows.length,
gain: best.gain
},
triangleScore: triangleCoverage(best.play, h),
spatialScore: spatialCoverage(best.play, h)
};
}
function decisionEvidence(motor, h, stats = {}) {
const fit = playStructure(motor?.play, h), samples = stats.entries || 0, reliability = samples / (samples + 12), s = spatialRead(h);
if (!validPlay(motor?.play)) return {
...fit,
samples: samples,
reliability: reliability,
reason: "SEM GEOMETRIA"
};
const componentCoverage = s.components.map(w => motor.play.numbers.reduce((sum, n) => sum + w[ix(n)], 0) / w.reduce((sum, v) => sum + v, 0));
const weighted = componentCoverage.reduce((sum, v, i) => sum + v * s.adaptive.shares[i], 0), rows = state.ledger.filter(r => r.motorHits && r.motorHits[motor.key] === false), similar = rows.map(r => ({
r: r,
w: spatialMatch(r.spatialKeys, s.keys)
})).filter(x => x.w > 0), mass = similar.reduce((sum, x) => sum + x.w, 0), recovered = (similar.reduce((sum, x) => sum + x.w * Number(motor.play.numbers.includes(x.r.number)), 0) + 28 / 37 * 8) / (mass + 8);
const contextWeight = Math.min(.1, mass / (mass + 12) * .1), score = (fit.score * .6 + weighted * .4) * (1 - contextWeight) + recovered * contextWeight;
const features = {
geometry: {
blocks: motor.play.blocks.map(b => ({
center: b.center,
radius: b.radius
})),
covered: 28,
uncovered: missing(motor.play),
normalized: motor.normalizedGeometry ? motor.score : null,
largestGap: fit.gap
},
triangle: s.tri.last ? {
type: s.tri.last.type,
trend: s.tri.last.trend,
steps: [ s.tri.last.s1, s.tri.last.s2 ],
closure: s.tri.last.closure,
area: s.tri.last.area
} : null,
chain: s.chain?.key || null,
route: s.route.key,
poles: s.poles.active ? {
event: s.poles.active.event,
separation: s.poles.active.separation,
drift: s.poles.active.drift
} : null,
arc: s.arcs.active ? {
numbers: s.arcs.active.numbers,
event: s.arcs.active.event,
health: s.arcs.active.health
} : null,
zones: fit.zones,
componentCoverage: componentCoverage,
componentShares: [ ...s.adaptive.shares ],
regionSamples: s.structure.regionSamples,
mirrorSamples: s.structure.mirrorSamples,
memory: {
samples: s.auxiliary.samples,
triggerMatches: s.auxiliary.exact,
shapeMatches: s.auxiliary.shape
},
globalAdjustment: copy(motor.adjustment || null),
localAdjustment: copy(motor.localAdjustment || null),
similarMisses: similar.length,
recovered: recovered,
firstEntries: samples,
firstMiss: stats.firstMiss || 0,
trend: stats.trend || 0,
diversity: motor.diversity || 0
};
const zone = s.structure.zones[0], zoneCoverage = zone ? motor.play.numbers.filter(n => zone.numbers.includes(n)).length + "/" + zone.size : "SEM ZONA";
return {
...fit,
features: features,
samples: samples,
reliability: reliability,
score: score,
reason: fit.reason + " • COBERTURA DA ZONA " + zoneCoverage + " • AJUSTE " + shiftText(motor.adjustment?.shift || 0) + (motor.localAdjustment ? " / LOCAL CONFIRMADO" : "") + " • " + samples + " ENTRADAS" + (samples < 12 ? " / SUPORTE BAIXO" : "")
};
}
function compactPanel(id) {
const cs = motors(state.history), h = state.history, s = spatialRead(h), m = state.cycle?.original || activeMotor(cs), structure = s.structure || structuralRead(h);
let html = "";
if (id === "selector") {
const ranked = selectionRanking(h), chosen = displayedSelection();
html = "<b>" + esc(chosen?.name || "AGUARDANDO HISTÓRICO") + "</b><p>" + esc(state.selection.reason || "EM AVALIAÇÃO") + "</p>" + (m ? "<p>" + esc(decisionEvidence(m, h, selectionStats(chosen?.id, h)).reason) + "</p>" : "") + tableHTML([ "CANDIDATO", "ENTRADAS", "GREEN", "G1", "LOSS", "ÍNDICE" ], ranked.slice(0, 5).map(r => [ esc(r.name), r.entries, r.green, r.g1, r.loss, pct(r.score, 1) ]));
} else if (id === "general") html = metricsHTML(state.ledger) + "<p>MANUAIS ARQUIVADOS: " + state.manualLog.length + " • DESFAZER: " + state.undoStack.length + "</p>"; else if (id === "trainer") {
const top = trainerRanking().slice(0, 5);
html = "<b>TREINADOR GLOBAL • " + esc(definitions().find(d => d.id === state.trainerChoice)?.name || "AGUARDANDO") + "</b>" + tableHTML([ "ESTRATÉGIA", "CICLOS", "LOSS", "ÍNDICE" ], top.map(r => [ esc(r.name), r.total, r.loss, pct(r.score, 1) ]));
} else if (id === "numbertrainer") {
const n = bestNumberCombination(h);
html = n ? "<b>GATILHO " + n.trigger + " • COMBINAÇÃO DO " + n.sourceNumber + "</b><p>" + n.matches + "/" + n.tests + " TRANSIÇÕES COBERTAS • MEMÓRIA AUXILIAR " + (state.spatialMemory?.numbers.length || 0) + " RESULTADOS</p>" : "AGUARDANDO HISTÓRICO";
} else if (id === "numbertrainer10") {
const n = choice10();
html = "<b>NÚMEROS 1.0 • " + (n ? esc(n.status) : "SEM JOGADA ELEGÍVEL") + "</b><p>TESTES ABERTOS: " + state.n10.pending.length + " • BLOQUEIOS NÃO JOGAR PRESERVADOS</p>";
} else if (id === "triangulation") {
const t = s.tri.last;
html = t ? "<b>" + t.a + " → " + t.b + " → " + t.c + "</b><p>" + esc(t.labels.join(" • ")) + " • SALTOS " + t.s1 + " / " + t.s2 + "</p><p>PERSISTÊNCIA DA FORMA " + structure.shapeRun + " • TENDÊNCIA " + structure.trendRun + "</p>" : "AGUARDANDO TRÊS RESULTADOS";
} else if (id === "spatial") html = tableHTML([ "ZONA", "ESTADO", "10 ANTERIORES", "10 RECENTES", "FORA", "DESLOCAMENTO" ], structure.zones.map(z => [ z.numbers.join(" • "), z.health, z.prior, z.now, z.outside, z.drift ])) + "<p>POLOS: " + esc(s.poles.active?.event || "SEM EPISÓDIO") + " • COMPONENTES ESPACIAIS ADAPTATIVOS PRESERVADOS</p>"; else if (id === "motors") html = tableHTML([ "MOTOR", "ÍNDICE GEOMÉTRICO", "AJUSTE", "LEITURA" ], cs.map(c => [ esc(c.key), pct(c.score, 1), shiftText(c.adjustment?.shift || 0), esc(c.evidence?.reason || playStructure(c.play, h).reason) ])); else if (id === "g1ranking" || id === "g1numbers") {
const strategy = state.cycle?.strategy || activeDefinition().id;
html = "<b>" + esc(strategy) + "</b>" + tableHTML([ "DEFESA", "EVENTOS", "GREEN G1", "LOSS" ], G1_MODES.map(mode => {
const r = defenseMetrics(strategy, mode, 5e3);
return [ mode, r.total, r.hits, r.loss ];
}));
} else if (id === "jumps") {
const a = analyze(h);
html = "MÉDIA DOS SALTOS " + fmt(a.mean3) + " • VARIAÇÃO " + fmt(a.acceleration);
} else if (id === "mirrors") html = "ESPELHO " + h.slice(-20).filter(n => MIRROR.has(n)).length + "/20 • TRANSIÇÕES REGIONAIS E ESPELHO INTEGRADAS AOS PESOS DOS MOTORES"; else if (id === "timeline") html = state.ledger.slice(-8).reverse().map(r => '<div class="listrow">GIRO ' + r.turn + " • " + r.number + " • " + esc(r.result) + " • " + esc(r.motor) + "</div>").join(""); else if (id === "lab") html = "TODAS AS ESTRATÉGIAS E A CRIAÇÃO DE PERSONALIZADAS ESTÃO DISPONÍVEIS NOS DETALHES. MEMÓRIA AUXILIAR LIMITADA A 700; JANELA OPERACIONAL DE 70.";
return '<div class="box">' + html + '</div><button class="btn" data-detail="' + id + '">MOSTRAR DETALHES</button>';
}
function renderPanel(id, make) {
const key = computationRevision + "|" + id + "|" + !!state.details?.[id] + "|" + state.n10.viewTrigger + "|" + state.n10.viewAll + "|" + state.strategy + "|" + state.manual + "|" + state.rank + "|" + state.stake + "|" + state.multiplier + "|" + state.created.length + "|" + state.adaptive + "|" + state.activeCreated + "|" + state.g1Trainer + "|" + state.g1 + "|" + state.galeSkip + "|" + state.secondHouse;
let html = panelCache.get(key);
if (html == null) {
html = make();
boundedCache(panelCache, key, html, 40);
}
if ($(id).innerHTML !== html) $(id).innerHTML = html;
}
function decisionDetailsHTML(id) {
if (id === "spatial") return compactPanel("spatial").replace(/<button[\s\S]*$/, "") + '<p class="muted">QUEBRA É UMA CLASSIFICAÇÃO DA SEQUÊNCIA JÁ OBSERVADA. O PRÓXIMO RESULTADO PERMANECE DESCONHECIDO.</p>';
const chosen = state.selection.choice, e = chosen?.evidence, f = e?.features;
if (!f) return '<div class="box">AGUARDANDO UMA DECISÃO COM CONTEXTO.</div>';
return '<div class="box"><b>MOTIVOS E FATORES DA ESCOLHA</b><p>' + esc(chosen.reason) + "</p>" + tableHTML([ "COMPONENTE", "COBERTURA DOS PESOS", "PESO ADAPTATIVO" ], COMPONENTS.map((name, i) => [ name, pct(f.componentCoverage[i], 1), pct(f.componentShares[i], 1) ])) + "<p>GEOMETRIA: 28 ÚNICOS / 6 BLOCOS; MAIOR LACUNA " + f.geometry.largestGap + ". MEMÓRIA: " + f.memory.samples + " RESULTADOS / " + f.memory.triggerMatches + " TRANSIÇÕES DO GATILHO. ERROS EM CONTEXTO SEMELHANTE: " + f.similarMisses + ".</p><p>ÍNDICE DO SELETOR: 80% AVALIAÇÃO DAS ENTRADAS E CICLOS, 10% COBERTURA ESPACIAL, 10% ADEQUAÇÃO ESTRUTURAL. ÍNDICES COMPARATIVOS, SEM PROBABILIDADE GARANTIDA.</p>" + tableHTML([ "ALTERNATIVA", "ÍNDICE", "ENTRADAS", "GREEN DIRETO / ÍNDICE", "ESPACIAL", "ESTRUTURAL" ], (chosen.alternatives || []).map(r => [ esc(r.name), pct(r.score, 1), r.samples, pct(r.direct, 1), pct(r.coverage, 1), pct(r.structure, 1) ])) + "</div>";
}
function handlePanelClick(e) {
const detail = e.target.closest?.("[data-detail]"), panel = e.target.closest?.("[data-panel]");
if (!detail && !panel) return;
e.stopImmediatePropagation?.();
if (busy) return;
if (detail) {
state.details = state.details || {};
state.details[detail.dataset.detail] = !state.details[detail.dataset.detail];
panelCache.clear();
} else state.open[panel.dataset.panel] = !state.open[panel.dataset.panel];
save();
render();
}
function button(label, action, parent, extra = "") {
const b = document.createElement("button");
b.className = "btn " + extra;
b.textContent = label;
b.onclick = action;
parent.appendChild(b);
return b;
}
function sortedBlocks(play) {
return validPlay(play) ? [ ...play.blocks ].sort((a, b) => Object.keys(REGIONS).indexOf(region(a.center)) - Object.keys(REGIONS).indexOf(region(b.center))) : [];
}
function centersHTML(play) {
return sortedBlocks(play).map(b => `<div class="center ${b.radius === 1 ? "short" : ""}"><strong>${b.center}</strong><small>${region(b.center)}</small><small>${b.radius} ${b.radius === 1 ? "VIZINHO" : "VIZINHOS"}</small></div>`).join("");
}
function cloud(numbers, highlight = []) {
const marked = new Set(highlight);
return `<div class="cloud">${numbers.map(n => `<span class="${marked.has(n) ? "danger" : ""}">${n}</span>`).join("")}</div>`;
}
function tableHTML(headers, rows) {
return `<div class="tablewrap"><table><thead><tr>${headers.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c ?? "—"}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
function metrics(rows) {
const closed = rows.filter(r => [ "GREEN", "GREEN G1", "LOSS" ].includes(r.result)), green = closed.filter(r => r.result === "GREEN").length, g1 = closed.filter(r => r.result === "GREEN G1").length, loss = closed.filter(r => r.result === "LOSS").length, net = closed.reduce((s, r) => s + (r.profit || 0), 0);
return {
total: closed.length,
green: green,
g1: g1,
loss: loss,
net: net
};
}
function metricsHTML(rows) {
const m = metrics(rows);
return `<div class="metrics">${[ [ "CICLOS", m.total ], [ "GREEN", m.green ], [ "GREEN G1", m.g1 ], [ "LOSS", m.loss ], [ "ACERTOS", pct(m.green + m.g1, m.total) ] ].map(([l, v]) => `<div class="metric"><small>${l}</small><b>${v}</b></div>`).join("")}</div>`;
}
function breakdown(strategy = null, mode = "CONGELADA") {
const out = {
CONTINUIDADE: {
total: 0,
hits: 0
},
DESLOCAMENTO: {
total: 0,
hits: 0
},
RUPTURA: {
total: 0,
hits: 0
}
};
for (const r of g1History(strategy, mode, 5e3)) {
const v = out[r.behavior];
if (!v) continue;
v.total++;
if (r.hit) v.hits++;
}
return out;
}
function breakdownHTML(strategy = null) {
return tableHTML([ "COMPORTAMENTO", "OCORRÊNCIAS", "GREEN G1", "LOSS", "ACERTO" ], Object.entries(breakdown(strategy)).map(([n, v]) => [ n, v.total, `<span class="good">${v.hits}</span>`, `<span class="bad">${v.total - v.hits}</span>`, pct(v.hits, v.total) ]));
}
function contextHTML(keys) {
return (keys || []).map(k => `<div class="muted">${esc(k)}</div>`).join("");
}
function triangleSVG(f) {
if (!f) return "";
const pos = n => {
const p = pointTriangle(n);
return {
x: 250 + p.x * 190,
y: 250 - p.y * 190
};
}, a = pos(f.a), b = pos(f.b), c = pos(f.c), marked = new Set([ f.a, f.b, f.c ]);
return `<svg viewBox="0 0 500 500" role="img" aria-label="Triangulação dos últimos resultados"><defs><marker id="triA" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill="#57e4ff"/></marker><marker id="triB" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill="#ffd36a"/></marker></defs><circle cx="250" cy="250" r="190" fill="#101e2d" stroke="#58718a" stroke-width="2"/>${f.a !== f.c ? `<line x1="${a.x}" y1="${a.y}" x2="${c.x}" y2="${c.y}" stroke="#a7bdd4" stroke-width="2" stroke-dasharray="7 5"/>` : ""}${f.a !== f.b ? `<path d="M ${a.x} ${a.y} Q ${(a.x + b.x) / 2 + 7} ${(a.y + b.y) / 2 + 7} ${b.x} ${b.y}" fill="none" stroke="#57e4ff" stroke-width="4" marker-end="url(#triA)"/>` : ""}${f.b !== f.c ? `<path d="M ${b.x} ${b.y} Q ${(b.x + c.x) / 2 - 7} ${(b.y + c.y) / 2 - 7} ${c.x} ${c.y}" fill="none" stroke="#ffd36a" stroke-width="4" marker-end="url(#triB)"/>` : ""}${W.map(n => {
const p = pos(n);
return `<circle cx="${p.x}" cy="${p.y}" r="14" fill="${n === 0 ? "#087b50" : RED.has(n) ? "#a92b43" : "#253a50"}" stroke="${marked.has(n) ? "#ffe078" : "#526d85"}" stroke-width="${marked.has(n) ? 3 : 1}"/><text x="${p.x}" y="${p.y + 4}" fill="white" text-anchor="middle" font-size="11" font-weight="bold">${n}</text>`;
}).join("")}<text x="250" y="241" fill="#bdd0e2" text-anchor="middle" font-size="14">${f.a} → ${f.b} → ${f.c}</text><text x="250" y="265" fill="#57e4ff" text-anchor="middle" font-size="11">${esc(f.type)}</text><text x="250" y="284" fill="#ffd36a" text-anchor="middle" font-size="11">${esc(f.trend)}</text></svg>`;
}
function triangulationHTML() {
if (!state.details?.["triangulation"]) return compactPanel("triangulation");
const h = state.history, a = triangleAnalysis(h), f = a.last;
if (!f) return `<div class="box">AGUARDANDO TRÊS RESULTADOS.</div>`;
const pair = h.slice(-2), following = [];
for (let i = 0; i + 2 < h.length; i++) if (h[i] === pair[0] && h[i + 1] === pair[1]) following.push(h[i + 2]);
return `<div class="box"><b>TRIANGULAÇÃO / AMPLITUDE / CONTORNO</b><p>TRINCA: ${f.a} → ${f.b} → ${f.c}</p><p>RÓTULOS: <strong>${esc(f.labels.join(" + "))}</strong></p><p>SALTOS: ${f.s1} / ${f.s2} • ${esc(f.trend)}</p><p>RAZÃO DOS MÓDULOS: ${f.ratio == null ? "INDEFINIDA" : fmt(f.ratio)}</p><p>SOMA ANTES DO MÓDULO: ${f.route.net} CASAS</p><p>PERCURSO ABSOLUTO: ${f.route.length} • AMPLITUDE: ${f.route.amplitude}</p><p>FECHAMENTO A → C: ${f.closure} CASAS</p><p>REFERÊNCIA DE 37 MAIS PRÓXIMA: ${f.route.nearestTurns * 37} • RESÍDUO: ${f.route.residual}</p><p>CORDAS: ${f.chords.map(fmt).join(" / ")}</p><p>ÂNGULOS: ${f.angles.map(v => v == null ? "INDEFINIDO" : fmt(v) + "°").join(" / ")}</p><p>ÁREA: ${fmt(f.area)} • ${f.degenerate ? "TRINCA DEGENERADA" : "TRÊS PONTOS DISTINTOS"}</p></div><div class="triangleDrawing">${triangleSVG(f)}</div><div class="muted">CIANO A → B; AMARELO B → C; TRACEJADO A → C. POSIÇÕES DOS RESULTADOS, NÃO TRAJETÓRIA REAL DA BOLA.</div><div class="box"><p>PAR ATUAL: ${pair.join(" → ")}</p><p>OCORRÊNCIAS COMPLETAS: ${a.exactPairs}</p><p>SALTOS INICIAIS SEMELHANTES: ${a.matches}</p><p>TRINCAS CONHECIDAS: ${a.samples}</p></div><div class="title">RESULTADOS DEPOIS DO PAR</div>${following.length ? cloud(following) : `<div class="muted">SEM OCORRÊNCIA EXATA COMPLETA.</div>`}<div class="title">CLASSIFICAÇÕES DA JANELA</div>${Object.entries(a.counts).map(([n, c]) => `<div class="listrow">${esc(n)} • ${c}</div>`).join("")}<div class="title">ÚLTIMAS TRINCAS</div>${tableHTML([ "POSIÇÃO", "TRINCA", "RÓTULOS", "AB", "BC", "SOMA", "ABSOLUTO", "FECHAMENTO" ], a.triples.slice(-25).reverse().map(t => [ t.position, `${t.a} → ${t.b} → ${t.c}`, esc(t.labels.join(" + ")), t.s1, t.s2, t.route.net, t.route.length, t.closure ]))}`;
}
function spatialHTML() {
if (!state.details?.["spatial"]) return compactPanel("spatial");
const h = state.history;
if (h.length < 4) return decisionDetailsHTML("spatial") + `<div class="box">AGUARDANDO QUATRO RESULTADOS.</div>`;
const s = spatialRead(h), p = s.poles.active, a = s.arcs.active, c = s.chain, fused = s.poles.concentration, leaders = W.map(n => ({
n: n,
total: s.weights[ix(n)],
triangle: s.tri.weights[ix(n)],
chain: s.chainWeights[ix(n)],
pole: s.poleWeights[ix(n)],
arc: s.arcWeights[ix(n)],
route: s.route.weights[ix(n)]
})).sort((a, b) => b.total - a.total);
return `<div class="box"><b>ANÁLISES EFETIVAS DOS MOTORES V${VERSION}</b><p>CONTRAÇÃO, EXPANSÃO, AMPLITUDE E ORDEM DOS SALTOS PARTICIPAM DOS PESOS ANTES DA GEOMETRIA.</p><p>JANELA MÓVEL; JOGADAS DOS CICLOS ABERTOS PRESERVADAS.</p>${contextHTML(s.keys)}</div><div class="title">PESOS ADAPTATIVOS DOS COMPONENTES</div>${tableHTML([ "COMPONENTE", "BASE", "PESO ATUAL", "AMOSTRAS", "GANHO LOG MÉDIO" ], s.adaptive.details.map(d => [ esc(d.component), pct(d.base, 1), pct(d.share, 1), d.samples, fmt(d.meanLogGain) ]))}<div class="muted">Até 24 avaliações causais, uma por resultado e componente. Regularização de 16 amostras e ajuste limitado. Os pesos são relativos, não probabilidades de acerto.</div><div class="title">PERCURSOS ACUMULADOS</div>${tableHTML([ "RESULTADOS", "SALTOS", "SOMA", "ABSOLUTO", "37 COMPLETAS", "FECHAMENTO", "RÓTULOS" ], s.route.current.map(r => [ r.numbers.join(" → "), r.steps.join(" / "), r.net, r.length, r.completedTurns, r.closure, esc(r.labels.join(" + ") || "PERCURSO ABERTO") ]))}<div class="muted">“37 COMPLETAS” É SOMA DOS MENORES SALTOS, NÃO VOLTAS REAIS DA BOLA.</div><div class="box"><b>ENCADEAMENTO</b><p>${c ? c.numbers.join(" → ") : "AGUARDANDO"}</p><p>SALTOS: ${c ? c.hops.join(" / ") : "—"}</p><p>FORMAS: ${c ? esc(c.first.labels.join(" + ")) + " → " + esc(c.second.labels.join(" + ")) : "—"}</p><p>EXEMPLOS DE CADEIA: ${s.chainExamples}</p><p>COMPARAÇÕES DE PERCURSO: ${s.route.examples} • RESULTADOS DISTINTOS: ${s.route.uniqueExamples}</p></div><div class="box"><b>DOIS POLOS MÓVEIS</b>${p ? `<p>STATUS: ${p.active ? "ATIVO" : "ENCERRADO"}</p><p>EVENTO: <strong>${esc(p.event)}</strong></p><p>INICIAIS: ${p.initial.join(" / ")} • ATUAIS: ${p.anchors.join(" / ")}</p><p>SEPARAÇÃO: ${distance(...p.anchors)} • ${esc(p.movement)}</p><p>DESLOCAMENTOS ACUMULADOS: ${p.drift.join(" / ")}</p><p>ÚLTIMOS DESLOCAMENTOS: ${p.lastShift.join(" / ")}</p><p>ALTERNÂNCIAS: ${p.alternations} • INTERRUPÇÕES: ${p.interruptions} • FORA: ${p.outside}</p><p>LADO SEGUINTE: ${p.active ? p.anchors[1 - p.lastSide] : "SEM POLO ATIVO"}</p>` : `<p>SEM EPISÓDIO A → B → A' → B'.</p>`}${fused ? `<p>CONCENTRAÇÃO APÓS FUSÃO: ${fused.active ? "ATIVA" : "ENCERRADA"} • CENTRO ${fused.center} • VISITAS ${fused.visits} • FORA ${fused.outside}</p>` : ""}<div class="muted">FORMAÇÃO: RETORNOS ATÉ 2 CASAS E SEPARAÇÃO ≥8. ACOMPANHAMENTO ATÉ 4. CONVERGÊNCIA ≤6; FUSÃO ≤4 ENCERRA OS DOIS POLOS. DOIS FORA ENCERRAM O EPISÓDIO.</div></div>${tableHTML([ "POSIÇÃO", "NÚMERO", "EVENTO", "MOVIMENTO", "DISTÂNCIA", "POLOS", "DESLOCAMENTOS" ], s.poles.events.slice(-30).reverse().map(e => [ e.position, e.number, esc(e.event), esc(e.movement), e.separation, e.anchors.join(" / "), e.drift.join(" / ") ]))}<div class="box"><b>ARCO ACOMPANHADO</b>${a ? `<p>${a.numbers.join(" • ")}</p><p>FORÇA: <strong>${a.health}</strong> • INFLUÊNCIA ${pct(a.strength, 1)}</p><p>EVENTO: ${a.event} • FORMADO ANTES DA POSIÇÃO ${a.formedBefore}</p><p>VISITAS: ${a.count}/${a.total} • MÍNIMO ${arcMinimum(a)}</p><p>DENTRO ${a.inside} • FORA ${a.outside} • ENTRADAS ${a.entries} • SAÍDAS ${a.exits} • REENTRADAS ${a.returns}</p><p>ÚLTIMO INTERVALO ${a.lastGap} • MAIOR INTERVALO ${a.maxGap} • DESLOCAMENTO ${a.drift}</p><p>SUPORTE CONTEXTUAL: ${s.arcEvidence.hits}/${s.arcEvidence.total}</p>` : `<p>SEM ARCO ATIVO. ÚLTIMO EVENTO: ${s.arcs.last?.event || "SEM EPISÓDIO"}</p>`}<div class="muted">Abaixo do mínimo: influência reduzida. Duas avaliações fracas ou 12 resultados fora com concentração insuficiente encerram o arco. Cada avaliação usa somente o prefixo anterior.</div></div><div class="title">ARCOS MAIS VISITADOS AGORA</div>${tableHTML([ "#", "ARCO DE 8 POSIÇÕES", "VISITAS", "AMOSTRA" ], s.arcs.ranked.slice(0, 10).map((r, i) => [ i + 1, r.numbers.join(" • "), r.count, r.total ]))}<div class="title">ENTRADAS, SAÍDAS, REENTRADAS E ENCERRAMENTOS</div>${tableHTML([ "POSIÇÃO", "NÚMERO", "EVENTO", "FORÇA", "ARCO", "FORA", "INTERVALO" ], s.arcs.events.slice(-30).reverse().map(e => [ e.position, e.number, esc(e.event), e.health || "—", esc(e.arcId), e.outside, e.gap ]))}<div class="title">TRANSIÇÕES CONHECIDAS DOS ARCOS • GERAL DESCRITIVO</div>${tableHTML([ "EVENTO ANTERIOR", "PRÓXIMOS TESTADOS", "PRÓXIMOS DENTRO" ], Object.entries(s.arcs.transitions).map(([e, v]) => [ esc(e), v.total, v.hits ]))}<div class="title">MEMÓRIA CONTEXTUAL USADA NO PESO DO ARCO</div>${tableHTML([ "SETOR / EVENTO / FORÇA / CONTEXTO", "TESTES", "DENTRO" ], Object.entries(s.arcs.contextTransitions).map(([k, v]) => [ esc(k), v.total, v.hits ]))}<div class="title">PESOS EFETIVOS DOS MOTORES</div>${tableHTML([ "NÚMERO", "TRINCA", "CADEIA", "POLOS", "ARCO", "PERCURSO", "TOTAL" ], leaders.map(v => [ v.n, fmt(v.triangle), fmt(v.chain), fmt(v.pole), fmt(v.arc), fmt(v.route), fmt(v.total) ]))}<div class="title">VALIDAÇÃO NO CONTEXTO ATUAL</div>${tableHTML([ "ESTRATÉGIA", "CICLOS COMPATÍVEIS", "SUPORTE", "ACERTOS", "LOSS", "ÍNDICE" ], trainerRanking().map(r => [ esc(r.name), r.contextTotal, fmt(r.contextSupport), r.contextHits, r.contextLoss, pct(r.score, 1) ]))}`;
}
function card10(r) {
const rejected = r.blocked || r.status === "REJECTED", approved = r.status === "APPROVED" && !rejected, pending = state.n10.pending.filter(t => t.trigger === r.trigger && t.recordId === r.id);
return `<div class="g1card ${approved ? "selected" : ""}"><b class="${rejected ? "bad" : approved ? "good" : ""}">GATILHO ${r.trigger} • ${recordStatus10(r)}</b><div class="muted">ORIGEM: ${esc(r.motor.key)} • GIRO ${r.created}</div><div class="play10"><div class="centers">${centersHTML(r.motor.play)}</div>${rejected ? `<div class="reject10">NÃO JOGAR<small>REPROVADA PARA O GATILHO ${r.trigger}</small></div>` : ""}</div><div class="muted">28 COBERTOS: ${r.motor.play.numbers.join(" • ")}</div><div class="muted">9 DESCOBERTOS: ${missing(r.motor.play).join(" • ")}</div><div class="muted">PROSPECTIVOS NA JANELA: GREEN ${r.green} • GREEN G1 ${r.g1} • LOSS ${r.loss}</div><div class="muted">RETROSPECTIVOS VIRTUAIS: GREEN ${r.vg} • GREEN G1 ${r.vg1} • LOSS ${r.vl}</div><div class="muted">COBERTURA DOS PESOS: ${pct(spatialCoverage(r.motor.play, state.history), 1)}</div>${r.lastResult ? `<div class="muted">ÚLTIMO CICLO: ${r.lastResult} • GIRO ${r.last}</div>` : ""}${r.lastVirtual ? `<div class="muted">ÚLTIMO RETROSPECTIVO: ${r.lastVirtual} • GIRO ${r.lastVirtualTurn}</div>` : ""}${rejected && !r.samples.length ? `<div class="muted">BLOQUEIO PRESERVADO. RESULTADO ORIGINAL FORA DO PLACAR DE 70.</div>` : ""}${pending.length ? `<div class="muted">TESTES ABERTOS: ${pending.map(t => `${t.actual ? "REAL" : "VIRTUAL"} ${esc(t.phase)} • GIRO ${t.turn}`).join(" / ")}</div>` : ""}${r.lastResult === "GREEN G1" ? `<div class="muted">APROVAÇÃO COM DEFESA. A ENTRADA ORIGINAL NÃO COBRIU O PRIMEIRO RESULTADO.</div>` : ""}</div>`;
}
function numberTrainer10HTML() {
if (!state.details?.["numbertrainer10"]) return compactPanel("numbertrainer10");
const current = state.history.at(-1);
if (current == null || state.history.length < 8) return `<div class="box">AGUARDANDO HISTÓRICO.</div>`;
const trigger = state.n10.viewTrigger === "CURRENT" ? current : Number(state.n10.viewTrigger), records = Object.values(book10(trigger).records), order = {
APPROVED: 0,
TESTING: 1,
REJECTED: 2
}, ranked = [ ...records ].sort((a, b) => order[a.status] - order[b.status] || scoreRecord10(b, state.history) - scoreRecord10(a, state.history) || b.last - a.last), visible = state.n10.viewAll ? ranked : ranked.slice(0, 60), selected = state.n10.choice, sr = selected ? book10(selected.trigger).records[selected.recordId] : null, forward = state.n10.events.filter(e => e.kind === "FORWARD"), events = state.n10.events.filter(e => e.trigger === trigger).slice(-35).reverse();
return `<div class="box"><b>TREINADOR GLOBAL NÚMEROS 1.0</b><p>STATUS: <strong class="${controllerIsActive(N10) ? "good" : "bad"}">${controllerIsActive(N10) ? "CONTROLANDO A JOGADA" : "TREINAMENTO VIRTUAL"}</strong></p><p>GATILHO ATUAL: ${current}</p><p>PRÓXIMA COMBINAÇÃO: ${sr ? recordStatus10(sr) : "SEM GEOMETRIA ELEGÍVEL"}</p><p>APROVAÇÃO, BLOQUEIO E CONTEXTO ESPACIAL PARTICIPAM DA SELEÇÃO.</p><p>CONTAGENS NA JANELA MÓVEL; BLOQUEIOS NÃO JOGAR PRESERVADOS.</p></div><div class="title">COMBINAÇÃO ATUAL</div>${sr ? card10(sr) : `<div class="box bad">SEM COMBINAÇÃO ELEGÍVEL. AGUARDANDO NOVA GEOMETRIA NORMAL; REPROVADAS NÃO SERÃO REUTILIZADAS.</div>`}<div class="title">CICLOS REAIS NA JANELA</div>${metricsHTML(forward.filter(e => !e.virtual))}<div class="title">PROSPECTIVOS VIRTUAIS</div>${metricsHTML(forward.filter(e => e.virtual))}<div class="row"><select id="trigger10"><option value="CURRENT" ${state.n10.viewTrigger === "CURRENT" ? "selected" : ""}>ACOMPANHAR NÚMERO ATUAL</option>${Array.from({
length: 37
}, (_, n) => `<option value="${n}" ${String(state.n10.viewTrigger) === String(n) ? "selected" : ""}>GATILHO ${n}</option>`).join("")}</select><button class="btn" id="all10">${state.n10.viewAll ? "MOSTRAR 60 PRIMEIRAS" : "MOSTRAR TODAS"}</button></div><div class="box">GATILHO ${trigger} • APROVADAS ${records.filter(r => r.status === "APPROVED").length} • EM TESTE ${records.filter(r => r.status === "TESTING").length} • BLOQUEADAS ${records.filter(r => r.blocked).length}</div>${tableHTML([ "GATILHO", "APROVADAS", "EM TESTE", "BLOQUEADAS", "ABERTOS" ], Array.from({
length: 37
}, (_, n) => {
const r = Object.values(state.n10.books[n]?.records || {});
return [ `<button class="btn" data-trigger10="${n}">${n}</button>`, r.filter(x => x.status === "APPROVED").length, r.filter(x => x.status === "TESTING").length, r.filter(x => x.blocked).length, state.n10.pending.filter(t => t.trigger === n).length ];
}))}<div class="title">COMBINAÇÕES DO GATILHO ${trigger} • ${visible.length}/${records.length}</div>${visible.map(card10).join("") || `<div class="box">SEM COMBINAÇÕES PARA ESTE GATILHO.</div>`}<div class="title">EVENTOS DA JANELA</div>${events.map(e => e.kind === "RETROSPECTIVE" ? `<div class="listrow"><b>RETROSPECTIVO VIRTUAL • GIRO ${e.turn}</b><div class="muted">ALTERNATIVAS ${e.tested} • GREEN ${e.green} • GREEN G1 ${e.g1} • LOSS ${e.loss} • SEM APOSTA REAL</div></div>` : `<div class="listrow"><b>${e.virtual ? "PROSPECTIVO VIRTUAL" : "CICLO REAL"} • GIRO ${e.turn}</b> • <strong class="${e.result === "LOSS" ? "bad" : "good"}">${e.result}</strong><div class="muted">${e.defense ? "DEFESA " + esc(e.defense) : "ENTRADA"} • ${esc(e.source)}</div>${contextHTML(e.spatialKeys)}</div>`).join("")}`;
}
function numberTrainerHTML() {
if (!state.details?.["numbertrainer"]) return compactPanel("numbertrainer");
const h = state.history;
if (h.length < 8) return `<div class="box">AGUARDANDO HISTÓRICO.</div>`;
const trigger = h.at(-1), ranked = rankNumberCombinations(h, trigger), s = ranked[0], pairs = numberTransitions(h, trigger), generated = state.numberCombinations;
return `<div class="box"><b>TREINADOR GLOBAL NÚMEROS • BASE V6.3.9</b><p>STATUS: ${controllerIsActive("NUMBER") ? "CONTROLANDO A JOGADA" : "ANÁLISE VIRTUAL"}</p><p>NÚMERO ATUAL: ${trigger}</p><p>COMBINAÇÕES NA JANELA: ${generated.length} • ORIGENS DIFERENTES: ${new Set(generated.map(r => r.origin)).size}</p><p>COMBINAÇÕES COMPARADAS: ${ranked.length} • TRANSIÇÕES: ${pairs.length}</p><p>MELHOR: ${s ? "GERADA PELO " + s.origin : "AGUARDANDO"} • GIRO ${s?.turn ?? "—"}</p><p>COBERTURA: ${s ? s.matches + "/" + s.total : "—"} • ÍNDICE ${s ? pct(s.score, 1) : "—"} • TROCAS ${state.numberChanges}</p><p>COMPARAÇÃO NUMÉRICA E COBERTURA ESPACIAL. SEM GREEN/LOSS COMO CRITÉRIO.</p></div>${tableHTML([ "#", "ORIGEM", "GIRO", "TRANSIÇÕES", "COBERTAS", "FORA", "ESPACIAL", "ÍNDICE" ], ranked.map((r, i) => [ i + 1, r.origin, r.turn, r.total, r.matches, r.misses, pct(r.spatialScore, 1), pct(r.score, 1) ]))}<div class="title">JOGADA ESCOLHIDA • ORIGEM ${s?.origin ?? "—"}</div><div class="centers">${centersHTML(s?.play)}</div><div class="title">28 COBERTOS</div>${cloud(s?.covered || [])}<div class="title">9 DESCOBERTOS</div>${cloud(missing(s?.play))}<div class="title">RESULTADOS DEPOIS DO ${trigger}</div>${cloud(pairs.map(r => r.next))}<div class="title">COMBINAÇÕES DA JANELA</div>${tableHTML([ "GIRO", "ORIGEM", "6 CENTROS" ], generated.slice().reverse().map(r => [ r.turn, r.origin, r.centers.join(" • ") ]))}<div class="title">ÚLTIMAS COMPARAÇÕES VIRTUAIS</div>${state.numberComparisons.slice(-20).reverse().map(r => `<div class="listrow">GATILHO ${r.trigger} • COMBINAÇÃO DO ${r.sourceNumber} • GIRO ${r.sourceTurn} • RESULTADO ${r.next} • <strong class="${r.covered ? "good" : "bad"}">${r.covered ? "COBERTO" : "FORA"}</strong></div>`).join("")}`;
}
function trainerHTML() {
if (!state.details?.["trainer"]) return compactPanel("trainer");
const ranked = trainerRanking(), active = ranked.find(r => r.id === state.trainerChoice), real = state.realG1.length, hits = state.realG1.filter(r => r.result === "GREEN G1").length;
return `<div class="box"><b>TREINADOR GLOBAL ORIGINAL</b><p>STATUS: ${controllerIsActive("TRAINER") ? "CONTROLANDO A JOGADA" : "ANÁLISE VIRTUAL"}</p><p>ESTRATÉGIAS ${ranked.length} • ATIVA: ${esc(active?.name || "AGUARDANDO")}</p><p>GIROS DESDE A TROCA ${state.trainerTurns} • TROCAS ${state.trainerChanges}</p><p>${state.trainerPending ? "TROCA PENDENTE — FECHAR GALE" : "AVALIAÇÃO A CADA RESULTADO"}</p><p>RESULTADOS VIRTUAIS E SUPORTE CONTEXTUAL NA JANELA MÓVEL.</p>${contextHTML(spatialRead(state.history).keys)}<p>TREINADORES NUMÉRICOS INDEPENDENTES.</p></div><div class="box"><b>TREINADOR GLOBAL G1</b><p>STATUS ${state.g1Trainer ? "ATIVADO" : "DESATIVADO"}</p><p>GALES REAIS ${real} • GREEN G1 ${hits} • LOSS ${real - hits} • APROVEITAMENTO ${pct(hits, real)}</p><p>EVENTOS VIRTUAIS ${uniqueGales(null, 5e3).length} • RUPTURAS ${breakdown().RUPTURA.total}</p></div><div class="title">RANKING DAS ESTRATÉGIAS</div>${tableHTML([ "#", "ESTRATÉGIA", "CICLOS", "ACERTOS", "LOSS", "CONTEXTO", "SUPORTE", "ÍNDICE" ], ranked.map((r, i) => [ i + 1, esc(r.name), r.total, r.hits, r.loss, r.contextTotal, fmt(r.contextSupport), pct(r.score, 1) ]))}<div class="title">ÚLTIMAS TROCAS NA JANELA</div>${state.trainerHistory.slice(-12).reverse().map(r => `<div class="listrow">GIRO ${r.turn} • ${esc(r.from)} → ${esc(r.to)}${contextHTML(r.spatialKeys)}</div>`).join("")}`;
}
function g1RankingHTML() {
if (!state.details?.["g1ranking"]) return compactPanel("g1ranking");
const ranked = [ ...definitions(), {
id: "NUMBER",
name: "TREINADOR GLOBAL NÚMEROS"
}, {
id: N10,
name: "TREINADOR GLOBAL NÚMEROS 1.0"
} ].map(def => {
const modes = G1_MODES.map(mode => ({
mode: mode,
...defenseMetrics(def.id, mode, 5e3)
})), best = [ ...modes ].sort((a, b) => (b.hits + 28 / 37 * 12) / (b.total + 12) - (a.hits + 28 / 37 * 12) / (a.total + 12))[0];
return {
...def,
modes: modes,
best: best
};
}).sort((a, b) => (b.best.hits + 28 / 37 * 12) / (b.best.total + 12) - (a.best.hits + 28 / 37 * 12) / (a.best.total + 12));
return `<div class="box"><b>RANKING EXCLUSIVO G1</b><p>SOMENTE EVENTOS QUE CHEGARAM AO GALE NA JANELA. AS TRÊS DEFESAS SÃO TESTADAS NO MESMO RESULTADO. CADA EVENTO É CONTADO UMA VEZ NO TOTAL DE GALES.</p></div>${tableHTML([ "#", "ESTRATÉGIA", "GALES", "MELHOR DEFESA", "GREEN G1", "LOSS", "ACERTO" ], ranked.map((r, i) => [ i + 1, esc(r.name), uniqueGales(r.id, 5e3).length, esc(r.best.mode), r.best.hits, r.best.loss, pct(r.best.hits, r.best.total) ]))}<div class="title">CONTINUIDADE / DESLOCAMENTO / RUPTURA</div>${breakdownHTML()}<div class="title">COMPARAÇÃO DAS TRÊS DEFESAS</div>${ranked.map(r => `<div class="box"><b>${esc(r.name)}</b>${tableHTML([ "DEFESA", "GALES", "GREEN G1", "LOSS", "ACERTO" ], r.modes.map(m => [ esc(m.mode), m.total, m.hits, m.loss, pct(m.hits, m.total) ]))}</div>`).join("")}`;
}
function g1NumbersHTML() {
if (!state.details?.["g1numbers"]) return compactPanel("g1numbers");
const cs = motors(state.history), original = state.cycle?.original || activeMotor(cs);
if (!validPlay(original?.play)) return `<div class="box">AGUARDANDO HISTÓRICO.</div>`;
const strategy = state.cycle?.strategy || activeDefinition().id, trigger = state.cycle?.trigger ?? state.history.at(-1);
if (trigger == null) return "";
const r = behaviorReading(original, state.history, strategy, trigger), options = defenses(original, trigger, state.history, strategy), d = state.cycle?.decision || chooseG1(original, trigger, state.history, strategy);
return `<div class="box"><b>TREINADOR GLOBAL G1 POR NÚMERO</b><p>STATUS ${state.g1Trainer ? "ATIVO" : "DESLIGADO"} • ESTRATÉGIA ${esc(strategy)}</p><p>MOTOR ${esc(original.key)} • GATILHO ${trigger} • COMPORTAMENTO ${r.type}</p><p>TRINCA ${esc(r.triangle)}</p><p>POLOS ${esc(r.poles)} • ARCO ${esc(r.arc)}</p><p>GALES DO NÚMERO ${numberG1Events(strategy, trigger, 5e3).length} • GREEN G1 ${r.numberHit} • LOSS ${r.numberLoss}</p><p>LOSS ÚLTIMOS 12: ${r.loss12}/${r.total12} • ÚLTIMOS 6: ${r.loss6}/${r.total6}</p><p>FORA DA COBERTURA ÚLTIMOS 6: ${r.outside6} • SEQUÊNCIA LOSS ${r.streak}</p><p>DEFESA <strong>${esc(d?.mode || "—")}</strong></p></div>${tableHTML([ "DEFESA", "TESTES Nº", "GREEN G1", "LOSS", "ACERTO" ], G1_MODES.map(mode => {
const v = numberG1Metrics(strategy, trigger, mode, 5e3);
return [ esc(mode), v.total, v.hits, v.loss, pct(v.hits, v.total) ];
}))}<div class="title">9 DESCOBERTOS DA ENTRADA</div>${cloud(missing(original.play))}${options.map(o => {
const g = defenseMetrics(strategy, o.mode, 5e3), n = numberG1Metrics(strategy, trigger, o.mode, 5e3);
return `<div class="g1card ${d?.mode === o.mode ? "selected" : ""}"><b>${esc(o.mode)}</b><div class="centers">${centersHTML(o.motor.play)}</div><div class="muted">28 COBERTOS • 9 DESCOBERTOS</div>${cloud(missing(o.motor.play))}<div class="muted">GLOBAL: GALES ${g.total} • GREEN G1 ${g.hits} • LOSS ${g.loss} • ACERTO ${pct(g.hits, g.total)}</div><div class="muted">GATILHO ${trigger}: GALES ${n.total} • GREEN G1 ${n.hits} • LOSS ${n.loss} • ACERTO ${pct(n.hits, n.total)}</div><div class="muted">COBERTURA ESPACIAL ${pct(spatialCoverage(o.motor.play, state.history), 1)}</div></div>`;
}).join("")}<div class="title">CONTINUIDADE / DESLOCAMENTO / RUPTURA</div>${breakdownHTML(strategy)}<div class="title">ÚLTIMOS GALES REAIS DA JANELA</div>${state.realG1.slice(-12).reverse().map(v => `<div class="listrow">GIRO ${v.turn} • NÚMERO ${v.trigger} • ${esc(v.mode)} • <b>${v.result}</b> • ${esc(v.behavior)}${contextHTML(v.spatialKeys)}</div>`).join("")}`;
}
function jumpsHTML() {
if (!state.details?.["jumps"]) return compactPanel("jumps");
const a = analyze(state.history);
return `<div class="box"><b>SALTOS E DIREÇÃO</b><p>NUMÉRICO: ${a.numericStreak.dir > 0 ? "CRESCENTE" : a.numericStreak.dir < 0 ? "DECRESCENTE" : "MISTO"} • ${a.numericStreak.length} PASSOS</p><p>FÍSICO: ${a.physicalStreak.dir > 0 ? "HORÁRIO" : a.physicalStreak.dir < 0 ? "ANTI-HORÁRIO" : "MISTO"} • ${a.physicalStreak.length} PASSOS</p><p>MÉDIA ÚLTIMOS 3 ${fmt(a.mean3)} • ANTERIOR ${fmt(a.previous3)} • VARIAÇÃO ${fmt(a.acceleration)}</p></div><div class="title">AUSÊNCIA POR REGIÃO FIXA</div>${Object.entries(a.regions).map(([n, v]) => `<div class="listrow">${n} • AUSÊNCIA ${v.absence} • ÚLTIMOS 12: ${v.recent}</div>`).join("")}<div class="title">ÚLTIMAS TRANSIÇÕES</div>${a.transitions.slice(-12).reverse().map(v => `<div class="listrow">${v.from} → ${v.to} • ${v.distance} CASAS • ${v.physical > 0 ? "HORÁRIO" : v.physical < 0 ? "ANTI-HORÁRIO" : "PARADO"}</div>`).join("")}<div class="muted">DIREÇÃO DO MENOR SALTO NA ORDEM W, NÃO MOVIMENTO REAL DA BOLA.</div>`;
}
function mirrorsHTML() {
if (!state.details?.["mirrors"]) return compactPanel("mirrors");
const recent = state.history.slice(-20), last = state.history.at(-1), near = last == null ? [] : W.filter(n => MIRROR.has(n) && distance(last, n) <= 4), far = last == null ? [] : W.filter(n => MIRROR.has(n) && distance(last, n) >= 10);
return `<div class="box"><b>ESPELHO / ANTIESPELHO</b><p>ESPELHO ÚLTIMOS 20: ${recent.filter(n => MIRROR.has(n)).length}</p><p>ANTIESPELHO ÚLTIMOS 20: ${recent.filter(n => !MIRROR.has(n)).length}</p></div><div class="title">ESPELHOS PRÓXIMOS</div>${cloud(near)}<div class="title">ESPELHOS DISTANTES</div>${cloud(far)}<div class="title">TODOS OS ESPELHOS</div>${cloud(W.filter(n => MIRROR.has(n)))}<div class="title">ANTIESPELHOS</div>${cloud(W.filter(n => !MIRROR.has(n)))}`;
}
function timelineHTML() {
if (!state.details?.["timeline"]) return compactPanel("timeline");
return state.ledger.slice().reverse().map(r => `<div class="listrow"><b>GIRO ${r.turn}</b> • ${r.number} • ${r.result}${r.selectionTarget ? `<div class="muted">SELETOR: ${esc(r.selectionTarget.name)}</div>` : ""}${r.autoRank ? `<div class="muted">AUTO EM USO: ${r.autoRank}º</div>` : ""}<div class="muted">GATILHO ${r.trigger ?? "—"} • ${esc(r.strategy)} • ${esc(r.motor)} • ${region(r.number)} • ${mirror(r.number)}</div><div class="muted">CONTEXTO ANTES DO RESULTADO:</div>${contextHTML(r.spatialKeys)}${r.componentShares ? `<div class="muted">PESOS T/C/P/A/R: ${r.componentShares.map(v => pct(v, 1)).join(" / ")} • AMOSTRAS ${r.adaptiveSamples}</div>` : ""}${r.numberCandidate != null ? `<div class="muted">TREINADOR NÚMEROS: COMBINAÇÃO DO ${r.numberCandidate} • ORIGEM NO GIRO ${r.numberCandidateTurn}</div>` : ""}</div>`).join("");
}
const css = `\n*{box-sizing:border-box}body{margin:0;background:#101720;color:#f4f7fb;font:13px Arial,sans-serif}.app{max-width:1100px;margin:auto;padding:12px}h1{font-size:24px;text-align:center;color:#59e5ff;margin:15px 0 5px}.sub{text-align:center;font-size:11px;color:#b3c7d9;line-height:1.7;margin-bottom:15px}.panel{background:#1d2938;border:1px solid #405a73;border-radius:11px;padding:12px;margin:10px 0}.title{color:#47e1f8;font-size:12px;font-weight:bold;margin:13px 0}.row{display:flex;flex-wrap:wrap;gap:6px;margin:9px 0}.btn{background:#304359;border:1px solid #708aa6;border-radius:7px;color:white;padding:10px;font-size:11px;font-weight:bold;cursor:pointer}.btn.active{background:#087e9c;border-color:#4eeaff}.btn.trainer{background:#263f4c;border-color:#4d8191}.btn.trainer.active,.btn.trainer.on{background:#086c4d;border:2px solid #42ffb0;box-shadow:0 0 13px #27e99a77,inset 0 0 8px #27e99a33}.btn.number.active{background:#705200;border:2px solid #ffdf60;box-shadow:0 0 16px #ffce3677}.btn.number10.active{background:#512884;border:2px solid #d6a3ff;box-shadow:0 0 16px #ae67ff77}.btn:disabled,.key:disabled{opacity:.35;cursor:not-allowed}textarea{width:100%;height:88px;padding:10px;border-radius:8px;background:#0c1623;border:1px solid #62758b;color:white}.status{font-size:12px;color:#b5d7e8;padding:9px 0;overflow-wrap:anywhere}.windowBox{background:#102b2c;border:1px solid #32bba2;border-radius:9px;padding:12px;margin:10px 0}.windowBox strong{font-size:27px;color:#54f0c3}.bar{height:10px;background:#34475a;border-radius:20px;overflow:hidden;margin:10px 0}.barfill{height:100%;background:#31dca9}.centers{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:5px;margin:12px 0}.center{min-height:86px;min-width:0;padding:8px 2px;border:2px solid #20d7f4;border-radius:9px;background:#086c91;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;text-align:center}.center.short{background:#d2a62b;border-color:#ffe28a;color:#111}.center strong{font-size:clamp(27px,5vw,43px);line-height:1;font-weight:900}.center small{font-size:9px;font-weight:bold}.keys{display:grid;grid-template-columns:repeat(6,1fr);gap:5px}.key{height:44px;border:1px solid #71849b;border-radius:7px;color:white;font-size:16px;font-weight:bold;cursor:pointer}.key.zero{grid-column:span 6}.history{display:flex;flex-wrap:wrap;gap:5px}.chip{min-width:47px;padding:8px;border:2px solid #667f99;border-radius:7px;text-align:center}.chip b{display:block;font-size:18px}.chip small{font-size:9px}.chip.green{border:3px solid #29e99a}.chip.loss{border:3px solid #ff416e}.chip.gale{border:3px solid #ffe045}.metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.metric{background:#293c51;border-radius:8px;padding:11px 5px;text-align:center}.metric small{display:block;font-size:9px;color:#bbd0e2}.metric b{display:block;font-size:22px;margin-top:5px}.good{color:#4ee4a4}.bad{color:#ff778c}.box{background:#132235;border:1px solid #46617d;border-radius:9px;padding:12px;margin:9px 0;line-height:1.7;overflow-wrap:anywhere}.g1card{background:#142438;border:1px solid #55728f;border-radius:9px;padding:12px;margin:9px 0}.g1card.selected{border:2px solid #38e6aa;background:#10382e}.cloud{display:flex;flex-wrap:wrap;gap:5px;margin:9px 0}.cloud span{display:inline-flex;min-width:36px;height:36px;align-items:center;justify-content:center;background:#2b4058;border:1px solid #64829f;border-radius:7px;font-weight:bold}.cloud span.danger{background:#69283e;border-color:#ff6989}.tablewrap{overflow:auto}table{width:100%;min-width:610px;border-collapse:collapse;font-size:11px}td,th{padding:9px;text-align:left;border-bottom:1px solid #41556e}th{color:#57def4}.listrow{border-bottom:1px solid #35485d;padding:9px 2px;font-size:11px;line-height:1.7;overflow-wrap:anywhere}.muted{color:#b1c7d9;font-size:11px;line-height:1.7;overflow-wrap:anywhere}.head{width:100%;background:#2c4056;color:white;border:1px solid #66829f;border-radius:8px;padding:12px;font-weight:bold;text-align:left;cursor:pointer;display:flex;justify-content:space-between;gap:8px}.hide{display:none}input[type=number]{width:110px;padding:9px;background:#101b2a;color:white;border:1px solid #637b95;border-radius:7px}select{padding:10px;background:#101b2a;color:white;border:1px solid #8d6eb0;border-radius:7px;max-width:100%}.play10{position:relative;min-height:86px}#centers{position:relative}.reject10{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);z-index:3;background:#d20b2b;color:white;border:2px solid #ff8c9c;text-align:center;font-size:clamp(19px,5vw,31px);font-weight:900;padding:8px 4px;box-shadow:0 3px 18px #000b;pointer-events:none}.reject10 small{display:block;font-size:10px;line-height:1.4;margin-top:3px}.triangleDrawing{max-width:540px;margin:10px auto}.triangleDrawing svg{display:block;width:100%;height:auto}@media(max-width:600px){.center{min-height:79px}.center strong{font-size:clamp(25px,7vw,37px)}.center small{font-size:8px}.btn{font-size:10px;padding:9px}}\n`;
const PANELS = [ [ "selector", "ESCOLHER TREINADOR E ESTRATÉGIAS / AUTO RANKING" ], [ "general", "RESULTADO GERAL" ], [ "trainer", "TREINADOR GLOBAL" ], [ "numbertrainer", "TREINADOR GLOBAL NÚMEROS" ], [ "numbertrainer10", "TREINADOR GLOBAL NÚMEROS 1.0" ], [ "triangulation", "TRIANGULAÇÃO / CONTORNO" ], [ "spatial", "ENCADEAMENTO / POLOS / ARCOS / PERCURSO" ], [ "g1ranking", "RANKING EXCLUSIVO G1 / RUPTURA" ], [ "g1numbers", "TREINADOR GLOBAL G1 POR NÚMERO / DEFESAS" ], [ "motors", "12 MOTORES" ], [ "jumps", "SALTOS E DIREÇÃO" ], [ "mirrors", "ESPELHO / ANTIESPELHO" ], [ "timeline", "LINHA DO TEMPO" ], [ "lab", "LABORATÓRIO" ] ];
document.body.innerHTML = `<style>${css}</style><main class="app"><h1>ANÁLISE BETA V${VERSION}</h1><div class="sub">JANELA MÓVEL DE 70 • ENTROU UM, SAIU UM<br>12 MOTORES • 28 NÚMEROS • CONTEXTO ESPACIAL INTEGRADO<br>CONTRAÇÃO / EXPANSÃO • AMPLITUDE • POLOS / FUSÃO • ARCOS / ENCERRAMENTO<br>TREINADOR GLOBAL • DOIS TREINADORES NUMÉRICOS • G1</div><section class="panel"><div class="title">IMPORTAR HISTÓRICO</div><textarea id="paste" placeholder="Cole os números do mais antigo ao mais recente"></textarea><div class="row"><button class="btn" id="import">IMPORTAR</button><button class="btn" id="restore">RECUPERAR HISTÓRICO</button><button class="btn" id="undo">APAGAR ÚLTIMO MANUAL</button><button class="btn" id="clear">ZERAR TUDO</button></div><div class="status" id="status"></div><div class="windowBox"><div class="muted">JANELA MÓVEL</div><strong id="counter">0 / 70</strong><div class="bar"><div class="barfill" id="barfill"></div></div><div class="muted" id="windowInfo"></div><div class="muted" id="cycleInfo"></div></div></section><section class="panel"><div class="title">ESTRATÉGIA ATIVA</div><div id="strategies"></div><div class="row" id="options"></div><div class="muted" id="selected"></div><div class="centers" id="centers"></div><div class="muted" id="coverage"></div></section><section class="panel"><div class="title">TECLADO 0–36</div><div class="keys" id="keys"></div></section><section class="panel"><div class="title">ÚLTIMOS 14 NÚMEROS</div><div class="history" id="last"></div></section>${PANELS.map(([id, t]) => `<section class="panel"><button class="head" data-panel="${id}">${t}<span>−</span></button><div id="${id}"></div></section>`).join("")}<section class="panel"><div class="title">FICHAS / G1 / RESULTADO FINANCEIRO</div><div class="row"><label>VALOR DA FICHA <input id="stake" type="number" min=".01" step=".01"></label><label>MULTIPLICADOR G1 <input id="multiplier" type="number" min=".01" step=".01"></label></div><div id="finance"></div></section><div class="box">A JANELA MANTÉM OS 70 MAIS RECENTES. CADA RESULTADO NOVO RETIRA O MAIS ANTIGO. A JANELA ANDA DURANTE O G1, MAS A JOGADA E A DEFESA COMPROMETIDAS NÃO SÃO TROCADAS. REGISTROS MANUAIS E BLOQUEIOS NÃO JOGAR PERMANECEM PRESERVADOS.</div></main>`;
function changeStrategy(strategy, adaptive = null, created = null) {
if (busy) return;
if (!cycleIsFree()) {
alert("AGUARDE ENCERRAR O CICLO ATUAL ANTES DE TROCAR A ESTRATÉGIA.");
return;
}
state.strategy = strategy;
state.adaptive = adaptive || state.adaptive;
state.activeCreated = created;
state.manual = null;
if (strategy === "TRAINER" && !state.trainerChoice) updateTrainer();
if (strategy === "NUMBER") updateNumberChoice();
if (strategy === N10) prepare10(state.history);
refreshSelections();
save();
render();
}
function buildStrategies() {
const root = $("strategies"), signature = JSON.stringify(state.created.map(c => [ c.id, c.name ]));
if (strategySignature === signature && root.children.length) return;
strategySignature = signature;
root.innerHTML = "";
const groups = [ [ "TREINADORES INDEPENDENTES", [ {
label: "ESCOLHER TREINADOR E ESTRATÉGIAS",
id: SELECTOR,
action: () => changeStrategy(SELECTOR)
}, {
label: "TREINADOR GLOBAL",
id: "TRAINER",
action: () => changeStrategy("TRAINER")
}, {
label: "TREINADOR GLOBAL NÚMEROS",
id: "NUMBER",
action: () => changeStrategy("NUMBER")
}, {
label: "TREINADOR GLOBAL NÚMEROS 1.0",
id: N10,
action: () => changeStrategy(N10)
} ] ], [ "ORIGINAIS", ORIGINALS.map(([id, name]) => ({
label: name,
id: id,
action: () => changeStrategy(id)
})) ], [ "12 ADAPTATIVAS", ADAPTATIVES.map(c => ({
label: c.name,
id: c.id,
action: () => changeStrategy("ADAPTIVE", c.id)
})) ] ];
for (const [label, items] of groups) {
const group = document.createElement("div");
group.innerHTML = `<div class="title">${label}</div>`;
const row = document.createElement("div");
row.className = "row";
for (const i of items) {
const b = button(i.label, i.action, row, i.id === "TRAINER" || i.id === SELECTOR ? "trainer" : i.id === "NUMBER" ? "number" : i.id === N10 ? "number10" : "");
b.dataset.choice = i.id;
}
group.appendChild(row);
root.appendChild(group);
}
const rr = document.createElement("div");
rr.className = "row";
for (let i = 1; i <= 4; i++) {
const b = button("AUTO " + i + "º", () => {
if (busy) return;
if (!cycleIsFree()) {
alert("AGUARDE ENCERRAR O CICLO.");
return;
}
state.rank = i;
changeStrategy("AUTO");
}, rr);
b.dataset.rank = i;
}
root.appendChild(rr);
if (state.created.length) {
const g = document.createElement("div");
g.innerHTML = `<div class="title">ESTRATÉGIAS PERSONALIZADAS</div>`;
const row = document.createElement("div");
row.className = "row";
for (const c of state.created) {
const b = button(c.name, () => changeStrategy("CREATED", null, "CREATED:" + c.id), row);
b.dataset.created = c.id;
}
g.appendChild(row);
root.appendChild(g);
}
}
const OPTIONS = [ [ "g1Trainer", "TREINADOR GLOBAL G1" ], [ "g1", "G1 AJUSTE FINO" ], [ "galeSkip", "GALE 2ª RODADA" ], [ "secondHouse", "2ª CASA" ] ];
for (const [field, label] of OPTIONS) {
const b = button(label, () => {
if (busy) return;
if (!cycleIsFree()) {
alert("AGUARDE ENCERRAR O CICLO ANTES DE ALTERAR O G1.");
return;
}
state[field] = !state[field];
panelCache.clear();
save();
render();
}, $("options"), field === "g1Trainer" ? "trainer" : "");
b.dataset.option = field;
}
for (let n = 0; n <= 36; n++) {
const b = document.createElement("button");
b.className = "key" + (n === 0 ? " zero" : "");
b.textContent = n;
b.style.background = n === 0 ? "#087b50" : RED.has(n) ? "#ac293f" : "#12151b";
b.onclick = () => addManual(n);
$("keys").appendChild(b);
}
$("import").onclick = () => importHistory(parseInput($("paste").value));
$("restore").onclick = async () => {
if (busy) return;
let found = null;
for (const key of [ KEY, ...OLD_KEYS ]) {
const data = read(key);
if (data?.history?.length) {
found = data;
break;
}
}
if (!found) {
alert("NENHUM HISTÓRICO ANTERIOR ENCONTRADO.");
return;
}
await importHistory(cleanNumbers(found.spatialMemory?.numbers || found.history));
};
$("undo").onclick = undo;
$("clear").onclick = clearAll;
$("stake").onchange = () => {
state.stake = Math.max(.01, Number($("stake").value) || 1);
save();
render();
};
$("multiplier").onchange = () => {
state.multiplier = Math.max(.01, Number($("multiplier").value) || 1);
save();
render();
};
if (globalThis.__analiseBetaPanelHandler) document.removeEventListener?.("click", globalThis.__analiseBetaPanelHandler, true);
globalThis.__analiseBetaPanelHandler = handlePanelClick;
document.addEventListener("click", handlePanelClick, true);
function render() {
try {
performRender();
} catch (e) {
console.error("ANÁLISE BETA:", e);
if ($("status")) $("status").textContent = "ERRO: " + String(e.message || e);
}
}
function performRender() {
buildStrategies();
const cs = motors(state.history), def = activeDefinition(), m = state.defense || activeMotor(cs), play = m?.play || null, s = spatialRead(state.history);
$("status").textContent = state.history.length + " NÚMEROS NA JANELA • " + cs.length + "/12 MOTORES • " + state.phase + " • GIRO " + state.totalTurns + (saveError ? " • FALHA AO SALVAR: " + saveError : "");
$("counter").textContent = state.history.length + " / " + WINDOW;
$("barfill").style.width = 100 * state.history.length / WINDOW + "%";
$("windowInfo").textContent = state.history.length === WINDOW ? "JANELA COMPLETA: ENTROU UM, SAIU O MAIS ANTIGO." : "FALTAM " + (WINDOW - state.history.length) + " RESULTADOS PARA COMPLETAR A JANELA.";
$("cycleInfo").textContent = cycleIsFree() ? "CICLO LIVRE • GIROS " + (state.historyTurns[0] ?? "—") + " A " + state.totalTurns : "CICLO " + state.phase + " • JANELA MÓVEL ATIVA • JOGADA DO CICLO PRESERVADA";
for (const b of document.querySelectorAll("[data-choice]")) {
const c = b.dataset.choice, a = strategyButtonActive(c);
b.classList.toggle("active", a);
}
for (const b of document.querySelectorAll("[data-rank]")) b.classList.toggle("active", effectiveAutoRank(m) === Number(b.dataset.rank));
for (const b of document.querySelectorAll("[data-option]")) {
const a = !!state[b.dataset.option];
b.classList.toggle("active", a);
b.classList.toggle("on", a && b.dataset.option === "g1Trainer");
}
for (const b of document.querySelectorAll("[data-created]")) b.classList.toggle("active", createdButtonActive(b.dataset.created));
const original = state.cycle?.original || m, r10 = original?.type === N10 && original.recordId ? state.n10.books[original.trigger]?.records[original.recordId] : null;
$("selected").textContent = (state.cycle?.strategy || def.name) + " • MOTOR " + (m?.key || "AGUARDANDO") + " • " + state.phase + (state.cycle?.decision ? " • G1 " + state.cycle.decision.mode + " • " + state.cycle.decision.behavior : "") + (state.strategy === N10 ? " • " + (r10 ? recordStatus10(r10) : "SEM GEOMETRIA ELEGÍVEL") : "") + " • " + (s.tri.last?.trend || "SEM TRINCA") + " • POLOS " + (s.poles.active?.event || "SEM EPISÓDIO") + " • ARCO " + (s.arcs.active?.health || s.arcs.last?.event || "SEM ARCO");
if (state.strategy === SELECTOR) $("selected").textContent = "ESCOLHER TREINADOR E ESTRATÉGIAS • " + (displayedSelection()?.name || "AGUARDANDO") + " • " + $("selected").textContent;
if (effectiveAutoRank(m)) $("selected").textContent += " • AUTO " + effectiveAutoRank(m) + "º";
$("centers").innerHTML = centersHTML(play) + (r10?.blocked ? `<div class="reject10">NÃO JOGAR<small>REPROVADA PARA O GATILHO ${r10.trigger}${state.cycle ? " • CICLO ATUAL MANTIDO ATÉ ENCERRAR" : ""}</small></div>` : "");
$("coverage").textContent = play ? "28 COBERTOS • 9 DESCOBERTOS: " + missing(play).join(" • ") : state.history.length < 8 ? "IMPORTE PELO MENOS 8 NÚMEROS." : state.strategy === N10 ? "SEM GEOMETRIA ELEGÍVEL. REPROVADAS NÃO SERÃO REUTILIZADAS." : "AGUARDANDO COMBINAÇÃO.";
const start = Math.max(0, state.history.length - 14);
$("last").innerHTML = state.history.slice(start).map((n, i) => {
const turn = state.historyTurns[start + i], row = state.ledger.find(r => r.turn === turn), r = row?.result || "HISTÓRICO", cls = r === "LOSS" ? "loss" : r.startsWith("GREEN") ? "green" : r === "GALE" ? "gale" : "";
return `<div class="chip ${cls}" style="background:${n === 0 ? "#087b50" : RED.has(n) ? "#a72740" : "#14181f"}"><b>${n}</b><small>${r}</small></div>`;
}).reverse().join("");
if (state.open.selector) renderPanel("selector", selectionHTML);
if (state.open.general) $("general").innerHTML = `<div class="title">RESULTADOS DA JANELA ATUAL</div>${metricsHTML(state.ledger)}<div class="title">IMPORTADOS NA JANELA</div>${metricsHTML(state.ledger.filter(r => r.source === "HISTÓRICO"))}<div class="title">MANUAIS NA JANELA</div>${metricsHTML(state.ledger.filter(r => r.source === "TEMPO REAL"))}<div class="title">MANUAIS ARQUIVADOS • TOTAL</div>${metricsHTML(state.manualLog)}<div class="box"><p>REGISTROS MANUAIS ARQUIVADOS: ${state.manualLog.length}</p><p>DESFAZER DISPONÍVEIS: ${state.undoStack.length}</p><p>RESULTADOS VENCIDOS SAEM DO PLACAR E TREINAMENTO. O ARQUIVO MANUAL PERMANECE SEPARADO.</p></div><div class="title">ÚLTIMOS RESULTADOS MANUAIS ARQUIVADOS</div>${state.manualLog.slice(-25).reverse().map(r => `<div class="listrow"><b>${r.number}</b> • <strong class="${r.result === "LOSS" ? "bad" : "good"}">${r.result}</strong> • ${esc(r.motor)}</div>`).join("")}`;
if (state.open.trainer) renderPanel("trainer", trainerHTML);
if (state.open.numbertrainer) renderPanel("numbertrainer", numberTrainerHTML);
if (state.open.numbertrainer10) {
renderPanel("numbertrainer10", numberTrainer10HTML);
if ($("trigger10")) $("trigger10").onchange = () => {
if (busy) return;
state.n10.viewTrigger = $("trigger10").value;
save();
render();
};
if ($("all10")) $("all10").onclick = () => {
if (busy) return;
state.n10.viewAll = !state.n10.viewAll;
save();
render();
};
for (const b of document.querySelectorAll("[data-trigger10]")) b.onclick = () => {
if (busy) return;
state.n10.viewTrigger = b.dataset.trigger10;
save();
render();
};
}
if (state.open.triangulation) renderPanel("triangulation", triangulationHTML);
if (state.open.spatial) renderPanel("spatial", spatialHTML);
if (state.open.g1ranking) renderPanel("g1ranking", g1RankingHTML);
if (state.open.g1numbers) renderPanel("g1numbers", g1NumbersHTML);
if (state.open.motors && !state.details?.motors) {
renderPanel("motors", () => compactPanel("motors"));
} else if (state.open.motors) {
$("motors").innerHTML = `<div class="row">${cs.map(c => `<button class="btn" data-manual="${c.key}">${c.key}</button>`).join("")}</div>${cs.map(c => `<div class="listrow"><b>${c.rank}º ${c.key}</b> • ${fmt(c.score)}<div class="muted">CENTROS: ${sortedBlocks(c.play).map(b => b.center).join(" • ")}</div><div class="muted">TESTES NA JANELA ${state.ledger.filter(r => r.motorHits && c.key in r.motorHits).length} • ÍNDICE ${pct(motorRate(c.key, 70), 1)}</div><div class="muted">COBERTURA ESPACIAL ${pct(c.spatialScore, 1)} • TRIANGULAÇÃO ${pct(c.triangleScore, 1)}</div><div class="muted">INTEGRAÇÃO V${c.spatialVersion} • PESOS T/C/P/A/R ${c.componentShares.map(v => pct(v, 1)).join(" / ")} • AMOSTRAS ${c.adaptiveSamples}</div>${adjustmentMotorHTML(c)}${contextHTML(c.spatialKeys)}</div>`).join("")}`;
for (const b of document.querySelectorAll("[data-manual]")) {
b.classList.toggle("active", state.manual === b.dataset.manual);
b.onclick = () => {
if (busy) return;
if (!cycleIsFree()) {
alert("AGUARDE ENCERRAR O CICLO.");
return;
}
state.manual = b.dataset.manual;
save();
render();
};
}
}
if (state.open.jumps) renderPanel("jumps", jumpsHTML);
if (state.open.mirrors) renderPanel("mirrors", mirrorsHTML);
if (state.open.timeline) renderPanel("timeline", timelineHTML);
if (state.open.lab && !state.details?.lab) {
renderPanel("lab", () => compactPanel("lab"));
} else if (state.open.lab) {
$("lab").innerHTML = `<div class="box">7 ORIGINAIS • 12 ADAPTATIVAS • 4 AUTO • PERSONALIZADAS</div><div class="box">OS 12 MOTORES RECEBEM OS PESOS ESPACIAIS ANTES DE FORMAR OS 28 NÚMEROS. TRIANGULAÇÃO, MEMÓRIA DE PARES, ENCADEAMENTO, POLOS, INTERRUPÇÃO, RETOMADA, RUPTURA, ARCOS, REENTRADAS E CONTORNO PRESERVADOS.</div><div class="box">V${VERSION}: CONTRAÇÃO / EXPANSÃO / MANUTENÇÃO; AMPLITUDE E ORDEM; CONVERGÊNCIA E FUSÃO; ARCOS ENFRAQUECIDOS E ENCERRADOS; MEMÓRIA POR SETOR E CONTEXTO; MISTURA ADAPTATIVA REGULARIZADA.</div><div class="box">CONTORNO: SOMA ANTES DO MÓDULO 37 E FECHAMENTO PRÓXIMO DA ORIGEM. 26 → 23 → 35 PODE SER CONTINUAÇÃO E FECHAMENTO POR CONTORNO.</div><div class="box">CONSENSO E UNIÃO TAMBÉM APLICAM A LEITURA ESPACIAL ANTES DA GEOMETRIA. ADAPTATIVAS E PERSONALIZADAS SELECIONAM OS MOTORES INTEGRADOS PELO DESEMPENHO GLOBAL E CONTEXTUAL.</div><div class="box">TREINADOR GLOBAL: CONTEXTOS T (TRINCA), C (CADEIA), P (POLOS), A (ARCO), R (PERCURSO). CONTEXTO CAPTURADO ANTES DO RESULTADO.</div><div class="box">TREINADOR GLOBAL NÚMEROS: TRANSIÇÕES DO GATILHO E COBERTURA ESPACIAL, SEM GREEN/LOSS COMO CRITÉRIO.</div><div class="box">NÚMEROS 1.0: APROVAÇÃO POR GATILHO, BLOQUEIO NÃO JOGAR E ALTERNATIVAS VIRTUAIS IMEDIATAS. CONTAGENS NA JANELA; BLOQUEIOS NÃO SÃO LIBERADOS AUTOMATICAMENTE.</div><div class="box">G1: CONGELADA PRESERVA A COMBINAÇÃO ORIGINAL; AJUSTE FINO E RECONSTRUÇÃO UTILIZAM AS NOVAS ANÁLISES. A DEFESA ESCOLHIDA PERMANECE FIXA NO CICLO.</div><div class="box">JANELA MÓVEL 70: ENTROU UM, SAIU O MAIS ANTIGO. SEM REINÍCIO EM LOTES DE 10. ÍNDICES HISTÓRICOS NÃO GARANTEM RESULTADOS FUTUROS.</div><button class="btn trainer" id="create">CRIAR CÓPIA DA MELHOR ADAPTATIVA</button>`;
$("create").onclick = () => {
if (busy) return;
const best = trainerRanking().find(r => r.type === "ADAPTIVE");
if (!best) return;
state.created.push({
id: "CUSTOM_" + Date.now(),
name: "ESTRATÉGIA VIRTUAL " + (state.created.length + 1),
config: copy(best.config)
});
save();
render();
};
}
for (const [id, open] of Object.entries(state.open)) {
const panel = $(id);
if (panel && open && state.details?.[id] && !panel.querySelector("[data-detail]")) {
const toggle = button("RESUMIR", () => {}, panel);
toggle.dataset.detail = id;
}
const el = $(id);
if (el) el.classList.toggle("hide", !open);
const span = document.querySelector('[data-panel="' + id + '"]')?.querySelector("span");
if (span) span.textContent = open ? "−" : "+";
}
$("stake").value = state.stake;
$("multiplier").value = state.multiplier;
$("finance").innerHTML = financeHTML();
}
function preserveBlocks10(oldN10) {
let n;
try {
n = unpack10(oldN10);
} catch {
return;
}
for (const [trigger, b] of Object.entries(n.books || {})) for (const [id, r] of Object.entries(b.records || {})) if ((r.blocked || r.status === "REJECTED") && validPlay(r.motor?.play)) {
const book = book10(Number(trigger)), existing = book.records[id];
book.records[id] = {
...copy(r),
...existing || {},
blocked: true,
status: "REJECTED",
samples: existing?.samples || [],
rejectedTurn: r.rejectedTurn,
virtualRejected: !!r.virtualRejected
};
}
refreshRecords10(state.historyTurns[0] || 1);
}
async function migrateLegacy() {
if (!legacyData) return;
const old = legacyData;
legacyData = null;
if (old.selection || (old.phase || "ENTRY") !== "ENTRY" || old.cycle) {
state = normalizeState(old);
state.undoStack = [];
clearSpatialCaches();
pruneRolling();
updateNumberChoice();
prepare10(state.history);
refreshSelections();
save();
render();
return;
}
const opts = {
...settings(),
strategy: old.strategy || "TRAINER",
rank: old.rank || 3,
manual: old.manual || null,
adaptive: old.adaptive || "A05",
created: copy(old.created || []),
activeCreated: old.activeCreated || null,
g1: old.g1 !== false,
g1Trainer: old.g1Trainer !== false,
galeSkip: !!old.galeSkip,
secondHouse: !!old.secondHouse,
stake: Number(old.stake) || 1,
multiplier: Number(old.multiplier) || 1,
open: {
...fresh().open,
...old.open || {}
}
};
await loadHistory(cleanNumbers(old.history), {
customSettings: opts,
customManualLog: old.manualLog || []
});
preserveBlocks10(old.n10);
prepare10(state.history);
refreshSelections();
save();
render();
}
pruneRolling();
if (state.history.length >= 8) {
updateNumberChoice();
prepare10(state.history);
}
render();
refreshSelections();
render();
if (legacyData) setTimeout(() => {
migrateLegacy();
}, 0);
})();
