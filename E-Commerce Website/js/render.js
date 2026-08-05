/* =========================================================
   SHOPINGO - SHARED RENDER HELPERS
   Product card, mini product, and delegated click handlers
   for add-to-cart / wishlist.
   ========================================================= */

function renderProductCard(p) {
  const wished = ShopingoCart.isWishlisted(p.id);
  return `
  <div class="col">
    <div class="card product-card border rounded-0">
      <div class="position-relative overflow-hidden">
        <div class="add-cart position-absolute top-0 end-0 mt-3 me-3">
          <a href="javascript:;" data-quickadd-id="${p.id}" title="Quick Add"><i class='bx bx-cart-add'></i></a>
        </div>
        <div class="quick-view position-absolute start-0 bottom-0 end-0">
          <a href="product-detail.html?id=${p.id}">Quick View</a>
        </div>
        <a href="product-detail.html?id=${p.id}">
          <img src="${p.image}" class="img-fluid" alt="${escapeHtml(p.title)}" loading="lazy" style="mix-blend-mode:multiply;padding:22px;height:210px;width:100%;object-fit:contain;">
        </a>
      </div>
      <div class="card-body px-3">
        <div class="d-flex align-items-center justify-content-between">
          <div class="">
            <p class="mb-1 product-short-name text-uppercase font-12 text-muted">${formatCategory(p.category)}</p>
            <h6 class="mb-0 fw-bold product-short-title">${truncate(escapeHtml(p.title), 30)}</h6>
          </div>
          <div class="icon-wishlist">
            <a href="javascript:;" class="wishlist-btn ${wished ? "active" : ""}" data-wishlist-id="${p.id}"><i class="bx ${wished ? "bxs-heart" : "bx-heart"}"></i></a>
          </div>
        </div>
        <div class="cursor-pointer rating mt-2">${buildStars(p.rating ? p.rating.rate : 4)}</div>
        <div class="product-price d-flex align-items-center justify-content-start gap-2 mt-2">
          <div class="h6 fw-light text-secondary text-decoration-line-through mb-0">$${withStrikePrice(p.price)}</div>
          <div class="h6 fw-bold mb-0">$${p.price.toFixed(2)}</div>
        </div>
      </div>
    </div>
  </div>`;
}

function renderMiniProduct(p) {
  return `
  <div class="d-flex align-items-center gap-3 mb-3">
    <div class="bottom-product-img">
      <a href="product-detail.html?id=${p.id}">
        <img src="${p.image}" width="80" alt="${escapeHtml(p.title)}" style="object-fit:contain;background:#f6f6f6;padding:6px;mix-blend-mode:multiply;">
      </a>
    </div>
    <div class="">
      <h6 class="mb-0 fw-light mb-1 fw-bold" style="font-size:13px;">${truncate(escapeHtml(p.title), 28)}</h6>
      <div class="rating">${buildStars(p.rating ? p.rating.rate : 4)}</div>
      <p class="mb-0 pro-price fw-bold">$${p.price.toFixed(2)}</p>
    </div>
  </div>
  ${p !== undefined ? "<hr/>" : ""}`;
}

function truncate(str, len) {
  return str && str.length > len ? str.slice(0, len).trim() + "..." : str || "";
}

function escapeHtml(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/** All product-card click behaviour delegated to <body> */
document.addEventListener("click", async (e) => {
  /* Wishlist toggle */
  const wishBtn = e.target.closest("[data-wishlist-id]");
  if (wishBtn) {
    e.preventDefault();
    const id = Number(wishBtn.dataset.wishlistId);
    let product = _findCachedProduct(id);
    if (!product) {
      product = await ShopingoAPI.getProduct(id);
    }
    const nowActive = ShopingoCart.toggleWishlist(product);
    wishBtn.classList.toggle("active", nowActive);
    wishBtn.querySelector("i").className = nowActive ? "bx bxs-heart" : "bx bx-heart";
    showToast(nowActive ? "Added to wishlist" : "Removed from wishlist", "bxs-heart");
    return;
  }

  /* Quick add to cart */
  const quickAddBtn = e.target.closest("[data-quickadd-id]");
  if (quickAddBtn) {
    e.preventDefault();
    const id = Number(quickAddBtn.dataset.quickaddId);
    let product = _findCachedProduct(id);
    if (!product) {
      product = await ShopingoAPI.getProduct(id);
    }
    ShopingoCart.addToCart(product, 1);
    showToast("Added to cart", "bxs-cart-add");
    return;
  }
});

/** In-memory cache for rendered products */
let _productLookupCache = {};
function cacheProducts(list) {
  list.forEach((p) => (_productLookupCache[p.id] = p));
}
function _findCachedProduct(id) {
  return _productLookupCache[id];
}
