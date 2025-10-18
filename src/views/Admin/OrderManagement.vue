<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { subscribeToCollection } from '../../firebase/firestore';
import { useRouter } from 'vue-router';

const orders = ref([]);
const loading = ref(true);
const filterStatus = ref('all');
const router = useRouter();

let unsubscribeOrders = null;

onMounted(() => {
unsubscribeOrders = subscribeToCollection(
'orders',
[{ type: 'orderBy', field: 'createdAt', direction: 'desc' }],
(data) => {
orders.value = data;
loading.value = false;
}
);
});

onUnmounted(() => {
if (unsubscribeOrders) unsubscribeOrders();
});

const filteredOrders = computed(() => {
if (filterStatus.value === 'all') return orders.value;
return orders.value.filter(o => o.status === filterStatus.value);
});

const viewOrder = (order) => {
  router.push(`/admin/orders/${order.id}`);
};

const formatDate = (timestamp) => {
if (!timestamp) return '';
const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
return date.toLocaleDateString('en-IN', {
day: 'numeric',
month: 'short',
year: 'numeric',
hour: '2-digit',
minute: '2-digit'
});
};

const getStatusColor = (status) => {
const colors = {
placed: '#667eea',
reviewing: '#f59e0b',
preparing: '#3b82f6',
'out-for-delivery': '#8b5cf6',
delivered: '#10b981',
cancelled: '#ef4444'
};
return colors[status] || '#666';
};
</script>

<template>
<div class="admin-orders">
<div class="admin-container">
<h1>Order Management</h1>

<div class="admin-nav">
<router-link role="button" to="/admin" class="admin-nav-link">Dashboard</router-link>
<router-link role="button" to="/admin/menu" class="admin-nav-link">Customize Menu</router-link>
<router-link role="button" to="/admin/orders" class="admin-nav-link">View and manage Orders</router-link>
<router-link role="button" to="/admin/coupons" class="admin-nav-link active">Coupons Manager</router-link>
<router-link role="button" to="/admin/users" class="admin-nav-link">Users</router-link>
</div>

<div class="filters">
<select v-model="filterStatus" class="filter-select">
<option value="all">All Orders</option>
<option value="placed">Placed</option>
<option value="reviewing">Reviewing</option>
<option value="preparing">Preparing</option>
<option value="out-for-delivery">Out for Delivery</option>
<option value="delivered">Delivered</option>
<option value="cancelled">Cancelled</option>
</select>
</div>

<div v-if="loading" class="loading">Loading...</div>

<div v-else-if="filteredOrders.length === 0" class="no-orders">
<p>No orders found</p>
</div>

<div v-else class="orders-list">
<div
v-for="order in filteredOrders"
:key="order.id"
class="order-card"
@click="viewOrder(order)"
>
<div class="order-header">
<div>
<h3>Order #{{ order.id.slice(-8) }}</h3>
<p class="order-date">{{ formatDate(order.createdAt) }}</p>
</div>
<div
class="order-status"
:style="{ background: getStatusColor(order.status) }"
>
{{ order.status }}
</div>
</div>

<div class="order-info">
<p><strong>Customer:</strong> {{ order.userName }}</p>
<p><strong>Email:</strong> {{ order.userEmail }}</p>
<p><strong>Total:</strong> ₹{{ order.total.toFixed(2) }}</p>
</div>

<div v-if="order.pendingApproval" class="pending-badge">
Pending Customer Approval
</div>
</div>
</div>
</div>
</div>
</template>

<style scoped>
.admin-orders {
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

.filters {
margin-bottom: 2rem;
}

.filter-select {
padding: 0.75rem 1rem;
border: 2px solid #e0e0e0;
border-radius: 8px;
font-size: 1rem;
cursor: pointer;
}

.loading,
.no-orders {
text-align: center;
padding: 4rem;
color: #666;
background: white;
border-radius: 12px;
}

.orders-list {
display: grid;
grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
gap: 1.5rem;
}

.order-card {
background: white;
padding: 1.5rem;
border-radius: 12px;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
cursor: pointer;
transition: all 0.3s;
}

.order-card:hover {
transform: translateY(-3px);
box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.order-header {
display: flex;
justify-content: space-between;
align-items: flex-start;
margin-bottom: 1rem;
padding-bottom: 1rem;
border-bottom: 1px solid #e0e0e0;
}

.order-header h3 {
color: #333;
font-size: 1.25rem;
margin-bottom: 0.25rem;
}

.order-date {
color: #666;
font-size: 0.9rem;
}

.order-status {
padding: 0.5rem 1rem;
border-radius: 20px;
color: white;
font-weight: 600;
font-size: 0.9rem;
}

.order-info p {
color: #666;
margin: 0.5rem 0;
font-size: 0.95rem;
}

.pending-badge {
background: #fff3cd;
color: #856404;
padding: 0.75rem;
border-radius: 8px;
margin-top: 1rem;
font-weight: 600;
text-align: center;
font-size: 0.9rem;
}

@media (max-width: 768px) {
.orders-list {
grid-template-columns: 1fr;
}
}
</style>
