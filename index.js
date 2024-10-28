const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const app = express();
const port = 3000;
const ExcelJS = require('exceljs'); // Importa a biblioteca exceljs

// Middleware para processar JSON nas requisições
app.use(express.json());

// Servir arquivos estáticos da pasta "public"
app.use(express.static('public'));

// Rota para fazer o download do inventário em formato de planilha
app.get('/download-inventory', async (req, res) => {
    try {
        const items = await prisma.item.findMany(); // Obtém os itens do inventário

        // Cria uma nova planilha
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Inventário');

        // Adiciona o cabeçalho
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Nome', key: 'name', width: 30 },
            { header: 'Marca', key: 'mark', width: 20 },
            { header: 'Categoria', key: 'category', width: 20 },
            { header: 'Quantidade', key: 'amount', width: 15 }
        ];

        // Adiciona os dados
        items.forEach(item => {
            worksheet.addRow(item);
        });

        // Define o cabeçalho para download
        res.setHeader(
            'Content-Disposition',
            'attachment; filename="inventario.xlsx"'
        );
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );

        // Envia o arquivo para o cliente
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Erro ao gerar a planilha:', error);
        res.status(500).send('Erro ao gerar a planilha');
    }
});

// Rota para adicionar um novo item
app.post('/add-item', async (req, res) => {
    try {
        const { name, mark, category, amount } = req.body;

        const newItem = await prisma.item.create({
            data: {
                name: name,
                mark: mark,
                category: category,
                amount: amount,
            },
        });
        res.json({ message: 'Item criado com sucesso', newItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar o item', details: error });
    }
});

// Rota para listar todos os itens
app.get('/items', async (req, res) => {
    try {
        const allItens = await prisma.item.findMany();
        res.json(allItens);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar os itens', details: error });
    }
});

// Rota para remover um item
app.delete('/remove-item/:id', async (req, res) => {
    const itemId = parseInt(req.params.id);

    try {
        await prisma.item.delete({
            where: { id: itemId }
        });
        res.json({ message: 'Item removido com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao remover o item' });
    }
});

// Rota para atualizar a quantidade de um item
app.put('/update-item/:id', async (req, res) => {
    const itemId = parseInt(req.params.id);
    const { amount } = req.body;

    try {
        const updatedItem = await prisma.item.update({
            where: { id: itemId },
            data: { amount: parseInt(amount) }
        });
        res.json(updatedItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar a quantidade do item' });
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

app.get('/search', async (req, res) => {
    const searchTerm = req.query.term;  // Captura o termo da pesquisa
    
    if (!searchTerm) {
        return res.status(400).json({ error: 'O termo de pesquisa é obrigatório' });
    }

    try {
        // Fazer a pesquisa no banco de dados usando Prisma
        const results = await prisma.item.findMany({
            where: {
                OR: [
                    { name: { contains: searchTerm, mode: 'insensitive' } },
                    { category: { contains: searchTerm, mode: 'insensitive' } },
                    { mark: { contains: searchTerm, mode: 'insensitive' } }
                ]
            }
        });
        
        // Retorna os resultados encontrados
        res.json(results);
    } catch (error) {
        console.error(error); // Verifique o log de erros no console do backend
        res.status(500).json({ error: 'Erro ao realizar a pesquisa' });
    }
});

// Rota para listar todos os itens
app.get('/all-items', async (req, res) => {
    try {
        const allItems = await prisma.item.findMany(); // Busca todos os itens no banco de dados
        res.json(allItems); // Retorna os itens no formato JSON
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao listar os itens' });
    }
});

app.get('/items-by-category', async (req, res) => {
    try {
        const items = await prisma.item.findMany();
        
        // Organizar itens por categoria
        const itemsByCategory = items.reduce((acc, item) => {
            const category = item.category;
            if (!acc[category]) acc[category] = [];
            acc[category].push(item);
            return acc;
        }, {});

        res.json(itemsByCategory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar itens por categoria' });
    }
});
