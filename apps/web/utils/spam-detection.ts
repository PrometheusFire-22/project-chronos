/**
 * Spam Detection Utilities for Waitlist Submissions
 *
 * Implements multi-factor spam scoring:
 * - Gibberish name detection (0-40 points)
 * - Email domain analysis (0-25 points)
 * - Content coherence (0-20 points)
 * - Submission velocity (0-15 points)
 *
 * Total score 0-100:
 * - 0-39: Legitimate (auto-approve)
 * - 40-69: Suspicious (manual review)
 * - 70-100: Spam (auto-reject)
 */

export interface SpamScore {
  total: number
  factors: {
    gibberish_name: number
    email_domain: number
    content_coherence: number
    submission_velocity: number
  }
  verdict: 'legitimate' | 'suspicious' | 'spam'
  reason: string
}

/**
 * Check if a text string appears to be gibberish
 */
function isGibberish(text: string): boolean {
  if (!text || text.length < 2) return false

  const normalized = text.toLowerCase().replace(/[^a-z]/g, '')
  if (normalized.length < 2) return false

  // Count vowels and consonants
  const vowels = (normalized.match(/[aeiou]/g) || []).length
  const consonants = (normalized.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length
  const total = vowels + consonants

  if (total === 0) return false

  // Check for excessive consonants (>70%)
  const consonantRatio = consonants / total
  if (consonantRatio > 0.7) return true

  // Check for too few vowels (< 2 in entire string)
  if (vowels < 2 && normalized.length > 5) return true

  // Check for random capitalization in middle of words
  if (/[a-z][A-Z]/.test(text)) return true

  // Check for excessive consecutive consonants (4+ in a row)
  if (/[bcdfghjklmnpqrstvwxyz]{4,}/i.test(text)) return true

  return false
}

/**
 * Calculate gibberish score for name fields (0-40 points)
 */
function calculateGibberishScore(firstName: string, lastName: string): number {
  let score = 0

  // Check first name
  if (isGibberish(firstName)) {
    score += 20
  }

  // Check last name
  if (isGibberish(lastName)) {
    score += 20
  }

  return score
}

/**
 * List of known disposable email domains
 */
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'tempmail.com',
  'guerrillamail.com',
  'mailinator.com',
  '10minutemail.com',
  'throwaway.email',
  'temp-mail.org',
  'fakeinbox.com',
  'trashmail.com',
  'yopmail.com',
  'maildrop.cc',
])

/**
 * List of common free email providers
 */
const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'protonmail.com',
  'icloud.com',
  'aol.com',
  'mail.com',
])

/**
 * Calculate email domain score (0-25 points)
 */
function calculateEmailDomainScore(
  email: string,
  company: string | null
): number {
  let score = 0

  const emailDomain = email.split('@')[1]?.toLowerCase()
  if (!emailDomain) return 25 // Invalid email format

  // Check for disposable email
  if (DISPOSABLE_EMAIL_DOMAINS.has(emailDomain)) {
    return 25 // Maximum penalty
  }

  // Check for free email provider
  if (FREE_EMAIL_DOMAINS.has(emailDomain)) {
    score += 10
  }

  // Check if email domain matches company name
  if (company && company.length > 3) {
    const companyNormalized = company.toLowerCase().replace(/[^a-z0-9]/g, '')
    const domainNormalized = emailDomain.split('.')[0]?.toLowerCase() || ''

    // If company name doesn't appear in domain, add penalty
    if (
      !domainNormalized.includes(companyNormalized) &&
      !companyNormalized.includes(domainNormalized)
    ) {
      score += 10
    }
  }

  return Math.min(score, 25)
}

/**
 * Common job titles for validation
 */
const COMMON_JOB_TITLES = new Set([
  'ceo',
  'cto',
  'cfo',
  'coo',
  'vp',
  'director',
  'manager',
  'analyst',
  'engineer',
  'developer',
  'designer',
  'consultant',
  'specialist',
  'coordinator',
  'associate',
  'assistant',
  'lead',
  'senior',
  'junior',
  'intern',
  'founder',
  'partner',
  'president',
  'executive',
])

/**
 * Calculate content coherence score (0-20 points)
 */
function calculateContentCoherenceScore(
  company: string | null,
  role: string | null
): number {
  let score = 0

  // Check company name
  if (company) {
    if (isGibberish(company)) {
      score += 10
    } else if (company.length < 2) {
      score += 5
    }
  }

  // Check role/job title
  if (role) {
    if (isGibberish(role)) {
      score += 10
    } else {
      // Check if role contains any common job title keywords
      const roleNormalized = role.toLowerCase()
      const hasCommonTitle = Array.from(COMMON_JOB_TITLES).some((title) =>
        roleNormalized.includes(title)
      )

      if (!hasCommonTitle && role.length > 5) {
        score += 5
      }
    }
  }

  return Math.min(score, 20)
}

/**
 * Calculate submission velocity score (0-15 points)
 * Note: This requires tracking recent submissions by IP, which should be
 * implemented at the API level with a cache/database
 */
function calculateSubmissionVelocityScore(
  recentSubmissionsFromIP: number = 0
): number {
  if (recentSubmissionsFromIP >= 10) return 15
  if (recentSubmissionsFromIP >= 5) return 10
  if (recentSubmissionsFromIP >= 3) return 5
  return 0
}

/**
 * Main spam detection function
 */
export function calculateSpamScore(data: {
  first_name: string
  last_name: string
  email: string
  company: string | null
  role: string | null
  recentSubmissionsFromIP?: number
}): SpamScore {
  const gibberishScore = calculateGibberishScore(
    data.first_name,
    data.last_name
  )
  const emailDomainScore = calculateEmailDomainScore(data.email, data.company)
  const contentCoherenceScore = calculateContentCoherenceScore(
    data.company,
    data.role
  )
  const submissionVelocityScore = calculateSubmissionVelocityScore(
    data.recentSubmissionsFromIP
  )

  const total =
    gibberishScore +
    emailDomainScore +
    contentCoherenceScore +
    submissionVelocityScore

  let verdict: 'legitimate' | 'suspicious' | 'spam'
  let reason: string

  if (total >= 70) {
    verdict = 'spam'
    reason = 'Multiple strong spam indicators detected'
  } else if (total >= 40) {
    verdict = 'suspicious'
    reason = 'Some suspicious patterns detected, requires manual review'
  } else {
    verdict = 'legitimate'
    reason = 'Appears to be a legitimate submission'
  }

  return {
    total,
    factors: {
      gibberish_name: gibberishScore,
      email_domain: emailDomainScore,
      content_coherence: contentCoherenceScore,
      submission_velocity: submissionVelocityScore,
    },
    verdict,
    reason,
  }
}

/**
 * Example usage:
 *
 * const spamScore = calculateSpamScore({
 *   first_name: 'John',
 *   last_name: 'Smith',
 *   email: 'john.smith@acme.com',
 *   company: 'Acme Corp',
 *   role: 'Product Manager',
 * })
 *
 * if (spamScore.verdict === 'spam') {
 *   // Auto-reject
 * } else if (spamScore.verdict === 'suspicious') {
 *   // Flag for manual review
 * } else {
 *   // Auto-approve
 * }
 */
