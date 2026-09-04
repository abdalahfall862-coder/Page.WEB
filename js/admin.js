const ADMIN_API = 'https://mon-api-vnhx.onrender.com/api/admin';
let editingProductId = null;

// ── Auth ──────────────────────────────────────
async function adminLogin() {
    const email    = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;
    const msg      = document.getElementById('admin-login-msg');
    try {
        const res  = await fetch('https://mon-api-vnhx.onrender.com/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) { msg.textContent = data.error || 'Accès refusé.'; msg.classList.remove('hidden'); return; }
        if (data.user?.role !== 'admin') { msg.textContent = 'Accès réservé aux administrateurs.'; msg.classList.remove('hidden'); return; }
        localStorage.setItem('admin-token', data.token);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        showDashboard();
    } catch (e) {
        msg.textContent = 'Erreur de connexion.';
        msg.classList.remove('hidden');
    }
}

function adminLogout() {
    localStorage.removeItem('admin-token');
    document.getElementById('admin-login').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
}

function getToken() { return localStorage.getItem('admin-token'); }

function adminAuthHeaders() {
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` };
}

async function showDashboard() {
    document.getElementById('admin-login').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    await loadStats();
    await loadProducts();
    await loadCategoriesSelect();
}

// ── Stats ─────────────────────────────────────
async function loadStats() {
    try {
        const res  = await fetch(`${ADMIN_API}/stats`, { headers: adminAuthHeaders() });
        const data = await res.json();
        document.getElementById('stat-users').textContent    = data.users;
        document.getElementById('stat-products').textContent = data.products;
        document.getElementById('stat-orders').textContent   = data.orders;
        document.getElementById('stat-revenue').textContent  = Number(data.revenue).toLocaleString() + ' FCFA';
    } catch (e) { console.error('Stats:', e); }
}

// ── Tabs ──────────────────────────────────────
const panels = ['products', 'categories', 'orders', 'users'];

function showTab(tab) {
    panels.forEach(p => {
        document.getElementById(`panel-${p}`).classList.toggle('hidden', p !== tab);
        document.getElementById(`tab-${p}`).classList.toggle('active-tab', p === tab);
        document.getElementById(`tab-${p}`).classList.toggle('tab-btn', true);
    });
    if (tab === 'categories') loadCategories();
    if (tab === 'orders')     loadOrders();
    if (tab === 'users')      loadUsers();
}

// ── Produits ──────────────────────────────────
async function loadProducts() {
    const tbody     = document.getElementById('products-table');
    const cardsDiv  = document.getElementById('products-cards');
    try {
        const res      = await fetch(`${ADMIN_API}/products`, { headers: adminAuthHeaders() });
        const products = await res.json();

        // ── Table desktop ──
        tbody.innerHTML = products.map(p => `
            <tr class="border-t border-[#F4F3EF] hover:bg-[#FCFBFA]">
                <td class="px-4 py-3 flex items-center gap-3">
                    <img src="${p.image}" class="w-10 h-10 rounded-lg object-cover" alt="${p.name}" loading="lazy">
                    <span class="font-medium text-[#1A1A1A]">${p.name}</span>
                </td>
                <td class="px-4 py-3 text-[#6B7A4F] font-semibold">${Number(p.price).toLocaleString()} FCFA</td>
                <td class="px-4 py-3">${p.stock ?? '—'}</td>
                <td class="px-4 py-3 text-[#686663]">${p.category?.name || '—'}</td>
                <td class="px-4 py-3">
                    <div class="flex gap-2 justify-end">
                        <button onclick="editProduct(${JSON.stringify(p).replace(/"/g, '&quot;')})" class="text-[#6B7A4F] text-sm px-3 py-1 rounded-full border border-[#6B7A4F]">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button onclick="deleteProduct('${p.id}')" class="text-red-500 text-sm px-3 py-1 rounded-full border border-red-200">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // ── Cards mobile ──
        cardsDiv.innerHTML = products.map(p => `
            <div class="bg-white rounded-2xl border border-[#E3E1DC] p-4 flex items-center gap-3">
                <img src="${p.image}" class="w-14 h-14 rounded-xl object-cover flex-shrink-0" alt="${p.name}" loading="lazy">
                <div class="flex-1 min-w-0">
                    <p class="font-semibold text-[#1A1A1A] text-sm truncate">${p.name}</p>
                    <p class="text-[#6B7A4F] font-bold text-sm mt-0.5">${Number(p.price).toLocaleString()} FCFA</p>
                    <p class="text-xs text-[#686663] mt-0.5">Stock : ${p.stock ?? '—'} · ${p.category?.name || '—'}</p>
                </div>
                <div class="flex flex-col gap-2">
                    <button onclick="editProduct(${JSON.stringify(p).replace(/"/g, '&quot;')})" class="text-[#6B7A4F] text-xs px-3 py-1.5 rounded-full border border-[#6B7A4F]">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button onclick="deleteProduct('${p.id}')" class="text-red-500 text-xs px-3 py-1.5 rounded-full border border-red-200">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

    } catch (e) {
        tbody.innerHTML   = '<tr><td colspan="5" class="text-center py-8 text-gray-400">Erreur chargement</td></tr>';
        cardsDiv.innerHTML = '<p class="text-center py-8 text-gray-400 text-sm">Erreur chargement</p>';
    }
}

async function loadCategoriesSelect() {
    try {
        const res  = await fetch(`${ADMIN_API}/categories`, { headers: adminAuthHeaders() });
        const cats = await res.json();
        const sel  = document.getElementById('p-category');
        sel.innerHTML = '<option value="">Choisir une catégorie</option>' +
            cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    } catch (e) {}
}

function openProductModal() {
    editingProductId = null;
    document.getElementById('product-modal-title').textContent = 'Ajouter un produit';
    ['p-name','p-price','p-stock','p-description'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('p-image').value = '';
    document.getElementById('p-category').value = '';
    document.getElementById('product-modal-msg').classList.add('hidden');
    setPreview('p-image-preview', '');
    document.getElementById('product-modal').classList.remove('hidden');
}

function closeProductModal() {
    document.getElementById('product-modal').classList.add('hidden');
}

function editProduct(p) {
    editingProductId = p.id;
    document.getElementById('product-modal-title').textContent = 'Modifier le produit';
    document.getElementById('p-name').value        = p.name || '';
    document.getElementById('p-price').value       = p.price || '';
    document.getElementById('p-stock').value       = p.stock || '';
    document.getElementById('p-image').value       = p.image || '';
    document.getElementById('p-description').value = p.description || '';
    document.getElementById('p-category').value    = p.categoryId || '';
    document.getElementById('product-modal-msg').classList.add('hidden');
    setPreview('p-image-preview', p.image || '');
    document.getElementById('product-modal').classList.remove('hidden');
}

async function saveProduct() {
    const msg  = document.getElementById('product-modal-msg');
    const body = {
        name:        document.getElementById('p-name').value.trim(),
        price:       Number(document.getElementById('p-price').value),
        stock:       Number(document.getElementById('p-stock').value),
        image:       document.getElementById('p-image').value.trim(),
        description: document.getElementById('p-description').value.trim(),
        categoryId:  document.getElementById('p-category').value
    };
    if (!body.name || !body.price) {
        msg.textContent = 'Nom et prix sont obligatoires.';
        msg.className = 'text-sm text-center text-red-500';
        msg.classList.remove('hidden');
        return;
    }
    try {
        const url    = editingProductId ? `${ADMIN_API}/products/${editingProductId}` : `${ADMIN_API}/products`;
        const method = editingProductId ? 'PUT' : 'POST';
        const res    = await fetch(url, { method, headers: adminAuthHeaders(), body: JSON.stringify(body) });
        const data   = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || `Erreur ${res.status}`);
        msg.textContent = editingProductId ? 'Produit modifié !' : 'Produit ajouté !';
        msg.className = 'text-sm text-center text-green-600';
        msg.classList.remove('hidden');
        setTimeout(() => { closeProductModal(); loadProducts(); loadStats(); }, 1000);
    } catch (e) {
        msg.textContent = e.message || 'Erreur lors de l\'enregistrement.';
        msg.className = 'text-sm text-center text-red-500';
        msg.classList.remove('hidden');
    }
}

async function deleteProduct(id) {
    if (!confirm('Supprimer ce produit ?')) return;
    await fetch(`${ADMIN_API}/products/${id}`, { method: 'DELETE', headers: adminAuthHeaders() });
    loadProducts();
    loadStats();
}

// ── Catégories ────────────────────────────────
async function loadCategories() {
    const tbody    = document.getElementById('categories-table');
    const cardsDiv = document.getElementById('categories-cards');
    try {
        const res  = await fetch(`${ADMIN_API}/categories`, { headers: adminAuthHeaders() });
        const cats = await res.json();

        // ── Table desktop ──
        tbody.innerHTML = cats.map(c => `
            <tr class="border-t border-[#F4F3EF] hover:bg-[#FCFBFA]">
                <td class="px-4 py-3 font-medium text-[#1A1A1A]">${c.name}</td>
                <td class="px-4 py-3"><img src="${c.image}" class="w-10 h-10 rounded-lg object-cover" alt="${c.name}" loading="lazy"></td>
                <td class="px-4 py-3 text-right">
                    <button onclick="deleteCategory('${c.id}')" class="text-red-500 text-sm px-3 py-1 rounded-full border border-red-200">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // ── Cards mobile ──
        cardsDiv.innerHTML = cats.map(c => `
            <div class="bg-white rounded-2xl border border-[#E3E1DC] p-4 flex items-center gap-3">
                <img src="${c.image}" class="w-12 h-12 rounded-xl object-cover flex-shrink-0" alt="${c.name}" loading="lazy">
                <p class="flex-1 font-semibold text-[#1A1A1A] text-sm">${c.name}</p>
                <button onclick="deleteCategory('${c.id}')" class="text-red-500 text-xs px-3 py-1.5 rounded-full border border-red-200">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `).join('');

    } catch (e) {
        tbody.innerHTML    = '<tr><td colspan="3" class="text-center py-8 text-gray-400">Erreur chargement</td></tr>';
        cardsDiv.innerHTML = '<p class="text-center py-8 text-gray-400 text-sm">Erreur chargement</p>';
    }
}

