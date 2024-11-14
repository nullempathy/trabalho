document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("sell-form");
  const sellList = document.getElementById("sell-list");
  const filterYear = document.getElementById("filter-year");
  const filterMonth = document.getElementById("filter-month");
  const filterButton = document.getElementById("filter-button");

  populateYearFilter();
  populateMonthFilter();
  loadSellsFromTheCurrentMonthAndYear(filterYear.value, filterMonth.value);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("sell-name").value;
    const quantity = parseInt(document.getElementById("sell-quantity").value);
    const unitPrice = parseFloat(
      document.getElementById("unit-price").value.replace(/[^\d,]/g, '').replace(',', '.')
    ).toFixed(2);
    const date = document.getElementById("sell-date").value;
    console.log("date", date);

    const totalPrice = (quantity * unitPrice).toFixed(2);

    let currentMonthAndYear = filterSellsOngoing(date);
    if (currentMonthAndYear) {
      addSellToList(date, name, quantity, unitPrice, totalPrice);
    }
    saveSells(date, name, quantity, unitPrice, totalPrice);
    form.reset();
  });

  filterButton.addEventListener("click", () => {
    const selectedYear = filterYear.value;
    const selectedMonth = filterMonth.value;
    console.log("Filtro selecionado - Ano:", selectedYear, "Mês:", selectedMonth);
    filterSells(selectedYear, selectedMonth);
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

  function filterSells(year, month) {
    let sells = JSON.parse(localStorage.getItem("sells")) || [];
    // console.log("sells", sells);
    const filtered = sells.filter(sell => {
      // console.log("sell.date", sell.date);
      const [y, m, d] = sell.date.split("-");
      // console.log(`Analisando compra: ${sell.date} - Ano: ${y}, Mês: ${m}`);
      return y === year && m === month;
    });

    sellList.innerHTML = "";
    // console.log("Compras filtradas:", filtered);
    filtered.forEach(sell => {
      addSellToList(sell.date, sell.name, sell.quantity, sell.unitPrice, sell.totalPrice);
    });
  }

  function filterSellsOngoing(date) {
    const selectedYear = filterYear.value;
    const selectedMonth = filterMonth.value;
    const [y, m, d] = date.split("-");
    if (y === selectedYear && m === selectedMonth) {
      return true;
    }
    return false;
  }

  function addSellToList(date, name, quantity, unitPrice, totalPrice) {
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

    sellList.appendChild(row);
  }

  function saveSells(date, name, quantity, unitPrice, totalPrice) {
    let sells = JSON.parse(localStorage.getItem("sells")) || [];
    let newsell = { date, name, quantity, unitPrice, totalPrice }
    sells.push(newsell);
    localStorage.setItem("sells", JSON.stringify(sells));
  }

  function loadSellsFromTheCurrentMonthAndYear(year, month) {
    filterSells(year, month);
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
