// products.js — Catalogue produits

async function loadProducts() {
    const container = document.getElementById('products-container');
    const params = new URLSearchParams();

    const category = document.getElementById('category-filter')?.value;
    const minPrice = document.getElementById('min-price')?.value;
    const maxPrice = document.getElementById('max-price')?.value;
    const search   = document.getElementById('search')?.value;

    const urlParams   = new URLSearchParams(window.location.search);
    const urlCategory = urlParams.get('category');

    if (urlCategory && !category) {
    const select = document.getElementById('category-filter');
    if (select) select.value = urlCategory;
    params.append('categoryId', urlCategory); 
    } else if (category) {
    params.append('categoryId', category); 
    }

    if (search) params.append('search', search);
    params.append('limit', 12);

    container.innerHTML = `
        <div class="text-center py-12 col-span-full">
            <i class="fa-solid fa-spinner fa-spin text-3xl text-[#6B7A4F]"></i>
            <p class="text-sm text-gray-400 mt-2">Chargement...</p>
        </div>`;

    try {
        const data   = await getProducts(params.toString());
        let products = data.products || [];

        if (minPrice) products = products.filter(p => p.price >= Number(minPrice));
        if (maxPrice) products = products.filter(p => p.price <= Number(maxPrice));

        if (products.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 col-span-full text-gray-400">
                    <i class="fa-solid fa-box-open text-3xl mb-2"></i>
                    <p>Aucun produit trouvé</p>
                </div>`;
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="bg-white rounded-[24px] p-4 shadow-sm hover:shadow-md transition group">
                <div class="relative overflow-hidden rounded-[16px] mb-3">
                    <img src="${product.image}" alt="${product.name}"
                         class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300">
                </div>
                <h3 class="font-semibold text-sm text-[#1A1A1A] truncate">${product.name}</h3>
                <p class="text-[#6B7A4F] font-bold mt-1">${Number(product.price).toLocaleString()} FCFA</p>
                <button onclick="addToCartNow('${product.id}')"
                    class="w-full mt-3 bg-[#F4F3EF] hover:bg-[#6B7A4F] hover:text-white text-[#2C2B2A] py-2 rounded-full text-xs font-medium transition">
                    <i class="fa-solid fa-plus mr-1"></i> Ajouter au panier
                </button>
            </div>
        `).join('');

    } catch (error) {
        container.innerHTML = `
            <p class="text-center text-gray-400 col-span-full py-8">
                <i class="fa-solid fa-wifi-slash mb-2 text-2xl block"></i>
                Impossible de charger les produits.
            </p>`;
        console.error('Erreur produits:', error);
    }
}

function filterProducts() { loadProducts(); }

async function loadCategories() {
    const select = document.getElementById('category-filter');
    if (!select) return;
    try {
        const data = await getCategories();
        data.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            select.appendChild(option);
        });
    } catch (error) { console.error('Erreur catégories:', error); }
}

async function addToCartNow(productId) {
    const token = localStorage.getItem('token');
    if (!token) {
        if (confirm('Vous devez être connecté pour ajouter au panier. Se connecter ?')) {
            window.location.href = 'login.html';
        }
        return;
    }
    try {
        await addToCart({ productId, quantity: 1 });
        updateCartCount();
        showToast('✅ Ajouté au panier !');
    } catch (error) { alert(error.message); }
}

function showToast(msg) {
    const existing = document.querySelector('.ms-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'ms-toast fixed bottom-6 right-6 bg-[#1A1A1A] text-white px-5 py-3 rounded-full shadow-lg text-sm font-medium z-50';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 2000);
}

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadProducts();
    updateCartCount();
});