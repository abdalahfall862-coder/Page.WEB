// api.js — Données locales (localStorage)

// ── Données de démonstration ─────────────────
const DEMO_PRODUCTS = [
    { id: '1', name: 'Sac à Main Premium', price: 15000, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&auto=format&fit=crop', category: '1' },
    { id: '2', name: 'Montre Élégante', price: 25000, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop', category: '2' },
    { id: '3', name: 'Chaussures Sport', price: 18000, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop', category: '3' },
    { id: '4', name: 'Lunettes de Soleil', price: 8000, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&auto=format&fit=crop', category: '4' },
    { id: '5', name: 'Parfum Luxe', price: 22000, image: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&auto=format&fit=crop', category: '5' },
    { id: '6', name: 'Ceinture Cuir', price: 9000, image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=400&auto=format&fit=crop', category: '1' },
    { id: '7', name: 'Bracelet Or', price: 35000, image: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=400&auto=format&fit=crop', category: '2' },
    { id: '8', name: 'Chemise Lin', price: 12000, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&auto=format&fit=crop', category: '3' },
];

const DEMO_CATEGORIES = [
    { id: '1', name: 'Sacs', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=100&auto=format&fit=crop' },
    { id: '2', name: 'Bijoux', image: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=100&auto=format&fit=crop' },
    { id: '3', name: 'Mode', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop' },
    { id: '4', name: 'Optique', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100&auto=format&fit=crop' },
    { id: '5', name: 'Beauté', image: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=100&auto=format&fit=crop' },
    { id: '6', name: 'Accessoires', image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=100&auto=format&fit=crop' },
];

// ── Helpers localStorage ──────────────────────
function getUsers()    { return JSON.parse(localStorage.getItem('ms_users') || '[]'); }
function saveUsers(u)  { localStorage.setItem('ms_users', JSON.stringify(u)); }
function getCart()     { return JSON.parse(localStorage.getItem('ms_cart') || '[]'); }
function saveCart(c)   { localStorage.setItem('ms_cart', JSON.stringify(c)); }

// ── Auth ──────────────────────────────────────
async function registerUser({ name, email, password }) {
    const users = getUsers();
    if (users.find(u => u.email === email)) {
        throw new Error('Cet email est déjà utilisé.');
    }
    const user = { id: Date.now().toString(), name, email, password };
    users.push(user);
    saveUsers(users);
    return { message: 'Inscription réussie !' };
}

async function loginUser({ email, password }) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Email ou mot de passe incorrect.');
    const token = btoa(JSON.stringify({ id: user.id, email: user.email }));
    return { token, user: { id: user.id, name: user.name, email: user.email } };
}

// ── Products ──────────────────────────────────
async function getProducts(params = '') {
    const urlParams = new URLSearchParams(params);
    const limit = parseInt(urlParams.get('limit')) || DEMO_PRODUCTS.length;
    const category = urlParams.get('category');
    const search = urlParams.get('search') || '';

    let products = [...DEMO_PRODUCTS];
    if (category) products = products.filter(p => p.category === category);
    if (search)   products = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    return { products: products.slice(0, limit), total: products.length };
}

async function getProduct(id) {
    const product = DEMO_PRODUCTS.find(p => p.id === id);
    if (!product) throw new Error('Produit introuvable');
    return product;
}

// ── Categories ────────────────────────────────
async function getCategories() {
    return DEMO_CATEGORIES;
}

// ── Cart ──────────────────────────────────────
async function addToCart({ productId, quantity = 1 }) {
    const cart = getCart();
    const existing = cart.find(i => i.productId === productId);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ productId, quantity });
    }
    saveCart(cart);
    return { message: 'Ajouté au panier' };
}

async function getCartFull() {
    const cart = getCart();
    const items = cart.map(i => {
        const product = DEMO_PRODUCTS.find(p => p.id === i.productId);
        return { ...i, product };
    }).filter(i => i.product);
    return { items };
}

async function updateCartItem(productId, quantity) {
    const cart = getCart();
    const item = cart.find(i => i.productId === productId);
    if (item) item.quantity = quantity;
    saveCart(cart);
    return { message: 'Mis à jour' };
}

async function removeFromCart(productId) {
    const cart = getCart().filter(i => i.productId !== productId);
    saveCart(cart);
    return { message: 'Supprimé' };
}

async function clearCart() {
    saveCart([]);
    return { message: 'Panier vidé' };
}

// ── Badge panier ──────────────────────────────
async function updateCartCount() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const cart = getCart();
    const count = cart.reduce((sum, i) => sum + i.quantity, 0);
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.textContent = count;
        badge.classList.toggle('hidden', count === 0);
    }
}