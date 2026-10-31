/* =========================================================
   DEVLANCE SOLUTIONS — SCRIPT
   1.  Setup & helpers
   2.  Navbar, scroll progress & back-to-top
   3.  Mobile menu
   4.  Active link highlighting
   5.  Reveal on scroll (+ tank bars)
   6.  Counter animation
   7.  Typing effect
   8.  Testimonials slider
   9.  FAQ accordion
   10. Contact form validation
   11. Button ripple
   12. Image fallback
   ========================================================= */
(function () {
  "use strict";

  /* ---------- 1. Setup & helpers ---------- */
  document.documentElement.classList.add("js");

  var $ = function (selector, scope) { return (scope || document).querySelector(selector); };
  var $$ = function (selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); };

  var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasObserver = "IntersectionObserver" in window;

  // Footer year
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 2. Navbar, scroll progress & back-to-top ---------- */
  var navbar = $("#navbar");
  var progress = $("#scrollProgress");
  var backTop = $("#backTop");
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var max = document.documentElement.scrollHeight - window.innerHeight;

    navbar.classList.toggle("scrolled", y > 24);
    backTop.classList.toggle("show", y > 600);
    progress.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  backTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  /* ---------- 3. Mobile menu ---------- */
  var navToggle = $("#navToggle");
  var navLinks = $("#navLinks");

  function setMenu(open) {
    navToggle.classList.toggle("open", open);
    navLinks.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
  }

  navToggle.addEventListener("click", function () {
    setMenu(!navLinks.classList.contains("open"));
  });

  $$("a", navLinks).forEach(function (link) {
    link.addEventListener("click", function () { setMenu(false); });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 1024) setMenu(false);
  });

  /* ---------- 4. Active link highlighting ---------- */
  var navAnchors = $$(".nav-link");
  var sections = navAnchors
    .map(function (a) { return $(a.getAttribute("href")); })
    .filter(Boolean);

  if (hasObserver) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = "#" + entry.target.id;
        navAnchors.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (section) { sectionObserver.observe(section); });
  }

  /* ---------- 5. Reveal on scroll (+ tank bars) ---------- */
  var revealItems = $$(".reveal");

  function fillTankBars(scope) {
    $$("[data-bar]", scope).forEach(function (bar) {
      bar.style.width = bar.getAttribute("data-bar") + "%";
    });
  }

  if (hasObserver && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add("visible");
        if (el.classList.contains("flagship")) fillTankBars(el);
        // remove stagger delay after the entrance so hover effects stay snappy
        window.setTimeout(function () { el.classList.add("revealed"); }, 1400);
        observer.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    revealItems.forEach(function (el) { revealObserver.observe(el); });
  } else {
    // Fallback: show everything immediately
    revealItems.forEach(function (el) { el.classList.add("visible", "revealed"); });
    fillTankBars(document);
  }

  /* ---------- 6. Counter animation ---------- */
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1900;
    var start = null;

    function format(value) {
      return decimals > 0
        ? value.toFixed(decimals)
        : Math.round(value).toLocaleString("en-US");
    }

    if (prefersReducedMotion) {
      el.textContent = format(target) + suffix;
      return;
    }

    function step(timestamp) {
      if (start === null) start = timestamp;
      var t = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 4); // easeOutQuart
      el.textContent = format(target * eased) + suffix;
      if (t < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  var counters = $$("[data-count]");
  if (hasObserver) {
    var counterObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------- 7. Typing effect ---------- */
  var typedEl = $("#typedText");
  var words = ["Petrol Pumps", "Retail Stores", "Growing Enterprises", "Mobile-First Teams"];

  if (typedEl) {
    if (prefersReducedMotion) {
      typedEl.textContent = words[0];
    } else {
      var wordIndex = 0;
      var charIndex = 0;
      var deleting = false;

      (function type() {
        var word = words[wordIndex];
        charIndex += deleting ? -1 : 1;
        typedEl.textContent = word.substring(0, charIndex);

        var delay = deleting ? 45 : 85;

        if (!deleting && charIndex === word.length) {
          delay = 1700; // pause on a finished word
          deleting = true;
        } else if (deleting && charIndex === 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          delay = 350;
        }
        window.setTimeout(type, delay);
      })();
    }
  }

  /* ---------- 8. Testimonials slider ---------- */
  var slider = $("#slider");
  if (slider) {
    var track = $("#sliderTrack");
    var slides = $$(".slide", track);
    var dotsWrap = $("#sliderDots");
    var current = 0;
    var autoplay = null;

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "dot";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Show testimonial " + (i + 1));
      dot.addEventListener("click", function () { goTo(i); restartAutoplay(); });
      dotsWrap.appendChild(dot);
    });
    var dots = $$(".dot", dotsWrap);

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = "translateX(-" + current * 100 + "%)";
      dots.forEach(function (d, i) {
        d.classList.toggle("active", i === current);
        d.setAttribute("aria-selected", String(i === current));
      });
    }

    function startAutoplay() {
      if (prefersReducedMotion) return;
      autoplay = window.setInterval(function () { goTo(current + 1); }, 6500);
    }
    function stopAutoplay() { window.clearInterval(autoplay); }
    function restartAutoplay() { stopAutoplay(); startAutoplay(); }

    $("#prevBtn").addEventListener("click", function () { goTo(current - 1); restartAutoplay(); });
    $("#nextBtn").addEventListener("click", function () { goTo(current + 1); restartAutoplay(); });

    slider.addEventListener("mouseenter", stopAutoplay);
    slider.addEventListener("mouseleave", startAutoplay);

    // Touch swipe support
    var touchStartX = 0;
    slider.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].clientX;
      stopAutoplay();
    }, { passive: true });
    slider.addEventListener("touchend", function (e) {
      var delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 50) goTo(current + (delta < 0 ? 1 : -1));
      startAutoplay();
    }, { passive: true });

    goTo(0);
    startAutoplay();
  }

  /* ---------- 9. FAQ accordion ---------- */
  var faqItems = $$(".faq-item");

  faqItems.forEach(function (item) {
    var button = $(".faq-q", item);
    button.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");

      // close all, then open the clicked one (single-open accordion)
      faqItems.forEach(function (other) {
        other.classList.remove("open");
        $(".faq-q", other).setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        item.classList.add("open");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });

  // Open the first question by default
  if (faqItems.length) {
    faqItems[0].classList.add("open");
    $(".faq-q", faqItems[0]).setAttribute("aria-expanded", "true");
  }

  /* ---------- 10. Contact form validation ---------- */
  var form = $("#contactForm");

  if (form) {
    var submitBtn = $("#submitBtn");
    var successMsg = $("#formSuccess");

    var rules = {
      name: function (v) {
        if (!v.trim()) return "Please enter your name.";
        if (v.trim().length < 2) return "Name must be at least 2 characters.";
        return "";
      },
      email: function (v) {
        if (!v.trim()) return "Please enter your email address.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return "Please enter a valid email address.";
        return "";
      },
      phone: function (v) {
        if (v.trim() && !/^[+\d][\d\s()\-]{6,}$/.test(v.trim())) return "Please enter a valid phone number.";
        return "";
      },
      service: function (v) {
        return v ? "" : "Please choose a service.";
      },
      message: function (v) {
        if (!v.trim()) return "Please tell us about your project.";
        if (v.trim().length < 10) return "Please add a little more detail (10+ characters).";
        return "";
      }
    };

    function validateField(name) {
      var input = form.elements[name];
      var field = input.closest(".field");
      var errorEl = $('[data-error-for="' + name + '"]', form);
      var message = rules[name](input.value);

      field.classList.toggle("invalid", Boolean(message));
      errorEl.textContent = message;
      return !message;
    }

    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      input.addEventListener("blur", function () { validateField(name); });
      input.addEventListener("input", function () {
        if (input.closest(".field").classList.contains("invalid")) validateField(name);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      successMsg.classList.remove("show");

      var allValid = Object.keys(rules).map(validateField).every(Boolean);
      if (!allValid) {
        var firstInvalid = $(".field.invalid input, .field.invalid select, .field.invalid textarea", form);
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // NOTE: This is a front-end demo. To receive real enquiries, replace the
      // timeout below with a fetch() call to your backend or a form service
      // (for example Formspree, EmailJS or your own API endpoint).
      submitBtn.classList.add("loading");
      window.setTimeout(function () {
        submitBtn.classList.remove("loading");
        form.reset();
        successMsg.classList.add("show");
        window.setTimeout(function () { successMsg.classList.remove("show"); }, 9000);
      }, 1400);
    });
  }

  /* ---------- 11. Button ripple ---------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".btn");
    if (!btn || prefersReducedMotion) return;

    var rect = btn.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height);
    var ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = e.clientX - rect.left - size / 2 + "px";
    ripple.style.top = e.clientY - rect.top - size / 2 + "px";
    btn.appendChild(ripple);
    window.setTimeout(function () { ripple.remove(); }, 650);
  });

  /* ---------- 12. Image fallback ---------- */
  $$("img[data-fallback]").forEach(function (img) {
    function handleError() {
      if (!img.dataset.retried) {
        img.dataset.retried = "1";
        img.src = "https://picsum.photos/seed/" + img.getAttribute("data-fallback") + "/1000/1100";
      } else {
        img.style.display = "none"; // the gradient frame behind remains visible
      }
    }
    img.addEventListener("error", handleError);
    if (img.complete && img.naturalWidth === 0 && img.src) handleError();
  });
})();
