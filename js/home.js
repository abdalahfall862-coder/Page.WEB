// home.js — Page d'accueil MethShop

async function loadCategories() {
    const container = document.getElementById('categories-container');
    if (!container) return;
    try {
        const data = await getCategories();
        container.innerHTML = data.map(cat => `
            <a href="products.html?category=${cat.id}" class="flex flex-col items-center group cursor-pointer">
                <div class="w-24 h-24 rounded-full bg-[#F4F3EF] group-hover:bg-[#EAE8E3] transition-all flex items-center justify-center overflow-hidden mb-3">
                    <img src="${cat.image}" class="w-14 h-14 object-cover mix-blend-multiply" alt="${cat.name}">
                </div>
                <span class="text-xs font-semibold">${cat.name}</span>
            </a>
        `).join('');
    } catch (error) {
        container.innerHTML = '<p class="col-span-full text-center text-gray-400">Erreur chargement catégories</p>';
    }
}

async function loadFeaturedProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;
    try {
        const data = await getProducts('limit=5');
        container.innerHTML = data.products.map(product => `
            <div class="bg-white rounded-[24px] p-4 shadow-sm hover:shadow-md transition">
                <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover rounded-[16px] mb-3">
                <h3 class="font-semibold text-sm text-[#1A1A1A]">${product.name}</h3>
                <p class="text-[#6B7A4F] font-bold mt-1">${product.price.toLocaleString()} FCFA</p>
                <button onclick="addToCartNow('${product.id}')"
                    class="w-full mt-2 bg-[#F4F3EF] hover:bg-[#6B7A4F] hover:text-white text-[#2C2B2A] py-2 rounded-full text-xs font-medium transition">
                    <i class="fa-solid fa-plus mr-1"></i> Ajouter
                </button>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<p class="text-center text-gray-400 col-span-full">Erreur chargement produits</p>';
    }
}

async function addToCartNow(productId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Connectez-vous d\'abord !');
        window.location.href = 'login.html';
        return;
    }
    try {
        await addToCart({ productId, quantity: 1 });
        await updateCartCount();
        // Toast discret au lieu d'un alert
        showToast('Ajouté au panier !');
    } catch (error) {
        alert(error.message);
    }
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.className = 'fixed bottom-6 right-6 bg-[#6B7A4F] text-white px-5 py-3 rounded-full text-sm shadow-lg z-50 transition-opacity';
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 2000);
}

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadFeaturedProducts();
    updateCartCount();
});