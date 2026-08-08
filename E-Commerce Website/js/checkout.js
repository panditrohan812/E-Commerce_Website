/* =========================================================
   SHOPINGO - SIMPLE CHECKOUT PAGE
   -----------------------------------------------------------------
   Yeh page cart (localStorage) se items padhta hai,
   customer ki details leta hai aur order place karke
   cart ko clear kar deta hai.

   NOTE: Real website pe payment hume server se karni hoti hai.
   Yahan sirf demo ke liye simple logic hai, taaki aapko
   pura flow samajh aaye.
   ========================================================= */

// Jab page load ho jaye
document.addEventListener("DOMContentLoaded", () => {
  showCartSummary(); // Right side summary dikhao
  handlePaymentChange(); // Selected payment ke hisaab se card fields dikhao
  setupSearch(); // Header search form

  // Form submit hone par order place karo
  document.getElementById("checkoutForm").addEventListener("submit", (event) => {
    event.preventDefault(); // page refresh na ho
    placeOrder(); // order place karo
  });

  // Payment radio buttons change hone par card details dikhao/chhupao
  document.querySelectorAll('input[name="payment"]').forEach((radio) => {
    radio.addEventListener("change", handlePaymentChange);
  });
});

/* =========================================================
   STEP 1: Order summary ko dikhana (right side)
   ========================================================= */
function showCartSummary() {
  const cart = ShopingoCart.getCart();          // cart se items lo
  const container = document.getElementById("summaryItems");

  // Agar cart khali hai
  if (cart.length === 0) {
    container.innerHTML = '<p class="text-muted">Your cart is empty.</p>';
    document.getElementById("subtotal").textContent = "$0.00";
    document.getElementById("total").textContent = "$0.00";
    return;
  }

  // Har item ko HTML me dikhao
  container.innerHTML = cart.map((item) => `
    <div class="d-flex justify-content-between align-items-center mb-2" style="font-size:13px;">
      <span>${item.title} <small>x${item.qty}</small></span>
      <strong>$${(item.price * item.qty).toFixed(2)}</strong>
    </div>
  `).join("");

  // Total update karo
  const subtotal = ShopingoCart.getCartTotal(); // ShopingoCart se total nikalo
  document.getElementById("subtotal").textContent = "$" + subtotal.toFixed(2);
  document.getElementById("shipping").textContent = "$0.00"; // demo: free shipping
  document.getElementById("total").textContent = "$" + subtotal.toFixed(2);
}

/* =========================================================
   STEP 2: Payment select hone par card fields dikhna
   ========================================================= */
function handlePaymentChange() {
  const selected = document.querySelector('input[name="payment"]:checked').value;
  // Sirf "Credit/Debit Card" chune par card details dikhao
  const showCard = selected === "Credit / Debit Card";
  document.getElementById("cardDetails").style.display = showCard ? "block" : "none";
}

/* =========================================================
   STEP 3: Order place karna
   ========================================================= */
function placeOrder() {
  // Form ki values padho
  const firstName = document.getElementById("firstName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const zip = document.getElementById("zip").value.trim();

  // Simple validation: required fields khali to nahi
  if (!firstName || !email || !phone || !address || !zip) {
    showToast("Please fill all required fields.", "bi-exclamation-triangle-fill");
    return;
  }

  // Email sahi hai ya nahi (simple check)
  const emailValid = email.includes("@") && email.includes(".");
  if (!emailValid) {
    showToast("Please enter a valid email.", "bi-exclamation-triangle-fill");
    return;
  }

  // Card payment chuni hai to card check karo
  const payment = document.querySelector('input[name="payment"]:checked').value;
  if (payment === "Credit / Debit Card") {
    const cardNumber = document.getElementById("cardNumber").value.replace(/\s/g, "");
    if (cardNumber.length !== 16) {
      showToast("Please enter a valid 16 digit card number.", "bi-exclamation-triangle-fill");
      return;
    }
  }

  // Sab kuch sahi hai -> order ban jata hai
  showToast("Order placed successfully! Thank you.", "bi-check-circle-fill");
  ShopingoCart.clearCart(); // cart khali kar do

  // Thoda ruk kar cart page par le jao (kuch bacha nahi cart me)
  setTimeout(() => {
    window.location.href = "cart.html";
  }, 1500);
}

/* =========================================================
   STEP 4: Header search -> products page
   ========================================================= */
function setupSearch() {
  const form = document.getElementById("headerSearchForm");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const q = form.querySelector("input").value.trim();
    window.location.href = "products.html" + (q ? "?q=" + encodeURIComponent(q) : "");
  });
}

/* =========================================================
   Small Toast helper (cart.js me bhi hai, yahan demo ke liye)
   ========================================================= */
function showToast(message, icon) {
  let toast = document.querySelector(".toast-notice");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast-notice";
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class="bi ${icon || "bi-check-circle-fill"}"></i><span>${message}</span>`;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2400);
}

