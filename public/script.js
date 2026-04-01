const apiURL = '/products';

// Elementos del DOM
const form = document.getElementById('productForm');
const nameInput = document.getElementById('prodName');
const priceInput = document.getElementById('prodPrice');
const quantityInput = document.getElementById('prodQuantity');
const productsBody = document.getElementById('productsBody');
const productCount = document.getElementById('productCount');
const btnSortPrice = document.getElementById('btnSortPrice');

// Variables globales para el manejo del inventario
let currentProducts = [];
let sortAscending = true;

// Cargar productos al inicio
document.addEventListener('DOMContentLoaded', fetchProducts);

// Botón para ordenar por precio
btnSortPrice.addEventListener('click', () => {
    // Cambiar la dirección del orden
    sortAscending = !sortAscending;
    
    // Flecha de interfaz (estético)
    btnSortPrice.textContent = sortAscending ? 'Ordenar por Precio ⬆️' : 'Ordenar por Precio ⬇️';
    
    // Ordenar el arreglo y volver a renderizar (sin volver a descargar)
    currentProducts.sort((a, b) => sortAscending ? a.price - b.price : b.price - a.price);
    renderTable(currentProducts);
});

// Crear un nuevo producto
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newProduct = {
        name: nameInput.value.trim(),
        price: parseFloat(priceInput.value),
        quantity: parseInt(quantityInput.value)
    };

    try {
        const response = await fetch(apiURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct)
        });

        if (response.ok) {
            form.reset();
            fetchProducts();
        } else {
            const data = await response.json().catch(() => null);
            alert('Error al registrar: ' + (data ? data.error : 'Fallo de conexión o servidor no actualizado'));
        }
    } catch (err) {
        console.error('Error de red:', err);
    }
});

// Descargar todos los productos de la API
async function fetchProducts() {
    try {
        const response = await fetch(apiURL);
        currentProducts = await response.json();
        
        // Renderizar si fue exitoso
        renderTable(currentProducts);
    } catch (err) {
        console.error('Error al cargar productos:', err);
        productsBody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:red;">Error de conexión con el colmado</td></tr>`;
    }
}

// Pintar la lista de productos en el HTML (DOM)
function renderTable(products) {
    productsBody.innerHTML = '';
    
    // ACTUALIZAR CONTADOR
    productCount.textContent = products.length;

    if (products.length === 0) {
        productsBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">El inventario está vacío</td></tr>`;
        return;
    }

    // Crear una fila (tr) por cada producto
    products.forEach(prod => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td class="td-name"></td>
            <td class="td-price"></td>
            <td class="td-quantity"></td>
            <td>
                <button class="btn-edit">Editar</button>
                <button class="btn-delete">Eliminar</button>
            </td>
        `;

        // Asignar los valores del DOM de forma segura
        tr.querySelector('.td-name').textContent = prod.name;
        tr.querySelector('.td-price').textContent = `$${parseFloat(prod.price).toFixed(2)}`;
        tr.querySelector('.td-quantity').textContent = prod.quantity;

        // Manejadores de eventos
        tr.querySelector('.btn-edit').addEventListener('click', () => editProduct(prod));
        tr.querySelector('.btn-delete').addEventListener('click', () => deleteProduct(prod.id));

        productsBody.appendChild(tr);
    });
}

// Editar la informacion de un producto
async function editProduct(product) {
    const newName = prompt('Nombre del producto:', product.name);
    if (newName === null) return;
    
    const newPrice = prompt('Precio del producto:', product.price);
    if (newPrice === null) return;

    const newQuantity = prompt('Cantidad en stock:', product.quantity);
    if (newQuantity === null) return;

    if (newName.trim() === '' || isNaN(newPrice) || isNaN(newQuantity)) {
        alert('Datos inválidos. Verifica que el precio y cantidad sean números.');
        return;
    }

    try {
        const response = await fetch(`${apiURL}/${product.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: newName.trim(), 
                price: parseFloat(newPrice), 
                quantity: parseInt(newQuantity) 
            })
        });
        
        if (response.ok) {
            alert('Producto actualizado correctamente');
            fetchProducts(); // recargar la lista de productos
        } else {
            alert('Error al actualizar el producto en inventario');
        }
    } catch (err) {
        console.error(err);
    }
}

// Borrar el producto
async function deleteProduct(id) {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;

    try {
        const response = await fetch(`${apiURL}/${id}`, { method: 'DELETE' });
        if (response.ok) {
            fetchProducts();
        } else {
            alert('Fallo al borrar el producto');
        }
    } catch (err) {
        console.error(err);
    }
}
