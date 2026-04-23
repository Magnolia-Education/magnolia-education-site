'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const SPECIAL_ANGLES = [
  -360,-330,-315,-300,-270,-240,-225,-210,-180,-150,-135,-120,-90,-60,-45,-30,
  0,30,45,60,90,120,135,150,180,210,225,240,270,300,315,330,360,
  390,405,420,450,480,495,510,540,570,585,600,630,660,675,690,720
];
const SNAP_THRESHOLD = 4;

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

/** Return a radian label string for any integer degree value. */
function radLabel(deg) {
  const sign = deg < 0 ? "−" : "";
  const absDeg = Math.abs(deg);
  let num = absDeg, den = 180;
  const g = gcd(num, den);
  num = num / g; den = den / g;
  if (num === 0) return "0";
  if (den === 1) return `${sign}${num === 1 ? "" : num}π`;
  return `${sign}${num === 1 ? "" : num}π/${den}`;
}

function degLabel(deg, useRad) {
  if (!useRad) return `${Math.round(deg)}°`;
  const isSpecial = SPECIAL_ANGLES.includes(Math.round(deg));
  if (isSpecial) return radLabel(Math.round(deg));
  return `${(deg * Math.PI / 180).toFixed(3)} rad`;
}

/** RAA = acute angle to nearest x-axis (0–90°). */
function raa(normDeg) {
  const q = normDeg % 180;
  return q <= 90 ? q : 180 - q;
}

function snapAngle(deg) {
  for (const a of SPECIAL_ANGLES) {
    if (Math.abs(deg - a) < SNAP_THRESHOLD) return a;
  }
  return deg;
}

function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

function fmtClean(n) {
  const r = Math.round(n * 10000) / 10000;
  if (Math.abs(r) < 0.0001) return "0";
  if (Math.abs(r - 1) < 0.0001) return "1";
  if (Math.abs(r + 1) < 0.0001) return "−1";
  return r.toFixed(3);
}

function toRad(deg) { return (deg * Math.PI) / 180; }

/** Round to 2 dp, strip trailing zeros, unicode minus. */
function fmt2(n) {
  if (Math.abs(n) < 0.005) return "0";
  const r = Math.round(n * 100) / 100;
  const s = Math.abs(r).toFixed(2).replace(/\.?0+$/, "");
  return r < 0 ? `−${s}` : s;
}

/** Pretty-print a side length for the special-triangle panel. */
function fmtSide(v) {
  const r = Math.round(v * 10000) / 10000;
  if (Math.abs(r) < 0.0001) return "0";
  if (Math.abs(r - Math.SQRT2)   < 0.002) return "√2";
  if (Math.abs(r - Math.sqrt(3)) < 0.002) return "√3";
  const n = Math.round(r);
  if (Math.abs(r - n) < 0.001 && n > 0) return String(n);
  return r.toFixed(1);
}

/** Exact side label for special triangle: returns string like "√2/2", "√3/2", "1/2", "√3", "2√2". */
function fmtExact(value, r) {
  const v  = Math.round(value * 10000) / 10000;
  const rv = Math.round(r     * 10000) / 10000;
  const rInt     = Math.round(rv);
  const rIsInt   = Math.abs(rv - rInt)     < 0.001 && rInt > 0;
  const rIsSqrt2 = Math.abs(rv - Math.SQRT2) < 0.002;

  // v = r (hypotenuse)
  if (Math.abs(v - rv) < 0.001) return fmtSide(r);

  // v = r/2 (short leg opposite 30°)
  if (Math.abs(v - rv / 2) < 0.001) {
    if (rIsSqrt2) return "√2/2";
    if (rIsInt) {
      const n = rInt / 2;
      return Number.isInteger(n) ? (n === 1 ? "1" : String(n)) : `${rInt}/2`;
    }
    return `${fmtSide(r)}/2`;
  }

  // v = r√3/2 (long leg opposite 60°)
  if (Math.abs(v - rv * Math.sqrt(3) / 2) < 0.002) {
    if (rIsSqrt2) return "√6/2";
    if (rIsInt) {
      if (rInt === 1) return "√3/2";
      const n = rInt / 2;
      if (Number.isInteger(n)) return n === 1 ? "√3" : `${n}√3`;
      return `${rInt}√3/2`;
    }
    return `${fmtSide(r)}√3/2`;
  }

  // v = r/√2 = r√2/2 (legs of 45-45-90)
  if (Math.abs(v - rv / Math.SQRT2) < 0.002) {
    if (rIsSqrt2) return "1";
    if (rIsInt) {
      if (rInt === 1) return "√2/2";
      const n = rInt / 2;
      if (Number.isInteger(n)) return n === 1 ? "√2" : `${n}√2`;
      return `${rInt}√2/2`;
    }
    return `${fmtSide(r)}√2/2`;
  }

  return fmtSide(v);
}

/** Return {num,den} exact-value strings for a special RAA, or null. */
function getExactFrac(raaDeg, fn) {
  const T = {
    30: { sin: ["1","2"],  cos: ["√3","2"], tan: ["1","√3"] },
    45: { sin: ["√2","2"], cos: ["√2","2"], tan: ["1","1"]  },
    60: { sin: ["√3","2"], cos: ["1","2"],  tan: ["√3","1"] },
  };
  return T[raaDeg]?.[fn] ?? null;
}

// ---------------------------------------------------------------------------
// Special triangle pulse keyframe (injected once)
// ---------------------------------------------------------------------------
const PULSE_STYLE = `
@keyframes triPulse {
  0%   { opacity: 0.18; }
  50%  { opacity: 0.55; }
  100% { opacity: 0.18; }
}
.angle-arrow-btn { border-radius: 8px; transition: background 0.15s; }
.angle-arrow-btn:hover { background: rgba(107,70,193,0.1) !important; }
.angle-arrow-btn:active { background: rgba(107,70,193,0.2) !important; }
.angle-reset-btn:hover { border-color: #999 !important; color: #555 !important; }`;

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------
const sinColor    = "#e53e3e";
const cosColor    = "#3182ce";
const tanColor    = "#2d8a5e";
const radiusColor = "#6b46c1";
const raaColor    = "#c07a00";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Frac({ num, den, color, size = 13 }) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", verticalAlign: "middle", margin: "0 1px" }}>
      <span style={{ fontSize: size, fontWeight: 700, color, borderBottom: `1.5px solid ${color}`, lineHeight: 1.2, padding: "0 2px" }}>{num}</span>
      <span style={{ fontSize: size, fontWeight: 700, color, lineHeight: 1.2, padding: "0 2px" }}>{den}</span>
    </span>
  );
}

function ModeToggle({ useRad, onToggle }) {
  const pillStyle = (active) => ({
    padding: "5px 14px", fontSize: 12, fontWeight: 700,
    fontFamily: "Georgia, serif", cursor: "pointer", border: "none",
    borderRadius: 20, transition: "all 0.18s",
    background: active ? "#6b46c1" : "transparent",
    color: active ? "white" : "#b8a898",
  });
  return (
    <div style={{ display: "inline-flex", alignItems: "center", background: "#ede8e0", borderRadius: 22, padding: 3, border: "1.5px solid #d4c9b8" }}>
      <button style={pillStyle(!useRad)} onClick={() => useRad && onToggle()}>Degrees</button>
      <button style={pillStyle(useRad)}  onClick={() => !useRad && onToggle()}>Radians</button>
    </div>
  );
}

