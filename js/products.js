document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("product-form");
  const productList = document.getElementById("product-list");

  loadProducts();

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const productName = document.getElementById("product-name").value;
    const productPrice = parseFloat(
      document.getElementById("product-price").value.replace(/[^\d,]/g, '').replace(',', '.')
    ).toFixed(2);

    addProductToList(productName, productPrice);
    saveProducts();

    form.reset();
  });

  function addProductToList(name, price) {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${name}</td>
      <td>R$ ${formatPrice(price)}</td>
      <td>
        <button class="edit-btn">Editar</button>
        <button class="delete-btn">Excluir</button>
      </td>
    `;

    row.querySelector(".edit-btn").addEventListener("click", () => editProduct(row, name, price));
    row.querySelector(".delete-btn").addEventListener("click", () => deleteProduct(row));

    productList.appendChild(row);
  }

  function editProduct(row, name, price) {
    // Substituir as células por campos de input
    row.innerHTML = `
      <td><input type="text" value="${name}" class="edit-name"></td>
      <td><input type="text" value="${formatPrice(price)}" class="edit-price"></td>
      <td>
        <button class="save-btn">Salvar</button>
        <button class="cancel-btn">Cancelar</button>
      </td>
    `;

    // Função para salvar as alterações
    row.querySelector(".save-btn").addEventListener("click", () => {
      const updatedName = row.querySelector(".edit-name").value;
      const updatedPrice = parseFloat(
        row.querySelector(".edit-price").value.replace(/[^\d,]/g, '').replace(',', '.')
      ).toFixed(2);

      // Limpar a formatação do preço
      row.innerHTML = `
        <td>${updatedName}</td>
        <td>R$ ${formatPrice(updatedPrice)}</td>
        <td>
          <button class="edit-btn">Editar</button>
          <button class="delete-btn">Excluir</button>
        </td>
      `;

      // Re-adicionar os event listeners aos botões
      row.querySelector(".edit-btn").addEventListener("click", () => editProduct(row, updatedName, updatedPrice));
      row.querySelector(".delete-btn").addEventListener("click", () => deleteProduct(row));

      saveProducts();
    });

    // Função para cancelar a edição (restaurar os valores originais)
    row.querySelector(".cancel-btn").addEventListener("click", () => {
      row.innerHTML = `
        <td>${name}</td>
        <td>R$ ${formatPrice(price)}</td>
        <td>
          <button class="edit-btn">Editar</button>
          <button class="delete-btn">Excluir</button>
        </td>
      `;
      row.querySelector(".edit-btn").addEventListener("click", () => editProduct(row, name, price));
      row.querySelector(".delete-btn").addEventListener("click", () => deleteProduct(row));
    });
  }

  function deleteProduct(row) {
    row.remove();
    saveProducts(); // Salvar as alterações no localStorage após exclusão
  }

  function saveProducts() {
    const rows = document.querySelectorAll("#product-list tr");
    const products = [];

    rows.forEach(row => {
      const name = row.querySelector("td:nth-child(1)").textContent;
      const price = row.querySelector("td:nth-child(2)").textContent.replace('R$ ', '').replace(',', '.');
      products.push({ name, price });
    });

    localStorage.setItem("products", JSON.stringify(products)); // Salva os produtos no localStorage
  }

  function loadProducts() {
    const products = JSON.parse(localStorage.getItem("products")) || [];

    products.forEach(product => {
      addProductToList(product.name, product.price);
    });
  }

  function formatPrice(price) {
    return parseFloat(price).toFixed(2).replace('.', ',');
  }
});


// Formata o "Valor do Produto" na hora do cadastro
document.getElementById('product-price').addEventListener('input', function(e) {
  let value = e.target.value;

  // Remove tudo que não seja número ou vírgula
  value = value.replace(/[^\d,]/g, '');

  // Adiciona o 'R$' no início
  value = 'R$' + value;

  // Atualiza o valor no campo de entrada
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

