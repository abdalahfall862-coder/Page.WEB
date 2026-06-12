async function loadCart() {
    const container = document.getElementById('cart-items');
    const summary = document.getElementById('cart-summary');
    
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
            summary.classList.add('hidden');
            return;
        }
        
        let total = 0;
        container.innerHTML = items.map(item => {
            total += item.price * item.quantity;
            return `
                <div class="flex items-center gap-4 bg-white rounded-[16px] p-4 shadow-sm">
                    <img src="${item.image}" class="w-20 h-20 object-cover rounded-[12px]" alt="${item.name}">
                    <div class="flex-1">
                        <h3 class="font-semibold text-sm">${item.name}</h3>
                        <p class="text-[#6B7A4F] font-bold">${item.price} FCFA</p>
                        <div class="flex items-center gap-2 mt-1">
                            <button onclick="updateQuantity('${item.productId}', ${item.quantity - 1})" class="w-8 h-8 rounded-full bg-[#F4F3EF] text-sm">-</button>
                            <span class="text-sm font-medium">${item.quantity}</span>
                            <button onclick="updateQuantity('${item.productId}', ${item.quantity + 1})" class="w-8 h-8 rounded-full bg-[#F4F3EF] text-sm">+</button>
                        </div>
                    </div>
                    <button onclick="removeItem('${item.productId}')" class="text-red-500 hover:text-red-700">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
        }).join('');
        
        document.getElementById('cart-total').textContent = total + ' FCFA';
        summary.classList.remove('hidden');
        
    } catch (error) {
        container.innerHTML = '<p class="text-center text-red-500">Erreur chargement panier</p>';
    }
}

async function updateQuantity(productId, quantity) {
    if (quantity < 1) {
        await removeItem(productId);
        return;
    }
    try {
        await addToCart({ productId, quantity });
        loadCart();
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
    const address = prompt('Entrez votre adresse de livraison:\n(Rue, Ville, Code postal, Pays)');
    if (!address) return;
    
    const [street, city, zipCode, country] = address.split(',').map(s => s.trim());
    
    try {
        await createOrder({
            shippingAddress: { street, city, zipCode, country },
            paymentMethod: 'card'
        });
        alert('Commande passée avec succès !');
        window.location.href = 'orders.html';
    } catch (error) {
        alert(error.message);
    }
}

document.addEventListener('DOMContentLoaded', loadCart);