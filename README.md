# Wisdom Painting Website

Simple frontend-only business website inspired by the provided reference structure, customized for **Wisdom Painting** with a Canadian audience in mind.

## Included pages

- `index.html` — Home + highlights + project query form
- `services.html` — Services overview
- `residential.html` — Residential subcategory page
- `commercial.html` — Commercial subcategory page
- `contact.html` — Contact-focused page
- `query.html` — Dedicated project query page

## Tech stack

- HTML
- CSS
- Vanilla JavaScript

Local development includes a small static Node server (`server.js`).

## Local run

```bash
npm run start
```

Open in browser:

- `http://localhost:8080`

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
- For deployment, Cloudflare Pages serves static files directly.

### Estimated ongoing cost (Canada-friendly low-cost stack)

| Item | Provider | Frequency | Cost |
|---|---|---|---|
| Website hosting + HTTPS | Cloudflare Pages | Ongoing | $0 |
| Query/contact form submissions | FormSubmit | Ongoing | $0 (free tier) |
| Google Business Profile | Google | Ongoing | $0 |
| Custom domain | Cloudflare Registrar / Porkbun | Yearly | ~$12–$18 CAD/year |

Approximate total ongoing cost: **~$12–$18 CAD/year** (domain only).

## Project query form behavior

The forms in `index.html` and `query.html` submit to FormSubmit via AJAX.

If a direct provider submit fails, the frontend opens a fallback email draft so the lead can still be sent.

## Before go-live

- Replace placeholder phone/email if needed
- Set your real `.ca` domain in canonical/OG/sitemap/robots
- Add real project images
- Create and optimize Google Business Profile
- Verify query form recipient endpoint
