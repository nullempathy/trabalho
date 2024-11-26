document.addEventListener("DOMContentLoaded", async () => {
  const filterYear = document.getElementById("filter-year");
  const filterMonth = document.getElementById("filter-month");
  const filterDay = null;
  const filterButton = document.getElementById("filter-button");
  const receitaBruta = document.getElementById("receita-bruta");
  const custoDosProdutosVendidos = document.getElementById("cpv");
  const lucroBruto = document.getElementById("lucro-bruto");
  const valorTotalDoEstoque = document.getElementById("valor-total-do-estoque");


  populateYearFilter();
  populateMonthFilter();

  loadSellsFromTheCurrentMonthAndYear(filterYear.value, filterMonth.value);
  loadPurchasesFromTheCurrentMonthAndYear(filterYear.value, filterMonth.value);


  // RECEITA BRUTA
  async function calcularReceitaBruta(year, month) {
    const sells = await filterSells(year, month);
    let total = 0;
    console.log("sells", sells);
    console.log("sells.length", sells.length);
    for (let i = 0; i < sells.length; i++) {
      // Para cada venda no array, multiplicamos o preço pela quantidade e somamos ao total
      total += Number(sells[i].price) * sells[i].quantity;
    }
    return total;
  }

  const calculoDaReceitaBruta = await calcularReceitaBruta(filterYear.value, filterMonth.value);
  console.log("calculoDaReceitaBruta", calculoDaReceitaBruta);
  receitaBruta.textContent = `R$ ${calculoDaReceitaBruta.toFixed(2)}`;



  // CUSTO DOS PRODUTOS VENDIDOS (CPV)
  async function calcularCustoDosProdutosVendidos(year, month) {
    const purchases = await filterPurchases(year, month);
    let total = 0;
    console.log("purchases", purchases);
    console.log("purchases.length", purchases.length);
    for (let i = 0; i < purchases.length; i++) {
      // Para cada compra no array, multiplicamos o preço pela quantidade e somamos ao total
      total += Number(purchases[i].price) * purchases[i].quantity;
    }
    return total;
  }

  const calculoDoCustoDosProdutosVendidos = await calcularCustoDosProdutosVendidos(filterYear.value, filterMonth.value);
  console.log("calculoDoCustoDosProdutosVendidos", calculoDoCustoDosProdutosVendidos);
  custoDosProdutosVendidos.textContent = `R$ ${calculoDoCustoDosProdutosVendidos.toFixed(2)}`;



  // LUCRO BRUTO
  function calcularLucroBruto(receitaBruta, cpv) {
    return receitaBruta - cpv;
  }
  const calculoDoLucroBruto = await calcularLucroBruto(calculoDaReceitaBruta, calculoDoCustoDosProdutosVendidos);
  lucroBruto.textContent = `R$ ${calculoDoLucroBruto.toFixed(2)}`;



  // VALOR TOTAL DO ESTOQUE
  async function calcularValorTotalDoEstoque() {
    const stockItems = await getStock();
    let total = 0;
    console.log("stockItems", stockItems);
    console.log("stockItems.length", stockItems.length);
    for (let i = 0; i < stockItems.length; i++) {
      // Para cada compra no array, multiplicamos o preço pela quantidade e somamos ao total
      console.log("Number(stockItems[i].product.price)", Number(stockItems[i].product.price));
      console.log("stockItems[i].product.quantity", stockItems[i].quantity);
      total += Number(stockItems[i].product.price) * stockItems[i].quantity;
    }
    console.log("total", total);
    return total;
  }
  const calculoDoValorTotalDoEstoque = await calcularValorTotalDoEstoque();
  valorTotalDoEstoque.textContent = `R$ ${calculoDoValorTotalDoEstoque.toFixed(2)}`;
  




























  // FILTRAGEM
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

  filterButton.addEventListener("click", () => {
    const selectedYear = filterYear.value;
    const selectedMonth = filterMonth.value !== "all" ? filterMonth.value : null;

    filterSells(selectedYear, selectedMonth);
    filterPurchases(selectedYear, selectedMonth);
  });

  // Filtro flexível por Ano/Mês/Dia
  async function filterSells(year, month, day) {
    try {
      const sells = await getSellsByDate(year, month, day);

      console.log("sells", sells);

      sells.forEach((sell) => {
        console.log("sell", sell);
      });

      return sells;

    } catch (error) {
      console.error("Erro ao filtrar vendas:", error);
      alert("Erro ao filtrar vendas. Tente novamente.");
    }
  }

  // Filtro flexível por Ano/Mês/Dia
  async function filterPurchases(year, month, day) {
    try {
      const purchases = await getPurchasesByDate(year, month, day);

      console.log("purchases", purchases);

  
      purchases.forEach((purchase) => {
        console.log("purchase", purchase);
      });

      return purchases;
    } catch (error) {
      console.error("Erro ao filtrar compras:", error);
      alert("Erro ao filtrar compras. Tente novamente.");
    }
  }

  async function loadSellsFromTheCurrentMonthAndYear(year, month) {
    await filterSells(year, month);
  }

  async function loadPurchasesFromTheCurrentMonthAndYear(year, month) {
    await filterPurchases(year, month);
  }

  // API FUNCTIONS
  async function getSellsByDate(year, month, day) {
    const queryParams = new URLSearchParams({
      year,
      ...(month && { month }),
      ...(day && { day }),
    }).toString();

    const response = await fetch(`http://127.0.0.1:3000/read/sell?${queryParams}`, { method: "GET" });
    if (!response.ok) throw new Error("Erro ao buscar vendas.");
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

  async function getStock() {
    try {
      const response = await fetch("http://localhost:3000/read/stock");
      if (response.ok) {
        const stockItems = await response.json();
        console.log("stockItems", stockItems);
        stockItems.forEach((stock) => {
          console.log("stock", stock);
        });
        return stockItems;
      } else {
        console.error("Erro ao carregar estoque:", await response.json());
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);
    }
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