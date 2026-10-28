import { Donation, NGOPartner, AIMatch, MatchFactor } from '../types';

export interface AIMatchCardData {
  ngoId: string;
  ngo: NGOPartner;
  score: number;
  reason: string;
}

export interface MatchFetchResult {
  matches: AIMatchCardData[];
  isFallback: boolean;
  label: string; // "Gemini AI Match" or "Basic match"
}

const CACHE_PREFIX = 'foodbridge_aimatch_';

/**
 * Fallback rule-based match when server/API is unavailable or rate-limited.
 * Filters & ranks NGOs by food type compatibility, capacity, and locality.
 */
export function computeClientFallbackMatches(
  donation: Donation,
  ngos: NGOPartner[]
): AIMatchCardData[] {
  const foodType = (donation.category || donation.foodName || '').toLowerCase();
  const quantity = Number(donation.quantity) || 0;

  const scored = ngos.map(ngo => {
    let score = 65;
    const accepted = (ngo.acceptedFoodTypes || ngo.specialties || []).map(t => String(t).toLowerCase());
    const matchesFood = accepted.some(t => foodType.includes(t) || t.includes(foodType));
    if (matchesFood) score += 20;

    if (ngo.capacity >= quantity) {
      score += 10;
    } else {
      score -= 15;
    }

    if (ngo.pickupAvailable) score += 5;

    score = Math.max(30, Math.min(98, score));

    let reason = `${ngo.name} in ${ngo.area || ngo.location} can accept ${donation.category} with ${ngo.capacity} servings capacity.`;
    if (matchesFood && ngo.pickupAvailable) {
      reason = `Direct food type match in ${ngo.area || ngo.location} with active pickup available.`;
    }

    return {
      ngoId: ngo.id,
      ngo,
      score,
      reason,
      area: ngo.area || ngo.location || '',
    };
  });

  scored.sort((a, b) => b.score - a.score || a.area.localeCompare(b.area));

  return scored.slice(0, 3).map(({ ngoId, ngo, score, reason }) => ({
    ngoId,
    ngo,
    score,
    reason,
  }));
}

/**
 * Fetch matches via backend Gemini API, caching in localStorage by donation ID.
 * Falls back transparently to rule-based match if API is unavailable, fails, or rate-limited.
 */
export async function fetchAIMatches(
  donation: Donation,
  ngos: NGOPartner[]
): Promise<MatchFetchResult> {
  const cacheKey = `${CACHE_PREFIX}${donation.id}`;

  // 1. Check localStorage first
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && Array.isArray(parsed.matches) && parsed.matches.length > 0) {
        const mappedMatches: AIMatchCardData[] = parsed.matches.map((m: any) => ({
          ngoId: m.ngoId,
          ngo: ngos.find(n => n.id === m.ngoId) || ngos[0],
          score: m.score,
          reason: m.reason,
        }));
        return {
          matches: mappedMatches,
          isFallback: Boolean(parsed.isFallback),
          label: parsed.isFallback ? 'Basic match' : 'Gemini AI Match',
        };
      }
    }
  } catch (e) {
    console.warn('Error reading AI match cache:', e);
  }

  // 2. Call backend /api/match
  try {
    const hoursLeft = donation.pickupDeadline
      ? Math.max(0, Math.round(((new Date(donation.pickupDeadline).getTime() - Date.now()) / (1000 * 60 * 60)) * 10) / 10)
      : 4;

    const res = await fetch('/api/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        donation: {
          id: donation.id,
          foodName: donation.foodName,
          category: donation.category,
          foodType: donation.category,
          quantity: donation.quantity,
          unit: donation.unit,
          location: donation.pickupLocation,
          pickupLocation: donation.pickupLocation,
          hoursLeft,
          urgency: donation.urgency,
        },
        ngos: ngos.map(n => ({
          id: n.id,
          name: n.name,
          area: n.area || n.location,
          location: n.location,
          capacity: n.capacity,
          acceptedFoodTypes: n.acceptedFoodTypes || n.specialties || [],
          pickupAvailable: n.pickupAvailable,
        })),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.matches) && data.matches.length > 0) {
        // Cache to localStorage
        try {
          localStorage.setItem(cacheKey, JSON.stringify(data));
        } catch { /* ignore quota */ }

        const mappedMatches: AIMatchCardData[] = data.matches.map((m: any) => ({
          ngoId: m.ngoId,
          ngo: ngos.find(n => n.id === m.ngoId) || ngos[0],
          score: m.score,
          reason: m.reason,
        }));

        return {
          matches: mappedMatches,
          isFallback: Boolean(data.isFallback),
          label: data.isFallback ? 'Basic match' : 'Gemini AI Match',
        };
      }
    }
  } catch (err) {
    console.warn('Backend match fetch failed, falling back to rule-based match:', err);
  }

  // 3. Fallback to client-side rule-based match
  const fallback = computeClientFallbackMatches(donation, ngos);
  const fallbackPayload = {
    matches: fallback.map(f => ({ ngoId: f.ngoId, score: f.score, reason: f.reason })),
    isFallback: true,
  };
  try {
    localStorage.setItem(cacheKey, JSON.stringify(fallbackPayload));
  } catch { /* ignore */ }

  return {
    matches: fallback,
    isFallback: true,
    label: 'Basic match',
  };
}