function openCategoryModal() {
    document.getElementById('c-name').value  = '';
    document.getElementById('c-image').value = '';
    document.getElementById('category-modal-msg').classList.add('hidden');
    setPreview('c-image-preview', '');
    document.getElementById('category-modal').classList.remove('hidden');
}

function closeCategoryModal() {
    document.getElementById('category-modal').classList.add('hidden');
}

async function saveCategory() {
    const msg  = document.getElementById('category-modal-msg');
    const body = {
        name:  document.getElementById('c-name').value.trim(),
        image: document.getElementById('c-image').value.trim()
    };
    if (!body.name) { msg.textContent = 'Nom requis.'; msg.className = 'text-sm text-center text-red-500'; msg.classList.remove('hidden'); return; }
    try {
        const res  = await fetch(`${ADMIN_API}/categories`, { method: 'POST', headers: adminAuthHeaders(), body: JSON.stringify(body) });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || `Erreur ${res.status}`);
        closeCategoryModal();
        loadCategories();
        loadCategoriesSelect();
    } catch (e) {
        msg.textContent = e.message || 'Erreur lors de l\'enregistrement.';
        msg.className = 'text-sm text-center text-red-500';
        msg.classList.remove('hidden');
    }
}

async function deleteCategory(id) {
    if (!confirm('Supprimer cette catégorie ?')) return;
    await fetch(`${ADMIN_API}/categories/${id}`, { method: 'DELETE', headers: adminAuthHeaders() });
    loadCategories();
}

