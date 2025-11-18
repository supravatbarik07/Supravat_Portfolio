/* Neon Portfolio interactions:
   - Mobile hamburger toggle
   - Fade-in observer
   - Project slider with auto & buttons
   - Contact form submission (Formspree)
*/

// DOM helpers
const qs = (s) => document.querySelector(s);
const qsa = (s) => document.querySelectorAll(s);

// MOBILE MENU
const hamburger = document.getElementById("hamburger");
const nav = document.getElementById("nav");
const overlay = document.getElementById("menuOverlay");

function toggleMenu() {
  nav.classList.toggle("active");
  hamburger.classList.toggle("active");
  overlay.classList.toggle("active");
}

hamburger.addEventListener("click", toggleMenu);
overlay.addEventListener("click", toggleMenu);

// close menu on link click
document.querySelectorAll(".nav a").forEach(link => {
  link.addEventListener("click", toggleMenu);
});

// ---------- FADE-IN ON SCROLL ----------
const faders = qsa('.fade-in');
const obs = new IntersectionObserver((entries, ob) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      ob.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });
faders.forEach(el => obs.observe(el));

// ---------- PROJECT SLIDER ----------
const track = qs('.slides-track');
const slides = qsa('.slides-track .project');
let slideIndex = 0;
const total = slides.length;

const updateSlider = () => {
  track.style.transform = `translateX(-${slideIndex * 100}%)`;
};
qs('.next')?.addEventListener('click', () => { slideIndex = (slideIndex + 1) % total; updateSlider(); });
qs('.prev')?.addEventListener('click', () => { slideIndex = (slideIndex - 1 + total) % total; updateSlider(); });

// auto-slide with pause on hover
let auto = setInterval(() => { slideIndex = (slideIndex + 1) % total; updateSlider(); }, 4500);
qs('.slides-viewport')?.addEventListener('mouseenter', () => clearInterval(auto));
qs('.slides-viewport')?.addEventListener('mouseleave', () => { auto = setInterval(() => { slideIndex = (slideIndex + 1) % total; updateSlider(); }, 4500); });

// ---------- CONTACT FORM (Formspree) ----------
const form = qs('#contact-form');
const status = qs('#form-status');
const clearBtn = qs('#clear');

// reference to the email input (Formspree often uses name="_replyto" but some APIs return 'email')
const emailInput = form ? form.querySelector('input[name="_replyto"], input[name="email"]') : null;

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  // clear previous states
  status.textContent = '';
  emailInput?.classList.remove('input-error');

  // basic client-side email validation to avoid needless round-trips
  const emailVal = emailInput?.value?.trim() || '';
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(emailVal)) {
    status.textContent = '❌ Please enter a valid email address.';
    emailInput?.classList.add('input-error');
    emailInput?.focus();
    return;
  }

  status.textContent = 'Sending...';
  const fd = new FormData(form);
  try {
    const res = await fetch(form.action, {
      method: form.method,
      body: fd,
      headers: { 'Accept': 'application/json' }
    });

    // Success path
    if (res.ok) {
      status.textContent = '✅ Message sent. I will reply soon.';
      form.reset();
      emailInput?.classList.remove('input-error');
      return;
    }

    // Non-OK: try to parse JSON body for structured errors
    let json = null;
    try { json = await res.json(); } catch (err) { json = null; }

    if (json && Array.isArray(json.errors) && json.errors.length) {
      // Format messages for display
      const msgs = json.errors.map(err => {
        // prefer the 'field' property if present, else show the code
        const fld = err.field ? `${err.field}: ` : (err.code ? `${err.code}: ` : '');
        return fld + (err.message || JSON.stringify(err));
      }).join(' • ');
      status.textContent = '❌ ' + msgs;

      // If any error references email, highlight the email input
      const emailErr = json.errors.find(e => {
        const f = (e.field || '').toString().toLowerCase();
        return f.includes('email') || f === '_replyto' || (e.code || '').toString().toLowerCase().includes('email');
      });
      if (emailErr) {
        emailInput?.classList.add('input-error');
        emailInput?.focus();
      }
    } else {
      // Fallback generic message
      status.textContent = '❌ Error sending message. Try again later.';
    }
  } catch (err) {
    status.textContent = '❌ Network error. Please try again.';
  }
});

// clear form and any error highlights
clearBtn?.addEventListener('click', () => {
  form.reset();
  status.textContent = '';
  emailInput?.classList.remove('input-error');
});

// ---------- Accessibility: smooth scroll for in-page links ----------
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const t = a.getAttribute('href');
    if (t.length > 1) {
      e.preventDefault();
      document.querySelector(t)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // close mobile nav
      if (nav.classList.contains('active')) { nav.classList.remove('active'); hamburger.classList.remove('active'); overlay.classList.remove('active'); }
    }
  });
});
// ---------- INTERACTIVE NEON CURSOR ----------
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');
let isHovering = false;

window.addEventListener('mousemove', (e) => {
  const x = e.clientX;
  const y = e.clientY;

  cursorDot.style.transform = `translate(${x}px, ${y}px)`;
  cursorOutline.style.transform = `translate(${x}px, ${y}px) scale(${isHovering ? 1.5 : 1})`;
});

document.querySelectorAll('a, button').forEach((el) => {
  el.addEventListener('mouseenter', () => {
    isHovering = true;
    cursorOutline.style.opacity = 0.5;
  });
  el.addEventListener('mouseleave', () => {
    isHovering = false;
    cursorOutline.style.opacity = 0.3;
  });
});

window.addEventListener('mousedown', () => {
  cursorOutline.style.transform += ' scale(0.8)';
});
window.addEventListener('mouseup', () => {
  cursorOutline.style.transform = cursorOutline.style.transform.replace(' scale(0.8)', '');
});

//------Experince Counting------//
function updateExperience() {
  const startDate = new Date("2023-02-20");
  const today = new Date();

  let diff = today - startDate;

  let years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
  diff -= years * 1000 * 60 * 60 * 24 * 365;

  let months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
  diff -= months * 1000 * 60 * 60 * 24 * 30.44;

  let days = Math.floor(diff / (1000 * 60 * 60 * 24));

  document.getElementById("expTime").textContent =
    `${years} Years, ${months} Months, ${days} Days (Feb 2023 — Present)`;
}

updateExperience();
setInterval(updateExperience, 1000 * 60 * 60 * 24);