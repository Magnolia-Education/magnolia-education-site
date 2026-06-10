/* @ds-bundle: {"format":3,"namespace":"MagnoliaEducationDesignSystem_019ddb","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"FeatureRow","sourcePath":"components/marketing/FeatureRow.jsx"},{"name":"SectionHeading","sourcePath":"components/marketing/SectionHeading.jsx"},{"name":"TestimonialCard","sourcePath":"components/marketing/TestimonialCard.jsx"},{"name":"SessionRow","sourcePath":"components/portal/SessionRow.jsx"},{"name":"StatTile","sourcePath":"components/portal/StatTile.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"e0d07ffe6af7","components/core/Badge.jsx":"74546d7943ab","components/core/Button.jsx":"4d9c7dad016f","components/core/Card.jsx":"ceecbf36de5f","components/forms/Input.jsx":"9bfd0363f7f4","components/marketing/FeatureRow.jsx":"8d4022cc2f55","components/marketing/SectionHeading.jsx":"23c491b2b664","components/marketing/TestimonialCard.jsx":"b1926f60dc06","components/portal/SessionRow.jsx":"11bd2a3056db","components/portal/StatTile.jsx":"c5ac06b36a6f"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.MagnoliaEducationDesignSystem_019ddb = window.MagnoliaEducationDesignSystem_019ddb || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Avatar — initials on a soft coral ground, or a photo. Used in the student hub
 * sidebar and tutor cards.
 */
function Avatar({
  name = '',
  src,
  size = 40,
  style = {},
  ...rest
}) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
  const dim = typeof size === 'number' ? `${size}px` : size;
  if (src) {
    return /*#__PURE__*/React.createElement("img", _extends({
      src: src,
      alt: name,
      style: {
        width: dim,
        height: dim,
        borderRadius: '999px',
        objectFit: 'cover',
        objectPosition: 'center top',
        display: 'block',
        ...style
      }
    }, rest));
  }
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      width: dim,
      height: dim,
      borderRadius: '999px',
      background: 'var(--coral-pale)',
      color: 'var(--coral)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      fontSize: `calc(${dim} * 0.4)`,
      flex: 'none',
      ...style
    },
    "aria-label": name
  }, rest), initials);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Small label — an uppercase coral "eyebrow", a rounded status pill, or the
 * coral-pale deadline capsule used across the site.
 */
