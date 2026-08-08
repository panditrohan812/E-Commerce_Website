const PAGE_SIZE = 9;

const state = {
  allProducts: [],
  categories: [],
  activeCategories: new Set(),
  maxPrice: 1000,
  minRating: 0,
  searchQuery: "",
  sort: "default",
  view: "grid",
  page: 1,
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("q")) state.searchQuery = params.get("q");
  if (params.get("view") === "list") state.view = "list";

  renderSkeleton();

  try {
    const [allProducts, categories] = await Promise.all([
      ShopingoAPI.getAllProducts(),
      ShopingoAPI.getCategories(),
    ]);
    state.allProducts = allProducts;
    state.categories = categories;
    cacheProducts(allProducts);

    if (params.get("category")) {
      state.activeCategories.add(params.get("category"));
    }

    renderFooterCategories(categories);
    renderCategoryFilters(categories);
    updatePageHeader();
    bindControls();
    applyAndRender();
  } catch (err) {
    console.error(err);
    document.getElementById("productsGrid").innerHTML =
      `<div class="col-12 text-center py-5"><i class="bx bx-wifi-off" style="font-size:40px;color:#ccc;"></i><p class="mt-3">Could not load products. Please try again.</p></div>`;
  }
}

function renderSkeleton() {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = Array.from({ length: 9 })
    .map(
      () => `
    <div class="col">
      <div class="card border-0">
        <div class="skeleton" style="height:210px;margin-bottom:10px;"></div>
        <div class="skeleton" style="height:14px;width:60%;margin-bottom:8px;"></div>
        <div class="skeleton" style="height:14px;width:40%;"></div>
      </div>
    </div>`,
    )
    .join("");
}

function renderCategoryFilters(categories) {
  const el = document.getElementById("categoryFilterList");
  if (!el) return;
  el.innerHTML = categories
    .map(
      (cat) => `
    <div class="form-check">
      <input class="form-check-input category-filter" type="checkbox" value="${cat}" id="cat-${slug(cat)}" ${state.activeCategories.has(cat) ? "checked" : ""}>
      <label class="form-check-label" for="cat-${slug(cat)}">${formatCategory(cat)} <span class="product-number">(${state.allProducts.filter((p) => p.category === cat).length})</span></label>
    </div>`,
    )
    .join("");

  el.querySelectorAll(".category-filter").forEach((cb) => {
    cb.addEventListener("change", () => {
      cb.checked
        ? state.activeCategories.add(cb.value)
        : state.activeCategories.delete(cb.value);
      state.page = 1;
      updatePageHeader();
      applyAndRender();
    });
  });
}

function renderFooterCategories(categories) {
  const el = document.getElementById("footerCategories");
  if (!el) return;
  el.innerHTML = categories
    .map(
      (cat) =>
        `<li class="mb-1"><a href="products.html?category=${encodeURIComponent(cat)}"><i class='bx bx-chevron-right'></i> ${formatCategory(cat)}</a></li>`,
    )
    .join("");
}

function bindControls() {
  const priceRange = document.getElementById("priceRange");
  if (priceRange) {
    priceRange.addEventListener("input", (e) => {
      state.maxPrice = Number(e.target.value);
      document.getElementById("priceRangeValue").textContent =
        `$${state.maxPrice}`;
      state.page = 1;
      applyAndRender();
    });
  }

  document.querySelectorAll(".rating-filter").forEach((r) => {
    r.addEventListener("change", (e) => {
      state.minRating = Number(e.target.value);
      state.page = 1;
      applyAndRender();
    });
  });

  const clearBtn = document.getElementById("clearFiltersBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      state.activeCategories.clear();
      state.maxPrice = 1000;
      state.minRating = 0;
      state.searchQuery = "";
      state.sort = "default";
      state.page = 1;
      if (priceRange) {
        priceRange.value = 1000;
        document.getElementById("priceRangeValue").textContent = "$1000";
      }
      document.getElementById("ratingAny").checked = true;
      document.getElementById("sortSelect").value = "default";
      document
        .querySelectorAll(".category-filter")
        .forEach((cb) => (cb.checked = false));
      updatePageHeader();
      applyAndRender();
    });
  }

  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      state.sort = e.target.value;
      applyAndRender();
    });
  }

  const gridBtn = document.getElementById("gridViewBtn");
  const listBtn = document.getElementById("listViewBtn");
  if (gridBtn) gridBtn.addEventListener("click", () => setView("grid"));
  if (listBtn) listBtn.addEventListener("click", () => setView("list"));

  // Set view buttons active state
  if (state.view === "list" && listBtn) listBtn.classList.add("active");
  if (state.view === "grid" && gridBtn) gridBtn.classList.add("active");
}

