import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

app.use(cors());
app.use(express.json());

/**
 * Fallback rule-based matching algorithm
 * Filters & ranks NGOs by food type compatibility, capacity, and locality.
 */
function computeFallbackMatches(donation, ngos) {
  const foodType = (donation.foodType || donation.category || donation.foodName || '').toLowerCase();
  const quantity = Number(donation.quantity) || 0;
  const hoursLeft = Number(donation.hoursLeft) || 4;

  const ranked = (ngos || []).map(ngo => {
    let score = 60;
    const accepted = (ngo.acceptedFoodTypes || ngo.specialties || []).map(t => String(t).toLowerCase());
    
    // Check food type compatibility
    const matchesFood = accepted.some(t => foodType.includes(t) || t.includes(foodType));
    if (matchesFood) {
      score += 20;
    }

    // Check capacity fit
    const capacity = Number(ngo.capacity) || 100;
    if (capacity >= quantity) {
      score += 10;
    } else {
      score -= 15;
    }

    // Urgency & pickup availability
    if (hoursLeft <= 3) {
      if (ngo.pickupAvailable) score += 10;
      else score -= 15;
    }

    // Distance consideration
    const distance = Number(ngo.distance) || 5;
    if (distance <= 4) score += 5;
    else if (distance > 10) score -= 10;

    score = Math.max(30, Math.min(98, score));

    let reason = `${ngo.name} in ${ngo.area || ngo.location} can accommodate ${quantity} servings.`;
    if (matchesFood && ngo.pickupAvailable) {
      reason = `Direct match for ${donation.foodName || 'this donation'} in ${ngo.area || ngo.location} with immediate pickup.`;
    } else if (matchesFood) {
      reason = `Accepts ${donation.category || 'this food type'} with capacity of ${ngo.capacity} servings.`;
    }

    return {
      ngoId: ngo.id,
      score,
      reason,
      area: ngo.area || ngo.location || '',
    };
  });

  // Sort by score descending, then alphabetically by area
  ranked.sort((a, b) => b.score - a.score || a.area.localeCompare(b.area));

  return ranked.slice(0, 3).map(({ ngoId, score, reason }) => ({
    ngoId,
    score,
    reason,
  }));
}

