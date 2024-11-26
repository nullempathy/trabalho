document.addEventListener("DOMContentLoaded", async () => {
  const filterYear = document.getElementById("filter-year");
  const filterMonth = document.getElementById("filter-month");
  const filterButton = document.getElementById("filter-button");
  const stock = document.getElementById("stock");
  const purchases = document.getElementById("purchases");
  const sells = document.getElementById("sells");
  const outOfStock = document.getElementById("stock-alert");


  populateYearFilter();
  populateMonthFilter();

  loadSellsFromTheCurrentMonthAndYear(filterYear.value, filterMonth.value);
  loadPurchasesFromTheCurrentMonthAndYear(filterYear.value, filterMonth.value);


  // QUANTIDADE TOTAL DE PRODUTOS EM ESTOQUE
  async function calcularQuantidadeTotalDeProdutosEmEstoque() {
    const stockItems = await getStock();
    let total = 0;
    console.log("stockItems", stockItems);
    console.log("stockItems.length", stockItems.length);
    for (let i = 0; i < stockItems.length; i++) {
      // Para cada item em estoque, somamos a quantidade ao total para obter o total de produtos disponiveis em estoque.
        console.log("i", i);
        total += i;
    }
    if(total === 0) {
      console.log("total", total);
      return total;
    }
    console.log("total", total + 1);
    return total + 1;
  }

  const calculoDaQuantidadeTotalDeProdutosEmEstoque = await calcularQuantidadeTotalDeProdutosEmEstoque();
  stock.textContent = `${calculoDaQuantidadeTotalDeProdutosEmEstoque.toFixed(0)} PRODUTOS DISPONÍVEIS`;
  if(calculoDaQuantidadeTotalDeProdutosEmEstoque === 1) {
    stock.textContent = `${calculoDaQuantidadeTotalDeProdutosEmEstoque.toFixed(0)} PRODUTO DISPONÍVEL`;
  }



  // QUANTIDADE TOTAL DE COMPRAS FEITAS
  async function calcularQuantidadeTotalDeComprasFeitas(year, month) {
    const purchases = await filterPurchases(year, month);
    let total = 0;
    console.log("purchases", purchases);
    console.log("purchases.length", purchases.length);
    for (let i = 0; i < purchases.length; i++) {
      // Para cada compra realizada, somamos as compras ao total para obter o total de compras realizadas.
      total += i;
    }
    if(total === 0) {
      console.log("total", total);
      return total;
    }
    console.log("total", total + 1);
    return total + 1;
  }

  const calculoDaQuantidadeTotalDeComprasFeitas = await calcularQuantidadeTotalDeComprasFeitas(filterYear.value, filterMonth.value);
  console.log("calculoDaQuantidadeTotalDeComprasFeitas", calculoDaQuantidadeTotalDeComprasFeitas);
  purchases.textContent = `${calculoDaQuantidadeTotalDeComprasFeitas.toFixed(0)} PRODUTOS COMPRADOS`;
  if(calculoDaQuantidadeTotalDeComprasFeitas === 1) {
    purchases.textContent = `${calculoDaQuantidadeTotalDeComprasFeitas.toFixed(0)} PRODUTO COMPRADO`;
  }



  // QUANTIDADE TOTAL DE VENDAS FEITAS
  async function calcularQuantidadeTotalDeVendasFeitas(year, month) {
    const sells = await filterSells(year, month);
    let total = 0;
    console.log("sells", sells);
    console.log("sells.length", sells.length);
    for (let i = 0; i < sells.length; i++) {
      // Para cada venda realizada, somamos a quantidade de vendas ao total para obter o total de vendas realizadas.
      total += i;
    }
    if(total === 0) {
      console.log("total", total);
      return total;
    }
    console.log("total", total + 1);
    return total + 1;
  }

  const calculoDaQuantidadeTotalDeVendasFeitas = await calcularQuantidadeTotalDeVendasFeitas(filterYear.value, filterMonth.value);
  console.log("calculoDaQuantidadeTotalDeVendasFeitas", calculoDaQuantidadeTotalDeVendasFeitas);
  sells.textContent = `${calculoDaQuantidadeTotalDeVendasFeitas.toFixed(0)} UNIDADES VENDIDAS`;
  if(calculoDaQuantidadeTotalDeVendasFeitas === 1) {
    sells.textContent = `${calculoDaQuantidadeTotalDeVendasFeitas.toFixed(0)} UNIDADE VENDIDA`;
  }



  // QUANTIDADE TOTAL DE PRODUTOS NÃO DISPONIVEIS
  async function calcularQuantidadeTotalDeProdutosNaoDisponiveis() {
    const stockItems = await getStock();
    let total = 0;
    console.log("stockItems", stockItems);
    console.log("stockItems.length", stockItems.length);
    for (let i = 0; i < stockItems.length; i++) {
      // Para cada item em estoque não disponivel, somamos a quantidade ao total para obter o total de produtos não disponiveis em estoque.
      if(stockItems[i].quantity === 0) {
        console.log("i", i);
        total += i;
      }
    }
    if(total === 0) {
      console.log("total", total);
      return total;
    }
    console.log("total", total + 1);
    return total + 1;
  }

  const calculoDaQuantidadeTotalDeProdutosNaoDisponiveis = await calcularQuantidadeTotalDeProdutosNaoDisponiveis();
  outOfStock.textContent = `${calculoDaQuantidadeTotalDeProdutosNaoDisponiveis.toFixed(0)} PRODUTOS NÃO DISPONÍVEIS`;
  if(calculoDaQuantidadeTotalDeProdutosNaoDisponiveis === 1) {
    outOfStock.textContent = `${calculoDaQuantidadeTotalDeProdutosNaoDisponiveis.toFixed(0)} PRODUTO NÃO DISPONÍVEL`;
  }



  // PEGA OS PRODUTOS MAIS VENDIDOS
  async function ordenaOsProdutosMaisVendidos(year, month) {
    const sells = await filterSells(year, month);

    // Mapeamos os dados do array original para um novo formato
    const vendasPorProduto = sells.map(sell => ({
      quantity: sell.quantity,
      name: sell.stock.product.name,
    }));

    // Ordenamos o array em ordem decrescente pela quantidade
    vendasPorProduto.sort((a, b) => b.quantity - a.quantity);

    return vendasPorProduto;
  }

  async function pegaOsCincoProdutosMaisVendidos(year, month) {
    const arrayProdutos = await ordenaOsProdutosMaisVendidos(year, month);
    return arrayProdutos.slice(0, 5);
  }

  const arrayProdutosMaisVendidos = await pegaOsCincoProdutosMaisVendidos(filterYear.value, filterMonth.value);




  // PEGAR AS COMPRAS E VENDAS DOS MESES
  async function pegaAsComprasEVendasDoPrimeiroSemestre() {
    getSellsByDate(2024, "02");
  }




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
    console.log(filterYear.value);
    console.log(filterMonth.value);

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




  // --------- CHARTS ---------

  // BAR CHART
  let barChartOptions = {
    series: [{
    data: [
      arrayProdutosMaisVendidos[0]?.quantity || "",
      arrayProdutosMaisVendidos[1]?.quantity || "",
      arrayProdutosMaisVendidos[2]?.quantity || "",
      arrayProdutosMaisVendidos[3]?.quantity || "",
      arrayProdutosMaisVendidos[4]?.quantity || ""
    ]
  }],
    chart: {
    type: 'bar',
    height: 350,
    toolbar: {
      show: false
    },
    colors: [
      "#246dec",
      "#cc3c43",
      "#367952",
      "f5b74f",
      "#4f35a1"
    ]
  },
  plotOptions: {
    bar: {
      distributed: true,
      borderRadius: 4,
      borderRadiusApplication: 'end',
      horizontal: false,
      columnWidth: "40%",
    }
  },
  dataLabels: {
    enabled: false
  },
  legend: {
    show: false
  },
  xaxis: {
    categories: [
      arrayProdutosMaisVendidos[0]?.name || "",
      arrayProdutosMaisVendidos[1]?.name || "",
      arrayProdutosMaisVendidos[2]?.name || "",
      arrayProdutosMaisVendidos[3]?.name || "",
      arrayProdutosMaisVendidos[4]?.name || ""
    ],
  },
  yaxis: {
    title: {
      text: "Count"
    }
  }
  };

  let barChart = new ApexCharts(document.querySelector("#bar-chart"), barChartOptions);
  barChart.render();
  // END BAR CHART



  // AREA CHART
  var areaChartOptions = {
    series: [{
    name: 'Compras',
    data: [22, 42, 27, 51, 58, 102, 99]
  }, {
    name: 'Vendas',
    data: [12, 33, 52, 19, 67, 93, 65]
  }],
    chart: {
    height: 350,
    type: 'area',
    toolbar: {
      show: false,
    },
  },
  colors: ["#4f35a1", "#246dec"],
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: 'smooth'
  },

  labels: ["Jan", "Fev", "Março", "Abril", "Maio", "Jun", "Jul"],
  markers: {
    size: 0
  },
  yaxis: [
    {
      title: {
        text: 'Compras',
      },
    },
    {
      opposite: true,
      title: {
        text: 'Vendas',
      },
    },
  ],
  tooltip: {
    shared: true,
    intersect: false,
  }
  };

  var areaChart = new ApexCharts(document.querySelector("#area-chart"), areaChartOptions);
  areaChart.render();
  // END AREA CHART





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





