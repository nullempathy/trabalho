document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("purchase-form");
  const purchaseList = document.getElementById("purchase-list");
  const filterYear = document.getElementById("filter-year");
  const filterMonth = document.getElementById("filter-month");
  const filterButton = document.getElementById("filter-button");

  populateYearFilter();
  populateMonthFilter();
  loadPurchasesFromTheCurrentMonthAndYear(filterYear.value, filterMonth.value);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("purchase-name").value;
    const quantity = parseInt(document.getElementById("purchase-quantity").value);
    const unitPrice = parseFloat(
      document.getElementById("unit-price").value.replace(/[^\d,]/g, '').replace(',', '.')
    ).toFixed(2);
    const date = document.getElementById("purchase-date").value;
    console.log("date", date);

    const totalPrice = (quantity * unitPrice).toFixed(2);

    let currentMonthAndYear = filterPurchasesOngoing(date);
    if (currentMonthAndYear) {
      addPurchaseToList(date, name, quantity, unitPrice, totalPrice);
    }
    savePurchases(date, name, quantity, unitPrice, totalPrice);
    form.reset();
  });

  filterButton.addEventListener("click", () => {
    const selectedYear = filterYear.value;
    const selectedMonth = filterMonth.value;
    console.log("Filtro selecionado - Ano:", selectedYear, "Mês:", selectedMonth);
    filterPurchases(selectedYear, selectedMonth);
  });

  function populateYearFilter() {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 10; year <= currentYear; year++) {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      filterYear.appendChild(option);
    }
    filterYear.value = currentYear;
  }

  function populateMonthFilter() {
    const currentMonth = new Date().getMonth() + 1; // Janeiro é 0
    filterMonth.value = currentMonth.toString().padStart(2, '0');
  }

  function filterPurchases(year, month) {
    let purchases = JSON.parse(localStorage.getItem("purchases")) || [];
    // console.log("purchases", purchases);
    const filtered = purchases.filter(purchase => {
      // console.log("purchase.date", purchase.date);
      const [y, m, d] = purchase.date.split("-");
      // console.log(`Analisando compra: ${purchase.date} - Ano: ${y}, Mês: ${m}`);
      return y === year && m === month;
    });

    purchaseList.innerHTML = "";
    // console.log("Compras filtradas:", filtered);
    filtered.forEach(purchase => {
      addPurchaseToList(purchase.date, purchase.name, purchase.quantity, purchase.unitPrice, purchase.totalPrice);
    });
  }

  function filterPurchasesOngoing(date) {
    const selectedYear = filterYear.value;
    const selectedMonth = filterMonth.value;
    const [y, m, d] = date.split("-");
    if (y === selectedYear && m === selectedMonth) {
      return true;
    }
    return false;
  }

  function addPurchaseToList(date, name, quantity, unitPrice, totalPrice) {
    const row = document.createElement("tr");

    const [year, month, day] = date.split("-");
    const formattedDate = `${day}/${month}/${year}`;

    row.innerHTML = `
      <td>${formattedDate}</td>
      <td>${name}</td>
      <td>${quantity}</td>
      <td>R$ ${formatPrice(unitPrice)}</td>
      <td>R$ ${formatPrice(totalPrice)}</td>
    `;

    purchaseList.appendChild(row);
  }

  function savePurchases(date, name, quantity, unitPrice, totalPrice) {
    let purchases = JSON.parse(localStorage.getItem("purchases")) || [];
    let newPurchase = { date, name, quantity, unitPrice, totalPrice }
    purchases.push(newPurchase);
    localStorage.setItem("purchases", JSON.stringify(purchases));
  }

  function loadPurchasesFromTheCurrentMonthAndYear(year, month) {
    filterPurchases(year, month);
  }

  function formatPrice(price) {
    return parseFloat(price).toFixed(2).replace('.', ',');
  }
});

// Formatação ao digitar o valor unitário
document.getElementById('unit-price').addEventListener('input', function(e) {
  let value = e.target.value;
  value = value.replace(/[^\d,]/g, '');
  value = 'R$' + value;
  e.target.value = value;
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