// ── Commandes ─────────────────────────────────
async function loadOrders() {
    const tbody    = document.getElementById('orders-table');
    const cardsDiv = document.getElementById('orders-cards');
    const statusColors = {
        pending:   'bg-yellow-100 text-yellow-700',
        confirmed: 'bg-blue-100 text-blue-700',
        shipping:  'bg-purple-100 text-purple-700',
        delivered: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700'
    };
    const statusLabels = {
        pending: 'En attente', confirmed: 'Confirmée',
        shipping: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée'
    };
    try {
        const res    = await fetch(`${ADMIN_API}/orders`, { headers: adminAuthHeaders() });
        const orders = await res.json();

        if (!orders.length) {
            tbody.innerHTML    = '<tr><td colspan="6" class="text-center py-8 text-gray-400">Aucune commande</td></tr>';
            cardsDiv.innerHTML = '<p class="text-center py-8 text-gray-400 text-sm">Aucune commande</p>';
            return;
        }

        // ── Table desktop ──
        tbody.innerHTML = orders.map(o => `
            <tr class="border-t border-[#F4F3EF] hover:bg-[#FCFBFA]">
                <td class="px-4 py-3 text-xs text-[#686663] font-mono">${String(o.id).slice(0,8)}...</td>
                <td class="px-4 py-3">${o.user?.name || '—'}</td>
                <td class="px-4 py-3 font-semibold text-[#6B7A4F]">${Number(o.total).toLocaleString()} FCFA</td>
                <td class="px-4 py-3">
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${statusColors[o.status] || 'bg-gray-100 text-gray-600'}">
                        ${statusLabels[o.status] || o.status}
                    </span>
                </td>
                <td class="px-4 py-3">
                    <button onclick='showOrderDetails(${JSON.stringify(o).replace(/'/g, "&#39;")})' 
                        class="text-[#6B7A4F] text-xs px-3 py-1 rounded-full border border-[#6B7A4F] mr-2">
                        Détails
                    </button>
                    <select onchange="updateOrderStatus('${o.id}', this.value)" class="border border-[#E3E1DC] rounded-full px-3 py-1 text-xs bg-white">
                        <option value="">Changer...</option>
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirmée</option>
                        <option value="shipping">Expédiée</option>
                        <option value="delivered">Livrée</option>
                        <option value="cancelled">Annulée</option>
                    </select>
                </td>
            </tr>
        `).join('');

        // ── Cards mobile ──
        cardsDiv.innerHTML = orders.map(o => `
            <div class="bg-white rounded-2xl border border-[#E3E1DC] p-4">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <p class="text-xs text-[#686663] font-mono">#${String(o.id).slice(0,8)}</p>
                        <p class="font-semibold text-[#1A1A1A] text-sm mt-0.5">${o.user?.name || '—'}</p>
                        <p class="font-bold text-[#6B7A4F] mt-0.5">${Number(o.total).toLocaleString()} FCFA</p>
                    </div>
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${statusColors[o.status] || 'bg-gray-100 text-gray-600'}">
                        ${statusLabels[o.status] || o.status}
                    </span>
                </div>
                <div class="flex gap-2">
                    <button onclick='showOrderDetails(${JSON.stringify(o).replace(/'/g, "&#39;")})' 
                        class="flex-1 text-[#6B7A4F] text-xs py-2 rounded-full border border-[#6B7A4F] text-center">
                        Détails
                    </button>
                    <select onchange="updateOrderStatus('${o.id}', this.value)" class="flex-1 border border-[#E3E1DC] rounded-full px-2 py-2 text-xs bg-white">
                        <option value="">Changer statut...</option>
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirmée</option>
                        <option value="shipping">Expédiée</option>
                        <option value="delivered">Livrée</option>
                        <option value="cancelled">Annulée</option>
                    </select>
                </div>
            </div>
        `).join('');

    } catch (e) {
        tbody.innerHTML    = '<tr><td colspan="6" class="text-center py-8 text-red-400">Erreur chargement</td></tr>';
        cardsDiv.innerHTML = '<p class="text-center py-8 text-red-400 text-sm">Erreur chargement</p>';
        console.error('Orders:', e);
    }
}