function setView(view) {
  state.view = view;
  document
    .getElementById("gridViewBtn")
    ?.classList.toggle("active", view === "grid");
  document
    .getElementById("listViewBtn")
    ?.classList.toggle("active", view === "list");
  applyAndRender();
}

function updatePageHeader() {
  const title =
    state.activeCategories.size === 1
      ? formatCategory([...state.activeCategories][0])
      : "Shop";
  const titleEl = document.getElementById("pageTitle");
  const crumbEl = document.getElementById("breadcrumbActive");
  if (titleEl) titleEl.textContent = title;
  if (crumbEl) crumbEl.textContent = title;
}

function applyAndRender() {
  let items = [...state.allProducts];

  if (state.activeCategories.size) {
    items = items.filter((p) => state.activeCategories.has(p.category));
  }
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    items = items.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }
  items = items.filter((p) => p.price <= state.maxPrice);
  items = items.filter(
    (p) => (p.rating ? p.rating.rate : 0) >= state.minRating,
  );

  switch (state.sort) {
    case "price-asc":
      items.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      items.sort((a, b) => b.price - a.price);
      break;
    case "rating-desc":
      items.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
      break;
    case "name-asc":
      items.sort((a, b) => a.title.localeCompare(b.title));
      break;
  }

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  state.page = Math.min(state.page, totalPages);
  const pageItems = items.slice(
    (state.page - 1) * PAGE_SIZE,
    state.page * PAGE_SIZE,
  );

  const grid = document.getElementById("productsGrid");
  grid.className =
    state.view === "grid"
      ? "row g-3 g-sm-4 row-cols-2 row-cols-md-3"
      : "row g-3 g-sm-4 list-view";

  const resultsEl = document.getElementById("resultsCount");
  if (resultsEl) {
    resultsEl.textContent = items.length
      ? `Showing ${(state.page - 1) * PAGE_SIZE + 1}-${Math.min(state.page * PAGE_SIZE, items.length)} of ${items.length} products`
      : "No products found";
  }

  if (!pageItems.length) {
    grid.innerHTML = `<div class="col-12 text-center py-5"><i class="bx bx-search" style="font-size:40px;color:#ccc;"></i><p class="mt-3">No products match your filters.</p></div>`;
  } else {
    grid.innerHTML = pageItems
      .map((p) =>
        state.view === "grid"
          ? `<div class="col">${renderProductCard(p)}</div>`
          : `<div class="col-12">${renderProductCard(p)}</div>`,
      )
      .join("");
  }

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const el = document.getElementById("paginationList");
  if (!el) return;
  if (totalPages <= 1) {
    el.innerHTML = "";
    return;
  }

  let html = `<li class="page-item ${state.page === 1 ? "disabled" : ""}"><a class="page-link" href="#" data-page="${state.page - 1}">Prev</a></li>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<li class="page-item ${i === state.page ? "active" : ""}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
  }
  html += `<li class="page-item ${state.page === totalPages ? "disabled" : ""}"><a class="page-link" href="#" data-page="${state.page + 1}">Next</a></li>`;
  el.innerHTML = html;

  el.querySelectorAll("[data-page]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = Number(link.dataset.page);
      if (page >= 1 && page <= totalPages) {
        state.page = page;
        applyAndRender();
        window.scrollTo({ top: 200, behavior: "smooth" });
      }
    });
  });
}

function slug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
