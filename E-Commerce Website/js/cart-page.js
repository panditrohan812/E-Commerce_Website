/* =========================================================
   SHOPINGO - CART PAGE
   Renders cart table from localStorage with quantity controls.
   ========================================================= */

const SHIPPING_FLAT = 9.99;
const FREE_SHIPPING_THRESHOLD = 49;

document.addEventListener("DOMContentLoaded", async () => {
  renderCart();
  try {
    const categories = await ShopingoAPI.getCategories();
    renderFooterCategories(categories);
  } catch (err) {
    console.error(err);
  }
});

function renderCart() {
  const items = ShopingoCart.getCart();
  const container = document.getElementById("cartContainer");
  if (!container) return;

  if (!items.length) {
    container.innerHTML = `
      <div class="empty-cart text-center py-5">
        <i class="bx bx-cart" style="font-size:60px;color:#ccc;"></i>
        <h4 class="mt-3">Your cart is empty</h4>
        <p class="mb-4">Looks like you haven't added anything yet.</p>
        <a href="products.html" class="btn btn-dark btn-ecomm">Continue Shopping</a>
      </div>`;
    return;
  }

  const subtotal = ShopingoCart.getCartTotal();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const total = subtotal + shipping;

  container.innerHTML = `
    <div class="row g-5">
      <div class="col-lg-8">
        <div class="table-responsive">
          <table class="table table-bordered align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width:300px;">Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="cartTableBody">
              ${items.map(rowTemplate).join("")}
            </tbody>
          </table>
        </div>
        <div class="d-flex justify-content-between mt-4">
          <a href="products.html" class="btn btn-outline-dark btn-ecomm"><i class="bx bx-arrow-back"></i> Continue Shopping</a>
          <button class="btn btn-danger btn-ecomm" id="clearCartBtn">Clear Cart</button>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card border">
          <div class="card-body">
            <h5 class="mb-4 fw-bold">Order Summary</h5>
            <div class="d-flex justify-content-between mb-2"><span>Subtotal</span><span class="fw-bold">$${subtotal.toFixed(2)}</span></div>
            <div class="d-flex justify-content-between mb-2"><span>Shipping</span><span class="fw-bold">${shipping === 0 ? "FREE" : "$" + shipping.toFixed(2)}</span></div>
            <hr>
            <div class="d-flex justify-content-between mb-3"><span class="h5">Total</span><span class="h5">$${total.toFixed(2)}</span></div>
            <button class="btn btn-dark btn-ecomm w-100" id="checkoutBtn">Proceed to Checkout</button>
            ${subtotal < FREE_SHIPPING_THRESHOLD ? `<p class="mt-2 text-muted font-13">Add $${(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} more for free shipping!</p>` : ""}
          </div>
        </div>
      </div>
    </div>
  `;

  bindCartEvents();
}

function rowTemplate(item) {
  return `
  <tr data-id="${item.id}">
    <td>
      <div class="d-flex align-items-center gap-3">
        <img src="${item.image}" alt="${escapeHtml(item.title)}" style="width:70px;height:70px;object-fit:contain;background:#f6f6f6;padding:6px;mix-blend-mode:multiply;">
        <div>
          <h6 class="mb-1">${escapeHtml(item.title)}</h6>
          <span class="font-13 text-muted text-uppercase">${formatCategory(item.category)}</span>
        </div>
      </div>
    </td>
    <td>$${item.price.toFixed(2)}</td>
    <td>
      <div class="d-flex align-items-center border" style="width:fit-content;">
        <button class="btn btn-white border-0 px-3 qty-decrease">&minus;</button>
        <span class="px-3 qty-value">${item.qty}</span>
        <button class="btn btn-white border-0 px-3 qty-increase">&plus;</button>
      </div>
    </td>
    <td class="fw-bold row-subtotal">$${(item.price * item.qty).toFixed(2)}</td>
    <td><button class="btn btn-sm btn-outline-danger remove-item"><i class="bx bx-trash"></i></button></td>
  </tr>`;
}

function bindCartEvents() {
  document.querySelectorAll("#cartTableBody tr").forEach((row) => {
    const id = Number(row.dataset.id);

    row.querySelector(".qty-increase")?.addEventListener("click", () => {
      const item = ShopingoCart.getCart().find((i) => i.id === id);
      ShopingoCart.updateQty(id, item.qty + 1);
      renderCart();
    });
    row.querySelector(".qty-decrease")?.addEventListener("click", () => {
      const item = ShopingoCart.getCart().find((i) => i.id === id);
      if (item.qty <= 1) return;
      ShopingoCart.updateQty(id, item.qty - 1);
      renderCart();
    });
    row.querySelector(".remove-item")?.addEventListener("click", () => {
      ShopingoCart.removeFromCart(id);
      showToast("Item removed from cart", "bx-trash");
      renderCart();
    });
  });

  const clearBtn = document.getElementById("clearCartBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      ShopingoCart.clearCart();
      showToast("Cart cleared", "bx-trash");
      renderCart();
    });
  }

  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      showToast("This is a demo store - checkout is not implemented.", "bx-info-circle");
    });
  }
}

function renderFooterCategories(categories) {
  const el = document.getElementById("footerCategories");
  if (!el) return;
  el.innerHTML = categories
    .map((cat) => `<li class="mb-1"><a href="products.html?category=${encodeURIComponent(cat)}"><i class='bx bx-chevron-right'></i> ${formatCategory(cat)}</a></li>`)
    .join("");
}
