// cart.js — Gestion du panier

async function loadCart() {
    const container = document.getElementById('cart-items');
    const summary   = document.getElementById('cart-summary');

    const token = localStorage.getItem('token');
    if (!token) {
        container.innerHTML = `
            <div class="text-center py-12 text-gray-400">
                <i class="fa-solid fa-lock text-4xl mb-3"></i>
                <p class="font-medium">Connectez-vous pour voir votre panier</p>
                <a href="login.html" class="mt-3 inline-block bg-[#6B7A4F] text-white px-6 py-2 rounded-full text-sm font-medium">
                    Se connecter
                </a>
            </div>`;
        if (summary) summary.classList.add('hidden');
        return;
    }

    try {
        const cart  = await getCartFull();
        const items = cart.items || [];

        if (items.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-gray-400">
                    <i class="fa-solid fa-cart-arrow-down text-4xl mb-2"></i>
                    <p>Votre panier est vide</p>
                    <a href="products.html" class="text-[#6B7A4F] font-medium mt-2 inline-block">Continuer les achats</a>
                </div>`;
            if (summary) summary.classList.add('hidden');
            return;
        }

        let subtotal = 0;
        container.innerHTML = items.map(item => {
            const price     = item.price || 0;
            const name      = item.name  || 'Produit';
            const image     = item.image || 'https://via.placeholder.com/80';
            const productId = item.productId;
            const quantity  = item.quantity || 1;
            const itemTotal = price * quantity;
            subtotal += itemTotal;
            return `
                <div class="flex items-center gap-4 bg-white rounded-[16px] p-4 shadow-sm">
                    <img src="${image}" class="w-20 h-20 object-cover rounded-[12px]" alt="${name}" loading="lazy">
                    <div class="flex-1">
                        <h3 class="font-semibold text-sm">${name}</h3>
                        <p class="text-[#6B7A4F] font-bold">${price.toLocaleString()} FCFA</p>
                        <div class="flex items-center gap-2 mt-2">
                            <button onclick="changeQuantity('${productId}', ${quantity - 1})"
                                class="w-8 h-8 rounded-full bg-[#F4F3EF] hover:bg-[#EAE8E3] text-sm font-bold transition">−</button>
                            <span class="text-sm font-medium w-6 text-center">${quantity}</span>
                            <button onclick="changeQuantity('${productId}', ${quantity + 1})"
                                class="w-8 h-8 rounded-full bg-[#F4F3EF] hover:bg-[#EAE8E3] text-sm font-bold transition">+</button>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-xs text-gray-400 mb-2">${itemTotal.toLocaleString()} FCFA</p>
                        <button onclick="removeItem('${productId}')" class="text-red-400 hover:text-red-600 transition">
                            <i class="fa-solid fa-trash text-sm"></i>
                        </button>
                    </div>
                </div>`;
        }).join('');

        const deliveryCost = subtotal >= 5000 ? 0 : 1500;
        const total        = subtotal + deliveryCost;

        document.getElementById('cart-subtotal').textContent = subtotal.toLocaleString() + ' FCFA';
        document.getElementById('cart-delivery').textContent =
            deliveryCost === 0 ? 'Gratuit 🎉' : deliveryCost.toLocaleString() + ' FCFA';
        document.getElementById('cart-total').textContent = total.toLocaleString() + ' FCFA';
        if (summary) summary.classList.remove('hidden');

    } catch (error) {
        container.innerHTML = '<p class="text-center text-red-500 py-8">Erreur chargement panier. Réessayez.</p>';
        console.error('Erreur panier:', error);
    }
}

async function changeQuantity(productId, quantity) {
    if (quantity < 1) { await removeItem(productId); return; }
    try {
        await updateCartItem(productId, quantity);
        loadCart();
        updateCartCount();
    } catch (error) { alert(error.message); }
}

async function removeItem(productId) {
    try {
        await removeFromCart(productId);
        loadCart();
        updateCartCount();
    } catch (error) { alert(error.message); }
}

async function checkout() {
    const street  = document.getElementById('street')?.value.trim();
    const city    = document.getElementById('city')?.value.trim();
    const zipCode = document.getElementById('zipcode')?.value.trim() || '00000';
    const phone   = document.getElementById('phone')?.value.trim();
    const msgEl   = document.getElementById('checkout-msg');

    // Validations
    if (!street || !city) {
        showCheckoutMsg("Veuillez remplir l'adresse de livraison.", 'red');
        return;
    }
    if (!phone) {
        showCheckoutMsg("Veuillez entrer votre numéro de téléphone.", 'red');
        return;
    }

    const btn = document.querySelector('button[onclick="checkout()"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Envoi en cours...'; }

    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const res = await apiFetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
                shippingAddress: {
                    street,
                    city,
                    zipCode,
                    country: 'Sénégal'
                },
                phone,
                paymentMethod: 'cash',
                deliveryType: city.toLowerCase() === 'dakar' ? 'yango' : 'standard'
            })
        });

        const data = await res.json();

        if (!res.ok) {
            showCheckoutMsg(data.error || data.message || 'Erreur lors de la commande.', 'red');
            if (btn) { btn.disabled = false; btn.innerHTML = 'Passer la commande <i class="fa-solid fa-arrow-right ml-2"></i>'; }
            return;
        }

        // Succès
        showCheckoutMsg('✅ Commande passée avec succès !', 'green');
        updateCartCount();
        setTimeout(() => { window.location.href = 'index.html'; }, 1500);

    } catch (error) {
        showCheckoutMsg(error.message || 'Erreur de connexion. Réessayez.', 'red');
        if (btn) { btn.disabled = false; btn.innerHTML = 'Passer la commande <i class="fa-solid fa-arrow-right ml-2"></i>'; }
        console.error('Checkout:', error);
    }
}

function showCheckoutMsg(text, color) {
    const el = document.getElementById('checkout-msg');
    if (!el) return;
    el.textContent = text;
    el.style.color = color;
    el.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    updateCartCount();
});