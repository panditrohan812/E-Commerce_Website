/* =========================================================
   SHOPINGO - MAIN SITE BEHAVIOUR
   Global: back-to-top, search, carousel init, scroll reveal.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Reset scroll position on refresh (no mid-page jump/bounce) ---------- */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  /* ---------- Back to top ---------- */
  const backToTop = document.getElementById("backToTop");
  if (backToTop) {
    window.addEventListener("scroll", () => {
      backToTop.classList.toggle("show", window.scrollY > 400);
    });
    backToTop.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

/* ---------- Navbar Contact -> smooth scroll to footer (no hash in URL) ---------- */
  const contactLink = document.getElementById("navContactLink");
  if (contactLink) {
    contactLink.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.getElementById("footerContact");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* ---------- Header search ---------- */
  const searchBtn = document.getElementById("headerSearchBtn");
  const searchInput = document.getElementById("headerSearchInput");
  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => {
      const q = searchInput.value.trim();
      window.location.href = `products.html${q ? "?q=" + encodeURIComponent(q) : ""}`;
    });
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        searchBtn.click();
      }
    });
  }

  /* ---------- Owl Carousel :: Banner Slider ---------- */
  if (typeof $ !== "undefined" && $.fn.owlCarousel) {
    $(".banner-slider").owlCarousel({
      loop: true,
      autoplay: true,
      autoplayTimeout: 5000,
      autoplaySpeed: 800,
      smartSpeed: 800,
      nav: true,
      navText: ["<i class='bx bx-chevron-left'></i>", "<i class='bx bx-chevron-right'></i>"],
      dots: false,
      items: 1,
    });

    $(".brands-shops").owlCarousel({
      loop: true,
      autoplay: true,
      autoplayTimeout: 3500,
      smartSpeed: 500,
      margin: 0,
      nav: false,
      dots: false,
      responsive: { 0: { items: 2 }, 576: { items: 3 }, 768: { items: 4 }, 992: { items: 5 }, 1200: { items: 6 } },
    });
  }
});


