<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { subscribeToCollection } from '../firebase/firestore';
const router = useRouter();
const { user } = useAuthStore();
const orders = ref([]);
const loading = ref(true);
let unsubscribe = null;
onMounted(() => {
unsubscribe = subscribeToCollection(
'orders',
[
{ type: 'where', field: 'userId', operator: '==', value: user.value.uid },
{ type: 'orderBy', field: 'createdAt', direction: 'desc' }
],
(data) => {
orders.value = data;
loading.value = false;
}
);
});
onUnmounted(() => {
if (unsubscribe) unsubscribe();
});
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
const getStatusText = (status) => {
const texts = {
placed: 'Order Placed',
reviewing: 'Under Review',
preparing: 'Preparing',
'out-for-delivery': 'Out for Delivery',
delivered: 'Delivered',
cancelled: 'Cancelled'
};
return texts[status] || status;
};
const viewOrder = (orderId) => {
router.push(`/order/${orderId}`);
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
</script>
<template>
<div class="orders-page">
<div class="orders-container">
<h1>My Orders</h1>
<div v-if="loading" class="loading">Loading orders...</div>
<div v-else-if="orders.length === 0" class="no-orders">
<p>You haven't placed any orders yet</p>
<router-link role="button" to="/menu" class="btn-primary">Browse Menu</router-link>
</div>
<div v-else class="orders-list">
<div
v-for="order in orders"
:key="order.id"
class="order-card"
@click="viewOrder(order.id)"
role="button"
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
{{ getStatusText(order.status) }}
</div>
</div>
<div class="order-items">
<div v-for="(item, index) in order.items" :key="index" class="order-item">
<span>{{ item.name }} × {{ item.quantity }}</span>
</div>
</div>
<div v-if="order.pendingApproval" class="pending-approval-badge">
Pending Your Approval
</div>
<div class="order-footer">
<span class="order-total">Total: ₹{{ order.total.toFixed(2) }}</span>
<span class="view-details">View Details →</span>
</div>
</div>
</div>
</div>
</div>
</template>
<style scoped>
.orders-page {
min-height: calc(100vh - 80px);
background: #f9f9f9;
padding: 2rem 1.5rem;
}

.orders-container {
max-width: 1000px;
margin: 0 auto;
}

.orders-container h1 {
font-size: 2.5rem;
margin-bottom: 2rem;
color: #333;
}

.loading,
.no-orders {
text-align: center;
padding: 4rem 2rem;
color: #666;
}

.no-orders .btn-primary {
display: inline-block;
margin-top: 1.5rem;
padding: 0.875rem 2rem;
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
color: white;
text-decoration: none;
border-radius: 8px;
font-weight: 600;
}

.orders-list {
display: flex;
flex-direction: column;
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

.order-items {
margin-bottom: 1rem;
}

.order-item {
display: flex;
justify-content: space-between;
padding: 0.5rem 0;
color: #666;
}

.pending-approval-badge {
background: #fff3cd;
color: #856404;
padding: 0.75rem 1rem;
border-radius: 8px;
margin-bottom: 1rem;
font-weight: 600;
text-align: center;
}

.order-footer {
display: flex;
justify-content: space-between;
align-items: center;
padding-top: 1rem;
border-top: 1px solid #e0e0e0;
}

.order-total {
font-size: 1.25rem;
font-weight: 700;
color: #333;
}

.view-details {
color: #667eea;
font-weight: 600;
}

@media (max-width: 768px) {
.order-header {
flex-direction: column;
gap: 1rem;
}

.order-status {
align-self: flex-start;
}
}
</style>