// ── Modale détails commande ────────────────────
function showOrderDetails(o) {
    const items = o.items.map(i => `
        <div class="flex justify-between items-center py-2 border-b border-[#F4F3EF] last:border-0">
            <span class="text-sm text-[#1A1A1A]">${i.name}</span>
            <div class="text-right">
                <span class="text-xs text-[#686663]">${i.quantity} × ${Number(i.priceAtPurchase).toLocaleString()} FCFA</span>
                <p class="text-sm font-semibold text-[#6B7A4F]">${(i.quantity * i.priceAtPurchase).toLocaleString()} FCFA</p>
            </div>
        </div>
    `).join('');

    const deliveryCost = o.delivery?.cost || 0;
    const date         = o.createdAt ? new Date(o.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

    document.body.insertAdjacentHTML('beforeend', `
        <div class="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center" id="order-detail-modal" onclick="if(event.target===this)closeOrderDetails()">
            <div class="bg-white rounded-t-3xl md:rounded-2xl p-5 md:p-6 w-full md:max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
                <div class="w-10 h-1 bg-[#E3E1DC] rounded-full mx-auto mb-4 md:hidden"></div>
                <div class="flex justify-between items-center mb-4">
                    <div>
                        <h3 class="font-bold text-[#1A1A1A]">Commande <span class="font-mono text-sm">#${String(o.id).slice(0,8)}</span></h3>
                        <p class="text-xs text-[#686663] mt-0.5">${date}</p>
                    </div>
                    <button onclick="closeOrderDetails()" class="text-[#686663] hover:text-[#1A1A1A] text-xl">✕</button>
                </div>
                <div class="bg-[#F9F8F5] rounded-xl p-3 mb-4 space-y-1">
                    <p class="text-sm"><span class="text-[#686663]">Client :</span> <span class="font-medium text-[#1A1A1A]">${o.user?.name || '—'}</span></p>
                    <p class="text-sm"><span class="text-[#686663]">Email :</span> <span class="font-medium text-[#1A1A1A]">${o.user?.email || '—'}</span></p>
                    <p class="text-sm"><span class="text-[#686663]">Adresse :</span> <span class="font-medium text-[#1A1A1A]">${o.shippingAddress?.street || '—'}, ${o.shippingAddress?.city || '—'}</span></p>
                    <p class="text-sm"><span class="text-[#686663]">Livraison :</span> <span class="font-medium text-[#1A1A1A]">${o.delivery?.type || '—'}</span></p>
                    <p class="text-sm"><span class="text-[#686663]">Paiement :</span> <span class="font-medium text-[#1A1A1A]">${o.paymentMethod || '—'}</span></p>
                </div>
                <h4 class="font-semibold text-[#1A1A1A] text-sm mb-2">Produits commandés</h4>
                <div class="mb-4">${items}</div>
                <div class="border-t border-[#E3E1DC] pt-3 space-y-1">
                    <div class="flex justify-between text-sm text-[#686663]">
                        <span>Sous-total</span>
                        <span>${(Number(o.total) - deliveryCost).toLocaleString()} FCFA</span>
                    </div>
                    <div class="flex justify-between text-sm text-[#686663]">
                        <span>Livraison</span>
                        <span>${Number(deliveryCost).toLocaleString()} FCFA</span>
                    </div>
                    <div class="flex justify-between font-bold text-[#1A1A1A] pt-1">
                        <span>Total</span>
                        <span class="text-[#6B7A4F]">${Number(o.total).toLocaleString()} FCFA</span>
                    </div>
                </div>
            </div>
        </div>
    `);
}

function closeOrderDetails() {
    document.getElementById('order-detail-modal')?.remove();
}

async function updateOrderStatus(id, status) {
    if (!status) return;
    await fetch(`${ADMIN_API}/orders/${id}/status`, {
        method: 'PUT', headers: adminAuthHeaders(), body: JSON.stringify({ status })
    });
    loadOrders();
}

// ── Utilisateurs ──────────────────────────────
async function loadUsers() {
    const tbody    = document.getElementById('users-table');
    const cardsDiv = document.getElementById('users-cards');
    try {
        const res   = await fetch(`${ADMIN_API}/users`, { headers: adminAuthHeaders() });
        const users = await res.json();

        // ── Table desktop ──
        tbody.innerHTML = users.map(u => `
            <tr class="border-t border-[#F4F3EF] hover:bg-[#FCFBFA]">
                <td class="px-4 py-3 font-medium text-[#1A1A1A]">${u.name}</td>
                <td class="px-4 py-3 text-[#686663]">${u.email}</td>
                <td class="px-4 py-3">
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-[#6B7A4F] text-white' : 'bg-[#F4F3EF] text-[#686663]'}">
                        ${u.role || 'user'}
                    </span>
                </td>
                <td class="px-4 py-3 text-right">
                    ${u.role !== 'admin' ? `
                    <button onclick="deleteUser('${u.id}')" class="text-red-500 text-sm px-3 py-1 rounded-full border border-red-200">
                        <i class="fa-solid fa-trash"></i>
                    </button>` : ''}
                </td>
            </tr>
        `).join('');

        // ── Cards mobile ──
        cardsDiv.innerHTML = users.map(u => `
            <div class="bg-white rounded-2xl border border-[#E3E1DC] p-4 flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-[#F4F3EF] flex items-center justify-center flex-shrink-0">
                    <span class="text-sm font-bold text-[#6B7A4F]">${u.name?.charAt(0).toUpperCase() || '?'}</span>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="font-semibold text-[#1A1A1A] text-sm truncate">${u.name}</p>
                    <p class="text-xs text-[#686663] truncate">${u.email}</p>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-[#6B7A4F] text-white' : 'bg-[#F4F3EF] text-[#686663]'}">
                        ${u.role || 'user'}
                    </span>
                    ${u.role !== 'admin' ? `
                    <button onclick="deleteUser('${u.id}')" class="text-red-500 text-xs px-2 py-1.5 rounded-full border border-red-200">
                        <i class="fa-solid fa-trash"></i>
                    </button>` : ''}
                </div>
            </div>
        `).join('');

    } catch (e) {
        tbody.innerHTML    = '<tr><td colspan="4" class="text-center py-8 text-gray-400">Erreur chargement</td></tr>';
        cardsDiv.innerHTML = '<p class="text-center py-8 text-gray-400 text-sm">Erreur chargement</p>';
    }
}

async function deleteUser(id) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    await fetch(`${ADMIN_API}/users/${id}`, { method: 'DELETE', headers: adminAuthHeaders() });
    loadUsers();
    loadStats();
}

