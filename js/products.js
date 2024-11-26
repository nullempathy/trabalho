document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("product-form");
  const productList = document.getElementById("product-list");

  loadProducts();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const productName = document.getElementById("product-name").value;
    const productPrice = parseFloat(
      document.getElementById("product-price").value.replace(/[^\d,]/g, '').replace(',', '.')
    ).toFixed(2);


    try {
      const response = await fetch("http://localhost:3000/create/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: productName, price: productPrice }),
      });

      if (response.ok) {
        const newProduct = await response.json();
        addProductToList(newProduct.id, newProduct.name, newProduct.price); // Atualiza a tabela
        form.reset();
      } else {
        console.error("Erro ao criar produto:", await response.json());
      }

    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);
    }
  });

  async function loadProducts() {
    try {
      const response = await fetch("http://localhost:3000/read/product");
      if (response.ok) {
        const products = await response.json();
        products.forEach(product => {
          addProductToList(product.id, product.name, product.price);
        });
      } else {
        console.error("Erro ao carregar produtos:", await response.json());
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);
    }
  }

  function addProductToList(id, name, price) {
    const row = document.createElement("tr");
    row.setAttribute("data-id", id); // Armazena o ID do produto

    row.innerHTML = `
      <td>${name}</td>
      <td>R$ ${formatPrice(price)}</td>
      <td>
        <button class="edit-btn">Editar</button>
      </td>
    `;

    console.log(name);
    row.querySelector(".edit-btn").addEventListener("click", () => editProduct(row, id, name, price));

    productList.appendChild(row);
  }

  function editProduct(row, id, name, price) {
    // Substituir as células por campos de input
    console.log("name", name);
    console.log("price", price);
    row.innerHTML = `
      <td>${name}</td>
      <td><input type="text" value="${formatPrice(price)}" class="edit-price"></td>
      <td>
        <button class="save-btn">Salvar</button>
        <button class="cancel-btn">Cancelar</button>
      </td>
    `;
  
    // Função para salvar as alterações
    row.querySelector(".save-btn").addEventListener("click", async () => {
      const updatedPrice = parseFloat(
        row.querySelector(".edit-price").value.replace(/[^\d,]/g, '').replace(',', '.')
      ).toFixed(2);
  
      console.log("updatedPrice", updatedPrice);
      try {
        // Enviar os dados atualizados ao servidor
        const response = await fetch("http://localhost:3000/update/product", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, price: updatedPrice }),
        });
  
        if (response.ok) {
          const updatedProduct = await response.json();
          console.log(updatedProduct);
          // Atualizar a tabela com os dados salvos
          row.innerHTML = `
            <td>${updatedProduct.name}</td>
            <td>R$ ${formatPrice(updatedProduct.price)}</td>
            <td>
              <button class="edit-btn">Editar</button>
            </td>
          `;
  
          // Re-adicionar o event listener ao botão de editar
          row.querySelector(".edit-btn").addEventListener("click", () => editProduct(row, id, updatedProduct.name, updatedProduct.price));
        } else {
          console.error("Erro ao atualizar produto:", await response.json());
        }
      } catch (error) {
        console.error("Erro ao conectar com o servidor:", error);
      }
    });
  
    // Função para cancelar a edição (restaurar os valores originais)
    row.querySelector(".cancel-btn").addEventListener("click", () => {
      row.innerHTML = `
        <td>${name}</td>
        <td>R$ ${formatPrice(price)}</td>
        <td>
          <button class="edit-btn">Editar</button>
        </td>
      `;
      row.querySelector(".edit-btn").addEventListener("click", () => editProduct(row, id, name, price));
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