function RatioCard({ label, color, numSym, denSym, numWord, denWord,
                     numVal, denVal, decimal, isUndef,
                     exactNum, exactDen,
                     numSymColor, denSymColor,
                     numValColor, denValColor }) {
  const nvc = numValColor || color;
  const dvc = denValColor || color;
  const hasExact = !isUndef && !!exactNum;

  const rowBase = { display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px 6px", fontSize: 13 };
  const symFrac = <Frac num={<span style={{ color: numSymColor || color }}>{numSym}</span>} den={<span style={{ color: denSymColor || color }}>{denSym}</span>} color={color} size={13} />;
  const wordFrac = <Frac num={numWord} den={denWord} color="#999" size={10} />;
  const commonPrefix = (
    <>
      <span style={{ color, fontWeight: 700 }}>{label} θ</span>
      <span style={{ color: "#bbb" }}>=</span>
      {symFrac}
      <span style={{ color: "#bbb" }}>=</span>
      {wordFrac}
      <span style={{ color: "#bbb" }}>=</span>
    </>
  );

  return (
    <div style={{ background: "white", borderRadius: 12, padding: "12px 14px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)", borderLeft: `4px solid ${color}`,
        minWidth: 0, position: "relative", minHeight: 64 }}>
      {/* Exact fraction variant — visible at special angles */}
      <div style={{ ...rowBase,
        visibility: hasExact ? "visible" : "hidden",
        ...(hasExact ? {} : { position: "absolute", top: 12, left: 14, right: 14 }),
      }}>
        {commonPrefix}
        <Frac num={<span style={{color:nvc}}>{exactNum}</span>} den={<span style={{color:dvc}}>{exactDen}</span>} color={color} size={14} />
        <span style={{ color: "#bbb" }}>≈</span>
        <span style={{ fontSize: 17, fontWeight: 700, color }}>{decimal}</span>
      </div>
      {/* Numeric / undefined variant — visible at non-special angles */}
      <div style={{ ...rowBase,
        visibility: hasExact ? "hidden" : "visible",
        ...(hasExact ? { position: "absolute", top: 12, left: 14, right: 14 } : {}),
      }}>
        {commonPrefix}
        {isUndef
          ? <span style={{ color, fontWeight: 700 }}>undefined</span>
          : <>
              <Frac num={<span style={{color:nvc}}>{numVal}</span>} den={<span style={{color:dvc}}>{denVal}</span>} color={color} size={13} />
              <span style={{ color: "#bbb" }}>=</span>
              <span style={{ fontSize: 17, fontWeight: 700, color }}>{decimal}</span>
            </>
        }
      </div>
    </div>
  );
}

/** RAA card: general rules + live example + sign rule, filtered by active toggles */
function RAACard({ thetaDisp, raaDisp, sinSign, cosSign, tanSign, active,
                   sinDecimal, cosDecimal, tanDecimal, isAxisAngle,
                   useRad, xStr, yStr, rStr }) {
  const fns = [
    { key: "sin", sign: sinSign, color: sinColor, decimal: sinDecimal },
    { key: "cos", sign: cosSign, color: cosColor, decimal: cosDecimal },
    { key: "tan", sign: tanSign, color: tanColor, decimal: tanDecimal },
  ].filter(f => active[f.key]);

  const genRow = (fn, color) => (
    <div key={fn} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, marginBottom: 2 }}>
      <span style={{ color, fontWeight: 700, minWidth: 36 }}>{fn} θ</span>
      <span style={{ color: "#bbb" }}>=</span>
      <span style={{ color: raaColor, fontWeight: 700 }}>±</span>
      <span style={{ color: radiusColor, fontWeight: 700 }}>{fn}(RAA)</span>
    </div>
  );
  const exRow = (fn, sign, color, decimal) => (
    <div key={fn} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, marginBottom: 2, flexWrap: "wrap" }}>
      <span style={{ color, fontWeight: 700 }}>{fn} {thetaDisp}</span>
      <span style={{ color: "#bbb" }}>=</span>
      <span style={{ color: raaColor, fontWeight: 700 }}>{sign}</span>
      <span style={{ color: radiusColor, fontWeight: 700 }}>{fn}({raaDisp})</span>
      <span style={{ color, fontWeight: 700 }}>= {decimal}</span>
    </div>
  );

  const axisHidden = !isAxisAngle;
  const normHidden = isAxisAngle;

  return (
    <div style={{
      background: "white", borderRadius: 12, padding: "12px 14px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.06)", borderLeft: `4px solid ${raaColor}`,
      position: "relative", minHeight: 108,
    }}>
      {/* Axis angle content — always in DOM, hidden when not on axis */}
      <div style={{
        visibility: axisHidden ? "hidden" : "visible",
        ...(axisHidden ? { position: "absolute", top: 12, left: 14, right: 14 } : {}),
      }}>
        <div style={{ fontSize: 11, color: "#aaa", marginBottom: 8 }}>On a coordinate axis — read values directly:</div>
        {fns.map(f => {
          const isUndef = f.key === "tan" && f.decimal === "∞";
          const sym = f.key === "sin" ? (useRad ? "y" : "y/r")
                    : f.key === "cos" ? (useRad ? "x" : "x/r")
                    : "y/x";
          const valSub = (!isUndef && !useRad)
            ? (f.key === "sin" ? `${yStr}/${rStr}`
             : f.key === "cos" ? `${xStr}/${rStr}`
             : `${yStr}/${xStr}`)
            : null;
          return (
            <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, marginBottom: 4, flexWrap: "wrap" }}>
              <span style={{ color: f.color, fontWeight: 700 }}>{f.key}({thetaDisp})</span>
              <span style={{ color: "#bbb" }}>=</span>
              <span style={{ color: f.color }}>{sym}</span>
              {valSub && (<>
                <span style={{ color: "#bbb" }}>=</span>
                <span style={{ color: f.color }}>{valSub}</span>
              </>)}
              <span style={{ color: "#bbb" }}>=</span>
              <span style={{ color: f.color, fontWeight: 700 }}>{isUndef ? "undefined" : f.decimal}</span>
            </div>
          );
        })}
        {fns.length === 0 && <div style={{ fontSize: 11, color: "#ccc" }}>Enable sin / cos / tan above.</div>}
      </div>
      {/* Normal (non-axis) content — always in DOM, hidden when on axis */}
      <div style={{
        visibility: normHidden ? "hidden" : "visible",
        ...(normHidden ? { position: "absolute", top: 12, left: 14, right: 14 } : {}),
      }}>
        {fns.length > 0 && (
          <div style={{ marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid #f0ece6" }}>
            {fns.map(f => genRow(f.key, f.color))}
          </div>
        )}
        {fns.length > 0 && (
          <div style={{ marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid #f0ece6" }}>
            {fns.map(f => exRow(f.key, f.sign, f.color, f.decimal))}
          </div>
        )}
        <div style={{ fontSize: 11, color: "#888", lineHeight: 1.8 }}>
          <div>1. <span style={{ color: raaColor, fontWeight: 600 }}>Location</span> → determines ±</div>
          <div>2. <span style={{ color: radiusColor, fontWeight: 600 }}>Ref. Triangle Ratio</span> → sin / cos / tan of RAA</div>
        </div>
      </div>
    </div>
  );
}

/** SVG special-triangle reference card */
function SpecialTriCard({ raaDeg, radius, isSpecialTriangle, show, onToggle }) {
  const triColor  = "#d946ef";
  const tealColor = "#0d9488";
  const goldColor = "#d4a000";

  // Fixed canonical side lengths — never scale by r
  const leg45   = "1";
  const hyp45   = "√2";
  const short30 = "1";
  const long30  = "√3";
  const hyp30   = "2";

  const is45   = isSpecialTriangle && raaDeg === 45;
  const is30   = isSpecialTriangle && raaDeg === 30;
  const is60   = isSpecialTriangle && raaDeg === 60;
  const is3060 = is30 || is60;

  // 45-45-90: right angle BR, 45° at BL, 45° at TR
  // O=bottom-left(45°), B=bottom-right(90°), T=top-right(45°)
  const Ox4=14, Oy4=148, Bx4=104, By4=148, Tx4=104, Ty4=58;
  // 30-60-90: right angle BR, 60° at BL, 30° at TR (tall narrow: short leg horizontal, long leg vertical)
  // O=bottom-left(60°), B=bottom-right(90°), T=top-right(30°)
  const Ox3=152, Oy3=148, Bx3=242, By3=148, Tx3=242, Ty3=28;

  // right-angle square mark: from corner going left (dx<0) and up (dy<0)
  const sq = (vx, vy, dx, dy, s=8) =>
    `M ${vx+dx*s},${vy} L ${vx+dx*s},${vy+dy*s} L ${vx},${vy+dy*s}`;

  const tc4 = is45   ? goldColor : triColor;
  const tc3 = is3060 ? goldColor : triColor;
  const fw4 = is45   ? 800 : 600;
  const fw3 = is3060 ? 800 : 600;

  return (
    <div style={{ background:"white", borderRadius:12, padding:"10px 14px",
        boxShadow:"0 2px 10px rgba(0,0,0,0.06)", borderLeft:`4px solid ${triColor}` }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: show ? 8 : 0 }}>
        <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:"#aaa" }}>Special Triangles</div>
        <button onClick={onToggle} style={{ background:"none", border:"none", cursor:"pointer",
            fontSize:13, color:"#bbb", padding:"0 4px", lineHeight:1 }}>
          {show ? "▴" : "▾"}
        </button>
      </div>
      {show && (
        <svg viewBox="0 0 310 168" style={{ width:"100%", display:"block" }}>
          {/* ── 45-45-90 ── */}
          <polygon points={`${Ox4},${Oy4} ${Bx4},${By4} ${Tx4},${Ty4}`}
            fill={is45 ? "rgba(212,160,0,0.09)" : "rgba(217,70,239,0.06)"}
            stroke={tc4} strokeWidth={is45 ? 2 : 1.5} />
          <path d={sq(Bx4,By4,-1,-1)} fill="none" stroke={tc4} strokeWidth={1.5}/>
          {/* side labels */}
          <text x={(Ox4+Bx4)/2} y={By4+14} textAnchor="middle" fontSize={11} fontWeight={fw4} fill={tc4} fontFamily="Georgia,serif">{leg45}</text>
          <text x={Bx4+11} y={(By4+Ty4)/2+4} textAnchor="start" fontSize={11} fontWeight={fw4} fill={tc4} fontFamily="Georgia,serif">{leg45}</text>
          <text x={(Ox4+Tx4)/2-12} y={(Oy4+Ty4)/2} textAnchor="end" fontSize={11} fontWeight={fw4} fill={tc4} fontFamily="Georgia,serif">{hyp45}</text>
          {/* angle labels — positioned inside triangle polygon */}
          <text x={Ox4+28} y={Oy4-14} textAnchor="start" fontSize={10} fontWeight={fw4} fill={is45 ? goldColor : tealColor} fontFamily="Georgia,serif">45°</text>

          {/* divider */}
          <line x1={140} y1={5} x2={140} y2={163} stroke="#ede8e0" strokeWidth={1}/>

          {/* ── 30-60-90 — short leg horizontal (bottom), long leg vertical (right) ── */}
          <polygon points={`${Ox3},${Oy3} ${Bx3},${By3} ${Tx3},${Ty3}`}
            fill={is3060 ? "rgba(212,160,0,0.09)" : "rgba(217,70,239,0.06)"}
            stroke={tc3} strokeWidth={is3060 ? 2 : 1.5} />
          <path d={sq(Bx3,By3,-1,-1)} fill="none" stroke={tc3} strokeWidth={1.5}/>
          {/* side labels — short30 on bottom (OB = r/2), long30 on right (BT = r√3/2) */}
          <text x={(Ox3+Bx3)/2} y={By3+14} textAnchor="middle" fontSize={11} fontWeight={fw3} fill={tc3} fontFamily="Georgia,serif">{short30}</text>
          <text x={Bx3+11} y={(By3+Ty3)/2+4} textAnchor="start" fontSize={11} fontWeight={fw3} fill={tc3} fontFamily="Georgia,serif">{long30}</text>
          <text x={(Ox3+Tx3)/2-14} y={(Oy3+Ty3)/2} textAnchor="end" fontSize={11} fontWeight={fw3} fill={tc3} fontFamily="Georgia,serif">{hyp30}</text>
          {/* angle labels — inside triangle polygon */}
          <text x={Ox3+22} y={Oy3-9} textAnchor="start" fontSize={10} fontWeight={is60 ? 800 : 600} fill={is60 ? goldColor : tealColor} fontFamily="Georgia,serif">60°</text>
          <text x={Tx3-15} y={Ty3+52} textAnchor="middle" fontSize={10} fontWeight={is30 ? 800 : 600} fill={is30 ? goldColor : tealColor} fontFamily="Georgia,serif">30°</text>
        </svg>
      )}
    </div>
  );
}

