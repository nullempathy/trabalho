document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("purchase-form");
  const purchaseList = document.getElementById("purchase-list");
  const filterYear = document.getElementById("filter-year");
  const filterMonth = document.getElementById("filter-month");
  const filterDay = document.getElementById("filter-day");
  const filterButton = document.getElementById("filter-button");

  populateYearFilter();
  populateMonthFilter();
  populateDayFilter(filterYear.value, filterMonth.value);

  loadPurchasesFromTheCurrentMonthAndYear(filterYear.value, filterMonth.value);

  filterYear.addEventListener("change", () => {
    populateDayFilter(filterYear.value, filterMonth.value);
  });

  filterMonth.addEventListener("change", () => {
    populateDayFilter(filterYear.value, filterMonth.value);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("purchase-name").value;
    const quantity = parseInt(document.getElementById("purchase-quantity").value);
    const unitPrice = parseFloat(
      document.getElementById("unit-price").value.replace(/[^\d,]/g, '').replace(',', '.')
    ).toFixed(2);
    const date = document.getElementById("purchase-date").value;

    const totalPrice = (quantity * unitPrice).toFixed(2);

    try {
      await createPurchase(name, quantity, unitPrice, date);

      if (filterPurchasesOngoing(date)) {
        addPurchaseToList(name, quantity, unitPrice, date, totalPrice);
      }
      form.reset();
    } catch (error) {
      console.error("Erro ao salvar compra:", error);
      alert("Erro ao salvar compra. Tente novamente.");
    }

  });

  filterButton.addEventListener("click", () => {
    const selectedYear = filterYear.value;
    const selectedMonth = filterMonth.value !== "all" ? filterMonth.value : null;
    const selectedDay = filterDay.value !== "all" ? filterDay.value : null;

    filterPurchases(selectedYear, selectedMonth, selectedDay);
  });

  function populateYearFilter() {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 30; year <= currentYear; year++) {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      filterYear.appendChild(option);
    }
    filterYear.value = currentYear;
  }

  function populateMonthFilter() {
    const currentMonth = new Date().getMonth() + 1; // Janeiro é 0
    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "Todos os meses";
    filterMonth.insertBefore(allOption, filterMonth.firstChild);

    filterMonth.value = currentMonth.toString().padStart(2, "0");
  }

  function populateDayFilter(year, month) {
    filterDay.innerHTML = '<option value="all">Todos os dias</option>'; // Limpa e adiciona opção padrão
    if (month === "all") return;

    const daysInMonth = new Date(year, month, 0).getDate(); // Obtém o número de dias no mês
    for (let day = 1; day <= daysInMonth; day++) {
      const option = document.createElement("option");
      option.value = day.toString().padStart(2, "0");
      option.textContent = day;
      filterDay.appendChild(option);
    }
  }
  
  // Filtro flexível por Ano/Mês/Dia
  async function filterPurchases(year, month, day) {
    try {
      const purchases = await getPurchasesByDate(year, month, day);
      purchaseList.innerHTML = "";

      console.log("filtrando pelo ano:", year);
      console.log("filtrando pelo mes:", month);
      console.log("filtrando pelo dia:", day);

      console.log("purchases", purchases);
      console.log();
      console.log();

  
      purchases.forEach((purchase) => {
        console.log("purchase", purchase);
        addPurchaseToList(
          purchase.productName,
          purchase.quantity,
          purchase.price,
          purchase.purchaseDate,
          (purchase.quantity * purchase.price).toFixed(2)
        );
      });
    } catch (error) {
      console.error("Erro ao filtrar compras:", error);
      alert("Erro ao filtrar compras. Tente novamente.");
    }
  }

  function filterPurchasesOngoing(date) {
    const selectedYear = filterYear.value;
    const selectedMonth = filterMonth.value;
    const selectedDay = filterDay.value;
    const [y, m, d] = date.split("-");
    if (y === selectedYear && (selectedMonth === "all" || m === selectedMonth) && (selectedDay === "all" || d === selectedDay)) {
      return true;
    }
    return false;
  }

  async function loadPurchasesFromTheCurrentMonthAndYear(year, month) {
    await filterPurchases(year, month);
  }

  function addPurchaseToList(name, quantity, unitPrice, date, totalPrice) {
    // Remove o horário da data, mantendo apenas o formato YYYY-MM-DD
    const [year, month, day] = date.split("T")[0].split("-");

    const formattedDate = `${day}/${month}/${year}`;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formattedDate}</td>
      <td>${name}</td>
      <td>${quantity}</td>
      <td>R$ ${formatPrice(unitPrice)}</td>
      <td>R$ ${formatPrice(totalPrice)}</td>
    `;

    purchaseList.appendChild(row);
  }

  function formatPrice(price) {
    return parseFloat(price).toFixed(2).replace('.', ',');
  }

  // API Functions
  async function createPurchase(name, quantity, unitPrice, date) {
    const response = await fetch("http://127.0.0.1:3000/create/purchase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productName: name,
        quantity,
        price: parseFloat(unitPrice),
        purchaseDate: date,
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao criar compra.");
    }

    return await response.json();
  }

  async function getPurchasesByDate(year, month, day) {
    const queryParams = new URLSearchParams({
      year,
      ...(month && { month }),
      ...(day && { day }),
    }).toString();

    const response = await fetch(`http://127.0.0.1:3000/read/purchase?${queryParams}`, { method: "GET" });
    if (!response.ok) throw new Error("Erro ao buscar compras.");
    return await response.json();
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
