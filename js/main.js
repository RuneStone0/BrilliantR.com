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

  /* Web3Forms — free backend (250 submissions/month). Access key is public;
     it just routes submissions to your verified email. */
  const CONTACT_ENDPOINT = "https://api.web3forms.com/submit";
  const ACCESS_KEY = "a8dbcc10-389a-4ffd-9bc3-9e99c0df3f3b";

  function setFormStatus(message) {
    if (!formStatus) return;
    formStatus.classList.add("is-visible");
    formStatus.textContent = message;
  }

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = (form.elements.name.value || "").trim();
      const company = (form.elements.company.value || "").trim();
      const email = (form.elements.email.value || "").trim();
      const message = (form.elements.message.value || "").trim();

      if (!name || !email || !message) return;

      setFormStatus("Sending…");

      const botcheck = form.elements.botcheck ? form.elements.botcheck.value : "";

      try {
        const response = await fetch(CONTACT_ENDPOINT, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            access_key: ACCESS_KEY,
            name,
            company,
            email,
            message,
            botcheck,
            _replyto: email,
            _subject: "BrilliantR website inquiry from " + name,
          }),
        });

        if (response.ok) {
          form.reset();
          setFormStatus("Thanks, " + name + " — your message is on its way. We'll reply to " + email + " soon.");
        } else if (response.status === 429) {
          setFormStatus("We've hit our monthly message limit. Please email us directly at hello@brilliantr.com.");
        } else {
          setFormStatus("Something went wrong sending your message. Please email us directly at hello@brilliantr.com.");
        }
      } catch (err) {
        setFormStatus("Couldn't reach the server. Please email us directly at hello@brilliantr.com.");
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

    /* Size the slide area to the active headline so the CTA stays close
       to the copy — no dead space left over from shorter slides. */
    function sizeToActive() {
      const active = slides[current];
      if (!active) return;
      carousel.style.height = active.offsetHeight + "px";
    }

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const active = i === current;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
        if (dots[i]) {
          dots[i].classList.toggle("is-active", active);
          dots[i].tabIndex = active ? 0 : -1;
        }
      });
      sizeToActive();
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
        dot.focus();
      });
    });

    /* Roving tabindex + arrow-key navigation between the slide dots. */
    const dotsWrap = document.getElementById("hero-dots");
    if (dotsWrap) {
      dotsWrap.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        const activeIndex = Array.prototype.indexOf.call(dots, document.activeElement);
        if (activeIndex === -1) return;
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const nextIndex = (activeIndex + direction + dots.length) % dots.length;
        dots[nextIndex].focus();
        showSlide(nextIndex);
        pause();
        startAuto();
      });
    }

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

    showSlide(0);
    startAuto();

    // Keep the slide area in sync with layout-affecting changes.
    let resizeTimer = 0;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(sizeToActive, 150);
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(sizeToActive);
    }
  }

  initHeroSlides();
})();