/* General site behavior: nav, smooth scroll, fade-in, contact form, footer year, hero carousel. */
(function () {
  "use strict";

  const header = document.getElementById("site-header");
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("nav-menu");
  const yearEl = document.getElementById("year");

  /* ——— Footer year ——— */
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ——— Mobile nav ——— */
  function setMenuOpen(open) {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.classList.toggle("is-open", open);
  }

  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      setMenuOpen(open);
    });
  }

  if (menu) {
    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });
  }

  /* ——— Sticky header shadow on scroll ——— */
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ——— Smooth scroll for in-page anchors ——— */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = document.getElementById(hash.slice(1));
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setMenuOpen(false);

      try {
        history.replaceState(null, "", hash);
      } catch (err) {
        /* ignore */
      }
    });
  });

  /* ——— Fade-in on scroll ——— */
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -40px 0px", threshold: 0.08 }
    );

    document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));
  } else {
    document.querySelectorAll(".fade-in").forEach((el) => el.classList.add("is-visible"));
  }

  /* ——— Contact form ——— */
  const form = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = (form.elements.name.value || "").trim();
      const company = (form.elements.company.value || "").trim();
      const email = (form.elements.email.value || "").trim();
      const message = (form.elements.message.value || "").trim();

      if (!name || !email || !message) return;

      const subject = "BrilliantR inquiry from " + name;
      const body =
        "Name: " + name + "\n" +
        "Company: " + (company || "—") + "\n" +
        "Email: " + email + "\n\n" +
        message;

      const mailto =
        "mailto:hello@brilliantr.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      const mailLink = document.createElement("a");
      mailLink.href = mailto;
      mailLink.rel = "noopener";
      document.body.appendChild(mailLink);
      mailLink.click();
      document.body.removeChild(mailLink);

      if (formStatus) {
        formStatus.classList.add("is-visible");
        formStatus.innerHTML =
          'If your email app did not open, send your message to ' +
          '<a href="mailto:hello@brilliantr.com">hello@brilliantr.com</a>.';
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(body).then(
          () => {
            if (formStatus) {
              formStatus.innerHTML =
                'Message copied to your clipboard. Paste it into an email to ' +
                '<a href="mailto:hello@brilliantr.com">hello@brilliantr.com</a>.';
            }
          },
          () => { /* clipboard blocked */ }
        );
      }
    });
  }

  /* ——— Hero headline carousel ——— */
  function initHeroSlides() {
    const slides = document.querySelectorAll(".hero-slide");
    const dots = document.querySelectorAll(".hero-dot");
    const carousel = document.getElementById("hero-slides");
    if (!carousel || slides.length < 2 || dots.length !== slides.length) return;

    let current = 0;
    let timer = 0;
    let paused = false;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const active = i === current;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
        if (dots[i]) {
          dots[i].classList.toggle("is-active", active);
          dots[i].setAttribute("aria-selected", active ? "true" : "false");
        }
      });
    }

    function next() {
      showSlide(current + 1);
    }

    function stopAuto() {
      if (timer) {
        window.clearInterval(timer);
        timer = 0;
      }
    }

    function startAuto() {
      stopAuto();
      timer = window.setInterval(next, 12000);
    }

    function pause() {
      paused = true;
      stopAuto();
    }

    function resume() {
      paused = false;
      if (!document.hidden) startAuto();
    }

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        showSlide(index);
        pause();
        startAuto();
      });
    });

    const heroContent = carousel.parentElement;
    heroContent.addEventListener("mouseenter", pause);
    heroContent.addEventListener("mouseleave", resume);
    heroContent.addEventListener("focusin", pause);
    heroContent.addEventListener("focusout", () => {
      if (!heroContent.contains(document.activeElement)) resume();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopAuto();
      } else if (!paused) {
        startAuto();
      }
    });

    showSlide(Math.floor(Math.random() * slides.length));
    startAuto();
  }

  initHeroSlides();
})();