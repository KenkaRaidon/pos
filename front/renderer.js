// frontend/renderer.js

let cart = []; // Aquí guardamos los productos en memoria

const input = document.getElementById('barcode-input');
const cartBody = document.getElementById('cart-body');
const totalSpan = document.getElementById('total-amount');
const msgDiv = document.getElementById('status-msg');

// 1. Escuchar cuando presionan ENTER en el input
input.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const code = input.value.trim();
        if (code) {
            await searchProduct(code);
            input.value = ''; // Limpiar input para el siguiente producto
        }
    }
});

// 2. Buscar producto en NestJS
async function searchProduct(barcode) {
    msgDiv.innerText = 'Buscando...';
    
    try {
        // Llamada a tu API
        const response = await fetch(`http://localhost:3000/products/barcode/${barcode}`);
        
        if (!response.ok) {
            throw new Error('Producto no encontrado');
        }

        const product = await response.json();
        addToCart(product);
        msgDiv.innerText = ''; // Borrar mensaje error

    } catch (error) {
        msgDiv.innerText = '❌ Producto no encontrado o error de red';
        // Reproducir sonido de error si quieres (opcional)
    }
}

// 3. Agregar al carrito visual
function addToCart(product) {
    // Verificar si ya está en el carrito para sumar cantidad
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: parseFloat(product.salePrice), // Convertir a numero
            quantity: 1
        });
    }
    
    renderCart();
}

// 4. Dibujar la tabla
function renderCart() {
    cartBody.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const subtotal = item.quantity * item.price;
        total += subtotal;

        const row = `
            <tr>
                <td>${item.quantity}</td>
                <td>${item.name}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td><b>$${subtotal.toFixed(2)}</b></td>
            </tr>
        `;
        cartBody.innerHTML += row;
    });

    totalSpan.innerText = total.toFixed(2);
}

// 5. Función placeholder para cobrar
function cobrar() {
    if (cart.length === 0) return alert('El carrito está vacío');
    alert(`Cobrando: $${totalSpan.innerText}\n\nAquí iría la lógica para guardar la venta en la DB.`);
    // Aquí luego llamaremos a POST /sales
    cart = [];
    renderCart();
}