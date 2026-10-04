# Wisdom Painting Website

Simple frontend-only business website inspired by the provided reference structure, customized for **Wisdom Painting** with a Canadian audience in mind.

## Included pages

- `index.html` — Home + highlights + reviews
- `services.html` — Services overview
- `residential.html` — Residential subcategory page
- `commercial.html` — Commercial subcategory page
- `reviews.html` — All verified reviews page
- `contact.html` — Contact-focused page

## Tech stack

- HTML
- CSS
- Vanilla JavaScript

No backend, no login/signup, no database.

## Local run

```bash
npm run start
```

Open in browser:

- `http://localhost:8080`

This runs `server.js`, which serves the site and provides:

- `GET /api/reviews` (reads `data/reviews.json`)
- `POST /api/reviews` (appends submitted review with name/email/rating/message)

## Local validation test

```bash
npm test
```

## Deployment (low-cost)

Use any static host:

- Cloudflare Pages (recommended)
- Netlify
- GitHub Pages

### Cloudflare Pages setup (recommended)

1. Push this project to a GitHub repository.
2. In Cloudflare dashboard, go to **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Select your repository and configure:
	- **Framework preset**: None
	- **Build command**: *(leave empty)*
	- **Build output directory**: `.`
4. Deploy.
5. Add your custom domain in **Pages > Custom domains**.
6. Update canonical + OG URLs in HTML files to your real domain.

### Cloudflare runtime note

- `server.js` runs only for local development.
- Cloudflare Pages does not persist writes to local files like `data/reviews.json` at runtime.
- For deployed review persistence, use a Pages Function + KV binding (`REVIEWS_KV`).

### Cloudflare KV setup for review submissions (optional but recommended)

1. In Cloudflare dashboard, open **Storage & Databases** → **KV**.
2. Create a KV namespace (example: `wisdom-reviews`).
3. Open your Pages project → **Settings** → **Functions** → **KV namespace bindings**.
4. Add:
   - Variable name: `REVIEWS_KV`
   - Namespace: `wisdom-reviews`
5. Redeploy your Pages project.

### Estimated ongoing cost (Canada-friendly low-cost stack)

| Item | Provider | Frequency | Cost |
|---|---|---|---|
| Website hosting + HTTPS | Cloudflare Pages | Ongoing | $0 |
| Review/contact form submissions | Web3Forms or Formspree | Ongoing | $0 (free tier) |
| Google Business Profile | Google | Ongoing | $0 |
| Custom domain | Cloudflare Registrar / Porkbun | Yearly | ~$12–$18 CAD/year |

Approximate total ongoing cost: **~$12–$18 CAD/year** (domain only).

## Review form provider setup

The `Leave a Review` form in `contact.html` supports both providers.

### Option A — Formspree

In `contact.html`, keep:

- `data-provider="formspree"`
- Set `data-formspree-endpoint="https://formspree.io/f/your-form-id"` to your real endpoint.

### Option B — Web3Forms

In `contact.html`:

- Set `data-provider="web3forms"`
- Set `data-web3forms-key="YOUR_WEB3FORMS_ACCESS_KEY"` to your real key.

The frontend JS (`script.js`) auto-configures the form based on those attributes.

If `REVIEWS_KV` is configured on Cloudflare Pages, the form can submit through `/api/reviews` without Formspree/Web3Forms.

## Real reviews only workflow

This website is configured to show **only verified reviews** from `data/reviews.json`.

- Homepage: review slideshow (auto-rotating)
- Other pages: top verified reviews list
- `reviews.html`: full verified review list

Add your real reviews in `data/reviews.json` using this format:

```json
{
	"reviews": [
		{
			"verified": true,
			"name": "Customer Name",
			"location": "London, ON",
			"rating": 5,
			"message": "Great service and clean finish.",
			"source": "Google Business Profile"
		}
	]
}
```

Only entries with `"verified": true` are rendered.

### Review form save behavior

When you click **Submit Review**:

1. The site first tries to save directly to `data/reviews.json` through `/api/reviews`.
2. If local API is unavailable, it falls back to Formspree/Web3Forms if configured.
3. If providers are not configured, it can still fallback to email draft mode.

On Cloudflare Pages, `/api/reviews` persistence depends on KV binding (`REVIEWS_KV`) rather than local file writes.

## Before go-live

- Replace placeholder phone/email if needed
- Set your real `.ca` domain in canonical/OG/sitemap/robots
- Add real project images and testimonials
- Create and optimize Google Business Profile
- Configure review form endpoint (Formspree or Web3Forms)
