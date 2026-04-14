/**
 * Analytics utility — wraps Cloudflare Web Analytics custom events
 * Fails silently in dev or if the beacon hasn't loaded yet.
 *
 * Cloudflare beacon exposes window.__cfBeaconF (queue) before the
 * script loads, then drains it once loaded.
 *
 * Usage:
 *   trackEvent('pdf_download', { school_type: 'private' })
 */

function trackEvent(name, props = {}) {
  try {
    // Cloudflare Web Analytics custom event API
    window.__cfBeaconF = window.__cfBeaconF || []
    window.__cfBeaconF.push({ type: 'event', name, props })
  } catch {
    // Never throw — analytics must never break the app
  }
}

// ── Named events (keeps call sites clean) ───────────────────────────────────

export function trackCalculate({ schoolType, tierId, yearsToMatric }) {
  trackEvent('calculate', {
    school_type: schoolType,
    tier: tierId,
    years_to_matric: yearsToMatric,
  })
}

export function trackPDFDownload({ schoolType, totalCost }) {
  trackEvent('pdf_download', {
    school_type: schoolType,
    total_cost_band: costBand(totalCost),
  })
}

export function trackShare() {
  trackEvent('share_link')
}

export function trackSchoolTypeChange(schoolType) {
  trackEvent('school_type_select', { school_type: schoolType })
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function costBand(amount) {
  if (amount < 500_000)   return 'under_500k'
  if (amount < 1_000_000) return '500k_1m'
  if (amount < 2_000_000) return '1m_2m'
  if (amount < 5_000_000) return '2m_5m'
  return 'over_5m'
}
