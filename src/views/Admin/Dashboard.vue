<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { subscribeToCollection } from '../../firebase/firestore';

const orders = ref([]);
const loading = ref(true);
let unsubscribeOrders = null;

onMounted(() => {
unsubscribeOrders = subscribeToCollection('orders', [], (data) => {
orders.value = data;
loading.value = false;
});
});

onUnmounted(() => {
if (unsubscribeOrders) unsubscribeOrders();
});

const activeOrders = computed(() => {
return orders.value.filter(o => !['delivered', 'cancelled'].includes(o.status));
});

const todayOrders = computed(() => {
const today = new Date();
today.setHours(0, 0, 0, 0);
return orders.value.filter(o => {
const orderDate = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
return orderDate >= today;
});
});

const totalRevenue = computed(() => {
return orders.value
.filter(o => o.status === 'delivered')
.reduce((sum, o) => sum + o.total, 0);
});

const todayRevenue = computed(() => {
const today = new Date();
today.setHours(0, 0, 0, 0);
return orders.value
.filter(o => {
const orderDate = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
return o.status === 'delivered' && orderDate >= today;
})
.reduce((sum, o) => sum + o.total, 0);
});

const pendingApprovalOrders = computed(() => {
return orders.value.filter(o => o.pendingApproval === true);
});
</script>

<template>
<div class="admin-dashboard">
<div class="admin-container">
<h1>Admin Dashboard</h1>

<div class="admin-nav">
<router-link role="button" to="/admin" class="admin-nav-link active">Dashboard</router-link>
<router-link role="button" to="/admin/menu" class="admin-nav-link">Customize Menu</router-link>
<router-link role="button" to="/admin/orders" class="admin-nav-link">View and manage Orders</router-link>
<router-link role="button" to="/admin/coupons" class="admin-nav-link">Coupons Manager</router-link>
<router-link role="button" to="/admin/users" class="admin-nav-link">Users</router-link>
</div>
<div v-if="loading" class="loading" role="alert">Loading...</div>
<div v-else>
<div class="stats-grid">
<div class="stat-card">
<div class="stat-icon">📦</div>
<div class="stat-content">
<h3>Active Orders</h3>
<p class="stat-value">{{ activeOrders.length }}</p>
</div>
</div>
<div class="stat-card">
<div class="stat-icon">🛒</div>
<div class="stat-content">
<h3>Today's Orders</h3>
<p class="stat-value">{{ todayOrders.length }}</p>
</div>
</div>
<div class="stat-card">
<div class="stat-icon">💰</div>
<div class="stat-content">
<h3>Today's Revenue</h3>
<p class="stat-value">₹{{ todayRevenue.toFixed(2) }}</p>
</div>
</div>
<div class="stat-card">
<div class="stat-icon">📊</div>
<div class="stat-content">
<h3>Total Revenue</h3>
<p class="stat-value">₹{{ totalRevenue.toFixed(2) }}</p>
</div>
</div>
</div>
<div v-if="pendingApprovalOrders.length > 0" class="alert-section">
<h2>⚠️ Orders Pending Customer Approval</h2>
<p>{{ pendingApprovalOrders.length }} order(s) waiting for customer approval after cart modification</p>
<router-link role="button" to="/admin/orders" class="btn-primary">Manage Orders</router-link>
</div>
<div class="recent-orders">
<h2>Recent Orders</h2>
<div v-if="todayOrders.length === 0" class="no-orders">
<p>No orders today</p>
</div>
<div v-else class="orders-table">
<table>
<thead>
<tr>
<th>Order ID</th>
<th>Customer</th>
<th>Items</th>
<th>Total</th>
<th>Status</th>
<th>Action</th>
</tr>
</thead>
<tbody>
<tr v-for="order in todayOrders.slice(0, 10)" :key="order.id">
<td>#{{ order.id.slice(-8) }}</td>
<td>{{ order.userName }}</td>
<td>{{ order.items.length }} items</td>
<td>₹{{ order.total.toFixed(2) }}</td>
<td>
<span class="status-badge" :class="order.status">
{{ order.status }}
</span>
</td>
<td>
<router-link role="button" :to="`/admin/orders`" class="btn-view">
View
</router-link>
</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</div>
</div>
</template>

