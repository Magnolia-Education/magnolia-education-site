// Magnolia Education — Onboarding intake parsers (shared module for Netlify functions)
//
// Pure, dependency-free, DETERMINISTIC heuristics (no AI). Turns the free-text answers
// from the TutorBird onboarding form into the structured shapes the MMS `students` columns
// expect (migration 0011). Anything that can't be parsed is SKIPPED and a human-readable
// note is pushed to `warnings[]` — the caller surfaces those in the TickTick task for Rachit
// (we never reject a submission). The raw payload is also stored in students.intake_raw, so
// a misparse is always recoverable.
//
// Formats mirror the hints configured on the TutorBird fields:
//   session plan        "1x45min" | "2x30min"
//   availability        "Mon 4-6pm, Wed 5:30-7pm, Sat 10am-1pm"
//   earliest start      "4pm" | "3:30pm"

const DAYS = {
  sun: 'Sun', sunday: 'Sun',
  mon: 'Mon', monday: 'Mon',
  tue: 'Tue', tues: 'Tue', tuesday: 'Tue',
  wed: 'Wed', weds: 'Wed', wednesday: 'Wed',
  thu: 'Thu', thur: 'Thu', thurs: 'Thu', thursday: 'Thu',
  fri: 'Fri', friday: 'Fri',
  sat: 'Sat', saturday: 'Sat',
};

const BLANK = new Set(['', 'none', 'n/a', 'na', 'no', 'nil']);

function isBlank(s) {
  return s == null || BLANK.has(String(s).trim().toLowerCase());
}

