const menuButton = document.getElementById('menu-toggle');
const nav = document.getElementById('primary-nav');
const submenuToggles = document.querySelectorAll('.submenu-toggle');
const reviewForm = document.getElementById('review-form');
const reviewFormStatus = document.getElementById('review-form-status');
const queryForm = document.getElementById('query-form');
const queryFormStatus = document.getElementById('query-form-status');
const reviewListContainers = document.querySelectorAll('[data-review-list]');
const reviewSlider = document.querySelector('[data-review-slider]');
const reviewSliderTrack = document.querySelector('[data-review-slider-track]');
const reviewSliderDots = document.querySelector('[data-review-slider-dots]');
const REVIEWS_API_URL = '/api/reviews';

let sliderIndex = 0;
let sliderTimer = null;

const toStars = (rating) => {
  const safe = Math.max(1, Math.min(5, Number(rating) || 0));
  return '★'.repeat(safe) + '☆'.repeat(5 - safe);
};

const createReviewCard = (review) => {
  const quote = document.createElement('blockquote');
  quote.className = 'review-card review-slide';

  const stars = document.createElement('div');
  stars.className = 'review-stars';
  stars.textContent = toStars(review.rating);

  const text = document.createElement('p');
  text.textContent = `“${review.message}”`;

  const cite = document.createElement('cite');
  const location = review.location ? `, ${review.location}` : '';
  cite.textContent = `— ${review.name}${location}`;

  quote.appendChild(stars);
  quote.appendChild(text);
  quote.appendChild(cite);

  if (review.source) {
    const meta = document.createElement('span');
    meta.className = 'review-meta';
    meta.textContent = `Source: ${review.source}`;
    quote.appendChild(meta);
  }

  return quote;
};

const renderEmptyState = (container) => {
  container.innerHTML = '';
  const empty = document.createElement('article');
  empty.className = 'review-empty';
  empty.innerHTML = '<h3>No verified reviews published yet</h3><p>Add real verified reviews in <code>data/reviews.json</code> to display them here.</p>';
  container.appendChild(empty);
};

const renderReviewList = (container, reviews) => {
  const showAll = container.dataset.showAll === 'true';
  const limit = Number(container.dataset.limit || '3');
  const selected = showAll ? reviews : reviews.slice(0, limit);

  if (selected.length === 0) {
    renderEmptyState(container);
    return;
  }

  container.innerHTML = '';
  selected.forEach((review) => {
    container.appendChild(createReviewCard(review));
  });
};

const renderReviewSlider = (reviews) => {
  if (!reviewSlider || !reviewSliderTrack || !reviewSliderDots) {
    return;
  }

  if (reviews.length === 0) {
    reviewSliderTrack.innerHTML = '';
    const empty = document.createElement('article');
    empty.className = 'review-empty';
    empty.innerHTML = '<h3>No verified reviews available</h3><p>Once you add verified reviews, the slider will rotate automatically.</p>';
    reviewSliderTrack.appendChild(empty);
    reviewSliderDots.innerHTML = '';
    return;
  }

  const slides = reviews.slice(0, 6);

  const showSlide = (index) => {
    sliderIndex = (index + slides.length) % slides.length;
    reviewSliderTrack.innerHTML = '';
    reviewSliderTrack.appendChild(createReviewCard(slides[sliderIndex]));

    Array.from(reviewSliderDots.children).forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === sliderIndex);
    });
  };

  reviewSliderDots.innerHTML = '';
  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'review-dot';
    dot.setAttribute('aria-label', `Go to review ${index + 1}`);
    dot.addEventListener('click', () => {
      showSlide(index);
      if (sliderTimer) {
        clearInterval(sliderTimer);
      }
      sliderTimer = setInterval(() => showSlide(sliderIndex + 1), 5000);
    });
    reviewSliderDots.appendChild(dot);
  });

  const prevButton = reviewSlider.querySelector('.review-slider-btn.prev');
  const nextButton = reviewSlider.querySelector('.review-slider-btn.next');

  prevButton?.addEventListener('click', () => showSlide(sliderIndex - 1));
  nextButton?.addEventListener('click', () => showSlide(sliderIndex + 1));

  showSlide(0);
  sliderTimer = setInterval(() => showSlide(sliderIndex + 1), 5000);
};