<style scoped>
.admin-dashboard {
min-height: calc(100vh - 80px);
background: #f9f9f9;
padding: 2rem 1.5rem;
}

.admin-container {
max-width: 1400px;
margin: 0 auto;
}

.admin-container h1 {
font-size: 2.5rem;
margin-bottom: 2rem;
color: #333;
}

.admin-nav {
display: flex;
gap: 1rem;
margin-bottom: 2rem;
flex-wrap: wrap;
}

.admin-nav-link {
padding: 0.75rem 1.5rem;
background: white;
color: #667eea;
text-decoration: none;
border-radius: 8px;
font-weight: 600;
transition: all 0.3s;
box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.admin-nav-link:hover {
background: #f5f5ff;
}

.admin-nav-link.active {
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
color: white;
}

.loading {
text-align: center;
padding: 4rem;
color: #666;
}

.stats-grid {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
gap: 1.5rem;
margin-bottom: 2rem;
}

.stat-card {
background: white;
padding: 2rem;
border-radius: 12px;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
display: flex;
align-items: center;
gap: 1.5rem;
}

.stat-icon {
font-size: 3rem;
}

.stat-content h3 {
color: #666;
font-size: 0.95rem;
margin-bottom: 0.5rem;
font-weight: 500;
}

.stat-value {
font-size: 2rem;
font-weight: 700;
color: #333;
}

.alert-section {
background: #fff3cd;
border: 2px solid #ffc107;
padding: 2rem;
border-radius: 12px;
margin-bottom: 2rem;
}

.alert-section h2 {
color: #856404;
margin-bottom: 0.75rem;
font-size: 1.5rem;
}

.alert-section p {
color: #856404;
margin-bottom: 1.5rem;
}

.btn-primary {
display: inline-block;
padding: 0.75rem 1.5rem;
background: #667eea;
color: white;
text-decoration: none;
border-radius: 8px;
font-weight: 600;
}

.recent-orders {
background: white;
padding: 2rem;
border-radius: 12px;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.recent-orders h2 {
font-size: 1.5rem;
margin-bottom: 1.5rem;
color: #333;
}

.no-orders {
text-align: center;
padding: 2rem;
color: #666;
}

.orders-table {
overflow-x: auto;
}

table {
width: 100%;
border-collapse: collapse;
}

th {
text-align: left;
padding: 1rem;
background: #f9f9f9;
color: #333;
font-weight: 600;
border-bottom: 2px solid #e0e0e0;
}

td {
padding: 1rem;
border-bottom: 1px solid #e0e0e0;
}

.status-badge {
padding: 0.375rem 0.875rem;
border-radius: 12px;
font-size: 0.85rem;
font-weight: 600;
display: inline-block;
}

.status-badge.placed {
background: #e0e7ff;
color: #667eea;
}

.status-badge.reviewing {
background: #fef3c7;
color: #f59e0b;
}

.status-badge.preparing {
background: #dbeafe;
color: #3b82f6;
}

.status-badge.out-for-delivery {
background: #ede9fe;
color: #8b5cf6;
}

.status-badge.delivered {
background: #d1fae5;
color: #10b981;
}

.status-badge.cancelled {
background: #fee2e2;
color: #ef4444;
}

.btn-view {
padding: 0.5rem 1rem;
background: #667eea;
color: white;
text-decoration: none;
border-radius: 6px;
font-size: 0.9rem;
font-weight: 600;
}

@media (max-width: 768px) {
.stats-grid {
grid-template-columns: 1fr;
}

.orders-table {
font-size: 0.9rem;
}

th,
td {
padding: 0.75rem;
}
}
</style>
