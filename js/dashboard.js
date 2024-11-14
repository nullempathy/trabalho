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


// --------- CHARTS ---------

// BAR CHART
let barChartOptions = {
  series: [{
  data: [10, 8, 6, 4, 2]
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
  categories: ["Geladeiras", "Ar-condicionado", "Freezers", "Refrigerador Industrial", "Bebedouros Refrigerados"
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