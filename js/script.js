document.getElementById("add-item-form").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const nome = document.getElementById("item-nome").value;
    const categoria = document.getElementById("item-categoria").value;
    const marca = document.getElementById("item-marca").value; // Novo campo para marca
    const quantidade = parseInt(document.getElementById("item-quantidade").value, 10);
    
    adicionarItem(nome, categoria, marca, quantidade);
    atualizarInventario();
    
    document.getElementById("add-item-form").reset();
    document.getElementById("item-quantidade").value = 1; // Reseta a quantidade para 1
});

document.getElementById("increment-btn").addEventListener("click", function() {
    const quantidadeInput = document.getElementById("item-quantidade");
    quantidadeInput.value = parseInt(quantidadeInput.value) + 1;
});

document.getElementById("decrement-btn").addEventListener("click", function() {
    const quantidadeInput = document.getElementById("item-quantidade");
    if (parseInt(quantidadeInput.value) > 1) {
        quantidadeInput.value = parseInt(quantidadeInput.value) - 1;
    }
});

// Array para armazenar itens do inventário
const inventario = [];

// Função para adicionar item ao inventário
function adicionarItem(nome, categoria, marca, quantidade) {
    inventario.push({ nome, categoria, marca, quantidade, novo: true });
}

// Função para remover item do inventário
function removerItem(index) {
    inventario.splice(index, 1);
    atualizarInventario();
}

// Função para atualizar o inventário com base em itens e filtro de pesquisa
function atualizarInventario(filtro = "") {
    const inventarioCategorias = document.getElementById("inventario-categorias");
    inventarioCategorias.innerHTML = "";

    const categorias = inventario.reduce((acc, item) => {
        if (
            item.nome.toLowerCase().includes(filtro.toLowerCase()) || 
            item.categoria.toLowerCase().includes(filtro.toLowerCase())
        ) {
            if (!acc[item.categoria]) acc[item.categoria] = [];
            acc[item.categoria].push(item);
        }
        return acc;
    }, {});

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
        
        items.forEach((item, index) => {
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
                        <button onclick="decrementarQuantidade(${index})">-</button>
                        <input type="number" value="${item.quantidade}" onblur="updateQuantidade(this, ${index})">
                        <button onclick="incrementarQuantidade(${index})">+</button>
                    </div>
                </td>
                <td><button onclick="removerItem(${index})">Remover</button></td>
            `;
            tbody.appendChild(row);
        });
        
        tabela.appendChild(tbody);
        categoriaDiv.appendChild(tabela);
        inventarioCategorias.appendChild(categoriaDiv);
    }
}

// Função para incrementar a quantidade
function incrementarQuantidade(index) {
    inventario[index].quantidade += 1;
    atualizarInventario();
}

// Função para decrementar a quantidade
function decrementarQuantidade(index) {
    if (inventario[index].quantidade > 1) {
        inventario[index].quantidade -= 1;
        atualizarInventario();
    }
}

// Função para atualizar a quantidade manualmente no campo
function updateQuantidade(input, index) {
    const newQuantity = parseInt(input.value, 10);
    if (!isNaN(newQuantity) && newQuantity > 0) {
        inventario[index].quantidade = newQuantity;
    } else {
        input.value = inventario[index].quantidade;
    }
}

// Evento de pesquisa
document.getElementById("search-button").addEventListener("click", function() {
    const filtro = document.getElementById("search-input").value;
    atualizarInventario(filtro);
});