const loadVerifiedReviews = async () => {
  if (reviewListContainers.length === 0 && !reviewSlider) {
    return;
  }

  try {
    let payload = null;

    try {
      const apiResponse = await fetch(REVIEWS_API_URL, { cache: 'no-store' });
      if (apiResponse.ok) {
        payload = await apiResponse.json();
      }
    } catch {
      payload = null;
    }

    if (!payload) {
      const staticResponse = await fetch('data/reviews.json', { cache: 'no-store' });
      if (!staticResponse.ok) {
        throw new Error('Could not load reviews');
      }
      payload = await staticResponse.json();
    }

    const allReviews = Array.isArray(payload.reviews) ? payload.reviews : [];
    const verified = allReviews.filter((review) => review && review.verified === true);

    reviewListContainers.forEach((container) => renderReviewList(container, verified));
    renderReviewSlider(verified);
  } catch {
    reviewListContainers.forEach((container) => renderEmptyState(container));
    renderReviewSlider([]);
  }
};

loadVerifiedReviews();

if (menuButton && nav) {
  menuButton.setAttribute('aria-label', 'Open menu');

  menuButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('nav-open', isOpen);
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open menu');
      document.body.classList.remove('nav-open');
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open menu');
      document.body.classList.remove('nav-open');
    }
  });
}

submenuToggles.forEach((toggle) => {
  toggle.addEventListener('click', (event) => {
    event.preventDefault();

    const parent = toggle.closest('.has-submenu');
    if (!parent) {
      return;
    }

    const nowOpen = parent.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(nowOpen));

    document.querySelectorAll('.has-submenu').forEach((item) => {
      if (item !== parent) {
        item.classList.remove('open');
        const otherToggle = item.querySelector('.submenu-toggle');
        if (otherToggle) {
          otherToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });
});

document.addEventListener('click', (event) => {
  if (!(event.target instanceof Node)) {
    return;
  }

  if (menuButton && nav) {
    const clickedMenuButton = menuButton.contains(event.target);
    const clickedNav = nav.contains(event.target);
    if (!clickedMenuButton && !clickedNav) {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open menu');
      document.body.classList.remove('nav-open');
    }
  }

  document.querySelectorAll('.has-submenu').forEach((item) => {
    if (!item.contains(event.target)) {
      item.classList.remove('open');
      const toggle = item.querySelector('.submenu-toggle');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
      }
    }
  });
});

const revealTargets = document.querySelectorAll(
  '.section, .hero-inner, .feature-item, .ba-card, .showcase-tile, .review-card'
);

if ('IntersectionObserver' in window && revealTargets.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: '0px 0px -8% 0px',
    }
  );

  revealTargets.forEach((target, index) => {
    target.classList.add('reveal');
    target.style.setProperty('--reveal-delay', `${Math.min(index * 70, 350)}ms`);
    observer.observe(target);
  });
}

