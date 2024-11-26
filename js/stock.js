document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("stock-form");
  const stockList = document.getElementById("stock-list");
  const productSelect = document.getElementById("product-select");
  const quantityInput = document.getElementById("product-quantity");

  populateProductSelect();
  loadStock();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const productId = productSelect.value;
    const productQuantity = parseInt(quantityInput.value, 10);

    try {
      const response = await fetch("http://localhost:3000/create/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: productQuantity }),
      });

      if (response.ok) {
        const newStock = await response.json();
        addStockToList(newStock.id, newStock.product.name, newStock.product.price, newStock.quantity);
        form.reset();
      } else {
        console.error("Erro ao criar estoque:", await response.json());
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);
    }

  });

  async function populateProductSelect() {
    try {
      const response = await fetch("http://localhost:3000/read/product");
      if (response.ok) {
        const products = await response.json();
        productSelect.innerHTML = ""; // Limpa o select antes de preencher
        products.forEach((product) => {
          const option = document.createElement("option");
          option.value = product.id;
          option.textContent = product.name;
          productSelect.appendChild(option);
        });
      } else {
        console.error("Erro ao carregar produtos:", await response.json());
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);
    }
  }

  async function loadStock() {
    try {
      const response = await fetch("http://localhost:3000/read/stock");
      if (response.ok) {
        const stockItems = await response.json();
        stockItems.forEach((stock) => {
          addStockToList(stock.id, stock.product.name, stock.product.price, stock.quantity);
        });
      } else {
        console.error("Erro ao carregar estoque:", await response.json());
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);
    }
  }

  function addStockToList(stockId, productName, productPrice, quantity) {
    const row = document.createElement("tr");
    row.setAttribute("data-id", stockId);

    row.innerHTML = `
      <td>${productName}</td>
      <td>R$ ${formatPrice(productPrice)}</td>
      <td>${quantity}</td>
      <td>${getProductStatus(quantity)}</td>
      <td>
        <button class="edit-btn">Editar</button>
      </td>
    `;

    row.querySelector(".edit-btn").addEventListener("click", () => editStock(row, stockId, productName, productPrice, quantity));
    stockList.appendChild(row);
  }

  function getProductStatus(quantity) {
    if (quantity > 10) return `<span class="status available font-weight-bold">Disponível</span>`;
    if (quantity > 0 && quantity <= 10) return `<span class="status low-stock font-weight-bold">Perto de acabar</span>`;
    if (quantity <= 0) return `<span class="status out-of-stock font-weight-bold">Esgotado</span>`;
  }

  async function editStock(row, stockId, productName, productPrice, oldQuantity) {
    row.innerHTML = `
      <td>${productName}</td>
      <td>R$ ${formatPrice(productPrice)}</td>
      <td><input type="number" value="${oldQuantity}" class="edit-quantity"></td>
      <td>${getProductStatus(oldQuantity)}</td>
      <td colspan="2">
        <button class="save-btn">Salvar</button>
        <button class="cancel-btn">Cancelar</button>
      </td>
    `;

    row.querySelector(".save-btn").addEventListener("click", async () => {
      const updatedQuantity = parseInt(row.querySelector(".edit-quantity").value, 10);

      try {
        const response = await fetch("http://localhost:3000/update/stock", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: stockId, quantity: updatedQuantity }),
        });

        if (response.ok) {
          const updatedStock = await response.json();
          row.innerHTML = `
            <td>${updatedStock.product.name}</td>
            <td>R$ ${formatPrice(updatedStock.product.price)}</td>
            <td>${updatedStock.quantity}</td>
            <td>${getProductStatus(updatedStock.quantity)}</td>
            <td>
              <button class="edit-btn">Editar</button>
            </td>
          `;
          row.querySelector(".edit-btn").addEventListener("click", () => editStock(row, stockId, updatedStock.product.name, updatedStock.product.price, updatedStock.quantity));
        } else {
          console.error("Erro ao atualizar estoque:", await response.json());
        }
      } catch (error) {
        console.error("Erro ao conectar com o servidor:", error);
      }
    });

    row.querySelector(".cancel-btn").addEventListener("click", () => {
      row.innerHTML = `
        <td>${row.querySelector("td:nth-child(1)").textContent}</td>
        <td>${row.querySelector("td:nth-child(2)").textContent}</td>
        <td>${oldQuantity}</td>
        <td>${getProductStatus(oldQuantity)}</td>
        <td>
          <button class="edit-btn">Editar</button>
        </td>
      `;
      row.querySelector(".edit-btn").addEventListener("click", () => editStock(row, stockId, productName, productPrice, oldQuantity));
    });
  }

  function formatPrice(price) {
    return parseFloat(price).toFixed(2).replace('.', ',');
  }
});

// SIDEBAR TOGGLE

let sidebarOpen = false;
let sidebar = document.getElementById("sidebar");
let buttonClose = document.getElementById("button-close");

function openSidebar() {
  if(!sidebarOpen) {
    sidebar.classList.add("sidebar-responsive");
    buttonClose.classList.remove("button-close-closed");
    buttonClose.classList.add("button-close-open");
    sidebarOpen = true;
  }
}

function closeSidebar() {
  if(sidebarOpen) {
    sidebar.classList.remove("sidebar-responsive");
    buttonClose.classList.remove("button-close-open");
    buttonClose.classList.add("button-close-closed");
    sidebarOpen = false;
  }
}