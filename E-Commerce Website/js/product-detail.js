/* =========================================================
   SHOPINGO - PRODUCT DETAIL PAGE
   Reads ?id= from URL, fetches product and related items.
   ========================================================= */

let currentProduct = null;
let currentQty = 1;

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));

  if (!id) {
    window.location.href = "products.html";
    return;
  }

  try {
    const [product, categories] = await Promise.all([
      ShopingoAPI.getProduct(id),
      ShopingoAPI.getCategories(),
    ]);
    currentProduct = product;
    cacheProducts([product]);

    renderFooterCategories(categories);
    renderProductDetail(product);
    loadRelated(product);
  } catch (err) {
    console.error(err);
    document.getElementById("productDetailContainer").innerHTML =
      `<div class="text-center py-5"><i class="bx bx-error-circle" style="font-size:40px;color:#ccc;"></i><p class="mt-3">Product not found. <a href="products.html">Back to shop</a></p></div>`;
  }
});

function renderProductDetail(p) {
  document.title = `${p.title} | Shopingo`;
  const titleEl = document.getElementById("pageTitle");
  if (titleEl) titleEl.textContent = `${p.title} | Shopingo`;
  const breadcrumbEl = document.getElementById("breadcrumbTitle");
  if (breadcrumbEl) breadcrumbEl.textContent = truncate(p.title, 40);

  const wished = ShopingoCart.isWishlisted(p.id);

  document.getElementById("productDetailContainer").innerHTML = `
    <div class="row g-5">
      <div class="col-lg-6">
        <div class="product-detail-body">
          <div class="product-gallery border mb-3 p-4 text-center" style="background:#f9f9f9;">
            <img src="${p.image}" alt="${escapeHtml(p.title)}" class="img-fluid" style="max-height:380px;mix-blend-mode:multiply;">
          </div>
          <div class="d-flex gap-2 justify-content-center">
            <div class="border p-2 cursor-pointer" style="width:78px;height:78px;background:#f9f9f9;">
              <img src="${p.image}" alt="thumb" class="img-fluid" style="max-height:68px;mix-blend-mode:multiply;margin:0 auto;">
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="product-info-section">
          <p class="cat-label mb-1 text-uppercase font-12 fw-bold">${formatCategory(p.category)}</p>
          <h3 class="mb-0">${escapeHtml(p.title)}</h3>
          <div class="product-rating d-flex align-items-center mt-2">
            <div class="rates cursor-pointer font-13">${buildStars(p.rating ? p.rating.rate : 4)}</div>
            <div class="ms-1"><p class="mb-0">(${p.rating ? p.rating.count : 0} reviews)</p></div>
          </div>
          <div class="d-flex align-items-center mt-3 gap-2 price-block">
            <h5 class="mb-0 text-decoration-line-through text-light-3">$${withStrikePrice(p.price)}</h5>
            <h4 class="mb-0">$${p.price.toFixed(2)}</h4>
          </div>
          <div class="mt-3">
            <h6>Description :</h6>
            <p class="mb-0">${escapeHtml(p.description)}</p>
          </div>
          <dl class="row mt-3">
            <dt class="col-sm-3">Category</dt>
            <dd class="col-sm-9">${formatCategory(p.category)}</dd>
            <dt class="col-sm-3">Availability</dt>
            <dd class="col-sm-9 text-success">In Stock</dd>
            <dt class="col-sm-3">SKU</dt>
            <dd class="col-sm-9">SHP-${String(p.id).padStart(4, "0")}</dd>
          </dl>
          <div class="d-flex align-items-center gap-3 mt-3">
            <div class="d-flex align-items-center border">
              <button class="btn btn-white border-0 px-3" id="qtyMinus">&minus;</button>
              <span class="px-3 fw-bold" id="qtyDisplay">1</span>
              <button class="btn btn-white border-0 px-3" id="qtyPlus">&plus;</button>
            </div>
          </div>
          <div class="d-flex gap-2 mt-3">
            <a href="javascript:;" class="btn btn-dark btn-ecomm" id="addToCartBtn"><i class="bx bxs-cart-add"></i> Add to Cart</a>
            <a href="javascript:;" class="btn btn-light btn-ecomm ${wished ? "active-wish" : ""}" id="wishlistDetailBtn"><i class="bx ${wished ? "bxs-heart" : "bx-heart"}"></i> Add to Wishlist</a>
          </div>
          <div class="mt-3 d-flex gap-3 social-share">
            <a href="#" class="text-dark"><i class="bx bxl-facebook-circle fs-4"></i></a>
            <a href="#" class="text-dark"><i class="bx bxl-twitter fs-4"></i></a>
            <a href="#" class="text-dark"><i class="bx bxl-pinterest-alt fs-4"></i></a>
          </div>
        </div>
      </div>
    </div>
  `;

  bindDetailControls(p);
}

function bindDetailControls(p) {
  const qtyDisplay = document.getElementById("qtyDisplay");

  document.getElementById("qtyMinus")?.addEventListener("click", () => {
    currentQty = Math.max(1, currentQty - 1);
    if (qtyDisplay) qtyDisplay.textContent = currentQty;
  });
  document.getElementById("qtyPlus")?.addEventListener("click", () => {
    currentQty += 1;
    if (qtyDisplay) qtyDisplay.textContent = currentQty;
  });

  document.getElementById("addToCartBtn")?.addEventListener("click", () => {
    ShopingoCart.addToCart(p, currentQty);
    showToast(`Added ${currentQty} item(s) to cart`, "bxs-cart-add");
  });

  document.getElementById("wishlistDetailBtn")?.addEventListener("click", function () {
    const nowActive = ShopingoCart.toggleWishlist(p);
    this.classList.toggle("active-wish", nowActive);
    this.querySelector("i").className = nowActive ? "bx bxs-heart" : "bx bx-heart";
    showToast(nowActive ? "Added to wishlist" : "Removed from wishlist", "bxs-heart");
  });
}

async function loadRelated(product) {
  try {
    const related = await ShopingoAPI.getProductsByCategory(product.category);
    const filtered = related.filter((p) => p.id !== product.id).slice(0, 4);
    cacheProducts(filtered);
    const el = document.getElementById("relatedProducts");
    if (el) el.innerHTML = filtered.map((p) => `<div class="col">${renderProductCard(p)}</div>`).join("");
  } catch (err) {
    console.error(err);
  }
}

function renderFooterCategories(categories) {
  const el = document.getElementById("footerCategories");
  if (!el) return;
  el.innerHTML = categories
    .map((cat) => `<li class="mb-1"><a href="products.html?category=${encodeURIComponent(cat)}"><i class='bx bx-chevron-right'></i> ${formatCategory(cat)}</a></li>`)
    .join("");
}