// ── Galerie d'images ──────────────────────────
const GALLERY_IMAGES = [
    { name: 'Barcelet en or', url: 'assets/barcelet en or.jpeg' },
    { name: 'Beauté', url: 'assets/beauté.jpeg' },
    { name: 'Bijoux', url: 'assets/bijoux.jpeg' },
    { name: 'Parfum', url: 'assets/parfum.jpeg' },
    { name: 'Produit hero', url: 'assets/img1.jpeg' }
];
let galleryTarget = null;
let gallerySelectedUrl = null;

function openGallery(targetId) {
    galleryTarget = targetId;
    gallerySelectedUrl = null;
    document.getElementById('gallery-search').value = '';
    document.getElementById('gallery-url-input').value = '';
    document.getElementById('gallery-selected-info').classList.add('hidden');
    document.getElementById('gallery-upload-content').classList.remove('hidden');
    document.getElementById('gallery-upload-loading').classList.add('hidden');
    document.getElementById('gallery-file-input').value = '';
    renderGallery();
    document.getElementById('gallery-modal').classList.remove('hidden');
}

function closeGallery() {
    document.getElementById('gallery-modal').classList.add('hidden');
    galleryTarget = null;
}

function renderGallery() {
    const uploaded = JSON.parse(localStorage.getItem('admin-uploaded-images') || '[]');
    const search = (document.getElementById('gallery-search').value || '').toLowerCase();

    const uploadedDiv = document.getElementById('gallery-uploaded');
    const filteredUploaded = uploaded.filter(i => !search || i.name.toLowerCase().includes(search) || i.url.toLowerCase().includes(search));
    uploadedDiv.innerHTML = filteredUploaded.length ? filteredUploaded.map((img, idx) => `
        <div class="gallery-item relative rounded-xl overflow-hidden aspect-square bg-[#F4F3EF] img-fade-in" onclick="selectGalleryImage('${img.url.replace(/'/g, "\\'")}', this)">
            <img src="${img.url}" class="w-full h-full object-cover" alt="${img.name}" loading="lazy" onerror="this.parentElement.style.display='none'">
            <button onclick="event.stopPropagation(); removeUploadedImage(${idx})" class="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-80 hover:opacity-100">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                <p class="text-white text-[10px] truncate">${img.name}</p>
            </div>
        </div>
    `).join('') : '<p class="text-xs text-[#B0AEA8] col-span-full py-2">Aucune image uploadée</p>';

    const defaultDiv = document.getElementById('gallery-default');
    const filteredDefault = GALLERY_IMAGES.filter(i => !search || i.name.toLowerCase().includes(search));
    defaultDiv.innerHTML = filteredDefault.map(img => `
        <div class="gallery-item relative rounded-xl overflow-hidden aspect-square bg-[#F4F3EF] img-fade-in" onclick="selectGalleryImage('${img.url}', this)">
            <img src="${img.url}" class="w-full h-full object-cover" alt="${img.name}" loading="lazy" onerror="this.parentElement.style.display='none'">
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                <p class="text-white text-[10px] truncate">${img.name}</p>
            </div>
        </div>
    `).join('');
}

