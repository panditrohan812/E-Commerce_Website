/* =========================================================
   SHOPINGO - CART MODULE
   localStorage persistence, cart + wishlist management,
   and badge/dropdown sync.
   ========================================================= */

const ShopingoCart = (() => {
  const STORAGE_KEY = "shopingo_cart";
  const WISHLIST_KEY = "shopingo_wishlist";

  function _read(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function _write(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  /* ---------------- CART ---------------- */

  function getCart() {
    return _read(STORAGE_KEY);
  }

  function saveCart(items) {
    _write(STORAGE_KEY, items);
    _refreshBadges();
    if (typeof renderCartDropdown === "function") renderCartDropdown();
  }

  function addToCart(product, qty = 1) {
    const items = getCart();
    const existing = items.find((i) => i.id === product.id);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        category: product.category,
        qty,
      });
    }
    saveCart(items);
    return items;
  }

  function updateQty(id, qty) {
    const items = getCart();
    const item = items.find((i) => i.id === id);
    if (item) {
      item.qty = Math.max(1, qty);
      saveCart(items);
    }
    return items;
  }

  function removeFromCart(id) {
    const items = getCart().filter((i) => i.id !== id);
    saveCart(items);
    return items;
  }

  function clearCart() {
    saveCart([]);
  }

  function getCartCount() {
    return getCart().reduce((sum, i) => sum + i.qty, 0);
  }

  function getCartTotal() {
    return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  /* ---------------- WISHLIST ---------------- */

  function getWishlist() {
    return _read(WISHLIST_KEY);
  }

  function toggleWishlist(product) {
    let items = getWishlist();
    const exists = items.find((i) => i.id === product.id);
    if (exists) {
      items = items.filter((i) => i.id !== product.id);
    } else {
      items.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
      });
    }
    _write(WISHLIST_KEY, items);
    _refreshBadges();
    return !exists;
  }

  function isWishlisted(id) {
    return getWishlist().some((i) => i.id === id);
  }

  function getWishlistCount() {
    return getWishlist().length;
  }

  /* ---------------- UI SYNC ---------------- */

  function _refreshBadges() {
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      el.textContent = getCartCount();
    });
    document.querySelectorAll("[data-wishlist-count]").forEach((el) => {
      el.textContent = getWishlistCount();
    });
  }

document.addEventListener("DOMContentLoaded", () => {
    _refreshBadges();
    if (typeof renderCartDropdown === "function") renderCartDropdown();
  });

  return {
    getCart,
    saveCart,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    getCartCount,
    getCartTotal,
    getWishlist,
    toggleWishlist,
    isWishlisted,
    getWishlistCount,
    refreshBadges: _refreshBadges,
  };
})();

/** Toast notification */
function showToast(message, icon = "bx-check-circle") {
  let toast = document.querySelector(".toast-notice");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast-notice";
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class='bx ${icon}'></i><span>${message}</span>`;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2400);
}

/** Renders the mini cart dropdown that appears in the header. */
function renderCartDropdown() {
  const listEl = document.getElementById("cartDropdownList");
  const totalEl = document.getElementById("cartDropdownTotal");
  if (!listEl) return;

  const items = ShopingoCart.getCart();
  if (!items.length) {
    listEl.innerHTML = `<div class="p-3 text-center text-muted font-13">Your cart is empty</div>`;
  } else {
    listEl.innerHTML = items
      .map(
        (i) => `
      <a class="dropdown-item" href="product-detail.html?id=${i.id}">
        <div class="d-flex align-items-center gap-3">
          <div class="flex-grow-1">
            <h6 class="cart-product-title mb-0">${escapeHtml(i.title)}</h6>
            <p class="cart-product-price mb-0">${i.qty} X $${(i.price * i.qty).toFixed(2)}</p>
          </div>
          <div class="position-relative">
            <div class="cart-product-cancel position-absolute" onclick="event.preventDefault();ShopingoCart.removeFromCart(${i.id});renderCartDropdown();">&times;</div>
            <div class="cart-product"><img src="${i.image}" alt="${escapeHtml(i.title)}"></div>
          </div>
        </div>
      </a>`,
      )
      .join("");
  }
  if (totalEl) {
    totalEl.textContent = "$" + ShopingoCart.getCartTotal().toFixed(2);
  }
}

/* Toast styles injected automatically */
(function injectToastStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .toast-notice {
      position: fixed; top: 20px; right: 20px;
      background: #212529; color: #fff;
      padding: 14px 22px; font-size: 13px;
      display: flex; align-items: center; gap: 10px;
      box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15);
      transform: translateX(140%);
      transition: transform 0.35s ease;
      z-index: 9999;
    }
    .toast-notice.show { transform: translateX(0); }
    .toast-notice i { color: #ffc107; font-size: 18px; }
  `;
  document.head.appendChild(style);
})();