function Badge({
  children,
  variant = 'eyebrow',
  tone = 'coral',
  style = {},
  ...rest
}) {
  const tones = {
    coral: {
      bg: 'var(--coral-pale)',
      fg: 'var(--coral)',
      border: 'rgba(232,131,106,0.28)'
    },
    navy: {
      bg: 'rgba(61,68,102,0.08)',
      fg: 'var(--navy)',
      border: 'var(--line-strong)'
    },
    success: {
      bg: 'var(--success-bg)',
      fg: 'var(--success)',
      border: 'transparent'
    },
    warning: {
      bg: 'var(--warning-bg)',
      fg: 'var(--warning)',
      border: 'transparent'
    },
    error: {
      bg: 'var(--error-bg)',
      fg: 'var(--error)',
      border: 'transparent'
    },
    info: {
      bg: 'var(--info-bg)',
      fg: 'var(--info)',
      border: 'transparent'
    }
  };
  const t = tones[tone] || tones.coral;
  if (variant === 'eyebrow') {
    return /*#__PURE__*/React.createElement("span", _extends({
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        letterSpacing: 'var(--tracking-eyebrow)',
        textTransform: 'uppercase',
        color: 'var(--coral)',
        ...style
      }
    }, rest), children);
  }
  const isPill = variant === 'pill' || variant === 'capsule';
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '7px',
      fontFamily: 'var(--font-body)',
      fontSize: variant === 'status' ? '0.66rem' : '0.8rem',
      fontWeight: 600,
      letterSpacing: variant === 'status' ? '0.06em' : '0.01em',
      textTransform: variant === 'status' ? 'uppercase' : 'none',
      color: t.fg,
      background: t.bg,
      border: variant === 'capsule' ? `1px solid ${t.border}` : '1px solid transparent',
      borderRadius: 'var(--radius-pill)',
      padding: variant === 'status' ? '4px 11px' : '8px 16px',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Magnolia Button — the coral CTA and its quieter companions.
 * Rounded, soft, lifts a touch on hover. Never sharp, never loud.
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  as = 'button',
  href,
  disabled = false,
  fullWidth = false,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: {
      padding: '9px 20px',
      fontSize: '0.85rem'
    },
    md: {
      padding: '13px 30px',
      fontSize: '0.95rem'
    },
    lg: {
      padding: '16px 38px',
      fontSize: '1.02rem'
    }
  };
  const base = {
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    lineHeight: 1,
    borderRadius: 'var(--radius-sm)',
    border: '2px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    textDecoration: 'none',
    display: fullWidth ? 'flex' : 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: fullWidth ? '100%' : 'auto',
    transition: 'background var(--dur) var(--ease), color var(--dur) var(--ease), transform var(--dur-fast) var(--ease), box-shadow var(--dur) var(--ease)',
    opacity: disabled ? 0.5 : 1,
    ...sizes[size]
  };
  const variants = {
    primary: {
      background: 'var(--coral)',
      color: '#fff',
      boxShadow: 'var(--shadow-cta)'
    },
    secondary: {
      background: 'transparent',
      color: 'var(--navy)',
      borderColor: 'var(--navy)'
    },
    white: {
      background: '#fff',
      color: 'var(--navy)',
      boxShadow: 'var(--shadow-sm)'
    },
    'outline-white': {
      background: 'transparent',
      color: '#fff',
      borderColor: 'rgba(255,255,255,0.5)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--coral)',
      padding: '6px 4px'
    }
  };
  const hoverFor = (e, on) => {
    if (disabled) return;
    const el = e.currentTarget;
    if (variant === 'primary') {
      el.style.background = on ? 'var(--coral-hover)' : 'var(--coral)';
      el.style.transform = on ? 'var(--lift)' : 'none';
    } else if (variant === 'secondary') {
      el.style.background = on ? 'var(--navy)' : 'transparent';
      el.style.color = on ? '#fff' : 'var(--navy)';
    } else if (variant === 'white') {
      el.style.transform = on ? 'var(--lift)' : 'none';
    } else if (variant === 'outline-white') {
      el.style.borderColor = on ? '#fff' : 'rgba(255,255,255,0.5)';
      el.style.background = on ? 'rgba(255,255,255,0.06)' : 'transparent';
    } else if (variant === 'ghost') {
      el.style.opacity = on ? 0.7 : 1;
    }
  };
  const Tag = href ? 'a' : as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href,
    style: {
      ...base,
      ...variants[variant],
      ...style
    },
    onMouseEnter: e => hoverFor(e, true),
    onMouseLeave: e => hoverFor(e, false),
    "aria-disabled": disabled || undefined
  }, rest), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Magnolia content card — white, softly rounded, navy-tinted shadow.
 * Optional accent variants tint the ground (coral-pale) or invert to navy.
 */
function Card({
  children,
  variant = 'plain',
  interactive = false,
  padding = '28px 30px',
  style = {},
  ...rest
}) {
  const variants = {
    plain: {
      background: 'var(--surface-card)',
      color: 'var(--ink)'
    },
    accent: {
      background: 'var(--coral-pale)',
      color: 'var(--ink)'
    },
    sky: {
      background: 'var(--gradient-sky)',
      color: 'var(--navy)'
    },
    navy: {
      background: 'var(--navy)',
      color: 'var(--on-dark)'
    }
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      borderRadius: 'var(--radius-md)',
      boxShadow: variant === 'navy' ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      padding,
      transition: 'transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease)',
      cursor: interactive ? 'pointer' : 'default',
      ...variants[variant],
      ...style
    },
    onMouseEnter: interactive ? e => {
      e.currentTarget.style.transform = 'var(--lift)';
      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
    } : undefined,
    onMouseLeave: interactive ? e => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
    } : undefined
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Text input with an optional label. Soft 2px border that warms to navy on focus.
 */