if (reviewForm instanceof HTMLFormElement) {
  const provider = (reviewForm.dataset.provider || 'formspree').toLowerCase();
  const formspreeEndpoint = reviewForm.dataset.formspreeEndpoint || '';
  const web3formsKey = reviewForm.dataset.web3formsKey || '';
  const fallbackEmail = 'Paintingwisdom9@gmail.com';

  const isFormspreeConfigured =
    provider === 'formspree' &&
    Boolean(formspreeEndpoint) &&
    !formspreeEndpoint.includes('your-form-id');

  const isWeb3formsConfigured =
    provider === 'web3forms' &&
    Boolean(web3formsKey) &&
    web3formsKey !== 'YOUR_WEB3FORMS_ACCESS_KEY';

  if (provider === 'web3forms' && isWeb3formsConfigured) {
    reviewForm.action = 'https://api.web3forms.com/submit';
    reviewForm.method = 'POST';

    if (!reviewForm.querySelector('input[name="access_key"]')) {
      const keyInput = document.createElement('input');
      keyInput.type = 'hidden';
      keyInput.name = 'access_key';
      keyInput.value = web3formsKey;
      reviewForm.appendChild(keyInput);
    }

    if (!reviewForm.querySelector('input[name="subject"]')) {
      const subjectInput = document.createElement('input');
      subjectInput.type = 'hidden';
      subjectInput.name = 'subject';
      subjectInput.value = 'New Wisdom Painting Review';
      reviewForm.appendChild(subjectInput);
    }
  } else if (provider === 'formspree' && isFormspreeConfigured) {
    reviewForm.action = formspreeEndpoint;
    reviewForm.method = 'POST';
  }

  reviewForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!reviewFormStatus) {
      reviewForm.submit();
      return;
    }

    reviewFormStatus.textContent = 'Submitting your review...';
    reviewFormStatus.className = 'form-status';

    try {
      const formData = new FormData(reviewForm);
      const payload = {
        name: String(formData.get('name') || '').trim(),
        email: String(formData.get('email') || '').trim(),
        rating: Number(formData.get('rating') || 0),
        message: String(formData.get('message') || '').trim(),
        location: String(formData.get('location') || '').trim(),
        source: 'Website Form',
      };

      const saveResponse = await fetch(REVIEWS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (saveResponse.ok) {
        reviewFormStatus.textContent = 'Thanks! Your review was saved successfully.';
        reviewFormStatus.className = 'form-status success';
        reviewForm.reset();
        await loadVerifiedReviews();
        return;
      }

      if (isFormspreeConfigured || isWeb3formsConfigured) {
        const providerResponse = await fetch(reviewForm.action, {
          method: 'POST',
          body: formData,
          headers: {
            Accept: 'application/json',
          },
        });

        if (!providerResponse.ok) {
          throw new Error('Provider submission failed');
        }

        reviewFormStatus.textContent = 'Thanks! Your review was submitted successfully.';
        reviewFormStatus.className = 'form-status success';
        reviewForm.reset();
        return;
      }

      const mailSubject = encodeURIComponent('Wisdom Painting - New Review Submission');
      const mailBody = encodeURIComponent(
        `Name: ${payload.name}\nEmail: ${payload.email}\nLocation: ${payload.location}\nRating: ${payload.rating}\n\nReview:\n${payload.message}`
      );

      window.location.href = `mailto:${fallbackEmail}?subject=${mailSubject}&body=${mailBody}`;
      reviewFormStatus.textContent =
        'Could not save directly right now. Your email app was opened so you can still send the review.';
      reviewFormStatus.className = 'form-status info';
    } catch {
      reviewFormStatus.textContent = 'Could not submit right now. Please try again in a moment.';
      reviewFormStatus.className = 'form-status error';
    }
  });
}

if (queryForm instanceof HTMLFormElement) {
  const fallbackEmail = 'Paintingwisdom9@gmail.com';
  const ajaxEndpoint = queryForm.dataset.ajaxEndpoint || queryForm.action;

  queryForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (queryFormStatus) {
      queryFormStatus.textContent = 'Submitting your query...';
      queryFormStatus.className = 'form-status';
    }

    const formData = new FormData(queryForm);

    try {
      const response = await fetch(ajaxEndpoint, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Query provider submission failed');
      }

      if (queryFormStatus) {
        queryFormStatus.textContent = 'Thank you! Your query was sent successfully.';
        queryFormStatus.className = 'form-status success';
      }

      queryForm.reset();
      return;
    } catch {
      const name = String(formData.get('name') || '').trim();
      const email = String(formData.get('email') || '').trim();
      const phone = String(formData.get('phone') || '').trim();
      const service = String(formData.get('service') || '').trim();
      const message = String(formData.get('message') || '').trim();

      const mailSubject = encodeURIComponent('New Project Query - Wisdom Painting');
      const mailBody = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\n\nQuery:\n${message}`
      );

      window.location.href = `mailto:${fallbackEmail}?subject=${mailSubject}&body=${mailBody}`;

      if (queryFormStatus) {
        queryFormStatus.textContent =
          'Direct submit is unavailable right now. Your email app was opened so you can still send the query.';
        queryFormStatus.className = 'form-status info';
      }
    }
  });
}

const yearNode = document.getElementById('year');
if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}
