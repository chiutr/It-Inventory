// Inicializa o Firebase
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_DOMINIO",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_STORAGE_BUCKET",
    messagingSenderId: "SEU_MESSAGING_ID",
    appId: "SEU_APP_ID"
  };
  
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  
  // Listener para o formulário de adicionar item
  document.getElementById("add-item-form").addEventListener("submit", function(event) {
      event.preventDefault();
      
      const nome = document.getElementById("item-nome").value;
      const categoria = document.getElementById("item-categoria").value;
      const marca = document.getElementById("item-marca").value; // Novo campo para marca
      const quantidade = parseInt(document.getElementById("item-quantidade").value, 10);
      
      adicionarItem(nome, categoria, marca, quantidade);
      document.getElementById("add-item-form").reset();
      document.getElementById("item-quantidade").value = 1; // Reseta a quantidade para 1
  });
  
  // Funções para incrementar e decrementar a quantidade
  document.getElementById("increment-btn").addEventListener("click", function() {
    const quantidadeInput = document.getElementById("item-quantidade");
    let currentValue = parseInt(quantidadeInput.value, 10);
    
    if (!isNaN(currentValue)) {
        quantidadeInput.value = currentValue + 1;
    } else {
        quantidadeInput.value = 1; // Valor inicial padrão
    }
});

document.getElementById("decrement-btn").addEventListener("click", function() {
    const quantidadeInput = document.getElementById("item-quantidade");
    let currentValue = parseInt(quantidadeInput.value, 10);
    
    if (!isNaN(currentValue) && currentValue > 1) {
        quantidadeInput.value = currentValue - 1;
    }
});
  
  // Função para adicionar item ao Firestore
  function adicionarItem(nome, categoria, marca, quantidade) {
      db.collection("inventario").add({
          nome: nome,
          categoria: categoria,
          marca: marca,
          quantidade: quantidade,
          novo: true
      })
      .then(() => {
          console.log("Item adicionado com sucesso!");
          atualizarInventario(); // Atualiza a interface após adicionar o item
      })
      .catch((error) => {
          console.error("Erro ao adicionar item: ", error);
      });
  }
  
  // Função para remover item do Firestore
  function removerItem(id) {
      db.collection("inventario").doc(id).delete()
      .then(() => {
          console.log("Item removido com sucesso!");
          atualizarInventario(); // Atualiza a interface após remover o item
      })
      .catch((error) => {
          console.error("Erro ao remover item: ", error);
      });
  }
  
  // Função para atualizar o inventário a partir do Firestore
  function atualizarInventario(filtro = "") {
      const inventarioCategorias = document.getElementById("inventario-categorias");
      inventarioCategorias.innerHTML = ""; // Limpa o inventário
  
      db.collection("inventario").get().then((querySnapshot) => {
          const categorias = {};
          
          querySnapshot.forEach((doc) => {
              const item = doc.data();
              item.id = doc.id;
  
              // Filtrar os itens com base no nome ou categoria
              if (item.nome.toLowerCase().includes(filtro.toLowerCase()) || 
                  item.categoria.toLowerCase().includes(filtro.toLowerCase())) {
                  if (!categorias[item.categoria]) categorias[item.categoria] = [];
                  categorias[item.categoria].push(item);
              }
          });
  
          // Renderizar as categorias e itens na interface
          for (const [categoria, items] of Object.entries(categorias)) {
              const categoriaDiv = document.createElement("div");
              categoriaDiv.className = "category";
              
              const categoriaTitulo = document.createElement("h2");
              categoriaTitulo.textContent = categoria;
              categoriaDiv.appendChild(categoriaTitulo);
  
              const tabela = document.createElement("table");
              tabela.innerHTML = `
                  <thead>
                      <tr>
                          <th>Nome</th>
                          <th>Marca</th>
                          <th>Quantidade</th>
                          <th>Ações</th>
                      </tr>
                  </thead>
              `;
              
              const tbody = document.createElement("tbody");
              
              items.forEach((item) => {
                  const row = document.createElement("tr");
  
                  if (item.novo) {
                      row.classList.add("fade-in");
                      item.novo = false;
                  }
  
                  row.innerHTML = `
                      <td>${item.nome}</td>
                      <td>${item.marca}</td>
                      <td>
                          <div class="quantidade-edit">
                              <button onclick="decrementarQuantidade('${item.id}', ${item.quantidade})">-</button>
                              <input type="number" value="${item.quantidade}" onblur="updateQuantidade(this, '${item.id}')">
                              <button onclick="incrementarQuantidade('${item.id}', ${item.quantidade})">+</button>
                          </div>
                      </td>
                      <td><button onclick="removerItem('${item.id}')">Remover</button></td>
                  `;
                  tbody.appendChild(row);
              });
              
              tabela.appendChild(tbody);
              categoriaDiv.appendChild(tabela);
              inventarioCategorias.appendChild(categoriaDiv);
          }
      });
  }
  
  // Função para incrementar a quantidade
  function incrementarQuantidade(id, quantidade) {
      db.collection("inventario").doc(id).update({
          quantidade: quantidade + 1
      })
      .then(() => {
          atualizarInventario();
      });
  }
  
  // Função para decrementar a quantidade
  function decrementarQuantidade(id, quantidade) {
      if (quantidade > 1) {
          db.collection("inventario").doc(id).update({
              quantidade: quantidade - 1
          })
          .then(() => {
              atualizarInventario();
          });
      }
  }
  
  // Função para atualizar a quantidade manualmente no campo
  function updateQuantidade(input, id) {
      const newQuantity = parseInt(input.value, 10);
      if (!isNaN(newQuantity) && newQuantity > 0) {
          db.collection("inventario").doc(id).update({
              quantidade: newQuantity
          })
          .then(() => {
              atualizarInventario();
          });
      } else {
          input.value = newQuantity;
      }
  }
  
  // Evento de pesquisa
  document.getElementById("search-button").addEventListener("click", function() {
      const filtro = document.getElementById("search-input").value;
      atualizarInventario(filtro);
  });
  
  // Inicializa a lista de inventário ao carregar a página
  atualizarInventario();
  
  // Função de pesquisa
  document.getElementById("search-button").addEventListener("click", async function(event) {
    event.preventDefault();
    
    const searchTerm = document.getElementById("search-input").value;
    try {
        const response = await fetch(`/search?term=${encodeURIComponent(searchTerm)}`);
        if (response.ok) {
            const results = await response.json();
            displaySearchResults(results);
        } else {
            alert('Erro ao pesquisar o item.');
        }
    } catch (error) {
        console.error('Erro:', error);
    }
});

// Função para exibir os resultados da pesquisa
function displaySearchResults(results) {
    const inventarioCategorias = document.getElementById("inventario-categorias");
    inventarioCategorias.innerHTML = ''; // Limpa os resultados anteriores

    if (results.length > 0) {
        results.forEach(item => {
            const itemElement = document.createElement("div");
            itemElement.classList.add("search-item");
            itemElement.innerHTML = `
                <strong>Nome:</strong> ${item.name} <br>
                <strong>Marca:</strong> ${item.mark} <br>
                <strong>Categoria:</strong> ${item.category} <br>
                <strong>Quantidade:</strong> ${item.amount} <br>
            `;
            inventarioCategorias.appendChild(itemElement);
        });
    } else {
        inventarioCategorias.innerHTML = '<p>Nenhum resultado encontrado.</p>';
    }
}