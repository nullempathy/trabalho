document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("purchase-form");
  const purchaseList = document.getElementById("purchase-list");
  const filterYear = document.getElementById("filter-year");
  const filterMonth = document.getElementById("filter-month");
  const filterDay = document.getElementById("filter-day");
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
      const dataPurchase = await createPurchase(name, quantity, unitPrice, date);
      console.log("dataPurchase", dataPurchase);
      await createStock(dataPurchase.id, quantity);

      if (filterPurchasesOngoing(date)) {
        addPurchaseToList(dataPurchase.id, name, quantity, unitPrice, date, totalPrice);
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
          purchase.id,
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

  function addPurchaseToList(purchaseId, name, quantity, unitPrice, date, totalPrice) {
    // Remove o horário da data, mantendo apenas o formato YYYY-MM-DD
    const [year, month, day] = date.split("T")[0].split("-");

    const formattedDate = `${day}/${month}/${year}`;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formattedDate}</td>
      <td>${name}</td>
      <td>${quantity}</td>
      <td>${formatarMoedaBR(unitPrice)}</td>
      <td>${formatarMoedaBR(totalPrice)}</td>
      <td>
        <button class="edit-btn">Editar</button>
      </td>
    `;

    row.querySelector(".edit-btn").addEventListener("click", () => editPurchase(row, purchaseId, name, quantity, unitPrice, formattedDate, totalPrice));
    purchaseList.appendChild(row);
  }

  async function editPurchase(row, purchaseId, name, oldQuantity, oldUnitPrice, formattedDate, oldTotalPrice) {
    row.innerHTML = `
      <td>${formattedDate}</td>
      <td><input type="string" value="${name}" class="edit-name"></td>
      <td><input type="number" value="${oldQuantity}" class="edit-quantity"></td>
      <td><input type="number" value="${oldUnitPrice}" class="edit-unitprice"</td>
      <td>${formatarMoedaBR(oldTotalPrice)}</td>
      <td colspan="2">
        <button class="save-btn">Salvar</button>
        <button class="cancel-btn">Cancelar</button>
      </td>
    `;

    row.querySelector(".save-btn").addEventListener("click", async () => {
      const updatedName = row.querySelector(".edit-name").value;
      const updatedQuantity = parseInt(row.querySelector(".edit-quantity").value, 10);
      const updatedUnitPrice = parseInt(row.querySelector(".edit-unitprice").value, 10);

      try {
        const response = await fetch("http://localhost:3000/read/stock");
        if (response.ok) {
          const stockItems = await response.json();
          for (const stock of stockItems) {
            if(stock.purchase.productName === name) {
              try {
                const response = await fetch("http://localhost:3000/update/stock", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: stock.id, quantity: updatedQuantity }),
                });
              } catch (error) {
                console.error("Erro ao fazer o update de stock depois do update product:", error);
              }
            }
          }
        } else {
          console.error("Erro ao carregar estoque:", await response.json());
        }
      } catch (error) {
        console.error("Erro ao fazer a leitura de stock depois do update product:", error);
      }

      try {
        const response = await fetch("http://localhost:3000/update/purchase", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: purchaseId, productName: updatedName, quantity: updatedQuantity, price: updatedUnitPrice }),
        });

        if (response.ok) {
          const updatedPurchase = await response.json();
          const updatedTotalPrice = (updatedPurchase.quantity * updatedPurchase.price).toFixed(2);
          row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${updatedPurchase.productName}</td>
            <td>${updatedPurchase.quantity}</td>
            <td>${formatarMoedaBR(updatedPurchase.price)}</td>
            <td>${formatarMoedaBR(updatedTotalPrice)}</td>
            <td>
              <button class="edit-btn">Editar</button>
            </td>
          `;
          row, purchaseId, name, oldQuantity, oldUnitPrice, formattedDate, oldTotalPrice
          row.querySelector(".edit-btn").addEventListener("click", () => editPurchase(row, purchaseId, updatedPurchase.productName, updatedPurchase.quantity, updatedPurchase.price, formattedDate, updatedTotalPrice));
        } else {
          console.error("Erro ao atualizar compra:", await response.json());
        }
      } catch (error) {
        console.error("Erro ao conectar com o servidor:", error);
      }
    });

    row.querySelector(".cancel-btn").addEventListener("click", async () => {
      row.innerHTML = `
        <td>${formattedDate}</td>
        <td>${name}</td>
        <td>${oldQuantity}</td>
        <td>${formatarMoedaBR(oldUnitPrice)}</td>
        <td>${formatarMoedaBR(oldTotalPrice)}</td>
        <td>
          <button class="edit-btn">Editar</button>
        </td>
      `;
      row.querySelector(".edit-btn").addEventListener("click", () => editPurchase(row, purchaseId, name, oldQuantity, oldUnitPrice, formattedDate, oldTotalPrice));
    });
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

  async function createStock(purchaseId, purchaseQuantity) {
    try {
      const response = await fetch("http://localhost:3000/create/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchaseId, quantity: purchaseQuantity }),
      });
    } catch (error) {
      console.error("Erro ao criar estoque:", await response.json());
      alert("Erro ao salvar estoque. Tente novamente.");
    }
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
