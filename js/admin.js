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

function getToken() {
    return localStorage.getItem('admin-token');
}

function authHeaders() {
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
        const res  = await fetch(`${ADMIN_API}/stats`, { headers: authHeaders() });
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
    if (tab === 'orders')    loadOrders();
    if (tab === 'users')     loadUsers();
}

// ── Produits ──────────────────────────────────
async function loadProducts() {
    const tbody = document.getElementById('products-table');
    try {
        const res      = await fetch(`${ADMIN_API}/products`, { headers: authHeaders() });
        const products = await res.json();
        tbody.innerHTML = products.map(p => `
            <tr class="border-t border-[#F4F3EF] hover:bg-[#FCFBFA]">
                <td class="px-4 py-3 flex items-center gap-3">
                    <img src="${p.image}" class="w-10 h-10 rounded-lg object-cover">
                    <span class="font-medium text-[#1A1A1A]">${p.name}</span>
                </td>
                <td class="px-4 py-3 text-[#6B7A4F] font-semibold">${Number(p.price).toLocaleString()} FCFA</td>
                <td class="px-4 py-3">${p.stock ?? '—'}</td>
                <td class="px-4 py-3 text-[#686663]">${p.category?.name || '—'}</td>
                <td class="px-4 py-3">
                    <div class="flex gap-2 justify-end">
                        <button onclick="editProduct(${JSON.stringify(p).replace(/"/g, '&quot;')})" class="text-[#6B7A4F] hover:text-[#576440] text-sm px-3 py-1 rounded-full border border-[#6B7A4F]">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button onclick="deleteProduct('${p.id}')" class="text-red-500 hover:text-red-600 text-sm px-3 py-1 rounded-full border border-red-200">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (e) { tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-400">Erreur chargement</td></tr>'; }
}

async function loadCategoriesSelect() {
    try {
        const res  = await fetch(`${ADMIN_API}/categories`, { headers: authHeaders() });
        const cats = await res.json();
        const sel  = document.getElementById('p-category');
        sel.innerHTML = '<option value="">Choisir une catégorie</option>' +
            cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    } catch (e) {}
}

function openProductModal() {
    editingProductId = null;
    document.getElementById('product-modal-title').textContent = 'Ajouter un produit';
    ['p-name','p-price','p-stock','p-image','p-description'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('p-category').value = '';
    document.getElementById('product-modal-msg').classList.add('hidden');
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
        const res    = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) });

        if (!res.ok) throw new Error('Erreur serveur');
        msg.textContent = editingProductId ? 'Produit modifié !' : 'Produit ajouté !';
        msg.className = 'text-sm text-center text-green-600';
        msg.classList.remove('hidden');
        setTimeout(() => { closeProductModal(); loadProducts(); loadStats(); }, 1000);
    } catch (e) {
        msg.textContent = 'Erreur lors de l\'enregistrement.';
        msg.className = 'text-sm text-center text-red-500';
        msg.classList.remove('hidden');
    }
}

async function deleteProduct(id) {
    if (!confirm('Supprimer ce produit ?')) return;
    await fetch(`${ADMIN_API}/products/${id}`, { method: 'DELETE', headers: authHeaders() });
    loadProducts();
    loadStats();
}

// ── Catégories ────────────────────────────────
async function loadCategories() {
    const tbody = document.getElementById('categories-table');
    try {
        const res  = await fetch(`${ADMIN_API}/categories`, { headers: authHeaders() });
        const cats = await res.json();
        tbody.innerHTML = cats.map(c => `
            <tr class="border-t border-[#F4F3EF] hover:bg-[#FCFBFA]">
                <td class="px-4 py-3 font-medium text-[#1A1A1A]">${c.name}</td>
                <td class="px-4 py-3">
                    <img src="${c.image}" class="w-10 h-10 rounded-lg object-cover">
                </td>
                <td class="px-4 py-3 text-right">
                    <button onclick="deleteCategory('${c.id}')" class="text-red-500 hover:text-red-600 text-sm px-3 py-1 rounded-full border border-red-200">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (e) {}
}

function openCategoryModal() {
    document.getElementById('c-name').value  = '';
    document.getElementById('c-image').value = '';
    document.getElementById('category-modal-msg').classList.add('hidden');
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
        await fetch(`${ADMIN_API}/categories`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
        closeCategoryModal();
        loadCategories();
    } catch (e) {}
}

async function deleteCategory(id) {
    if (!confirm('Supprimer cette catégorie ?')) return;
    await fetch(`${ADMIN_API}/categories/${id}`, { method: 'DELETE', headers: authHeaders() });
    loadCategories();
}

// ── Commandes ─────────────────────────────────
async function loadOrders() {
    const tbody      = document.getElementById('orders-table');
    const cardsDiv   = document.getElementById('orders-cards');
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
        const res    = await fetch(`${ADMIN_API}/orders`, { headers: authHeaders() });
        const orders = await res.json();

        if (!orders.length) {
            tbody.innerHTML   = '<tr><td colspan="5" class="text-center py-8 text-gray-400">Aucune commande</td></tr>';
            cardsDiv.innerHTML = '<p class="text-center py-8 text-gray-400 text-sm">Aucune commande</p>';
            return;
        }

        // Table desktop
        tbody.innerHTML = orders.map(o => `
            <tr class="border-t border-[#F4F3EF] hover:bg-[#FCFBFA]">
                <td class="px-4 py-3 text-xs text-[#686663] font-mono">${String(o.id).slice(0,8)}...</td>
                <td class="px-4 py-3">${o.user?.name || o.userId?.slice(0,8) || '—'}</td>
                <td class="px-4 py-3 font-semibold text-[#6B7A4F]">${Number(o.total).toLocaleString()} FCFA</td>
                <td class="px-4 py-3">
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${statusColors[o.status] || 'bg-gray-100 text-gray-600'}">
                        ${statusLabels[o.status] || o.status}
                    </span>
                </td>
                <td class="px-4 py-3">
                    <select onchange="updateOrderStatus('${o.id}', this.value)" class="border border-[#E3E1DC] rounded-full px-3 py-1 text-xs focus:outline-[#6B7A4F] bg-white">
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

        // Cards mobile
        cardsDiv.innerHTML = orders.map(o => `
            <div class="bg-white rounded-2xl border border-[#E3E1DC] p-4">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <p class="text-xs text-[#686663] font-mono">#${String(o.id).slice(0,8)}</p>
                        <p class="font-semibold text-[#1A1A1A] text-sm mt-0.5">${o.user?.name || o.userId?.slice(0,8) || '—'}</p>
                    </div>
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${statusColors[o.status] || 'bg-gray-100 text-gray-600'}">
                        ${statusLabels[o.status] || o.status}
                    </span>
                </div>
                <div class="flex justify-between items-center">
                    <p class="font-bold text-[#6B7A4F]">${Number(o.total).toLocaleString()} FCFA</p>
                    <select onchange="updateOrderStatus('${o.id}', this.value)" class="border border-[#E3E1DC] rounded-full px-3 py-1 text-xs focus:outline-[#6B7A4F] bg-white">
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
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-red-400">Erreur chargement commandes</td></tr>';
        cardsDiv.innerHTML = '<p class="text-center py-8 text-red-400 text-sm">Erreur chargement</p>';
        console.error('Orders:', e);
    }
}

async function updateOrderStatus(id, status) {
    if (!status) return;
    await fetch(`${ADMIN_API}/orders/${id}/status`, {
        method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status })
    });
    loadOrders();
}

// ── Utilisateurs ──────────────────────────────
async function loadUsers() {
    const tbody = document.getElementById('users-table');
    try {
        const res   = await fetch(`${ADMIN_API}/users`, { headers: authHeaders() });
        const users = await res.json();
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
                    <button onclick="deleteUser('${u.id}')" class="text-red-500 hover:text-red-600 text-sm px-3 py-1 rounded-full border border-red-200">
                        <i class="fa-solid fa-trash"></i>
                    </button>` : ''}
                </td>
            </tr>
        `).join('');
    } catch (e) {}
}

async function deleteUser(id) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    await fetch(`${ADMIN_API}/users/${id}`, { method: 'DELETE', headers: authHeaders() });
    loadUsers();
    loadStats();
}

// ── Init ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('admin-token')) showDashboard();
});