function filterGallery() { renderGallery(); }

function selectGalleryImage(url, el) {
    document.querySelectorAll('.gallery-item').forEach(i => i.classList.remove('selected'));
    if (el) el.classList.add('selected');
    gallerySelectedUrl = url;
    document.getElementById('gallery-selected-thumb').src = url;
    document.getElementById('gallery-selected-name').textContent = url.split('/').pop();
    document.getElementById('gallery-selected-info').classList.remove('hidden');
}

function confirmGallerySelection() {
    if (!gallerySelectedUrl || !galleryTarget) return;
    document.getElementById(galleryTarget).value = gallerySelectedUrl;
    const previewId = galleryTarget === 'p-image' ? 'p-image-preview' : 'c-image-preview';
    setPreview(previewId, gallerySelectedUrl);
    closeGallery();
}

function setPreview(previewId, url) {
    const el = document.getElementById(previewId);
    if (!url) {
        el.innerHTML = '<i class="fa-solid fa-image text-[#B0AEA8] text-xl"></i>';
        el.className = el.className.replace('img-fade-in', '').trim();
        if (previewId === 'p-image-preview') el.className += ' w-20 h-20 rounded-xl bg-[#F4F3EF] flex items-center justify-center overflow-hidden flex-shrink-0';
        else el.className += ' w-16 h-16 rounded-xl bg-[#F4F3EF] flex items-center justify-center overflow-hidden flex-shrink-0';
        return;
    }
    el.innerHTML = `<img src="${url}" class="w-full h-full object-cover img-fade-in" onerror="this.parentElement.innerHTML='<i class=\\'fa-solid fa-image text-[#B0AEA8] text-xl\\'></i>'">`;
}