// POST /api/match
app.post('/api/match', async (req, res) => {
  const { donation, ngos, role = 'admin', ngoId } = req.body;

  if (!donation || !ngos || !Array.isArray(ngos) || ngos.length === 0) {
    return res.status(400).json({
      error: 'Missing donation or ngos array in request body',
    });
  }

  // 1. Role enforcement: Donors cannot view the NGO match list directly
  if (role === 'donor') {
    return res.json({
      matches: [],
      isFallback: false,
      message: 'Donors cannot view NGO matches directly',
    });
  }

  // 2. Role enforcement: NGO workers can ONLY see their own NGO
  let candidateNGOs = ngos;
  const isNgoRole = role === 'ngo';
  if (isNgoRole) {
    if (!ngoId) {
      return res.status(400).json({ error: 'ngoId is required for role ngo', matches: [] });
    }
    candidateNGOs = ngos.filter(n => (n.id === ngoId || n.ngoId === ngoId)).slice(0, 1);
    if (candidateNGOs.length === 0) {
      return res.json({ matches: [], isFallback: false });
    }
  }

  // If no Gemini API key configured, use transparent fallback
  if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '' || GEMINI_API_KEY.includes('your_gemini_api_key')) {
    console.log('[FoodBridge Match] No GEMINI_API_KEY detected. Using Basic match fallback.');
    const fallbackMatches = computeFallbackMatches(donation, candidateNGOs);
    return res.json({
      matches: isNgoRole ? fallbackMatches.slice(0, 1) : fallbackMatches.slice(0, 3),
      isFallback: true,
      fallbackText: 'Basic match',
    });
  }

  try {
    const hoursLeft = donation.hoursLeft != null
      ? donation.hoursLeft
      : donation.pickupDeadline
        ? Math.max(0, Math.round(((new Date(donation.pickupDeadline).getTime() - Date.now()) / (1000 * 60 * 60)) * 10) / 10)
        : 4;

    const ngoSummary = candidateNGOs.map(ngo => ({
      ngoId: ngo.id || ngo.ngoId,
      name: ngo.name,
      area: ngo.area || ngo.location,
      capacityServings: ngo.capacity,
      acceptedFoodTypes: ngo.acceptedFoodTypes || ngo.specialties || [],
      pickupAvailable: Boolean(ngo.pickupAvailable),
    }));

    const systemInstruction = isNgoRole
      ? `You are FoodBridge AI Match. Evaluate how well this food donation fits the specified NGO.
Consider food type compatibility, quantity vs capacity, locality distance, and urgency.
Return JSON ONLY in this schema:
{"matches":[{"ngoId":"${ngoSummary[0].ngoId}","score":0-100,"reason":"one short sentence explaining how well this fits this NGO"}]}`
      : `You are FoodBridge AI Match, an intelligent dispatch engine matching surplus food donations with the best local NGOs in Delhi NCR & Gurugram.

Instructions:
1. Food type match: Check if the donation category/name matches what the NGO accepts (acceptedFoodTypes).
2. Capacity fit: Compare the donation quantity to the NGO's capacity (servings it can handle).
3. Distance & Location: Compare donation pickup location with NGO area (closer is better).
4. Urgency & Pickup Feasibility: How little time is left until deadline (hours left). If urgent (under 4-5 hours), heavily prioritize NGOs that have pickupAvailable=true and are nearby.

Return JSON ONLY in this exact schema with the top 3 best-matching NGOs ranked best first:
{"matches":[{"ngoId":"...","score":0-100,"reason":"one short concise sentence explaining why this NGO was matched"}]}`;

    const promptText = isNgoRole
      ? `How well does this donation fit this NGO? Return a score 0-100 and one short reason.

Donation details:
- Food Name: ${donation.foodName || 'Surplus Meals'}
- Food Type: ${donation.foodType || donation.category || 'Cooked Meals'}
- Quantity: ${donation.quantity || 1} ${donation.unit || 'servings'}
- Pickup Location: ${donation.pickupLocation || donation.location || 'Gurugram'}
- Hours Left Until Expiration: ${hoursLeft} hours
- Urgency: ${donation.urgency || 'medium'}

NGO:
${JSON.stringify(ngoSummary[0], null, 2)}`
      : `Match this donation to the top 3 NGOs:

Donation details:
- Food Name: ${donation.foodName || 'Surplus Meals'}
- Food Type: ${donation.foodType || donation.category || 'Cooked Meals'}
- Quantity: ${donation.quantity || 1} ${donation.unit || 'servings'}
- Pickup Location: ${donation.pickupLocation || donation.location || 'Gurugram'}
- Hours Left Until Expiration: ${hoursLeft} hours
- Urgency: ${donation.urgency || 'medium'}

Candidate NGOs:
${JSON.stringify(ngoSummary, null, 2)}`;

    const promptPayload = {
      system_instruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [
        {
          parts: [{ text: promptText }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    };

    console.log(`[FoodBridge Match] Calling Gemini API (${GEMINI_MODEL}) for role=${role}, donation=${donation.foodName}...`);

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY.trim()}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(promptPayload),
    });

    if (!geminiResponse.ok) {
      const errBody = await geminiResponse.text();
      console.warn(`[FoodBridge Match] Gemini API returned status ${geminiResponse.status}: ${errBody}`);
      const fallbackMatches = computeFallbackMatches(donation, candidateNGOs);
      return res.json({
        matches: isNgoRole ? fallbackMatches.slice(0, 1) : fallbackMatches.slice(0, 3),
        isFallback: true,
        fallbackText: 'Basic match',
      });
    }

    const data = await geminiResponse.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      console.warn('[FoodBridge Match] Empty response from Gemini API. Falling back.');
      const fallbackMatches = computeFallbackMatches(donation, candidateNGOs);
      return res.json({
        matches: isNgoRole ? fallbackMatches.slice(0, 1) : fallbackMatches.slice(0, 3),
        isFallback: true,
        fallbackText: 'Basic match',
      });
    }

    const parsed = JSON.parse(rawText);

    if (!parsed || !Array.isArray(parsed.matches) || parsed.matches.length === 0) {
      console.warn('[FoodBridge Match] Unexpected JSON shape from Gemini. Falling back.');
      const fallbackMatches = computeFallbackMatches(donation, candidateNGOs);
      return res.json({
        matches: isNgoRole ? fallbackMatches.slice(0, 1) : fallbackMatches.slice(0, 3),
        isFallback: true,
        fallbackText: 'Basic match',
      });
    }

    const limit = isNgoRole ? 1 : 3;
    const cleanedMatches = parsed.matches.slice(0, limit).map(m => ({
      ngoId: String(m.ngoId || (candidateNGOs[0] ? candidateNGOs[0].id : '')),
      score: Math.min(100, Math.max(0, Math.round(Number(m.score) || 75))),
      reason: String(m.reason || 'Recommended match for this donation.'),
    }));

    console.log(`[FoodBridge Match] Gemini match successful (${cleanedMatches.length} NGOs matched for role=${role}).`);

    return res.json({
      matches: cleanedMatches,
      isFallback: false,
    });
  } catch (error) {
    console.error('[FoodBridge Match] Error during Gemini match:', error);
    const fallbackMatches = computeFallbackMatches(donation, candidateNGOs);
    return res.json({
      matches: isNgoRole ? fallbackMatches.slice(0, 1) : fallbackMatches.slice(0, 3),
      isFallback: true,
      fallbackText: 'Basic match',
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasKey: Boolean(GEMINI_API_KEY && GEMINI_API_KEY.trim().length > 5),
    model: GEMINI_MODEL,
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n===========================================`);
    console.log(`🚀 FoodBridge AI Backend running on port ${PORT}`);
    console.log(`📡 Gemini Model: ${GEMINI_MODEL}`);
    console.log(`🔑 Gemini API Key configured: ${Boolean(GEMINI_API_KEY && GEMINI_API_KEY.trim().length > 5) ? 'YES' : 'NO (using Basic match fallback)'}`);
    console.log(`===========================================\n`);
  });
}

export default app;