/**
 * Legacy deterministic scoring algorithm
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function distanceScore(distanceKm: number): { score: number; detail: string } {
  if (distanceKm <= 2) return { score: 1.0, detail: `Very close (${distanceKm} km)` };
  if (distanceKm <= 5) return { score: 0.85, detail: `Nearby (${distanceKm} km)` };
  if (distanceKm <= 10) return { score: 0.6, detail: `Moderate distance (${distanceKm} km)` };
  if (distanceKm <= 20) return { score: 0.35, detail: `Far (${distanceKm} km)` };
  return { score: 0.15, detail: `Very far (${distanceKm} km)` };
}

function capacityScore(donationQty: number, ngoCapacity: number): { score: number; detail: string } {
  const ratio = donationQty / ngoCapacity;
  if (ratio <= 0.3) return { score: 0.9, detail: `Well within capacity (${ngoCapacity} unit cap)` };
  if (ratio <= 0.6) return { score: 1.0, detail: `Good fit for capacity (${ngoCapacity} unit cap)` };
  if (ratio <= 0.9) return { score: 0.7, detail: `Near capacity limit (${ngoCapacity} unit cap)` };
  if (ratio <= 1.0) return { score: 0.4, detail: `At capacity limit (${ngoCapacity} unit cap)` };
  return { score: 0.1, detail: `Exceeds capacity (${ngoCapacity} unit cap)` };
}

function specialtyScore(category: string, specialties: string[]): { score: number; detail: string } {
  if (specialties.includes(category)) {
    return { score: 1.0, detail: `Handles ${category} — direct specialty match` };
  }
  return { score: 0.3, detail: `General food handling` };
}

function availabilityScore(activePickups: number): { score: number; detail: string } {
  if (activePickups === 0) return { score: 1.0, detail: 'No active pickups — fully available' };
  if (activePickups <= 2) return { score: 0.8, detail: `${activePickups} active pickup(s) — mostly available` };
  if (activePickups <= 4) return { score: 0.5, detail: `${activePickups} active pickups — moderately busy` };
  return { score: 0.2, detail: `${activePickups} active pickups — very busy` };
}

function urgencyBoost(urgency: string): number {
  switch (urgency) {
    case 'critical': return 1.3;
    case 'high': return 1.15;
    case 'medium': return 1.0;
    case 'low': return 0.95;
    default: return 1.0;
  }
}

export function getSmartMatches(donation: Donation, ngos: NGOPartner[]): AIMatch[] {
  const weights = {
    distance: 0.30,
    capacity: 0.25,
    specialty: 0.25,
    availability: 0.20,
  };

  const matches: AIMatch[] = ngos.map(ngo => {
    const dist = distanceScore(ngo.distance || 3);
    const cap = capacityScore(donation.quantity, ngo.capacity);
    const spec = specialtyScore(donation.category, ngo.acceptedFoodTypes || ngo.specialties || []);
    const avail = availabilityScore(ngo.activePickups || 0);

    const factors: MatchFactor[] = [
      { name: 'Distance', score: dist.score, weight: weights.distance, detail: dist.detail },
      { name: 'Capacity', score: cap.score, weight: weights.capacity, detail: cap.detail },
      { name: 'Specialty', score: spec.score, weight: weights.specialty, detail: spec.detail },
      { name: 'Availability', score: avail.score, weight: weights.availability, detail: avail.detail },
    ];

    const rawScore =
      dist.score * weights.distance +
      cap.score * weights.capacity +
      spec.score * weights.specialty +
      avail.score * weights.availability;

    const boosted = clamp(rawScore * urgencyBoost(donation.urgency), 0, 1);
    const score = Math.round(boosted * 100) / 100;

    return {
      ngoId: ngo.id,
      ngo,
      score,
      factors,
      explanation: `${ngo.name} in ${ngo.area || ngo.location} can accept ${donation.foodName}. Capacity: ${ngo.capacity} servings.`,
    };
  });

  return matches.sort((a, b) => b.score - a.score);
}
