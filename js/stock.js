document.addEventListener("DOMContentLoaded", () => {
  const stockList = document.getElementById("stock-list");

  loadStock();

  async function loadStock() {
    try {
      const response = await fetch("http://localhost:3000/read/stock");
      if (response.ok) {
        const stockItems = await response.json();
        console.log("stockItems", stockItems);
        stockItems.forEach((stock) => {
          console.log("stock", stock);
          addStockToList(stock.id, stock.purchase.productName, stock.purchase.price, stock.quantity, stock.status);
        });
      } else {
        console.error("Erro ao carregar estoque:", await response.json());
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);
    }
  }
  
  function addStockToList(stockId, productName, productPrice, quantity, status) {
    const row = document.createElement("tr");
    row.setAttribute("data-id", stockId);

    row.innerHTML = `
      <td>${productName}</td>
      <td>R$ ${formatPrice(productPrice)}</td>
      <td>${quantity}</td>
      <td>${getProductStatus(quantity)}</td>
    `;

    stockList.appendChild(row);
  }

  function getProductStatus(quantity) {
    if (quantity >= 10) return `<span class="status available font-weight-bold">Disponível</span>`;
    if (quantity > 0 && quantity < 10) return `<span class="status low-stock font-weight-bold">Perto de acabar</span>`;
    if (quantity <= 0) return `<span class="status out-of-stock font-weight-bold">Esgotado</span>`;
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