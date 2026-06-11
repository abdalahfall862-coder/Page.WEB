// URL de ton API hébergée sur Render (remplace /api/products par ta route exacte si elle change)
const API_URL = "https://mon-api-vnhx.onrender.com/api/products";

// Sélection des éléments HTML
const productsContainer = document.getElementById('products-container');
const cartCountElement = document.getElementById('cart-count');

let cartCount = 0;

// 1. Fonction principale pour récupérer les produits depuis l'API Render
async function fetchProducts() {
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const products = await response.json();
        
        // Vider le conteneur de chargement
        productsContainer.innerHTML = "";

        if (products.length === 0) {
            productsContainer.innerHTML = `<p class="col-span-full text-center text-sm text-gray-500">Aucun produit disponible pour le moment.</p>`;
            return;
        }

        // Boucler sur chaque produit reçu de MongoDB Atlas
        products.forEach(product => {
            const productCard = createProductCard(product);
            productsContainer.appendChild(productCard);
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des produits :", error);
        productsContainer.innerHTML = `
            <div class="col-span-full text-center py-6 text-red-500 text-sm">
                <i class="fa-solid fa-triangle-exclamation text-lg mb-2 block"></i>
                Impossible de charger les produits. Vérifiez la connexion à votre API.
            </div>`;
    }
}

// 2. Générateur de carte produit conforme au design de la capture
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = "bg-white border border-[#EAE8E3] rounded-2xl p-4 flex flex-col justify-between group relative hover:shadow-md transition-all duration-300";

    // Valeurs par défaut si des champs manquent dans ton entité TypeORM
    const image = product.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200";
    const name = product.name || "Produit Premium";
    const price = product.price ? `${product.price.toFixed(2)}€` : "N/A";
    const rating = product.rating || "4.5";
    const reviews = product.reviewsCount || "12";

    card.innerHTML = `
        <button class="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors z-10">
            <i class="fa-regular fa-heart"></i>
        </button>

        <div class="w-full h-40 bg-[#F4F3EF] rounded-xl flex items-center justify-center p-4 overflow-hidden mb-4">
            <img src="${image}" alt="${name}" class="max-h-full max-w-full object-contain transform group-hover:scale-105 transition duration-300">
        </div>

        <div class="text-left space-y-1.5 flex-1 flex flex-col justify-end">
            <h3 class="font-semibold text-xs md:text-sm text-[#1A1A1A] line-clamp-1">${name}</h3>
            
            <div class="flex items-center gap-1 text-[10px] text-gray-500">
                <span class="text-amber-500 flex items-center"><i class="fa-solid fa-star mr-0.5"></i> ${rating}</span>
                <span>(${reviews})</span>
            </div>

            <div class="flex items-center justify-between pt-1">
                <span class="font-bold text-sm text-[#1A1A1A]">${price}</span>
                <button onclick="addToCart()" class="bg-[#6B7A4F] hover:bg-[#576440] text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 font-medium transition shadow-xs">
                    <i class="fa-solid fa-cart-plus"></i> Ajouter
                </button>
            </div>
        </div>
    `;
    return card;
}

// 3. Petite fonction interactive pour simuler l'ajout au panier
function addToCart() {
    cartCount++;
    cartCountElement.textContent = cartCount;
    
    // Animation flash discrète sur le badge du panier
    cartCountElement.classList.add('scale-125', 'bg-amber-600');
    setTimeout(() => {
        cartCountElement.classList.remove('scale-125', 'bg-amber-600');
    }, 200);
}

// Lancement automatique au chargement de la page
document.addEventListener('DOMContentLoaded', fetchProducts);