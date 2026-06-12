// ============================================
// cart.js — Gestion du panier
// ============================================

async function loadCart() {
    const container = document.getElementById('cart-items');
    const summary = document.getElementById('cart-summary');

    // Vérifier connexion
    const token = localStorage.getItem('token');
    if (!token) {
        container.innerHTML = `
            <div class="text-center py-12 text-gray-400">
                <i class="fa-solid fa-lock text-4xl mb-3"></i>
                <p class="font-medium">Connectez-vous pour voir votre panier</p>
                <a href="login.html" class="mt-3 inline-block bg-[#6B7A4F] text-white px-6 py-2 rounded-full text-sm font-medium">
                    Se connecter
                </a>
            </div>
        `;
        if (summary) summary.classList.add('hidden');
        return;
    }

    try {
        const cart = await getCart();
        const items = cart.items || [];

        if (items.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-gray-400">
                    <i class="fa-solid fa-cart-arrow-down text-4xl mb-2"></i>
                    <p>Votre panier est vide</p>
                    <a href="products.html" class="text-[#6B7A4F] font-medium mt-2 inline-block">Continuer les achats</a>
                </div>
            `;
            if (summary) summary.classList.add('hidden');
            return;
        }

        let subtotal = 0;
        container.innerHTML = items.map(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            return `
                <div class="flex items-center gap-4 bg-white rounded-[16px] p-4 shadow-sm">
                    <img src="${item.image || 'https://via.placeholder.com/80'}" 
                         class="w-20 h-20 object-cover rounded-[12px]" alt="${item.name}">
                    <div class="flex-1">
                        <h3 class="font-semibold text-sm">${item.name}</h3>
                        <p class="text-[#6B7A4F] font-bold">${item.price.toLocaleString()} FCFA</p>
                        <div class="flex items-center gap-2 mt-2">
                            <button onclick="changeQuantity('${item.productId}', ${item.quantity - 1})"
                                class="w-8 h-8 rounded-full bg-[#F4F3EF] hover:bg-[#EAE8E3] text-sm font-bold transition">−</button>
                            <span class="text-sm font-medium w-6 text-center">${item.quantity}</span>
                            <button onclick="changeQuantity('${item.productId}', ${item.quantity + 1})"
                                class="w-8 h-8 rounded-full bg-[#F4F3EF] hover:bg-[#EAE8E3] text-sm font-bold transition">+</button>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-xs text-gray-400 mb-2">${itemTotal.toLocaleString()} FCFA</p>
                        <button onclick="removeItem('${item.productId}')" class="text-red-400 hover:text-red-600 transition">
                            <i class="fa-solid fa-trash text-sm"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Frais de livraison estimés
        const deliveryCost = 1500;
        const total = subtotal + deliveryCost;

        document.getElementById('cart-subtotal').textContent = subtotal.toLocaleString() + ' FCFA';
        document.getElementById('cart-delivery').textContent = deliveryCost.toLocaleString() + ' FCFA';
        document.getElementById('cart-total').textContent = total.toLocaleString() + ' FCFA';
        if (summary) summary.classList.remove('hidden');

    } catch (error) {
        container.innerHTML = '<p class="text-center text-red-500 py-8">Erreur chargement panier. Réessayez.</p>';
        console.error('Erreur panier:', error);
    }
}

// Changer la quantité via PUT /api/cart/:productId
async function changeQuantity(productId, quantity) {
    if (quantity < 1) {
        await removeItem(productId);
        return;
    }
    try {
        await updateCartItem(productId, quantity);
        loadCart();
        updateCartCount();
    } catch (error) {
        alert(error.message);
    }
}

async function removeItem(productId) {
    try {
        await removeFromCart(productId);
        loadCart();
        updateCartCount();
    } catch (error) {
        alert(error.message);
    }
}

async function checkout() {
    const street   = document.getElementById('street')?.value.trim();
    const city     = document.getElementById('city')?.value.trim();
    const zipCode  = document.getElementById('zipcode')?.value.trim() || '00000';
    const country  = document.getElementById('country')?.value.trim() || 'Sénégal';

    if (!street || !city) {
        alert('Veuillez remplir l\'adresse de livraison.');
        return;
    }

    try {
        await createOrder({
            shippingAddress: { street, city, zipCode, country },
            paymentMethod: 'card',
            deliveryType: city.toLowerCase() === 'dakar' ? 'yango' : 'standard'
        });
        alert('✅ Commande passée avec succès !');
        window.location.href = 'index.html';
    } catch (error) {
        alert('Erreur : ' + error.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    updateCartCount();
});