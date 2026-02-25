(() => {
  const bootstrap = window.GIT_COMMERCE_BOOTSTRAP || { products: [], storeId: "", apiBaseUrl: "" };
  const products = Array.isArray(bootstrap.products) ? bootstrap.products : [];
  const grid = document.getElementById("product-grid");

  const money = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(value || 0));

  const buildCard = (product) => `
    <div class="product">
      <img src="${product.image_url || "https://via.placeholder.com/640x380?text=Product"}" alt="${product.name}">
      <h2>${product.name}</h2>
      <p>${money(product.price)}</p>
      <button class="buy-button" data-product-id="${product.id}">Buy now</button>
    </div>
  `;

  const render = () => {
    if (!grid) return;
    if (products.length === 0) {
      grid.innerHTML = '<p class="empty">No products available.</p>';
      return;
    }
    grid.innerHTML = products.map(buildCard).join("");
  };

  const placeOrder = async (productId) => {
    const email = window.prompt("Enter your email to place the order:");
    if (!email) return;

    const response = await fetch(`${bootstrap.apiBaseUrl}/api/orders/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId: bootstrap.storeId,
        productId,
        customerEmail: email,
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || "Order could not be placed");
    }
  };

  render();

  grid?.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;
    const productId = target.dataset.productId;
    if (!productId) return;

    try {
      await placeOrder(productId);
      window.alert("Order placed successfully.");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Order failed.");
    }
  });
})();
