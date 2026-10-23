const menuButton = document.getElementById('menu-toggle');
const nav = document.getElementById('primary-nav');
const submenuToggles = document.querySelectorAll('.submenu-toggle');
const queryForm = document.getElementById('query-form');
const queryFormStatus = document.getElementById('query-form-status');

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
  '.section, .hero-inner, .feature-item, .ba-card, .showcase-tile'
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
