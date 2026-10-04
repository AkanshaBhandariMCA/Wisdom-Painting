export async function onRequestGet({ env }) {
  const key = 'reviews';

  if (!env.REVIEWS_KV) {
    return jsonResponse({ reviews: [] });
  }

  const raw = await env.REVIEWS_KV.get(key);
  if (!raw) {
    return jsonResponse({ reviews: [] });
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.reviews)) {
      return jsonResponse({ reviews: [] });
    }
    return jsonResponse(parsed);
  } catch {
    return jsonResponse({ reviews: [] });
  }
}

export async function onRequestPost({ request, env }) {
  if (!env.REVIEWS_KV) {
    return jsonResponse(
      {
        ok: false,
        error: 'REVIEWS_KV binding not configured in Cloudflare Pages settings.',
      },
      500
    );
  }

  let body = null;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid JSON body.' }, 400);
  }

  const name = sanitizeText(body?.name, 120);
  const email = sanitizeText(body?.email, 180);
  const message = sanitizeText(body?.message, 2000);
  const location = sanitizeText(body?.location || '', 160);
  const source = sanitizeText(body?.source || 'Website Form', 120);
  const rating = normalizeRating(body?.rating);

  if (!name || !email || !message || rating === null) {
    return jsonResponse(
      {
        ok: false,
        error: 'Missing or invalid fields. Required: name, email, rating(1-5), message.',
      },
      400
    );
  }

  const key = 'reviews';
  const existingRaw = await env.REVIEWS_KV.get(key);
  const existingPayload = parseReviewsPayload(existingRaw);

  const review = {
    id: `r-${Date.now()}`,
    verified: true,
    name,
    email,
    rating,
    message,
    location,
    source,
    submittedAt: new Date().toISOString(),
  };

  existingPayload.reviews.push(review);
  await env.REVIEWS_KV.put(key, JSON.stringify(existingPayload));

  return jsonResponse({ ok: true, review }, 201);
}

function parseReviewsPayload(raw) {
  if (!raw) {
    return { reviews: [] };
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.reviews)) {
      return { reviews: [] };
    }
    return parsed;
  } catch {
    return { reviews: [] };
  }
}

function sanitizeText(value, maxLength = 4000) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function normalizeRating(value) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return null;
  }

  const rounded = Math.round(parsed);
  if (rounded < 1 || rounded > 5) {
    return null;
  }

  return rounded;
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
