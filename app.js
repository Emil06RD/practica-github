const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

// Middleware 
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Arreglo en memoria (Base de datos del colmado)
let products = [
    { id: 1, name: 'Arroz', price: 35.00, quantity: 50 },
    { id: 2, name: 'Habichuelas', price: 65.00, quantity: 20 }
];
let nextId = 3;

// GET /products
app.get('/products', (req, res) => {
    res.json(products);
});

// POST /products
app.post('/products', (req, res) => {
    const { name, price, quantity } = req.body;
    
    if (!name || price === undefined || price === '' || quantity === undefined || quantity === '') {
        return res.status(400).json({ error: 'Nombre, precio y cantidad son requeridos' });
    }

    if (isNaN(parseFloat(price)) || isNaN(parseInt(quantity))) {
        return res.status(400).json({ error: 'El precio y la cantidad deben ser valores numéricos' });
    }

    const newProduct = {
        id: nextId++,
        name,
        price: parseFloat(price),
        quantity: parseInt(quantity)
    };
    
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// PUT /products/:id
app.put('/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { name, price, quantity } = req.body;
    
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    if (name) products[productIndex].name = name;
    if (price !== undefined && !isNaN(parseFloat(price))) products[productIndex].price = parseFloat(price);
    if (quantity !== undefined && !isNaN(parseInt(quantity))) products[productIndex].quantity = parseInt(quantity);

    res.json(products[productIndex]);
});

// DELETE /products/:id
app.delete('/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const deletedProduct = products.splice(productIndex, 1);
    res.json({ message: 'Producto eliminado', product: deletedProduct[0] });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor de Colmado corriendo en http://localhost:${port}`);
});
