/* =========================================================
   SHOPINGO - API LAYER
   All product data is fetched live from the public FakeStore API.
   https://fakestoreapi.com
   ========================================================= */

const API_BASE = "https://fakestoreapi.com";

const ShopingoAPI = (() => {
  let _allProductsCache = null;
  let _categoriesCache = null;

  /** Fetch every product. Cached after first call. */
  async function getAllProducts() {
    if (_allProductsCache) return _allProductsCache;
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error("Failed to load products");
    const data = await res.json();
    _allProductsCache = data;
    return data;
  }

  /** Fetch a single product by id. */
  async function getProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error("Product not found");
    return res.json();
  }

  /** Fetch all category names. */
  async function getCategories() {
    if (_categoriesCache) return _categoriesCache;
    const res = await fetch(`${API_BASE}/products/categories`);
    if (!res.ok) throw new Error("Failed to load categories");
    const data = await res.json();
    _categoriesCache = data;
    return data;
  }

  /** Fetch products belonging to one category. */
  async function getProductsByCategory(category) {
    const res = await fetch(
      `${API_BASE}/products/category/${encodeURIComponent(category)}`,
    );
    if (!res.ok) throw new Error("Failed to load category products");
    return res.json();
  }

  /** Fetch a limited/sorted slice, used for homepage rows. */
  async function getProducts({ limit, sort } = {}) {
    let url = `${API_BASE}/products?`;
    if (limit) url += `limit=${limit}&`;
    if (sort) url += `sort=${sort}&`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to load products");
    return res.json();
  }

  return {
    getAllProducts,
    getProduct,
    getCategories,
    getProductsByCategory,
    getProducts,
  };
})();

/** Pretty print a raw API category string, e.g. "men's clothing" -> "Men's Clothing" */
function formatCategory(cat) {
  if (!cat) return "";
  return cat.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Deterministic pseudo "original price" so every card shows a discount, like the reference design. */
function withStrikePrice(price) {
  const inflated = price * 1.25;
  return inflated.toFixed(2);
}

/** Build a star rating string (used across cards) */
function buildStars(rate) {
  const rounded = Math.round(rate || 4);
  let html = "";
  for (let i = 1; i <= 5; i++) {
    html +=
      i <= rounded
        ? '<i class="bx bxs-star text-warning"></i>'
        : '<i class="bx bx-star text-warning"></i>';
  }
  return html;
}
