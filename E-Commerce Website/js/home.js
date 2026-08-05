/* =========================================================
   SHOPINGO - HOME PAGE
   Fills every dynamic section of the landing page
   with live data from the FakeStore API.
   ========================================================= */

const CATEGORY_IMAGES = {
  "men's clothing": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=200&q=80",
  "women's clothing": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&q=80",
  jewelery: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&q=80",
  electronics: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&q=80",
};

const BLOG_POSTS = [
  { img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80", title: "5 Wardrobe Staples for Every Season", excerpt: "A capsule wardrobe saves time and money. Here are the pieces worth investing in this year." },
  { img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80", title: "How to Shop Smarter This Sale Season", excerpt: "Simple tips to make the most of end of season discounts without overspending." },
  { img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80", title: "Beauty Essentials You Shouldn't Skip", excerpt: "Our editors round up the cosmetics staples worth keeping in every routine." },
  { img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&q=80", title: "Meet the Team Behind Shopingo", excerpt: "A behind the scenes look at the people curating your favourite products." },
];

document.addEventListener("DOMContentLoaded", init);

async function init() {
  try {
    const [allProducts, categories] = await Promise.all([
      ShopingoAPI.getAllProducts(),
      ShopingoAPI.getCategories(),
    ]);
    cacheProducts(allProducts);

    renderFeatured(allProducts);
    renderNewArrivals(allProducts);
    renderBrowseCategory(categories, allProducts);
    renderMiniLists(allProducts);
    renderFooterCategories(categories);
    renderBlog();
    renderCartDropdown();
  } catch (err) {
    console.error(err);
    showToast("Could not load products. Please check your connection.", "bx-wifi-off");
  }
}

function renderFeatured(products) {
  const el = document.getElementById("featuredProducts");
  if (!el) return;
  const list = shuffle([...products]).slice(0, 10);
  el.innerHTML = list.map(renderProductCard).join("");
}

function renderNewArrivals(products) {
  const el = document.getElementById("newArrivalsCarousel");
  if (!el) return;
  const list = shuffle([...products]).slice(0, 8);
  el.innerHTML = list.map((p) => `<div class="item">${renderProductCard(p)}</div>`).join("");
  // Re-init owl
  if (typeof $ !== "undefined" && $.fn.owlCarousel) {
    $(el).trigger("destroy.owl.carousel");
    setTimeout(() => {
      $(el).owlCarousel({
        loop: true, autoplay: true, autoplayTimeout: 4000, smartSpeed: 600, margin: 16,
        nav: false, dots: true,
        responsive: { 0: { items: 2 }, 576: { items: 2 }, 768: { items: 3 }, 992: { items: 4 }, 1200: { items: 5 } },
      });
    }, 100);
  }
}

function renderBrowseCategory(categories, allProducts) {
  const el = document.getElementById("browseCategory");
  if (!el) return;
  el.innerHTML = categories
    .map((cat) => {
      const count = allProducts.filter((p) => p.category === cat).length;
      const img = CATEGORY_IMAGES[cat] || "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=200&q=80";
      return `
      <div class="col">
        <a href="products.html?category=${encodeURIComponent(cat)}" class="browse-cat-card card rounded-0">
          <div class="card-body p-0">
            <img src="${img}" class="img-fluid" alt="${formatCategory(cat)}">
          </div>
          <div class="card-footer text-center bg-transparent border">
            <h6 class="mb-0 text-uppercase fw-bold">${formatCategory(cat)}</h6>
            <p class="mb-0 font-12 text-uppercase">${count} Products</p>
          </div>
        </a>
      </div>`;
    })
    .join("");
}

function renderMiniLists(products) {
  const byRatingCount = [...products].sort((a, b) => b.rating.count - a.rating.count);
  const byRating = [...products].sort((a, b) => b.rating.rate - a.rating.rate);
  const shuffledA = shuffle([...products]);
  const shuffledB = shuffle([...products]);

  const setList = (id, list) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = list.slice(0, 4).map(renderMiniProduct).join("");
  };
  setList("bestSellingList", byRatingCount);
  setList("featuredList", shuffledA);
  setList("newArrivalsList", shuffledB);
  setList("topRatedList", byRating);
}

function renderFooterCategories(categories) {
  const el = document.getElementById("footerCategories");
  if (!el) return;
  el.innerHTML = categories
    .map(
      (cat) =>
        `<li class="mb-1"><a href="products.html?category=${encodeURIComponent(cat)}"><i class='bx bx-chevron-right'></i> ${formatCategory(cat)}</a></li>`
    )
    .join("");
}

function renderBlog() {
  const el = document.getElementById("latestNewsCarousel");
  if (!el) return;
  el.innerHTML = BLOG_POSTS.map(
    (post) => `
    <div class="item">
      <div class="card rounded-0 product-card border news-card">
        <div class="news-date">
          <div class="date-number">${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}</div>
          <div class="date-month">${["JAN", "FEB", "MAR", "APR", "MAY", "JUN"][Math.floor(Math.random() * 6)]}</div>
        </div>
        <a href="javascript:;">
          <img src="${post.img}" class="card-img-top border-bottom" alt="${post.title}">
        </a>
        <div class="card-body">
          <div class="news-title">
            <a href="javascript:;"><h5 class="mb-3 text-capitalize">${post.title}</h5></a>
          </div>
          <p class="news-content mb-0">${post.excerpt}</p>
        </div>
        <div class="card-footer border-top bg-transparent">
          <a href="javascript:;" class="link-dark">0 Comments</a>
        </div>
      </div>
    </div>`
  ).join("");

  if (typeof $ !== "undefined" && $.fn.owlCarousel) {
    $(el).trigger("destroy.owl.carousel");
    setTimeout(() => {
      $(el).owlCarousel({
        loop: true, autoplay: true, autoplayTimeout: 4500, smartSpeed: 600, margin: 16,
        nav: false, dots: true,
        responsive: { 0: { items: 1 }, 576: { items: 2 }, 992: { items: 3 }, 1200: { items: 4 } },
      });
    }, 100);
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