// "4" | "4:30" | "4pm" | "4:30pm" -> "HH:MM" (24h). `inherit` supplies am/pm when the token
// omits it (e.g. the start of "4-6pm"). Returns null if the time can't be resolved.
function to24h(token, inherit) {
  const m = String(token).trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!m) return null;
  let hour = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const mer = (m[3] || inherit || '').toLowerCase();
  if (hour < 1 || hour > 12 || min > 59) {
    // allow a bare 24h hour like "13" only if no meridiem was given
    if (!mer && hour >= 0 && hour <= 23) return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    return null;
  }
  if (!mer) return null; // ambiguous 1-12 with no am/pm
  if (mer === 'pm' && hour !== 12) hour += 12;
  if (mer === 'am' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

// "4-6pm" | "10am-1pm" | "5:30-7pm" -> { start, end } (24h). End is parsed first so the start
// can inherit its am/pm.
function parseRange(rangeStr) {
  const parts = String(rangeStr).split('-');
  if (parts.length !== 2) return null;
  const endMerMatch = parts[1].match(/(am|pm)/i);
  const endMer = endMerMatch ? endMerMatch[1].toLowerCase() : null;
  const end = to24h(parts[1], endMer);
  const start = to24h(parts[0], endMer); // start inherits end's meridiem if it omits its own
  if (!start || !end) return null;
  return { start, end };
}

// "Mon 4-6pm" -> { day, start, end } or null
function parseEntry(entry) {
  const trimmed = String(entry).trim();
  if (!trimmed) return null;
  const sp = trimmed.indexOf(' ');
  if (sp === -1) return null;
  const dayTok = trimmed.slice(0, sp).toLowerCase().replace(/[.,]/g, '');
  const day = DAYS[dayTok];
  if (!day) return null;
  const range = parseRange(trimmed.slice(sp + 1).replace(/\s+/g, ''));
  if (!range) return null;
  return { day, start: range.start, end: range.end };
}

// "Mon 4-6pm, Wed 5:30-7pm" -> [{day,start,end}]. Blank/"none" -> null (not provided).
// Present-but-unparseable entries are skipped and warned.
function parseAvailability(str, label, warnings) {
  if (isBlank(str)) return null;
  const out = [];
  for (const piece of String(str).split(',')) {
    if (!piece.trim()) continue;
    const entry = parseEntry(piece);
    if (entry) out.push(entry);
    else warnings.push(`Couldn't parse ${label} entry: "${piece.trim()}"`);
  }
  return out;
}

// "1x45min" | "2x30min" -> { sessions_per_week, session_length_min }. Validates the minimum
// rule (1 => >=45, 2+ => >=30); a violation is kept but warned.
function parseSessionPlan(str, warnings) {
  const empty = { sessions_per_week: null, session_length_min: null };
  if (isBlank(str)) return empty;
  const m = String(str).match(/(\d+)\s*x\s*(\d+)/i);
  if (!m) {
    warnings.push(`Couldn't parse session plan: "${String(str).trim()}"`);
    return empty;
  }
  const sessions_per_week = parseInt(m[1], 10);
  const session_length_min = parseInt(m[2], 10);
  const okMin =
    (sessions_per_week === 1 && session_length_min >= 45) ||
    (sessions_per_week >= 2 && session_length_min >= 30);
  if (!okMin) {
    warnings.push(
      `Session plan below minimum (got ${sessions_per_week}x${session_length_min}min; need 1x45 or 2x30)`
    );
  }
  return { sessions_per_week, session_length_min };
}

// "4pm" | "3:30pm" -> "HH:MM" (for earliest_start_after_school). null if blank/unparseable.
function parseTimeOfDay(str, warnings) {
  if (isBlank(str)) return null;
  const merMatch = String(str).match(/(am|pm)/i);
  const t = to24h(str, merMatch ? merMatch[1].toLowerCase() : null);
  if (!t) warnings.push(`Couldn't parse earliest start time: "${String(str).trim()}"`);
  return t;
}

// Percentage 0-100. null if blank/unparseable; out-of-range is kept but warned.
function parseMark(str, warnings) {
  if (isBlank(str)) return null;
  const n = parseInt(String(str).replace('%', '').trim(), 10);
  if (Number.isNaN(n)) {
    warnings.push(`Couldn't parse previous mark: "${String(str).trim()}"`);
    return null;
  }
  if (n < 0 || n > 100) warnings.push(`Previous mark out of range: ${n}`);
  return n;
}

// Grade -> int 1..13. Tolerates "11", "Grade 11", "gr 9". null if blank/unparseable.
function parseGrade(str, warnings) {
  if (isBlank(str)) return null;
  const m = String(str).match(/\d+/);
  if (!m) {
    warnings.push(`Couldn't parse grade: "${String(str).trim()}"`);
    return null;
  }
  const n = parseInt(m[0], 10);
  if (n < 1 || n > 13) warnings.push(`Grade out of range: ${n}`);
  return n;
}

// Free-text device answer -> the students.device CHECK set (laptop|tablet|drawing_tablet|other).
// Unknown non-blank input falls back to 'other' + a warning (never a CHECK violation). null if blank.
function normalizeDevice(str, warnings) {
  if (isBlank(str)) return null;
  const s = String(str).toLowerCase();
  if (s.includes('draw')) return 'drawing_tablet';
  if (s.includes('laptop') || s.includes('computer') || s.includes('pc') || s.includes('mac') || s.includes('desktop')) return 'laptop';
  if (s.includes('ipad') || s.includes('tablet')) return 'tablet';
  warnings.push(`Unrecognized device "${String(str).trim()}" — stored as "other"`);
  return 'other';
}

// One call to parse all free-text/structured intake fields off the inbound payload.
// Returns { fields, warnings }. `fields` keys map 1:1 to students columns (0011).
function parseIntake(p) {
  const warnings = [];
  const plan = parseSessionPlan(p.session_plan, warnings);
  const fields = {
    grade: parseGrade(p.grade, warnings),
    device: normalizeDevice(p.device, warnings),
    sessions_per_week: plan.sessions_per_week,
    session_length_min: plan.session_length_min,
    preferred_times: parseAvailability(p.preferred_times, 'preferred times', warnings),
    unavailable_times: parseAvailability(p.unavailable_times, 'unavailable times', warnings),
    earliest_start_after_school: parseTimeOfDay(p.earliest_start, warnings),
    previous_subject_mark: parseMark(p.previous_subject_mark, warnings),
  };
  return { fields, warnings };
}

module.exports = {
  parseIntake,
  // exported for unit tests
  parseSessionPlan,
  parseAvailability,
  parseTimeOfDay,
  parseMark,
  parseGrade,
  normalizeDevice,
  to24h,
  parseRange,
  parseEntry,
};
