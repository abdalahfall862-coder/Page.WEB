const API_URL = 'http://localhost:3000/api';

// Helper: headers avec token
function getHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

// GET
async function get(url) {
    const response = await fetch(API_URL + url, { 
        headers: getHeaders(),
        mode: 'cors'
    });
    if (!response.ok) throw new Error('Erreur ' + response.status);
    return response.json();
}

// POST
async function post(url, data) {
    const response = await fetch(API_URL + url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
        mode: 'cors'
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur ' + response.status);
    }
    return response.json();
}

// DELETE
async function del(url) {
    const response = await fetch(API_URL + url, {
        method: 'DELETE',
        headers: getHeaders(),
        mode: 'cors'
    });
    if (!response.ok) throw new Error('Erreur ' + response.status);
    return response.json();
}

// Auth
const registerUser = (data) => post('/register', data);
const loginUser = (data) => post('/login', data);

// Products
const getProducts = (params = '') => get('/products?' + params);
const getProduct = (id) => get(`/products/${id}`);

// Cart
const getCart = () => get('/cart');
const addToCart = (data) => post('/cart/add', data);
const removeFromCart = (itemId) => del(`/cart/${itemId}`);

// Orders
const createOrder = (data) => post('/orders', data);
const getMyOrders = () => get('/orders/my-orders');

// Categories
const getCategories = () => get('/categories');

// Admin
const getStats = () => get('/admin/stats');