/** Definitions panel with toggle */
function DefsPanel({ show, onToggle }) {
  const row = (term, def) => (
    <div style={{ marginBottom: 5, fontSize: 12, color: "#6b5744", lineHeight: 1.5 }}>
      <span style={{ fontWeight: 700 }}>{term}</span>
      <span style={{ color: "#999" }}> — </span>
      {def}
    </div>
  );
  return (
    <div style={{ background: "white", borderRadius: 12, padding: "10px 14px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", borderLeft: "4px solid #d4c9b8" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: show ? 8 : 0 }}>
        <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#aaa" }}>Definitions</div>
        <button onClick={onToggle} style={{ background:"none", border:"none", cursor:"pointer",
            fontSize:13, color:"#bbb", padding:"0 4px", lineHeight:1 }}>
          {show ? "▴" : "▾"}
        </button>
      </div>
      {show && (
        <>
          {row("θ (Principal Angle)", "measured from positive x-axis, counter-clockwise")}
          {row("RAA (Reference Angle)", "acute angle between terminal arm and nearest x-axis")}
        </>
      )}
    </div>
  );
}

/** Thin collapsible wrapper around any card */
function Collapsible({ open, onToggle, label, color, children }) {
  return (
    <div style={{ background:"white", borderRadius:12, boxShadow:"0 2px 10px rgba(0,0,0,0.06)", borderLeft:`4px solid ${color}`, overflow:"hidden" }}>
      <div
        onClick={onToggle}
        style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
          padding: open ? "8px 14px 4px" : "10px 14px",
          cursor:"pointer", userSelect:"none" }}
      >
        <span style={{ fontSize:11, fontWeight:700, color, letterSpacing:0.5 }}>{label}</span>
        <span style={{ fontSize:13, color:"#bbb", lineHeight:1 }}>{open ? "▴" : "▾"}</span>
      </div>
      {open && <div style={{ padding:"0 14px 12px" }}>{children}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step pill buttons + arrow navigation (shared by both slider cards)
// ---------------------------------------------------------------------------
const STEP_OPTIONS = [
  { deg: 30, dLabel: "30°", rLabel: "π/6" },
  { deg: 45, dLabel: "45°", rLabel: "π/4" },
  { deg: 90, dLabel: "90°", rLabel: "π/2" },
];

function StepPills({ stepDeg, setStepDeg, useRad, color, onReset }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginTop: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
        {STEP_OPTIONS.map(({ deg, dLabel, rLabel }) => {
          const isActive = stepDeg === deg;
          return (
            <button key={deg} onClick={() => setStepDeg(deg)} style={{
              padding: "3px 8px", borderRadius: 14, fontSize: 10, fontWeight: 700,
              fontFamily: "Georgia, serif", cursor: "pointer",
              border: `1.5px solid ${color}`,
              background: isActive ? color : "transparent",
              color: isActive ? "white" : color,
              transition: "all 0.18s", whiteSpace: "nowrap",
            }}>
              {useRad ? rLabel : dLabel}
            </button>
          );
        })}
      </div>
      <button className="angle-reset-btn" onClick={onReset} style={{
        padding: "3px 10px", borderRadius: 14, fontSize: 10, fontWeight: 600,
        fontFamily: "Georgia, serif", cursor: "pointer",
        border: "1.5px solid #bbb", background: "transparent", color: "#888",
        transition: "all 0.18s", whiteSpace: "nowrap",
      }}>
        {useRad ? "Reset to 0 rad" : "Reset to 0°"}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Graph panel
// ---------------------------------------------------------------------------
function GraphPanel({ angleDeg, active, useRad, onAngleChange }) {
  const VW = 860, VH = 220;
  const PL = 44, PR = 36, PT = 28, PB = 42;
  const GW = VW - PL - PR;
  const GH = VH - PT - PB;

  const degToX = (d) => PL + (d + 360) / 1080 * GW;
  const valToY = (v) => PT + (1.2 - v) / 2.4 * GH;

  // --- Dragging ---
  const graphSvgRef = useRef(null);
  const onAngleChangeRef = useRef(onAngleChange);
  onAngleChangeRef.current = onAngleChange;
  const [graphDragging, setGraphDragging] = useState(false);

  function getAngleFromClientX(clientX) {
    const svg = graphSvgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const svgX = (clientX - rect.left) * (VW / rect.width);
    return snapAngle(clamp((svgX - PL) / GW * 1080 - 360, -360, 720));
  }

  function handleGraphMouseDown(e) {
    setGraphDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const a = getAngleFromClientX(clientX);
    if (a !== null) onAngleChangeRef.current(a);
  }

  useEffect(() => {
    if (!graphDragging) return;
    function onMove(e) {
      if (e.cancelable) e.preventDefault();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const a = getAngleFromClientX(clientX);
      if (a !== null) onAngleChangeRef.current(a);
    }
    function onUp() { setGraphDragging(false); }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [graphDragging]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Curve helpers ---
  function makeCurve(mathFn) {
    const pts = [];
    for (let d = -360; d <= 720; d++) {
      pts.push(`${degToX(d).toFixed(1)},${valToY(mathFn(toRad(d))).toFixed(1)}`);
    }
    return pts.join(" ");
  }

  const asymptotes = [-270, -90, 90, 270, 450, 630];
  function makeTanSegments() {
    const bounds = [-360, ...asymptotes, 720];
    return bounds.slice(0, -1).map((start, i) => {
      const end = bounds[i + 1];
      const pts = [];
      for (let d = start + 1; d < end - 1; d++) {
        const t = Math.tan(toRad(d));
        if (Math.abs(t) <= 4) pts.push(`${degToX(d).toFixed(1)},${valToY(t).toFixed(1)}`);
      }
      return pts.length > 1 ? pts.join(" ") : null;
    }).filter(Boolean);
  }

  // --- Current angle dots ---
  const normD   = ((angleDeg % 360) + 360) % 360;
  const aRad    = toRad(normD);
  const sinDotY = valToY(Math.sin(aRad));
  const cosDotY = valToY(Math.cos(aRad));
  const tanVal  = Math.abs(Math.cos(aRad)) > 0.0001 ? Math.tan(aRad) : null;
  const tanDotY = tanVal !== null && Math.abs(tanVal) <= 4 ? valToY(tanVal) : null;
  const trackX  = degToX(angleDeg);

  // Exact labels at special angles — sign comes directly from computed sin/cos
  const gNormSnapped = Math.abs(normD - Math.round(normD)) < 0.01;
  const gRaaDeg = raa(Math.round(normD));
  const gSinPos = Math.sin(aRad) >= 0;
  const gCosPos = Math.cos(aRad) >= 0;
  function gExact(fn, positive) {
    if (!gNormSnapped) return null;
    const f = getExactFrac(gRaaDeg, fn);
    if (!f) return null;
    const num = positive ? f[0] : `−${f[0]}`;
    return f[1] === "1" ? num : `${num}/${f[1]}`;
  }
  const sinLabel = gExact("sin", gSinPos);
  const cosLabel = gExact("cos", gCosPos);
  const tanLabel = gExact("tan", gSinPos === gCosPos);

  const xTickDegs = [-360, -270, -180, -90, 0, 90, 180, 270, 360, 450, 540, 630, 720];

  // Axis line positions
  const axisY  = valToY(0);       // horizontal axis (y=0 value)
  const axisX  = degToX(0);      // vertical axis at θ=0

  return (
    <div style={{ width: "100%", maxWidth: 880, marginTop: 20 }}>
      <svg
        ref={graphSvgRef}
        viewBox={`0 0 ${VW} ${VH}`}
        style={{
          width: "100%", minHeight: 220, display: "block",
          background: "white", borderRadius: 12,
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          cursor: graphDragging ? "ew-resize" : "crosshair",
          userSelect: "none",
        }}
        onMouseDown={handleGraphMouseDown}
        onTouchStart={e => { e.preventDefault(); handleGraphMouseDown(e); }}
      >
        <defs>
          <clipPath id="gcl">
            <rect x={PL} y={PT} width={GW} height={GH} />
          </clipPath>
        </defs>

        {/* ── Clipped graph content ── */}
        <g clipPath="url(#gcl)">
          {/* Subtle vertical grid at each 90° */}
          {xTickDegs.map(d => (
            <line key={`grid-${d}`}
              x1={degToX(d)} y1={PT} x2={degToX(d)} y2={PT+GH}
              stroke="#f0ece6" strokeWidth={1} />
          ))}

          {/* ±1 dashed guides */}
          {[1, -1].map(v => (
            <line key={v} x1={PL} y1={valToY(v)} x2={PL+GW} y2={valToY(v)}
              stroke="#c0b4a8" strokeWidth={1} strokeDasharray="5,4" />
          ))}

          {/* Tan asymptotes */}
          {asymptotes.map(a => (
            <line key={a}
              x1={degToX(a)} y1={PT} x2={degToX(a)} y2={PT+GH}
              stroke={tanColor} strokeWidth={1} strokeDasharray="4,3" opacity={0.5} />
          ))}

          {/* Curves */}
          {active.sin && <polyline points={makeCurve(Math.sin)} fill="none" stroke={sinColor} strokeWidth={2} />}
          {active.cos && <polyline points={makeCurve(Math.cos)} fill="none" stroke={cosColor} strokeWidth={2} />}
          {active.tan && makeTanSegments().map((pts, i) => (
            <polyline key={i} points={pts} fill="none" stroke={tanColor} strokeWidth={2} />
          ))}

          {/* Tracking line */}
          <line x1={trackX} y1={PT} x2={trackX} y2={PT+GH}
            stroke={radiusColor} strokeWidth={1.5} opacity={0.7} />

          {/* Dots */}
          {active.sin && <circle cx={trackX} cy={sinDotY} r={5} fill={sinColor} stroke="white" strokeWidth={1.5} />}
          {active.cos && <circle cx={trackX} cy={cosDotY} r={5} fill={cosColor} stroke="white" strokeWidth={1.5} />}
          {active.tan && tanDotY !== null && <circle cx={trackX} cy={tanDotY} r={5} fill={tanColor} stroke="white" strokeWidth={1.5} />}

          {/* Exact value labels at special angles */}
          {active.sin && sinLabel && (
            <text x={trackX + 8} y={sinDotY - 6} fontSize={10} fontWeight={700} fill={sinColor} fontFamily="Georgia, serif">{sinLabel}</text>
          )}
          {active.cos && cosLabel && (
            <text x={trackX + 8} y={cosDotY - 6} fontSize={10} fontWeight={700} fill={cosColor} fontFamily="Georgia, serif">{cosLabel}</text>
          )}
          {active.tan && tanDotY !== null && tanLabel && (
            <text x={trackX + 8} y={tanDotY - 6} fontSize={10} fontWeight={700} fill={tanColor} fontFamily="Georgia, serif">{tanLabel}</text>
          )}
        </g>

        {/* ── Axes drawn outside clip so arrows are always visible ── */}

        {/* x-axis (zero line) — bold, dark, with right arrow and θ label */}
        <line x1={PL - 6} y1={axisY} x2={PL + GW + 18} y2={axisY}
          stroke="#4a4240" strokeWidth={2} />
        <polygon
          points={`${PL+GW+18},${axisY} ${PL+GW+11},${axisY-4} ${PL+GW+11},${axisY+4}`}
          fill="#4a4240" />
        <text x={PL+GW+24} y={axisY+5}
          fontSize={14} fill="#4a4240" fontFamily="Georgia, serif" fontStyle="italic">θ</text>

        {/* y-axis at θ=0 — bold, dark, with up arrow and f(θ) label */}
        <line x1={axisX} y1={PT + GH + 6} x2={axisX} y2={PT - 18}
          stroke="#4a4240" strokeWidth={2} />
        <polygon
          points={`${axisX},${PT-18} ${axisX-4},${PT-11} ${axisX+4},${PT-11}`}
          fill="#4a4240" />
        <text x={axisX + 5} y={PT - 6}
          fontSize={12} fill="#4a4240" fontFamily="Georgia, serif" fontStyle="italic">f(θ)</text>

        {/* Plot border */}
        <rect x={PL} y={PT} width={GW} height={GH}
          fill="none" stroke="#b8b0a8" strokeWidth={1} />

        {/* Tick marks */}
        {xTickDegs.map(d => (
          <line key={`tick-${d}`}
            x1={degToX(d)} y1={PT+GH} x2={degToX(d)} y2={PT+GH+5}
            stroke="#9a9088" strokeWidth={1.5} />
        ))}

        {/* x-axis labels */}
        {xTickDegs.map(d => (
          <text key={d} x={degToX(d)} y={PT+GH+18}
            fontSize={10} fill="#7a7068" textAnchor="middle" fontFamily="Georgia, serif">
            {useRad ? radLabel(d) : `${d}°`}
          </text>
        ))}

        {/* y-axis labels */}
        {[1, 0, -1].map(v => (
          <text key={v} x={PL-6} y={valToY(v)+4}
            fontSize={10} fill="#7a7068" textAnchor="end" fontFamily="Georgia, serif">{v}</text>
        ))}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function UnitCircle() {
  const [angleDeg, setAngleDeg] = useState(53);
  const [dragging,  setDragging]  = useState(false);
  const [useRad,    setUseRad]    = useState(false);
  const [radius,    setRadius]    = useState(1);
  const [stepDeg,   setStepDeg]   = useState(30);
  const [active,    setActive]    = useState({ sin: true, cos: false, tan: false });
  const [showGraph,       setShowGraph]       = useState(false);
  const [showSpecialTri,  setShowSpecialTri]  = useState(false);
  const [showDefs,        setShowDefs]        = useState(true);
  const [openSin,  setOpenSin]  = useState(true);
  const [openCos,  setOpenCos]  = useState(true);
  const [openTan,  setOpenTan]  = useState(true);
  const [openRAA,  setOpenRAA]  = useState(true);
  const [openAngle, setOpenAngle] = useState(true);
  const [thumbsOpen, setThumbsOpen] = useState(false);
  const [nlName,   setNlName]   = useState("");
  const [nlEmail,  setNlEmail]  = useState("");
  const [nlGrade,  setNlGrade]  = useState("");
  const [nlSchool, setNlSchool] = useState("");
  const [nlDone,   setNlDone]   = useState(false);
  const svgRef = useRef(null);

  const toggleFn = (fn) => setActive(prev => ({ ...prev, [fn]: !prev[fn] }));

  // Favicon + title + pulse keyframe on mount
  useEffect(() => {
    document.title = 'Trig Dictionary Tool | Magnolia Education';
    let link = document.querySelector("link[rel~='icon']");
    if (!link) { link = document.createElement('link'); document.head.appendChild(link); }
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📐</text></svg>";
    const style = document.createElement('style');
    style.textContent = PULSE_STYLE;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // -------------------------------------------------------------------------
  // Animation
  // -------------------------------------------------------------------------
  const [playing, setPlaying] = useState(false);
  const [speed,   setSpeed]   = useState("slow");

  const rafRef        = useRef(null);
  const rafPlaying    = useRef(false);
  const rafSpeed      = useRef("slow");
  const rafStartTime  = useRef(null);
  const rafStartAngle = useRef(0);
  const angleDegRef   = useRef(angleDeg);
  angleDegRef.current = angleDeg;

  function cancelAnim() {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }

  function launchAnim(fromAngle) {
    cancelAnim();
    rafStartAngle.current = fromAngle;
    rafStartTime.current  = null;
    function tick(ts) {
      if (!rafPlaying.current) return;
      if (rafStartTime.current === null) rafStartTime.current = ts;
      const elapsed = (ts - rafStartTime.current) / 1000;
      const dur = rafSpeed.current === "slow" ? 120 : 60;
      let a = rafStartAngle.current + (1080 / dur) * elapsed;
      if (a > 720) {
        rafStartAngle.current = -360;
        rafStartTime.current  = ts;
        a = -360;
      }
      setAngleDeg(a);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  useEffect(() => {
    rafSpeed.current = speed;
    if (rafPlaying.current) launchAnim(angleDegRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed]);

  useEffect(() => () => { rafPlaying.current = false; cancelAnim(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handlePlayPause() {
    if (playing) {
      rafPlaying.current = false;
      cancelAnim();
      setPlaying(false);
    } else {
      rafPlaying.current = true;
      setPlaying(true);
      launchAnim(angleDeg);
    }
  }

  // -------------------------------------------------------------------------
  // Trig values
  // -------------------------------------------------------------------------
  const CX = 210, CY = 210;
  const R = Math.round(170 * (0.7 + 0.3 * (radius - 1) / 9));
  const normDeg  = ((angleDeg % 360) + 360) % 360;
  const angleRad = toRad(normDeg);
  const cosRaw = Math.cos(angleRad);
  const sinRaw = Math.sin(angleRad);
  const tanRaw = Math.abs(cosRaw) < 0.0001 ? null : sinRaw / cosRaw;
  const xVal = cosRaw * radius;
  const yVal = sinRaw * radius;
  const px = CX + R * cosRaw;
  const py = CY - R * sinRaw;
  const qx = cosRaw >= 0 ? 1 : -1;
  const qy = sinRaw >= 0 ? 1 : -1;
  const raaDeg    = raa(normDeg);
  const raaDisp   = degLabel(raaDeg, useRad);
  const thetaDisp = degLabel(angleDeg, useRad);
  const sinSign = qy >= 0 ? "+" : "−";
  const cosSign = qx >= 0 ? "+" : "−";
  const tanSign = (qx * qy) >= 0 ? "+" : "−";
  const isAxisAngle = Math.abs(sinRaw) < 0.005 || Math.abs(cosRaw) < 0.005;

  // Exact values — only show when angle is precisely at a snapped special value
  // Use Math.round(normDeg) for the RAA lookup so float drift during animation (e.g. 30.0001)
  // doesn't cause getExactFrac to miss the integer key.
  const isNearSnapped = Math.abs(normDeg - Math.round(normDeg)) < 0.01;
  const raaDegLookup  = raa(Math.round(normDeg));
  const _sinFrac = isNearSnapped ? getExactFrac(raaDegLookup, "sin") : null;
  const _cosFrac = isNearSnapped ? getExactFrac(raaDegLookup, "cos") : null;
  const _tanFrac = isNearSnapped ? getExactFrac(raaDegLookup, "tan") : null;
  // Apply quadrant sign to numerator
  function signedFrac(frac, positive) {
    if (!frac) return null;
    return positive ? frac : [`−${frac[0]}`, frac[1]];
  }
  const sinExact = signedFrac(_sinFrac, qy >= 0);
  const cosExact = signedFrac(_cosFrac, qx >= 0);
  const tanExact = signedFrac(_tanFrac, (qx * qy) >= 0);
  const isSpecialTriangle = _sinFrac !== null;

  // -------------------------------------------------------------------------
  // Circle drag handling
  // -------------------------------------------------------------------------
  const getAngleFromEvent = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = 420 / rect.width;
    const scaleY = 420 / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const mx = (clientX - rect.left) * scaleX - CX;
    const my = -((clientY - rect.top) * scaleY - CY);
    let deg = Math.atan2(my, mx) * 180 / Math.PI;
    const base = Math.floor(angleDeg / 360) * 360;
    let candidate = base + deg;
    const options = [candidate - 360, candidate, candidate + 360];
    let best = candidate, bestDist = Infinity;
    for (const o of options) {
      if (o >= -360 && o <= 720) {
        const d = Math.abs(o - angleDeg);
        if (d < bestDist) { bestDist = d; best = o; }
      }
    }
    setAngleDeg(snapAngle(clamp(best, -360, 720)));
  }, [angleDeg]);

  const onMouseDown = (e) => { setDragging(true); getAngleFromEvent(e); };
  const onMouseMove = useCallback((e) => { if (dragging) getAngleFromEvent(e); }, [dragging, getAngleFromEvent]);
  const onMouseUp   = () => setDragging(false);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup",   onMouseUp);
    window.addEventListener("touchmove", onMouseMove, { passive: false });
    window.addEventListener("touchend",  onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup",   onMouseUp);
      window.removeEventListener("touchmove", onMouseMove);
      window.removeEventListener("touchend",  onMouseUp);
    };
  }, [onMouseMove]);

  // -------------------------------------------------------------------------
  // SVG arc helpers
  // -------------------------------------------------------------------------

  /**
   * θ arc: draws from positive x-axis to the terminal arm.
   * For angles ≤ 360°: simple SVG arc.
   * For angles > 360°: Archimedean spiral (radius grows with each extra revolution).
   * Returns { pathStr, arrowPoints } or null if angle is too small.
   */
  function thetaArcData() {
    const baseR = 32;
    const spiralGap = 9; // extra px per revolution beyond the first

    const absDeg = Math.abs(angleDeg);
    if (absDeg < 0.5) return null;

    const dir    = angleDeg >= 0 ? 1 : -1;
    const sweep  = angleDeg < 0 ? 1 : 0;
    const fullLaps  = Math.floor(absDeg / 360);
    const remainder = absDeg % 360;

    let pathStr;

    if (fullLaps === 0) {
      // Simple arc — no spiral
      const r = baseR;
      const startX = CX + r, startY = CY;
      const endX = CX + r * cosRaw;
      const endY = CY - r * sinRaw;
      const largeArc = remainder > 180 ? 1 : 0;
      pathStr = `M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} ${sweep} ${endX} ${endY}`;
    } else {
      // Multi-lap: polyline approximating a spiral.
      // Radius is flat for the first revolution, then grows for each extra lap.
      const numSteps = Math.min(Math.ceil(absDeg * 1.5), 1440);
      const pts = [];
      for (let i = 0; i <= numSteps; i++) {
        const t = (i / numSteps) * absDeg;
        const extraRevs = Math.max(0, (t - 360) / 360);
        const r = baseR + extraRevs * spiralGap;
        const mathAngle = dir * toRad(t);
        pts.push(`${(CX + r * Math.cos(mathAngle)).toFixed(1)},${(CY - r * Math.sin(mathAngle)).toFixed(1)}`);
      }
      pathStr = `M ${pts[0]} L ${pts.slice(1).join(' L ')}`;
    }

    // Arrowhead at end point
    const endExtraRevs = Math.max(0, (absDeg - 360) / 360);
    const endR  = fullLaps === 0 ? baseR : baseR + endExtraRevs * spiralGap;
    const endX  = CX + endR * cosRaw;
    const endY  = CY - endR * sinRaw;
    // Tangent direction in SVG at the end of the arc:
    //   CCW (dir=1): (-sinRaw, -cosRaw)   CW (dir=-1): (sinRaw, cosRaw)
    const tx = -sinRaw * dir;
    const ty = -cosRaw * dir;
    const al = 7, aw = 4;
    const bx = endX - al * tx, by = endY - al * ty;
    const perpX = -ty, perpY = tx;
    const arrowPoints = [
      `${endX.toFixed(1)},${endY.toFixed(1)}`,
      `${(bx + aw * perpX).toFixed(1)},${(by + aw * perpY).toFixed(1)}`,
      `${(bx - aw * perpX).toFixed(1)},${(by - aw * perpY).toFixed(1)}`,
    ].join(' ');

    return { pathStr, arrowPoints };
  }

  // RAA arc (small, amber, dashed) — always inside reference triangle
  function raaArcPath() {
    const r = 18;
    const axisAngle = cosRaw >= 0 ? 0 : Math.PI;
    const termAngle = angleRad;
    const sx = CX + r * Math.cos(axisAngle);
    const sy = CY - r * Math.sin(axisAngle);
    const ex = CX + r * Math.cos(termAngle);
    const ey = CY - r * Math.sin(termAngle);
    // Sweep must curve inward toward origin (through the reference triangle).
    // Q1 (cos≥0, sin≥0): axis=0→term CCW, sweep=0
    // Q2 (cos<0, sin≥0): axis=π→term CW (upward in SVG), sweep=1
    // Q3 (cos<0, sin<0): axis=π→term CCW (downward in SVG), sweep=0
    // Q4 (cos≥0, sin<0): axis=0→term CW (downward in SVG), sweep=1
    const sweep = cosRaw >= 0
      ? (sinRaw >= 0 ? 0 : 1)
      : (sinRaw >= 0 ? 1 : 0);
    return `M ${sx} ${sy} A ${r} ${r} 0 0 ${sweep} ${ex} ${ey}`;
  }

  const triPoly = `${CX},${CY} ${px},${CY} ${px},${py}`;

  const activeQ = [qx > 0 && qy > 0, qx < 0 && qy > 0, qx < 0 && qy < 0, qx > 0 && qy < 0].findIndex(Boolean);

  const degOrPi    = useRad ? "π"  : "180°";
  const twoDegOrPi = useRad ? "2π" : "360°";
  const qFormulas = [
    `θ = RAA = ${raaDisp}`,
    `θ = ${degOrPi} − RAA`,
    `θ = ${degOrPi} + RAA`,
    `θ = ${twoDegOrPi} − RAA`,
  ];

  const quadrants = [
    { x: 330, y: 48,  sx: "+", sy: "+", label: "Q1" },
    { x: 90,  y: 48,  sx: "−", sy: "+", label: "Q2" },
    { x: 90,  y: 336, sx: "−", sy: "−", label: "Q3" },
    { x: 330, y: 336, sx: "+", sy: "−", label: "Q4" },
  ];

  // RAA label position — for Q4 the arc goes CW from 0 down to angleRad,
  // so the arc midpoint math angle is (angleRad - 2π)/2 (negative, i.e. lower-right)
  const axisAngle   = cosRaw >= 0 ? 0 : Math.PI;
  const midRaaAngle = (cosRaw >= 0 && sinRaw < 0)
    ? (angleRad - 2 * Math.PI) / 2
    : (angleRad + axisAngle) / 2;
  const raaLabelDist = 46;
  const raaLabelX = clamp(CX + raaLabelDist * Math.cos(midRaaAngle), 20, 400);
  const raaLabelY = clamp(CY - raaLabelDist * Math.sin(midRaaAngle), 16, 404);

  // θ label: midpoint of the VISUAL arc (respects direction & capped at 360° for label placement)
  const arcDisplayDeg = angleDeg >= 0 ? Math.min(angleDeg, 360) : Math.max(angleDeg, -360);
  // At 0°/360°/720°/-360° labels pile up on the positive x-axis — detect and apply offsets
  const thetaOnAxis = isAxisAngle && cosRaw > 0.5;
  // When arc is invisible (0°), pretend arc spans 60° so label places above-right of center
  const arcForLabel = (thetaOnAxis && Math.abs(arcDisplayDeg) < 1) ? 60 : arcDisplayDeg;
  const thetaMidAngle = toRad(arcForLabel / 2);
  const thetaLabelDist = 60;
  const thetaLabelX = clamp(CX + thetaLabelDist * Math.cos(thetaMidAngle), 20, 400);
  const thetaLabelY = clamp(CY - thetaLabelDist * Math.sin(thetaMidAngle) + 4 - (thetaOnAxis ? 20 : 0), 16, 404);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  const flowerUrl = "url('/tools/magnolia.png')";
  const corner = (extra) => ({
    position: "absolute", backgroundImage: flowerUrl,
    backgroundSize: "contain", backgroundRepeat: "no-repeat",
    backgroundPosition: "center", opacity: 0.5, pointerEvents: "none",
    width: 40, height: 40, ...extra,
  });
  const edge = (extra) => ({
    position: "absolute", backgroundImage: flowerUrl,
    backgroundSize: "28px 28px", backgroundPosition: "center",
    opacity: 0.5, pointerEvents: "none", ...extra,
  });

  return (
    <div style={{
      minHeight: "100vh", background: "#fafaf7",
      padding: "40px", boxSizing: "border-box", position: "relative"
    }}>
      {/* Corners */}
      <div style={corner({ top: 0, left: 0 })} />
      <div style={corner({ top: 0, right: 0 })} />
      <div style={corner({ bottom: 0, left: 0 })} />
      <div style={corner({ bottom: 0, right: 0 })} />
      {/* Edge strips — run between corners */}
      <div style={edge({ top: 0, left: 40, right: 40, height: 40, backgroundRepeat: "repeat-x" })} />
      <div style={edge({ bottom: 0, left: 40, right: 40, height: 40, backgroundRepeat: "repeat-x" })} />
      <div style={edge({ top: 40, bottom: 40, left: 0, width: 40, backgroundRepeat: "repeat-y" })} />
      <div style={edge({ top: 40, bottom: 40, right: 0, width: 40, backgroundRepeat: "repeat-y" })} />
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      fontFamily: "'Georgia', serif", position: "relative", zIndex: 1
    }}>

      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <Link
          href="https://magnolia-education.com"
          target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 7, textDecoration: "none", marginBottom: 6 }}
        >
          <span style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#b8a898", fontFamily: "Georgia, serif" }}>
            Magnolia Education
          </span>
        </Link>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#2d2d2d", margin: "0 0 4px", letterSpacing: 0.5 }}>
          Extended Right Triangle Dictionary
        </h1>
      </div>

      {/* CONTROLS */}
      <div style={{ display: "flex", gap: 14, marginBottom: 16, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        <ModeToggle useRad={useRad} onToggle={() => setUseRad(r => !r)} />

        {/* sin/cos/tan focus toggles */}
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { key: "sin", color: sinColor },
            { key: "cos", color: cosColor },
            { key: "tan", color: tanColor },
          ].map(({ key, color }) => (
            <button key={key} onClick={() => toggleFn(key)} style={{
              padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700,
              fontFamily: "Georgia, serif", cursor: "pointer",
              border: `1.5px solid ${color}`,
              background: active[key] ? color : "transparent",
              color: active[key] ? "white" : color,
              opacity: active[key] ? 1 : 0.45,
              transition: "all 0.18s",
            }}>
              {key}
            </button>
          ))}
        </div>

        {/* Play / speed */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button onClick={handlePlayPause} style={{
            padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700,
            fontFamily: "Georgia, serif", cursor: "pointer",
            border: `1.5px solid ${radiusColor}`,
            background: playing ? radiusColor : "transparent",
            color: playing ? "white" : radiusColor,
            transition: "all 0.18s",
          }}>
            {playing ? "⏸ Pause" : "▶ Play"}
          </button>
          {["slow", "fast"].map(s => (
            <button key={s} onClick={() => setSpeed(s)} style={{
              padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
              fontFamily: "Georgia, serif", cursor: "pointer",
              border: "1.5px solid #d4c9b8",
              background: speed === s ? "#d4c9b8" : "transparent",
              color: speed === s ? "#5a4a3a" : "#b8a898",
              transition: "all 0.18s",
            }}>
              {s === "slow" ? "Slow" : "Fast"}
            </button>
          ))}
        </div>

        {/* Show/hide graph */}
        <button onClick={() => setShowGraph(g => !g)} style={{
          padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700,
          fontFamily: "Georgia, serif", cursor: "pointer",
          border: "1.5px solid #d4c9b8",
          background: showGraph ? "#d4c9b8" : "transparent",
          color: showGraph ? "#5a4a3a" : "#b8a898",
          transition: "all 0.18s",
        }}>
          {showGraph ? "Hide Graph" : "Show Graph"}
        </button>

        {/* Radius slider */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b5744", flexWrap: "wrap" }}>
          <span style={{ fontWeight: 600 }}>r =</span>
          <input
            type="range" min={1} max={10} step={0.5}
            value={Math.min(10, Math.max(1, Math.round(radius * 2) / 2))}
            onChange={e => setRadius(Number(e.target.value))}
            style={{ width: 90, accentColor: radiusColor }}
          />
          <span style={{ fontWeight: 700, color: radiusColor, minWidth: 32 }}>{fmtSide(radius)}</span>
          {[
            { label: "r = 1",           val: 1 },
            { label: "r = √2 ≈ 1.414", val: Math.SQRT2 },
            { label: "r = 2",           val: 2 },
          ].map(({ label, val }) => {
            const isActive = Math.abs(radius - val) < 1e-9;
            return (
              <button key={label} onClick={() => setRadius(val)} style={{
                padding: "3px 8px", borderRadius: 14, fontSize: 10, fontWeight: 700,
                fontFamily: "Georgia, serif", cursor: "pointer",
                border: `1.5px solid ${radiusColor}`,
                background: isActive ? radiusColor : "transparent",
                color: isActive ? "white" : radiusColor,
                transition: "all 0.18s", whiteSpace: "nowrap",
              }}>{label}</button>
            );
          })}
        </div>
      </div>

      {/* MAIN LAYOUT: diagram + cards */}
      <div style={{
        display: "flex", gap: 20, alignItems: "flex-start",
        flexWrap: "wrap", justifyContent: "center", width: "100%", maxWidth: 880
      }}>

        {/* SVG DIAGRAM */}
        <svg
          ref={svgRef}
          width={420} height={420} viewBox="0 0 420 420"
          style={{ cursor: dragging ? "grabbing" : "grab", maxWidth: "100%", userSelect: "none", flexShrink: 0 }}
          onMouseDown={onMouseDown}
          onTouchStart={e => { e.preventDefault(); onMouseDown(e); }}
        >
          {/* Axes */}
          <line x1={10}  y1={CY}  x2={410} y2={CY}  stroke="#ccc" strokeWidth={1.5} />
          <line x1={CX}  y1={410} x2={CX}  y2={10}  stroke="#ccc" strokeWidth={1.5} />
          <polygon points={`410,${CY} 404,${CY-4} 404,${CY+4}`} fill="#ccc" />
          <polygon points={`${CX},10 ${CX-4},16 ${CX+4},16`}    fill="#ccc" />
          <text x={414}  y={CY+4}  fontSize={11} fill="#bbb">x</text>
          <text x={CX+5} y={14}    fontSize={11} fill="#bbb">y</text>

          {/* Unit circle */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#d4c9b8" strokeWidth={1.5} />

          {/* Axis tick labels */}
          <text x={CX+R+2} y={CY-5}   fontSize={10} fill="#a0927a" fontStyle="italic">{fmtSide(radius)}</text>
          <text x={CX+4}   y={CY-R-4} fontSize={10} fill="#a0927a" fontStyle="italic">{fmtSide(radius)}</text>
          <circle cx={CX+R} cy={CY}   r={2} fill="#ccc" />
          <circle cx={CX}   cy={CY-R} r={2} fill="#ccc" />
          <circle cx={CX-R} cy={CY}   r={2} fill="#ccc" />
          <circle cx={CX}   cy={CY+R} r={2} fill="#ccc" />

          {/* Quadrant labels with Q formula */}
          {quadrants.map((q, i) => {
            const isActive = activeQ === i;
            const result   = i > 0 ? `= ${thetaDisp}` : null;
            return (
              <g key={i} opacity={isActive ? 1 : 0.3}>
                <text x={q.x} y={q.y} fontSize={13} textAnchor="middle" fontWeight={800} fill="#5a4a3a" fontFamily="Georgia, serif">
                  {q.label}
                </text>
                <text x={q.x} y={q.y + 14} fontSize={10} textAnchor="middle">
                  <tspan fill={cosColor}>{q.sx}x</tspan>
                  <tspan fill="#aaa">, </tspan>
                  <tspan fill={sinColor}>{q.sy}y</tspan>
                </text>
                {isActive && (
                  <>
                    <text x={q.x} y={q.y + 29} fontSize={9} textAnchor="middle" fill="#6b5744" fontFamily="Georgia, serif">
                      {qFormulas[i]}
                    </text>
                    {result && (
                      <text x={q.x} y={q.y + 42} fontSize={9} textAnchor="middle" fill="#9a8878" fontFamily="Georgia, serif">
                        {result}
                      </text>
                    )}
                  </>
                )}
              </g>
            );
          })}

          {/* Reference triangle fill — gold glow + pulse on special angles; hidden at axis angles where triangle degenerates */}
          {!isAxisAngle && (
            <polygon points={triPoly}
              fill={isSpecialTriangle ? "rgba(212,160,0,0.13)" : "rgba(107,70,193,0.07)"}
              stroke={isSpecialTriangle ? "#d4a000" : "none"}
              strokeWidth={isSpecialTriangle ? 1.5 : 0}
              style={isSpecialTriangle ? { animation: "triPulse 1.4s ease-in-out infinite" } : {}}
            />
          )}

          {/* Cos line */}
          {active.cos && (
            <line x1={CX} y1={CY} x2={px} y2={CY}
              stroke={cosColor} strokeWidth={2.5} strokeDasharray="5,3" />
          )}

          {/* Sin line */}
          {active.sin && (
            <line x1={px} y1={CY} x2={px} y2={py}
              stroke={sinColor} strokeWidth={2.5} />
          )}

          {/* Terminal arm */}
          <line x1={CX} y1={CY} x2={px} y2={py}
            stroke={radiusColor} strokeWidth={2} opacity={0.75} />
          {/* r= label on terminal arm */}
          <text
            x={clamp((CX + px) / 2 - sinRaw * 22, 20, 400)}
            y={clamp(thetaOnAxis ? CY - 16 : (CY + py) / 2 + cosRaw * 22, 18, 402)}
            fontSize={11} fill={radiusColor} fontWeight={700}
            textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic">
            r={fmtSide(radius)}
          </text>

          {/* θ arc — direction-correct, with spiral for >360° and arrowhead */}
          {(() => {
            const arc = thetaArcData();
            if (!arc) return null;
            return <>
              <path d={arc.pathStr} fill="none" stroke="#b8a898" strokeWidth={1.5} />
              <polygon points={arc.arrowPoints} fill="#b8a898" />
            </>;
          })()}
          <text x={thetaLabelX} y={thetaLabelY}
            fontSize={12} fill="#6b5744" fontWeight={600} textAnchor="middle"
            stroke="white" strokeWidth={3} strokeLinejoin="round" paintOrder="stroke fill">
            {activeQ === 0 ? `θ = RAA = ${thetaDisp}` : `θ = ${thetaDisp}`}
          </text>

          {/* RAA arc — hidden in Q1 since θ = RAA there */}
          {raaDeg > 0.5 && raaDeg < 89.5 && activeQ !== 0 && (
            <>
              <path d={raaArcPath()} fill="none" stroke={raaColor} strokeWidth={1.5} strokeDasharray="3,2" />
              <text x={raaLabelX} y={raaLabelY}
                fontSize={9} fill={raaColor} fontWeight={700} textAnchor="middle"
                stroke="white" strokeWidth={3} strokeLinejoin="round" paintOrder="stroke fill">
                RAA = {raaDisp}
              </text>
            </>
          )}

          {/* x= y= labels */}
          <text x={(CX + px) / 2} y={sinRaw >= 0 ? CY + 16 : CY - 8}
            fontSize={11} fill={cosColor} textAnchor="middle" fontWeight={600}>
            x = {fmt2(xVal)}
          </text>
          <text
            x={px + (cosRaw >= 0 ? 9 : -9)}
            y={(CY + py) / 2}
            fontSize={11} fill={sinColor}
            textAnchor={cosRaw >= 0 ? "start" : "end"} fontWeight={600}>
            y = {fmt2(yVal)}
          </text>

          {/* Draggable point */}
          <circle cx={px} cy={py} r={11} fill="white" stroke={radiusColor} strokeWidth={2.5} />
          <circle cx={px} cy={py} r={4}  fill={radiusColor} />
          <circle cx={CX} cy={CY} r={3}  fill="#bbb" />
          {/* Floating (x, y) coordinate label — diagonal offset at cardinal angles to avoid axis label overlap */}
          {(() => {
            const dx = px - CX, dy = py - CY;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            let lx, ly;
            if (isAxisAngle) {
              if (Math.abs(cosRaw) > 0.5) {
                // On x-axis (0° / 180°): shift up to clear the y= label
                lx = clamp(px + (cosRaw > 0 ? 22 : -22), 18, 400);
                ly = clamp(py - 30, 14, 406);
              } else {
                // On y-axis (90° / 270°): shift left to clear the x= label
                lx = clamp(px - 46, 18, 400);
                ly = clamp(py + (sinRaw > 0 ? -12 : 12), 14, 406);
              }
            } else {
              lx = clamp(px + (dx / len) * 24, 18, 400);
              ly = clamp(py + (dy / len) * 24, 14, 406);
            }
            return (
              <text x={lx} y={ly}
                fontSize={10} fontWeight={700} fill={radiusColor}
                textAnchor={cosRaw >= 0 ? "start" : "end"}
                fontFamily="Georgia, serif">
                ({fmt2(xVal)}, {fmt2(yVal)})
              </text>
            );
          })()}
        </svg>

        {/* CARDS COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, minWidth: 240, maxWidth: 360 }}>
          {active.sin && (
            <Collapsible open={openSin} onToggle={() => setOpenSin(o => !o)} label="sin θ" color={sinColor}>
              <RatioCard
                label="sin" color={sinColor}
                numSym="y" denSym="r" numWord="opposite" denWord="hypotenuse"
                numVal={fmt2(yVal)} denVal={fmtSide(radius)}
                decimal={fmt2(sinRaw)}
                isUndef={false}
                exactNum={sinExact?.[0]} exactDen={sinExact?.[1]}
              />
            </Collapsible>
          )}
          {active.cos && (
            <Collapsible open={openCos} onToggle={() => setOpenCos(o => !o)} label="cos θ" color={cosColor}>
              <RatioCard
                label="cos" color={cosColor}
                numSym="x" denSym="r" numWord="adjacent" denWord="hypotenuse"
                numVal={fmt2(xVal)} denVal={fmtSide(radius)}
                decimal={fmt2(cosRaw)}
                isUndef={false}
                exactNum={cosExact?.[0]} exactDen={cosExact?.[1]}
              />
            </Collapsible>
          )}
          {active.tan && (
            <Collapsible open={openTan} onToggle={() => setOpenTan(o => !o)} label="tan θ" color={tanColor}>
              <RatioCard
                label="tan" color={tanColor}
                numSym="y" denSym="x" numWord="opposite" denWord="adjacent"
                numVal={fmt2(yVal)} denVal={fmt2(xVal)}
                decimal={tanRaw !== null ? fmt2(tanRaw) : "∞"}
                isUndef={tanRaw === null}
                exactNum={tanExact?.[0]} exactDen={tanExact?.[1]}
                numSymColor={sinColor} denSymColor={cosColor}
                numValColor={sinColor} denValColor={cosColor}
              />
            </Collapsible>
          )}

          {/* RAA card — always visible */}
          <Collapsible open={openRAA} onToggle={() => setOpenRAA(o => !o)} label="Core Rule" color={raaColor}>
            <RAACard
              thetaDisp={thetaDisp} raaDisp={raaDisp}
              sinSign={sinSign} cosSign={cosSign} tanSign={tanSign}
              sinDecimal={fmt2(sinRaw)} cosDecimal={fmt2(cosRaw)}
              tanDecimal={tanRaw !== null ? fmt2(tanRaw) : "∞"}
              active={active}
              isAxisAngle={isAxisAngle}
              useRad={useRad}
              xStr={fmt2(xVal)} yStr={fmt2(yVal)} rStr={fmtSide(radius)}
            />
          </Collapsible>

          {/* Angle slider */}
          <Collapsible open={openAngle} onToggle={() => setOpenAngle(o => !o)} label="Angle θ" color={radiusColor}>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
                <button className="angle-arrow-btn"
                  onClick={() => setAngleDeg(snapAngle(clamp(Math.round(angleDeg) - stepDeg, -360, 720)))}
                  style={{ fontSize: 20, lineHeight: 1, background: "none", border: "none", cursor: "pointer",
                    color: "#6b5744", padding: "6px 8px", minWidth: 36, minHeight: 36, fontFamily: "Georgia, serif" }}>
                  ←
                </button>
                <div style={{ fontSize: 26, fontWeight: 700, color: "#6b5744" }}>{thetaDisp}</div>
                <button className="angle-arrow-btn"
                  onClick={() => setAngleDeg(snapAngle(clamp(Math.round(angleDeg) + stepDeg, -360, 720)))}
                  style={{ fontSize: 20, lineHeight: 1, background: "none", border: "none", cursor: "pointer",
                    color: "#6b5744", padding: "6px 8px", minWidth: 36, minHeight: 36, fontFamily: "Georgia, serif" }}>
                  →
                </button>
              </div>
              <input
                type="range" min={-360} max={720} step={1}
                value={Math.round(angleDeg)}
                onChange={e => setAngleDeg(snapAngle(Number(e.target.value)))}
                style={{ width: "100%", accentColor: radiusColor }}
              />
              <StepPills stepDeg={stepDeg} setStepDeg={setStepDeg} useRad={useRad} color={radiusColor}
                onReset={() => setAngleDeg(0)} />
            </div>
          </Collapsible>

          {/* Special triangle reference card */}
          <SpecialTriCard
            raaDeg={raaDeg} radius={radius} isSpecialTriangle={isSpecialTriangle}
            show={showSpecialTri} onToggle={() => setShowSpecialTri(s => !s)} />

          {/* Definitions */}
          <DefsPanel show={showDefs} onToggle={() => setShowDefs(s => !s)} />
        </div>
      </div>

      {/* GRAPH */}
      {showGraph && (
        <GraphPanel
          angleDeg={angleDeg}
          active={active}
          useRad={useRad}
          onAngleChange={setAngleDeg}
        />
      )}
      {showGraph && (active.sin || active.cos || active.tan) && (
        <div style={{ marginTop: 6, display: "flex", gap: 18, justifyContent: "center",
            flexWrap: "wrap", fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 12 }}>
          {active.sin && <span style={{ color: sinColor }}>f(θ) = sin θ</span>}
          {active.cos && <span style={{ color: cosColor }}>f(θ) = cos θ</span>}
          {active.tan && <span style={{ color: tanColor }}>f(θ) = tan θ</span>}
        </div>
      )}

      {/* Second angle slider — below graph */}
      <div style={{
        width: "100%", maxWidth: 880, marginTop: 16,
        background: "white", borderRadius: 10, padding: "12px 18px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.07)", boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 6 }}>
          <button className="angle-arrow-btn"
            onClick={() => setAngleDeg(snapAngle(clamp(Math.round(angleDeg) - stepDeg, -360, 720)))}
            style={{ fontSize: 20, lineHeight: 1, background: "none", border: "none", cursor: "pointer",
              color: "#6b5744", padding: "6px 8px", minWidth: 36, minHeight: 36, fontFamily: "Georgia, serif" }}>
            ←
          </button>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#6b5744", fontFamily: "Georgia, serif", fontStyle: "italic" }}>θ =</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: "#6b5744", fontFamily: "Georgia, serif" }}>{thetaDisp}</span>
          <button className="angle-arrow-btn"
            onClick={() => setAngleDeg(snapAngle(clamp(Math.round(angleDeg) + stepDeg, -360, 720)))}
            style={{ fontSize: 20, lineHeight: 1, background: "none", border: "none", cursor: "pointer",
              color: "#6b5744", padding: "6px 8px", minWidth: 36, minHeight: 36, fontFamily: "Georgia, serif" }}>
            →
          </button>
        </div>
        <input
          type="range" min={-360} max={720} step={1}
          value={Math.round(angleDeg)}
          onChange={e => setAngleDeg(snapAngle(Number(e.target.value)))}
          style={{ width: "100%", accentColor: radiusColor }}
        />
        <StepPills stepDeg={stepDeg} setStepDeg={setStepDeg} useRad={useRad} color={radiusColor}
          onReset={() => setAngleDeg(0)} />
      </div>

      {/* FOOTER */}
      <div style={{ marginTop: 32, textAlign: "center" }}>
        <Link
          href="https://magnolia-education.com"
          target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-block", textDecoration: "none" }}
        >
          <img
            src="/tools/magnoliatree.png" alt="Magnolia Education"
            style={{ height: 144, width: "auto", objectFit: "contain", display: "block", margin: "0 auto 6px" }}
          />
          <div style={{ fontSize: 10, color: "#c8bfb4", letterSpacing: 1 }}>
            © 2026 Magnolia Education. All rights reserved.
          </div>
        </Link>

        {/* CTA + thumbs up */}
        <div style={{ marginTop: 8, fontSize: 11, color: "#b8a898", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
          <span>
            Need a tutor in Ontario?{" "}
            <a href="https://magnolia-education.com" target="_blank" rel="noopener noreferrer"
              style={{ color: "#b8a898", textDecoration: "underline" }}>
              magnolia-education.com →
            </a>
          </span>
          <button
            onClick={() => setThumbsOpen(o => !o)}
            title="Like this tool? Sign up for trig tips"
            style={{
              background: "none", border: "1.5px solid #d6cec6", borderRadius: 20,
              cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "3px 8px",
              color: thumbsOpen ? "#6b46c1" : "#b8a898",
              borderColor: thumbsOpen ? "#6b46c1" : "#d6cec6",
              transition: "all 0.18s",
            }}
          >
            👍
          </button>
        </div>

        {/* Newsletter panel */}
        {thumbsOpen && (
          <div style={{
            marginTop: 12, maxWidth: 320, margin: "12px auto 0",
            background: "#fff8f4", border: "1.5px solid #e8ddd5",
            borderRadius: 14, padding: "18px 20px", textAlign: "left",
          }}>
            {nlDone ? (
              <div style={{ textAlign: "center", fontSize: 14, color: "#6b46c1", fontWeight: 600, padding: "8px 0" }}>
                Thanks! We&apos;ll be in touch 🌸
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#2d2d2d", marginBottom: 2 }}>Liking the tool?</div>
                  <div style={{ fontSize: 12, color: "#8a7a6e", fontWeight: 400 }}>Want trig tips and free tools?</div>
                </div>
                <form
                  data-netlify="true"
                  name="magnolia-newsletter"
                  method="POST"
                  action="/"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const fd = new FormData(e.target);
                    await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
                      body: new URLSearchParams(fd).toString() });
                    setNlDone(true);
                  }}
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <input type="hidden" name="form-name" value="magnolia-newsletter" />
                  <input type="hidden" name="source" value="trig-dictionary-tool" />
                  {[
                    { label: "Name", name: "name", type: "text", val: nlName, set: setNlName, placeholder: "Your name" },
                    { label: "Email", name: "email", type: "email", val: nlEmail, set: setNlEmail, placeholder: "your@email.com" },
                  ].map(({ label, name, type, val, set, placeholder }) => (
                    <div key={name}>
                      <label style={{ fontSize: 11, color: "#8a7a6e", display: "block", marginBottom: 3 }}>{label}</label>
                      <input
                        type={type} name={name} value={val} placeholder={placeholder} required
                        onChange={e => set(e.target.value)}
                        style={{
                          width: "100%", boxSizing: "border-box", padding: "7px 10px",
                          border: "1.5px solid #e0d6ce", borderRadius: 8, fontSize: 13,
                          background: "#fff", fontFamily: "Georgia, serif", outline: "none",
                          color: "#2d2d2d",
                        }}
                      />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: 11, color: "#8a7a6e", display: "block", marginBottom: 3 }}>Grade</label>
                    <select
                      name="grade" value={nlGrade} required
                      onChange={e => setNlGrade(e.target.value)}
                      style={{
                        width: "100%", boxSizing: "border-box", padding: "7px 10px",
                        border: "1.5px solid #e0d6ce", borderRadius: 8, fontSize: 13,
                        background: "#fff", fontFamily: "Georgia, serif", color: nlGrade ? "#2d2d2d" : "#aaa",
                        outline: "none",
                      }}
                    >
                      <option value="" disabled>Select grade</option>
                      {[9, 10, 11, 12].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "#8a7a6e", display: "block", marginBottom: 3 }}>School</label>
                    <input
                      type="text" name="school" value={nlSchool} placeholder="Your school" required
                      onChange={e => setNlSchool(e.target.value)}
                      style={{
                        width: "100%", boxSizing: "border-box", padding: "7px 10px",
                        border: "1.5px solid #e0d6ce", borderRadius: 8, fontSize: 13,
                        background: "#fff", fontFamily: "Georgia, serif", outline: "none",
                        color: "#2d2d2d",
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    style={{
                      marginTop: 4, padding: "8px 0", borderRadius: 20, fontSize: 13,
                      fontWeight: 700, fontFamily: "Georgia, serif", cursor: "pointer",
                      background: "#6b46c1", color: "white", border: "none",
                      width: "100%", transition: "opacity 0.18s",
                    }}
                  >
                    Sign me up
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>

    </div>
    </div>
  );
}
