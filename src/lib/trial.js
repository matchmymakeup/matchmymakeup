// Premium trial state — read/write tracker for the 7-day free trial.
// Source of truth is `mmm_trial_start` in localStorage for both anonymous
// and authed users until a future phase migrates trial state to
// profiles.trial_started_at.
//
// scansSaved currently reads mmm_library directly. Step 4/5 will update
// upstream call sites to use storage.js getScans() and pass scansSaved
// in explicitly; this function will then drop its localStorage dependency.

export function getTrialInfo() {
  try {
    const start = localStorage.getItem('mmm_trial_start')
    if (!start) return { active: false, started: false, daysLeft: 0, scansSaved: 0 }
    const startDate = new Date(start)
    const now = new Date()
    const elapsed = Math.floor((now - startDate) / 86400000)
    const daysLeft = Math.max(0, 7 - elapsed)
    const lib = JSON.parse(localStorage.getItem('mmm_library') || '{}')
    const scansSaved = (lib.scans || []).length
    return { active: daysLeft > 0, started: true, daysLeft, scansSaved, elapsed }
  } catch {
    return { active: false, started: false, daysLeft: 0, scansSaved: 0 }
  }
}

export function startTrial() {
  localStorage.setItem('mmm_trial_start', new Date().toISOString())
}

// Convenience boolean — replaces Library.jsx's local getTrialInfo() that
// returned just true/false. Step 5 will swap Library's local for this.
export function isPremium() {
  return getTrialInfo().active
}
