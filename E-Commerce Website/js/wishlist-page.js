/* =========================================================
   SHOPINGO - WISHLIST PAGE
   Renders all wishlisted products from localStorage and
   allows quick add-to-cart or removal.
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  renderWishlist();
  try {
    const categories = await ShopingoAPI.getCategories();
    renderFooterCategories(categories);
  } catch (err) {
    console.error(err);
  }
});

function renderWishlist() {
  const items = ShopingoCart.getWishlist();
  const container = document.getElementById("wishlistContainer");

  if (!items.length) {
    container.innerHTML = `
      <div class="empty-cart text-center py-5">
        <i class='bx bx-heart' style="font-size:60px;color:#dee2e6;"></i>
        <h4 class="mt-3">Your wishlist is empty</h4>
        <p class="mb-4">Products you like will appear here. Tap the heart on any product to save it.</p>
        <a href="products.html" class="btn btn-dark btn-ecomm">Continue Shopping</a>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <h5 class="mb-0 fw-bold text-uppercase">My Wishlist (${items.length})</h5>
      <button class="btn btn-outline-danger btn-ecomm" id="clearWishlistBtn"><i class='bx bx-trash'></i> Clear All</button>
    </div>
    <div class="row g-4 row-cols-2 row-cols-md-3 row-cols-lg-4" id="wishlistGrid">
      ${items.map(renderWishlistItem).join("")}
    </div>`;

  bindWishlistEvents();
}

function renderWishlistItem(item) {
  return `
  <div class="col">
    <div class="card product-card border rounded-0">
      <div class="position-relative overflow-hidden">
        <div class="icon-wishlist position-absolute top-0 end-0 mt-3 me-3">
          <a href="javascript:;" class="wishlist-remove bg-white rounded-circle d-inline-flex align-items-center justify-content-center" data-wishlist-remove="${item.id}" title="Remove from wishlist" style="width:34px;height:34px;color:#e0455b;box-shadow:0 2px 8px rgba(0,0,0,.1);">
            <i class='bx bxs-heart'></i>
          </a>
        </div>
        <div class="quick-view position-absolute start-0 bottom-0 end-0">
          <a href="product-detail.html?id=${item.id}">View Product</a>
        </div>
        <a href="product-detail.html?id=${item.id}">
          <img src="${item.image}" class="img-fluid" alt="${escapeHtml(item.title)}" loading="lazy" style="mix-blend-mode:multiply;padding:22px;height:210px;width:100%;object-fit:contain;">
        </a>
      </div>
      <div class="card-body px-3">
        <p class="mb-1 product-short-name text-uppercase font-12 text-muted">${formatCategory(item.category) || "Product"}</p>
        <h6 class="mb-0 fw-bold product-short-title">${truncate(escapeHtml(item.title), 30)}</h6>
        <div class="product-price d-flex align-items-center justify-content-start gap-2 mt-2">
          <div class="h6 fw-light text-secondary text-decoration-line-through mb-0">$${withStrikePrice(item.price)}</div>
          <div class="h6 fw-bold mb-0">$${item.price.toFixed(2)}</div>
        </div>
        <button class="btn btn-dark btn-ecomm w-100 mt-3" data-wishlist-addcart="${item.id}"><i class='bx bxs-cart-add'></i> Add to Cart</button>
      </div>
    </div>
  </div>`;
}

function bindWishlistEvents() {
  document.querySelectorAll("[data-wishlist-remove]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const id = Number(btn.dataset.wishlistRemove);
      const product = ShopingoCart.getWishlist().find((i) => i.id === id);
      if (product) {
        ShopingoCart.toggleWishlist(product);
        showToast("Removed from wishlist", "bxs-heart");
        renderWishlist();
      }
    });
  });

  document.querySelectorAll("[data-wishlist-addcart]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const id = Number(btn.dataset.wishlistAddcart);
      let product = _findCachedProduct(id);
      if (!product) {
        product = await ShopingoAPI.getProduct(id);
      }
      ShopingoCart.addToCart({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        category: product.category,
      }, 1);
      showToast("Added to cart", "bxs-cart-add");
    });
  });

  const clearBtn = document.getElementById("clearWishlistBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      const all = ShopingoCart.getWishlist();
      all.forEach((p) => {
        if (ShopingoCart.isWishlisted(p.id)) ShopingoCart.toggleWishlist(p);
      });
      showToast("Wishlist cleared", "bxs-heart");
      renderWishlist();
    });
  }
}

function renderFooterCategories(categories) {
  const el = document.getElementById("footerCategories");
  if (!el) return;
  el.innerHTML = categories
    .map(
      (cat) =>
        `<li><a href="products.html?category=${encodeURIComponent(cat)}"><i class='bx bx-chevron-right'></i> ${formatCategory(cat)}</a></li>`,
    )
    .join("");
}
