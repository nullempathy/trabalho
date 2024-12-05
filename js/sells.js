document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("sell-form");
  const sellList = document.getElementById("sell-list");
  const filterYear = document.getElementById("filter-year");
  const filterMonth = document.getElementById("filter-month");
  const filterDay = document.getElementById("filter-day");
  const stockSelect = document.getElementById("stock-select");
  const quantityInput = document.getElementById("sell-quantity");
  const priceInput = document.getElementById("unit-price");
  const filterButton = document.getElementById("filter-button");

  // Função para formatar valores no formato brasileiro
  function formatarMoedaBR(valor) {
    // Verifica se o valor é uma string e tenta convertê-lo para float
    const numero = typeof valor === "string" ? parseFloat(valor) : valor;

    // Se o valor convertido não for um número válido, retorna "R$ 0,00" ou uma mensagem
    if (isNaN(numero)) {
      return "R$ 0,00";
    }

    // Formata o número para o formato brasileiro
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(numero);
  }

  populateYearFilter();
  populateMonthFilter();
  populateStockSelect();
  populateDayFilter(filterYear.value, filterMonth.value);

  loadSellsFromTheCurrentMonthAndYear(filterYear.value, filterMonth.value);

  filterYear.addEventListener("change", () => {
    populateDayFilter(filterYear.value, filterMonth.value);
  });

  filterMonth.addEventListener("change", () => {
    populateDayFilter(filterYear.value, filterMonth.value);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const stockId = document.getElementById("stock-select").value;
    const quantity = parseInt(document.getElementById("sell-quantity").value);
    const unitPrice = parseFloat(
      document.getElementById("unit-price").value.replace(/[^\d,]/g, '').replace(',', '.')
    ).toFixed(2);
    const date = document.getElementById("sell-date").value;

    const totalPrice = (quantity * unitPrice).toFixed(2);

    try {
      const sellCreated = await createSell(stockId, quantity, unitPrice, date);

      if (filterSellsOngoing(date)) {
        addSellToList(sellCreated.stock.purchase.productName, quantity, unitPrice, date, totalPrice);
      }
      form.reset();
    } catch (error) {
      console.error("Erro ao salvar venda:", error);
      alert("Erro ao salvar venda. Tente novamente.");
    }
  });

  async function populateStockSelect() {
    try {
      const response = await fetch("http://localhost:3000/read/stock");
      if (response.ok) {
        const stocks = await response.json();
        stockSelect.innerHTML = ""; // Limpa o select antes de preencher
        quantityInput.placeholder = stocks[0].quantity;
        priceInput.placeholder = stocks[0].purchase.price;
        stocks.forEach((stock) => {
          console.log("stock", stock);
          // Remove o horário da data, mantendo apenas o formato YYYY-MM-DD
          let [year, month, day] = stock.purchase.purchaseDate.split("T")[0].split("-");
          let formattedDate = `${day}/${month}/${year}`;
          const option = document.createElement("option");
          option.value = stock.id;
          option.textContent = `${stock.purchase.productName} - ${formattedDate}`;
          option.dataset.quantity = stock.quantity;
          option.dataset.price = stock.purchase.price;
          stockSelect.appendChild(option);
        });

      } else {
        console.error("Erro ao carregar produtos em estoque:", await response.json());
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);
    }
  }

  // Atualiza o placeholder do campo de quantidade sempre que o usuário mudar a seleção no select
  stockSelect.addEventListener("change", () => {
    console.log("mudou?");
    const selectedOption = stockSelect.selectedOptions[0]; // Obtém a opção selecionada
    const quantity = selectedOption ? selectedOption.dataset.quantity : 0; // Acessa a quantidade armazenada
    const price = selectedOption ? selectedOption.dataset.price : 0; // Acessa a quantidade armazenada

    console.log("Quantidade do stock selecionado:", quantity);
    quantityInput.placeholder = quantity; // Atualiza o placeholder do campo de quantidade
    priceInput.placeholder = price;
  });

  filterButton.addEventListener("click", () => {
    const selectedYear = filterYear.value;
    const selectedMonth = filterMonth.value !== "all" ? filterMonth.value : null;
    const selectedDay = filterDay.value !== "all" ? filterDay.value : null;

    filterSells(selectedYear, selectedMonth, selectedDay);
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
  async function filterSells(year, month, day) {
    try {
      console.log("year month day", year, month, day);
      const sells = await getSellsByDate(year, month, day);
      sellList.innerHTML = "";

      console.log("sells", sells);

      sells.forEach((sell) => {
        console.log("sell", sell);
        addSellToList(
          sell.stock.purchase.productName,
          sell.quantity,
          sell.price,
          sell.sellDate,
          (sell.quantity * sell.price).toFixed(2)
        );
      });
    } catch (error) {
      console.error("Erro ao filtrar vendas:", error);
      alert("Erro ao filtrar vendas. Tente novamente.");
    }
  }

  function filterSellsOngoing(date) {
    const selectedYear = filterYear.value;
    const selectedMonth = filterMonth.value;
    const selectedDay = filterDay.value;
    const [y, m, d] = date.split("-");
    if (y === selectedYear && (selectedMonth === "all" || m === selectedMonth) && (selectedDay === "all" || d === selectedDay)) {
      return true;
    }
    return false;
  }

  async function loadSellsFromTheCurrentMonthAndYear(year, month) {
    await filterSells(year, month);
  }

  function addSellToList(productName, quantity, unitPrice, date, totalPrice) {
    // Remove o horário da data, mantendo apenas o formato YYYY-MM-DD
    const [year, month, day] = date.split("T")[0].split("-");
    const formattedDate = `${day}/${month}/${year}`;

    console.log("productName: ", productName);
    console.log("quantity: ", quantity);
    console.log("unitPrice: ", unitPrice);
    console.log("date: ", date);
    console.log("totalPrice: ", totalPrice);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formattedDate}</td>
      <td>${productName}</td>
      <td>${quantity}</td>
      <td>${formatarMoedaBR(unitPrice)}</td>
      <td>${formatarMoedaBR(totalPrice)}</td>
    `;

    sellList.appendChild(row);
  }

  // API Functions
  async function createSell(stockId, quantity, unitPrice, date) {
    console.log(`stockId: ${stockId}, quantity: ${quantity}, unitPrice: ${unitPrice}, date: ${date}`);
    const response = await fetch("http://127.0.0.1:3000/create/sell", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stockId,
        quantity,
        unitPrice: parseFloat(unitPrice),
        sellDate: date,
      }),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      console.error(`Erro (${response.status}):`, errorMessage);
      throw new Error("Erro ao criar venda.");
    }

    return await response.json();
  }

  async function getSellsByDate(year, month, day) {
    const queryParams = new URLSearchParams({
      year,
      ...(month && { month }),
      ...(day && { day }),
    }).toString();
    console.log(`http://127.0.0.1:3000/read/sell?${queryParams}`);
    const response = await fetch(`http://127.0.0.1:3000/read/sell?${queryParams}`, { method: "GET" });
    if (!response.ok) throw new Error("Erro ao buscar vendas.");
    return await response.json();
  }

});

// Formatação ao digitar o valor unitário
document.getElementById('unit-price').addEventListener('input', function(e) {
  let value = e.target.value;

  // Remove qualquer coisa que não seja dígito ou vírgula
  value = value.replace(/[^\d,]/g, '');

  // Substitui vírgulas extras e formata corretamente
  if (value.includes(',')) {
    const parts = value.split(',');
    value = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + parts[1].slice(0, 2); // Milhares + até 2 casas decimais
  } else {
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Apenas separador de milhares
  }

  // Adiciona o prefixo "R$"
  e.target.value = 'R$ ' + value;
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
