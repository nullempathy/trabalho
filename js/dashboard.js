document.addEventListener("DOMContentLoaded", async () => {
  const filterYear = document.getElementById("filter-year");
  const filterSemester = document.getElementById("filter-semester");
  const filterButton = document.getElementById("filter-button");
  const stock = document.getElementById("stock");
  const purchases = document.getElementById("purchases");
  const sells = document.getElementById("sells");
  const outOfStock = document.getElementById("stock-alert");


  populateYearFilter();
  populateSemesterFilter();

  preencheOGraficoSemestral(filterSemester.value);


  // QUANTIDADE TOTAL DE PRODUTOS EM ESTOQUE
  async function calcularQuantidadeTotalDeProdutosEmEstoque() {
    const stockItems = await getStock();
    let total = 0;
    for (let i = 0; i < stockItems.length; i++) {
        if(stockItems[i].status !== "Esgotado") {
          // Para cada item em estoque, somamos a quantidade ao total para obter o total de produtos disponiveis em estoque.
          total += stockItems[i].quantity;
        } 
    }
    return total;
  }

  const calculoDaQuantidadeTotalDeProdutosEmEstoque = await calcularQuantidadeTotalDeProdutosEmEstoque();
  stock.textContent = `${calculoDaQuantidadeTotalDeProdutosEmEstoque.toFixed(0)} PRODUTOS DISPONÍVEIS`;
  if(calculoDaQuantidadeTotalDeProdutosEmEstoque === 1) {
    stock.textContent = `${calculoDaQuantidadeTotalDeProdutosEmEstoque.toFixed(0)} PRODUTO DISPONÍVEL`;
  }


  // QUANTIDADE TOTAL DE VENDAS FEITAS
  async function calcularQuantidadeTotalDeVendasFeitas(year, month) {
    const sells = await filterSells(year, month);
    let total = 0;
    for (let i = 0; i < sells.length; i++) {
      // Para cada venda realizada, somamos a quantidade de vendas ao total para obter o total de vendas realizadas.
      total += sells[i].quantity;
    }
    return total;
  }
  
  async function calcularQuantidadeTotalDeVendasFeitasNoPrimeiroSemestre() {
    let total = 0;
    for(i = 0; i < 6; i++) {
      total += await calcularQuantidadeTotalDeVendasFeitas(filterYear.value, `0${i}`);
    }
    return total;
  }

  async function calcularQuantidadeTotalDeVendasFeitasNoSegundoSemestre() {
    let total = 0;
    for(i = 6; i < 10; i++) {
      total += await calcularQuantidadeTotalDeVendasFeitas(filterYear.value, `0${i}`);
    }
    total += await calcularQuantidadeTotalDeVendasFeitas(filterYear.value, `10`);
    total += await calcularQuantidadeTotalDeVendasFeitas(filterYear.value, `11`);
    return total;
  }

  async function calcularQuantidadeTotalDeVendasFeitasNoAno() {
    let total = 0;
    total += await calcularQuantidadeTotalDeVendasFeitasNoPrimeiroSemestre();
    total += await calcularQuantidadeTotalDeVendasFeitasNoSegundoSemestre();
    return total;
  }

  const calculoDaQuantidadeTotalDeVendasFeitasNoPrimeiroSemestre = await calcularQuantidadeTotalDeVendasFeitasNoPrimeiroSemestre();
  sells.textContent = `${calculoDaQuantidadeTotalDeVendasFeitasNoPrimeiroSemestre.toFixed(0)} PRODUTOS VENDIDOS`;
  if(calculoDaQuantidadeTotalDeVendasFeitasNoPrimeiroSemestre === 1) {
    sells.textContent = `${calculoDaQuantidadeTotalDeVendasFeitasNoPrimeiroSemestre.toFixed(0)} PRODUTO VENDIDO`;
  }



  // QUANTIDADE TOTAL DE PRODUTOS NÃO DISPONIVEIS
  async function calcularQuantidadeTotalDeProdutosNaoDisponiveis() {
    const stockItems = await getStock();
    let total = 0;
    for (let i = 0; i < stockItems.length; i++) {
      // Para cada item em estoque não disponivel, somamos a quantidade ao total para obter o total de produtos não disponiveis em estoque.
      if(stockItems[i].status === "Esgotado") {
        total = total + 1;
      }
    }
    return total;
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
      name: sell.stock.purchase.productName,
    }));

    // Ordenamos o array em ordem decrescente pela quantidade
    vendasPorProduto.sort((a, b) => b.quantity - a.quantity);

    return vendasPorProduto;
  }

  async function pegaOsCincoProdutosMaisVendidos(year, month) {
    const arrayProdutos = await ordenaOsProdutosMaisVendidos(year, month);
    return arrayProdutos.slice(0, 5);
  }

  const arrayProdutosMaisVendidos = await pegaOsCincoProdutosMaisVendidos(filterYear.value, null);

  // QUANTIDADE TOTAL DE COMPRAS FEITAS
  async function calcularQuantidadeTotalDeComprasFeitas(year, month) {
    const purchases = await filterPurchases(year, month);
    let total = 0;
    for (let i = 0; i < purchases.length; i++) {
      // Para cada compra realizada, somamos as compras ao total para obter o total de compras realizadas.
      total += purchases[i].quantity;
    }
    return total;
  }



  // PEGAR AS COMPRAS E VENDAS DOS MESES DO PRIMEIRO SEMESTRE
  async function pegaAsComprasEVendasDoPrimeiroSemestre() {
    const vendasJaneiro = await calcularQuantidadeTotalDeVendasFeitas(filterYear.value, "01");
    const vendasFevereiro = await calcularQuantidadeTotalDeVendasFeitas(filterYear.value, "02");
    const vendasMarch = await calcularQuantidadeTotalDeVendasFeitas(filterYear.value, "03");
    const vendasAbril = await calcularQuantidadeTotalDeVendasFeitas(filterYear.value, "04");
    const vendasMaio = await calcularQuantidadeTotalDeVendasFeitas(filterYear.value, "05");
    const vendasJunho = await calcularQuantidadeTotalDeVendasFeitas(filterYear.value, "06");

    const comprasJaneiro = await calcularQuantidadeTotalDeComprasFeitas(filterYear.value, "01");
    const comprasFevereiro = await calcularQuantidadeTotalDeComprasFeitas(filterYear.value, "02");
    const comprasMarch = await calcularQuantidadeTotalDeComprasFeitas(filterYear.value, "03");
    const comprasAbril = await calcularQuantidadeTotalDeComprasFeitas(filterYear.value, "04");
    const comprasMaio = await calcularQuantidadeTotalDeComprasFeitas(filterYear.value, "05");
    const comprasJunho = await calcularQuantidadeTotalDeComprasFeitas(filterYear.value, "06");

    return {
      vendas: [
        vendasJaneiro,
        vendasFevereiro,
        vendasMarch,
        vendasAbril,
        vendasMaio,
        vendasJunho
      ],
      compras: [
        comprasJaneiro,
        comprasFevereiro,
        comprasMarch,
        comprasAbril,
        comprasMaio,
        comprasJunho
      ]
    }
  }

  // PEGAR AS COMPRAS E VENDAS DOS MESES DO SEGUNDO SEMESTRE
  async function pegaAsComprasEVendasDoSegundoSemestre() {
    const vendasJulho = await calcularQuantidadeTotalDeVendasFeitas(filterYear.value, "07");
    const vendasAgosto = await calcularQuantidadeTotalDeVendasFeitas(filterYear.value, "08");
    const vendasSetembro = await calcularQuantidadeTotalDeVendasFeitas(filterYear.value, "09");
    const vendasOutubro = await calcularQuantidadeTotalDeVendasFeitas(filterYear.value, "10");
    const vendasNovembro = await calcularQuantidadeTotalDeVendasFeitas(filterYear.value, "11");
    const vendasDezembro = await calcularQuantidadeTotalDeVendasFeitas(filterYear.value, "12");

    const comprasJulho = await calcularQuantidadeTotalDeComprasFeitas(filterYear.value, "07");
    const comprasAgosto = await calcularQuantidadeTotalDeComprasFeitas(filterYear.value, "08");
    const comprasSetembro = await calcularQuantidadeTotalDeComprasFeitas(filterYear.value, "09");
    const comprasOutubro = await calcularQuantidadeTotalDeComprasFeitas(filterYear.value, "10");
    const comprasNovembro = await calcularQuantidadeTotalDeComprasFeitas(filterYear.value, "11");
    const comprasDezembro = await calcularQuantidadeTotalDeComprasFeitas(filterYear.value, "12");

    return {
      vendas: [
        vendasJulho,
        vendasAgosto,
        vendasSetembro,
        vendasOutubro,
        vendasNovembro,
        vendasDezembro
      ],
      compras: [
        comprasJulho,
        comprasAgosto,
        comprasSetembro,
        comprasOutubro,
        comprasNovembro,
        comprasDezembro
      ]
    }
  }

  async function pegaAsComprasEVendasDoAno() {
    const dadosVendasEComprasDoPrimeiroSemestre = await pegaAsComprasEVendasDoPrimeiroSemestre();
    const dadosVendasEComprasDoSegundoSemestre = await pegaAsComprasEVendasDoSegundoSemestre();
  
    // Combina os dados dos dois semestres
    const vendasDoAno = [
      ...dadosVendasEComprasDoPrimeiroSemestre.vendas,
      ...dadosVendasEComprasDoSegundoSemestre.vendas
    ];
  
    const comprasDoAno = [
      ...dadosVendasEComprasDoPrimeiroSemestre.compras,
      ...dadosVendasEComprasDoSegundoSemestre.compras
    ];
  
    return {
      vendas: vendasDoAno,
      compras: comprasDoAno
    };
  }

  let barChart = null;
  let areaChart = null;
  
  async function preencheOGraficoSemestral(semestre) {
    let dadosVendasEComprasDoSemestre = null;
    let primeiroSemestre = 0;
    let ano = 0;
    if (semestre === "01") {
      dadosVendasEComprasDoSemestre = await pegaAsComprasEVendasDoPrimeiroSemestre();
      primeiroSemestre = 1;
    }
    if (semestre === "02") {
      dadosVendasEComprasDoSemestre = await pegaAsComprasEVendasDoSegundoSemestre();
    }
    if (semestre === null) {
      dadosVendasEComprasDoSemestre = await pegaAsComprasEVendasDoAno();
      ano = 1;
    }
    const comprasDoSemestre = await dadosVendasEComprasDoSemestre.compras || [];
    const vendasDoSemestre = await dadosVendasEComprasDoSemestre.vendas || [];


    // --------- CHARTS ---------

    // --------- REMOVE GRÁFICOS EXISTENTES ---------
    if (barChart) barChart.destroy();
    if (areaChart) areaChart.destroy();

    if(!ano) {
      // BAR CHART
      let barChartOptions = {
        series: [{
        data: [
          arrayProdutosMaisVendidos[0]?.quantity || "",
          arrayProdutosMaisVendidos[1]?.quantity || "",
          arrayProdutosMaisVendidos[2]?.quantity || "",
          arrayProdutosMaisVendidos[3]?.quantity || "",
          arrayProdutosMaisVendidos[4]?.quantity || "",
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

      barChart = new ApexCharts(document.querySelector("#bar-chart"), barChartOptions);
      barChart.render();
      // END BAR CHART



      // AREA CHART
      let areaChartOptions = {
        series: [{
        name: 'Compras',
        data: [
          comprasDoSemestre[0],
          comprasDoSemestre[1],
          comprasDoSemestre[2],
          comprasDoSemestre[3],
          comprasDoSemestre[4],
          comprasDoSemestre[5],
        ]
      }, {
        name: 'Vendas',
        data: [
          vendasDoSemestre[0],
          vendasDoSemestre[1],
          vendasDoSemestre[2],
          vendasDoSemestre[3],
          vendasDoSemestre[4],
          vendasDoSemestre[5],
        ]
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

      labels: [
        primeiroSemestre === 1 ? "Jan" : "Jul",
        primeiroSemestre === 1 ? "Fev" : "Aug",
        primeiroSemestre === 1 ? "Mar" : "Set",
        primeiroSemestre === 1 ? "Abril" : "Out",
        primeiroSemestre === 1 ? "Maio" : "Nov",
        primeiroSemestre === 1 ? "Jun" : "Dez",
      ],
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

      areaChart = new ApexCharts(document.querySelector("#area-chart"), areaChartOptions);
      areaChart.render();
      // END AREA CHART
    }
    else {
      // BAR CHART
      let barChartOptions = {
        series: [{
        data: [
          arrayProdutosMaisVendidos[0]?.quantity || "",
          arrayProdutosMaisVendidos[1]?.quantity || "",
          arrayProdutosMaisVendidos[2]?.quantity || "",
          arrayProdutosMaisVendidos[3]?.quantity || "",
          arrayProdutosMaisVendidos[4]?.quantity || "",
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

      barChart = new ApexCharts(document.querySelector("#bar-chart"), barChartOptions);
      barChart.render();
      // END BAR CHART



      // AREA CHART
      let areaChartOptions = {
        series: [{
        name: 'Compras',
        data: [
          comprasDoSemestre[0],
          comprasDoSemestre[1],
          comprasDoSemestre[2],
          comprasDoSemestre[3],
          comprasDoSemestre[4],
          comprasDoSemestre[5],
          comprasDoSemestre[6],
          comprasDoSemestre[7],
          comprasDoSemestre[8],
          comprasDoSemestre[9],
          comprasDoSemestre[10],
          comprasDoSemestre[11],
        ]
      }, {
        name: 'Vendas',
        data: [
          vendasDoSemestre[0],
          vendasDoSemestre[1],
          vendasDoSemestre[2],
          vendasDoSemestre[3],
          vendasDoSemestre[4],
          vendasDoSemestre[5],
          vendasDoSemestre[6],
          vendasDoSemestre[7],
          vendasDoSemestre[8],
          vendasDoSemestre[9],
          vendasDoSemestre[10],
          vendasDoSemestre[11],
        ]
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

      labels: [
        "Jan",
        "Fev",
        "Mar",
        "Abril",
        "Maio",
        "Jun",
        "Jul",
        "Aug",
        "Set",
        "Out",
        "Nov",
        "Dez",
      ],
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

      areaChart = new ApexCharts(document.querySelector("#area-chart"), areaChartOptions);
      areaChart.render();
      // END AREA CHART      
    }
    

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

  function populateSemesterFilter() {
    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "Todos os Semestres";
    const firstSemester = document.createElement("option");
    firstSemester.value = "01";
    firstSemester.textContent = "Primeiro Semestre";
    const secondSemester = document.createElement("option");
    secondSemester.value = "02";
    secondSemester.textContent = "Segundo Semestre";
    filterSemester.insertBefore(firstSemester, filterSemester.firstChild);
    filterSemester.insertBefore(secondSemester, filterSemester.firstChild);
    filterSemester.insertBefore(allOption, filterSemester.firstChild);
  }

  filterButton.addEventListener("click", async () => {
    const selectedYear = filterYear.value;
    const selectedSemester = filterSemester.value !== "all" ? filterSemester.value : null;
    console.log("selectedYear", selectedYear);
    console.log("selectedSemester", selectedSemester);
    if (selectedSemester === "01") {
      const calculoDaQuantidadeTotalDeVendasFeitasNoPrimeiroSemestre = await calcularQuantidadeTotalDeVendasFeitasNoPrimeiroSemestre();
      sells.textContent = `${calculoDaQuantidadeTotalDeVendasFeitasNoPrimeiroSemestre.toFixed(0)} PRODUTOS VENDIDOS`;
      if(calculoDaQuantidadeTotalDeVendasFeitasNoPrimeiroSemestre === 1) {
        sells.textContent = `${calculoDaQuantidadeTotalDeVendasFeitasNoPrimeiroSemestre.toFixed(0)} PRODUTO VENDIDO`;
      }
    }
    if (selectedSemester === "02") {
      const calculoDaQuantidadeTotalDeVendasFeitasNoSegundoSemestre = await calcularQuantidadeTotalDeVendasFeitasNoSegundoSemestre();
      sells.textContent = `${calculoDaQuantidadeTotalDeVendasFeitasNoSegundoSemestre.toFixed(0)} PRODUTOS VENDIDOS`;
      if(calculoDaQuantidadeTotalDeVendasFeitasNoSegundoSemestre === 1) {
        sells.textContent = `${calculoDaQuantidadeTotalDeVendasFeitasNoSegundoSemestre.toFixed(0)} PRODUTO VENDIDO`;
      }
    }
    if (selectedSemester === null) {
      const calculoDaQuantidadeTotalDeVendasFeitasNoAno = await calcularQuantidadeTotalDeVendasFeitasNoAno();
      sells.textContent = `${calculoDaQuantidadeTotalDeVendasFeitasNoAno.toFixed(0)} PRODUTOS VENDIDOS`;
      if(calculoDaQuantidadeTotalDeVendasFeitasNoAno === 1) {
        sells.textContent = `${calculoDaQuantidadeTotalDeVendasFeitasNoAno.toFixed(0)} PRODUTO VENDIDO`;
      }
    }
    preencheOGraficoSemestral(selectedSemester);

  });

  // Filtro flexível por Ano/Mês/Dia
  async function filterSells(year, month, day) {
    try {
      const sells = await getSellsByDate(year, month, day);

      sells.forEach((sell) => {
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

  
      purchases.forEach((purchase) => {
      });

      return purchases;
    } catch (error) {
      console.error("Erro ao filtrar compras:", error);
      alert("Erro ao filtrar compras. Tente novamente.");
    }
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
        stockItems.forEach((stock) => {
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





