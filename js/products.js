let currentPage = 1;

async function loadProducts() {
    const container = document.getElementById('products-container');
    const params = new URLSearchParams();
    
    const category = document.getElementById('category-filter')?.value;
    const minPrice = document.getElementById('min-price')?.value;
    const maxPrice = document.getElementById('max-price')?.value;
    const search = document.getElementById('search')?.value;
    
    if (category) params.append('categoryId', category);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (search) params.append('search', search);
    params.append('page', currentPage);
    params.append('limit', 12);
    
    try {
        const data = await getProducts(params.toString());
        container.innerHTML = data.products.map(product => `
            <div class="bg-white rounded-[24px] p-4 shadow-sm hover:shadow-md transition">
                <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover rounded-[16px] mb-3">
                <h3 class="font-semibold text-sm text-[#1A1A1A]">${product.name}</h3>
                <p class="text-[#6B7A4F] font-bold mt-1">${product.price} FCFA</p>
                <button onclick="addToCartNow('${product.id}')" class="w-full mt-2 bg-[#F4F3EF] hover:bg-[#6B7A4F] hover:text-white text-[#2C2B2A] py-2 rounded-full text-xs font-medium transition">
                    <i class="fa-solid fa-plus mr-1"></i> Ajouter
                </button>
            </div>
        `).join('');
        
        renderPagination(data.totalPages);
    } catch (error) {
        container.innerHTML = '<p class="text-center text-gray-400 col-span-full">Erreur chargement produits</p>';
    }
}

function renderPagination(totalPages) {
    const container = document.getElementById('pagination');
    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button onclick="goToPage(${i})" class="w-10 h-10 rounded-full ${i === currentPage ? 'bg-[#6B7A4F] text-white' : 'bg-white text-[#2C2B2A]'} font-medium">${i}</button>`;
    }
    container.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    loadProducts();
}

function filterProducts() {
    currentPage = 1;
    loadProducts();
}

async function loadCategories() {
    const select = document.getElementById('category-filter');
    try {
        const data = await getCategories();
        data.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadProducts();
    updateCartCount();
});