function Input({
  label,
  hint,
  type = 'text',
  as = 'input',
  id,
  style = {},
  ...rest
}) {
  const fieldId = id || (label ? `f-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  const Tag = as === 'textarea' ? 'textarea' : 'input';
  const field = {
    width: '100%',
    fontFamily: 'var(--font-body)',
    fontSize: '0.95rem',
    color: 'var(--ink)',
    background: 'var(--white)',
    padding: as === 'textarea' ? '12px 16px' : '12px 18px',
    border: '2px solid var(--line-strong)',
    borderRadius: 'var(--radius-xs)',
    outline: 'none',
    transition: 'border-color var(--dur) var(--ease)',
    minHeight: as === 'textarea' ? '120px' : undefined,
    resize: as === 'textarea' ? 'vertical' : undefined,
    fontFamily: 'var(--font-body)',
    ...style
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '7px'
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '0.8rem',
      fontWeight: 600,
      color: 'var(--navy)'
    }
  }, label), /*#__PURE__*/React.createElement(Tag, _extends({
    id: fieldId,
    type: as === 'textarea' ? undefined : type,
    style: field,
    onFocus: e => {
      e.currentTarget.style.borderColor = 'var(--navy)';
    },
    onBlur: e => {
      e.currentTarget.style.borderColor = 'var(--line-strong)';
    }
  }, rest)), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '0.74rem',
      color: 'var(--ink-faint)'
    }
  }, hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/marketing/FeatureRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Alternating feature row — a hand-drawn illustration on a soft sky panel beside a
 * tag / serif title / body / link. The backbone of the marketing pages.
 */
function FeatureRow({
  tag,
  title,
  body,
  linkLabel,
  linkHref = '#',
  image,
  imageAlt = '',
  reverse = false,
  imageScale = 1.4,
  style = {},
  ...rest
}) {
  const textCol = /*#__PURE__*/React.createElement("div", null, tag && /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--coral)',
      margin: '0 0 14px'
    }
  }, tag), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: 'clamp(1.8rem, 3.4vw, 2.6rem)',
      lineHeight: 1.15,
      color: 'var(--navy)',
      margin: '0 0 16px'
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '0.975rem',
      lineHeight: 1.75,
      color: 'var(--ink-soft)',
      margin: '0 0 22px'
    }
  }, body), linkLabel && /*#__PURE__*/React.createElement("a", {
    href: linkHref,
    style: {
      fontFamily: 'var(--font-body)',
      color: 'var(--coral)',
      fontWeight: 600,
      fontSize: '0.9rem',
      textDecoration: 'none'
    }
  }, linkLabel));
  const imageCol = /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--gradient-sky)',
      borderRadius: 'var(--radius-lg)',
      minHeight: '300px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: imageAlt,
    style: {
      width: '100%',
      maxHeight: '340px',
      objectFit: 'contain',
      transform: `scale(${imageScale})`,
      transformOrigin: 'center'
    }
  }));
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'grid',
      gridTemplateColumns: reverse ? '60% 40%' : '40% 60%',
      gap: '64px',
      alignItems: 'center',
      ...style
    }
  }, rest), reverse ? /*#__PURE__*/React.createElement(React.Fragment, null, textCol, imageCol) : /*#__PURE__*/React.createElement(React.Fragment, null, imageCol, textCol));
}
Object.assign(__ds_scope, { FeatureRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/marketing/FeatureRow.jsx", error: String((e && e.message) || e) }); }

// components/marketing/SectionHeading.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * The section signature: a coral uppercase eyebrow, a Cormorant serif title, and an
 * optional muted subtitle. Used at the top of nearly every section.
 */
function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  onDark = false,
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      textAlign: align,
      maxWidth: align === 'center' ? '680px' : undefined,
      marginInline: align === 'center' ? 'auto' : undefined,
      ...style
    }
  }, rest), eyebrow && /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      letterSpacing: 'var(--tracking-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--coral)',
      margin: '0 0 16px'
    }
  }, eyebrow), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: 'var(--display-1)',
      lineHeight: 1.18,
      letterSpacing: 'var(--tracking-display)',
      color: onDark ? '#fff' : 'var(--navy)',
      margin: 0
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '1.05rem',
      lineHeight: 'var(--leading-body)',
      color: onDark ? 'var(--on-dark-soft)' : 'var(--ink-soft)',
      margin: '18px 0 0',
      maxWidth: '620px',
      marginInline: align === 'center' ? 'auto' : undefined
    }
  }, subtitle));
}
Object.assign(__ds_scope, { SectionHeading });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/marketing/SectionHeading.jsx", error: String((e && e.message) || e) }); }

// components/marketing/TestimonialCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Testimonial card — gold stars, an italic quote, and an attributed author.
 * White, softly rounded, the brand's warm shadow.
 */
function TestimonialCard({
  quote,
  author,
  role,
  rating = 5,
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-sm)',
      padding: '28px 28px 24px',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--star)',
      fontSize: '0.95rem',
      letterSpacing: '2px',
      marginBottom: '14px'
    },
    "aria-label": `${rating} out of 5 stars`
  }, '★'.repeat(rating)), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '0.92rem',
      lineHeight: 1.7,
      color: 'var(--ink)',
      fontStyle: 'italic',
      margin: '0 0 20px'
    }
  }, "\u201C", quote, "\u201D"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      fontSize: '0.8rem',
      letterSpacing: '0.05em',
      color: 'var(--navy)',
      margin: 0
    }
  }, author), role && /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '0.75rem',
      color: 'var(--ink-soft)',
      margin: '2px 0 0'
    }
  }, role));
}
Object.assign(__ds_scope, { TestimonialCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/marketing/TestimonialCard.jsx", error: String((e && e.message) || e) }); }

// components/portal/SessionRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * A schedule row in the student hub — subject + tutor, the date/time, and a status pill.
 */
function SessionRow({
  subject,
  tutorName,
  when,
  status = 'scheduled',
  style = {},
  ...rest
}) {
  const toneByStatus = {
    scheduled: 'coral',
    completed: 'success',
    cancelled: 'navy'
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-sm)',
      padding: '16px 18px',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      color: 'var(--navy)',
      margin: 0
    }
  }, subject, " with ", tutorName), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '0.85rem',
      color: 'var(--ink-soft)',
      margin: '3px 0 0'
    }
  }, when)), /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    variant: "status",
    tone: toneByStatus[status]
  }, status));
}
Object.assign(__ds_scope, { SessionRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/portal/SessionRow.jsx", error: String((e && e.message) || e) }); }

// components/portal/StatTile.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Student-hub stat tile — a small label, a value, an optional sub-line, with the
 * warm coral-pale hover lift. Links somewhere in the portal.
 */
function StatTile({
  label,
  value,
  sub,
  href = '#',
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    style: {
      display: 'block',
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-sm)',
      padding: '20px',
      textDecoration: 'none',
      transition: 'transform var(--dur) var(--ease), background var(--dur) var(--ease), box-shadow var(--dur) var(--ease)',
      ...style
    },
    onMouseEnter: e => {
      e.currentTarget.style.transform = 'var(--lift)';
      e.currentTarget.style.background = 'var(--coral-pale)';
      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.background = 'var(--surface-card)';
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
    }
  }, rest), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '0.72rem',
      fontWeight: 600,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--coral)',
      margin: 0
    }
  }, label), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '1.1rem',
      fontWeight: 600,
      color: 'var(--navy)',
      margin: '6px 0 0'
    }
  }, value), sub && /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '0.85rem',
      color: 'var(--ink-soft)',
      margin: '2px 0 0'
    }
  }, sub));
}
Object.assign(__ds_scope, { StatTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/portal/StatTile.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.FeatureRow = __ds_scope.FeatureRow;

__ds_ns.SectionHeading = __ds_scope.SectionHeading;

__ds_ns.TestimonialCard = __ds_scope.TestimonialCard;

__ds_ns.SessionRow = __ds_scope.SessionRow;

__ds_ns.StatTile = __ds_scope.StatTile;

})();
