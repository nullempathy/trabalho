document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("stock-form");
  const stockList = document.getElementById("stock-list");
  const productSelect = document.getElementById("product-select");
  const quantityInput = document.getElementById("product-quantity");

  populateProductSelect();
  loadStock();

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const productName = productSelect.value;
    const productPrice = getProductPrice(productName); // Obtém o preço do produto do localStorage
    const productQuantity = parseInt(quantityInput.value, 10);

    addProductToList(productName, productPrice, productQuantity);
    saveStock();

    form.reset();
  });

  function populateProductSelect() {
    const products = JSON.parse(localStorage.getItem("products")) || [];

    productSelect.innerHTML = ''; // Limpa o select antes de preencher
    products.forEach(product => {
      const option = document.createElement("option");
      option.value = product.name;
      option.textContent = product.name;
      productSelect.appendChild(option);
    });
  }

  function getProductPrice(productName) {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const product = products.find(p => p.name === productName);
    return product ? product.price : "0.00"; // Retorna o preço do produto ou "0.00" se não encontrado
  }

  function getProductStatus(quantity) {
    if (quantity > 10) return `<span class="status available font-weight-bold">Disponível</span>`;
    if (quantity > 0 && quantity <= 10) return `<span class="status low-stock font-weight-bold">Perto de acabar</span>`;
    if (quantity <= 0) return `<span class="status out-of-stock font-weight-bold">Esgotado</span>`;
  }

  function addProductToList(name, price, quantity) {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${name}</td>
      <td>R$ ${formatPrice(price)}</td>
      <td>${quantity}</td>
      <td>${getProductStatus(quantity)}</td>
      <td>
        <button class="edit-btn">Editar</button>
        <button class="delete-btn">Excluir</button>
      </td>
    `;

    row.querySelector(".edit-btn").addEventListener("click", () => editProduct(row));
    row.querySelector(".delete-btn").addEventListener("click", () => deleteProduct(row));
    stockList.appendChild(row);
  }

  function editProduct(row) {
    const name = row.querySelector("td:nth-child(1)").textContent;
    const price = parseFloat(row.querySelector("td:nth-child(2)").textContent.replace('R$ ', '').replace(',', '.'));
    const quantity = parseInt(row.querySelector("td:nth-child(3)").textContent, 10);
  
    // Substituir os valores por inputs editáveis
    row.innerHTML = `
      <td><input type="text" value="${name}" class="edit-name"></td>
      <td><input type="text" value="${price.toFixed(2).replace('.', ',')}" class="edit-price"></td>
      <td><input type="number" value="${quantity}" class="edit-quantity"></td>
      <td>${getProductStatus(quantity)}</td>
      <td>
        <button class="save-btn">Salvar</button>
        <button class="cancel-btn">Cancelar</button>
      </td>
    `;
  
    // Botão Salvar
    row.querySelector(".save-btn").addEventListener("click", () => {
      const updatedName = row.querySelector(".edit-name").value;
      const updatedPrice = parseFloat(row.querySelector(".edit-price").value.replace(',', '.')).toFixed(2);
      const updatedQuantity = parseInt(row.querySelector(".edit-quantity").value, 10);
  
      row.innerHTML = `
        <td>${updatedName}</td>
        <td>R$ ${updatedPrice.replace('.', ',')}</td>
        <td>${updatedQuantity}</td>
        <td>${getProductStatus(updatedQuantity)}</td>
        <td>
          <button class="edit-btn">Editar</button>
          <button class="delete-btn">Excluir</button>
        </td>
      `;
  
      // Reaplicando eventos
      row.querySelector(".edit-btn").addEventListener("click", () => editProduct(row));
      row.querySelector(".delete-btn").addEventListener("click", () => deleteProduct(row));
  
      saveStock(); // Persistir alterações
    });
  
    // Botão Cancelar
    row.querySelector(".cancel-btn").addEventListener("click", () => {
      row.innerHTML = `
        <td>${name}</td>
        <td>R$ ${price.toFixed(2).replace('.', ',')}</td>
        <td>${quantity}</td>
        <td>${getProductStatus(quantity)}</td>
        <td>
          <button class="edit-btn">Editar</button>
          <button class="delete-btn">Excluir</button>
        </td>
      `;
      row.querySelector(".edit-btn").addEventListener("click", () => editProduct(row));
      row.querySelector(".delete-btn").addEventListener("click", () => deleteProduct(row));
    });
  }

  function deleteProduct(row) {
    row.remove();
    saveStock();
  }

  function saveStock() {
    const rows = document.querySelectorAll("#stock-list tr");
    const stock = [];

    rows.forEach(row => {
      const name = row.querySelector("td:nth-child(1)").textContent;
      const price = row.querySelector("td:nth-child(2)").textContent.replace('R$ ', '').replace(',', '.');
      const quantity = parseInt(row.querySelector("td:nth-child(3)").textContent, 10);
      stock.push({ name, price, quantity });
    });

    localStorage.setItem("stock", JSON.stringify(stock)); // Salva o estoque no localStorage
  }

  function loadStock() {
    const stock = JSON.parse(localStorage.getItem("stock")) || [];

    stock.forEach(product => {
      addProductToList(product.name, product.price, product.quantity);
    });
  }

  function formatPrice(price) {
    return parseFloat(price).toFixed(2).replace('.', ',');
  }
});