async function handleGalleryFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Image trop volumineuse (max 5 Mo).'); return; }
    document.getElementById('gallery-upload-content').classList.add('hidden');
    document.getElementById('gallery-upload-loading').classList.remove('hidden');
    try {
        const base64 = await compressAndConvertToBase64(file);
        const uploaded = JSON.parse(localStorage.getItem('admin-uploaded-images') || '[]');
        uploaded.unshift({ name: file.name, url: base64 });
        localStorage.setItem('admin-uploaded-images', JSON.stringify(uploaded));
        renderGallery();
        selectGalleryImage(base64, null);
    } catch (e) {
        alert('Erreur lors de l\'enregistrement de l\'image.');
        console.error('Upload error:', e);
    }
    document.getElementById('gallery-upload-content').classList.remove('hidden');
    document.getElementById('gallery-upload-loading').classList.add('hidden');
    document.getElementById('gallery-file-input').value = '';
}

function compressAndConvertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX = 300;
                let w = img.width, h = img.height;
                if (w > MAX || h > MAX) {
                    if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
                    else { w = Math.round(w * MAX / h); h = MAX; }
                }
                canvas.width = w;
                canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.4);
                resolve(dataUrl);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function selectGalleryUrl() {
    const url = document.getElementById('gallery-url-input').value.trim();
    if (!url) return;
    selectGalleryImage(url, null);
    confirmGallerySelection();
}

function removeUploadedImage(idx) {
    const uploaded = JSON.parse(localStorage.getItem('admin-uploaded-images') || '[]');
    uploaded.splice(idx, 1);
    localStorage.setItem('admin-uploaded-images', JSON.stringify(uploaded));
    renderGallery();
}

function handleGalleryDrop(event) {
    const file = event.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const input = document.getElementById('gallery-file-input');
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    input.dispatchEvent(new Event('change'));
}

// ── Init ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('admin-token')) showDashboard();
});