<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { subscribeToCollection, updateDocument } from '../../firebase/firestore';

const orders = ref([]);
const loading = ref(true);
const selectedOrder = ref(null);
const showOrderModal = ref(false);
const modifyingCart = ref(false);
const modifiedItems = ref([]);
const filterStatus = ref('all');

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
selectedOrder.value = order;
modifiedItems.value = JSON.parse(JSON.stringify(order.items));
modifyingCart.value = false;
showOrderModal.value = true;
};

const closeModal = () => {
showOrderModal.value = false;
selectedOrder.value = null;
modifiedItems.value = [];
modifyingCart.value = false;
};

const updateOrderStatus = async (orderId, newStatus) => {
const statusHistory = [
...(selectedOrder.value.statusHistory || []),
{
status: newStatus,
timestamp: new Date().toISOString(),
note: `Status updated to ${newStatus}`
}
];

await updateDocument('orders', orderId, {
status: newStatus,
statusHistory
});

if (selectedOrder.value.id === orderId) {
selectedOrder.value.status = newStatus;
}
};

const startModifyingCart = () => {
modifyingCart.value = true;
};

const updateModifiedQuantity = (index, quantity) => {
if (quantity <= 0) {
modifiedItems.value.splice(index, 1);
} else {
modifiedItems.value[index].quantity = quantity;
}
};

const removeModifiedItem = (index) => {
modifiedItems.value.splice(index, 1);
};

const saveModifiedCart = async () => {
if (modifiedItems.value.length === 0) {
alert('Cart cannot be empty');
return;
}

const newSubtotal = modifiedItems.value.reduce((sum, item) => {
return sum + (item.price * item.quantity);
}, 0);

const newTotal = newSubtotal + selectedOrder.value.deliveryFee - selectedOrder.value.discount;

await updateDocument('orders', selectedOrder.value.id, {
items: modifiedItems.value,
subtotal: newSubtotal,
total: newTotal,
modifiedByAdmin: true,
pendingApproval: true,
status: 'reviewing'
});

modifyingCart.value = false;
closeModal();
};

const cancelModifyCart = () => {
modifiedItems.value = JSON.parse(JSON.stringify(selectedOrder.value.items));
modifyingCart.value = false;
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

<div v-if="showOrderModal" class="modal">
<div class="modal-content large">
<div class="modal-header">
<h2>Order #{{ selectedOrder.id.slice(-8) }}</h2>
<button @click="closeModal" class="btn-close">×</button>
</div>

<div class="modal-body">
<div class="order-details">
<div class="detail-section">
<h3>Customer Information</h3>
<p><strong>Name:</strong> {{ selectedOrder.userName }}</p>
<p><strong>Email:</strong> {{ selectedOrder.userEmail }}</p>
<p><strong>Phone:</strong> {{ selectedOrder.address.phone }}</p>
</div>

<div class="detail-section">
<h3>Delivery Address</h3>
<p>{{ selectedOrder.address.label }}</p>
<p>{{ selectedOrder.address.street }}</p>
<p>{{ selectedOrder.address.city }}, {{ selectedOrder.address.state }} - {{ selectedOrder.address.pincode }}</p>
</div>

<div class="detail-section">
<div class="section-header-inline">
<h3>Order Items</h3>
<button
v-if="!modifyingCart && selectedOrder.status === 'placed'"
@click="startModifyingCart"
class="btn-modify"
>
Modify Cart
</button>
</div>

<div v-if="!modifyingCart" class="items-list">
<div
v-for="(item, index) in selectedOrder.items"
:key="index"
class="item-row"
>
<span>{{ item.name }} × {{ item.quantity }}</span>
<span>₹{{ (item.price * item.quantity).toFixed(2) }}</span>
</div>
</div>

<div v-else class="items-list-editable">
<div
v-for="(item, index) in modifiedItems"
:key="index"
class="item-row-editable"
>
<span class="item-name">{{ item.name }}</span>
<div class="quantity-controls">
<button @click="updateModifiedQuantity(index, item.quantity - 1)">-</button>
<span>{{ item.quantity }}</span>
<button @click="updateModifiedQuantity(index, item.quantity + 1)">+</button>
</div>
<span class="item-price">₹{{ (item.price * item.quantity).toFixed(2) }}</span>
<button @click="removeModifiedItem(index)" class="btn-remove-item">×</button>
</div>

<div class="modify-actions">
<button @click="saveModifiedCart" class="btn-save-modify">
Save & Send for Approval
</button>
<button @click="cancelModifyCart" class="btn-cancel-modify">
Cancel
</button>
</div>
</div>
</div>

<div class="detail-section">
<h3>Order Summary</h3>
<div class="summary-row">
<span>Subtotal</span>
<span>₹{{ selectedOrder.subtotal.toFixed(2) }}</span>
</div>
<div class="summary-row">
<span>Delivery Fee</span>
<span>₹{{ selectedOrder.deliveryFee.toFixed(2) }}</span>
</div>
<div v-if="selectedOrder.discount > 0" class="summary-row">
<span>Discount</span>
<span>-₹{{ selectedOrder.discount.toFixed(2) }}</span>
</div>
<div class="summary-row total">
<span>Total</span>
<span>₹{{ selectedOrder.total.toFixed(2) }}</span>
</div>
</div>

<div class="detail-section">
<h3>Update Status</h3>
<div class="status-buttons">
<button
v-if="selectedOrder.status === 'placed'"
@click="updateOrderStatus(selectedOrder.id, 'preparing')"
class="btn-status"
>
Accept & Start Preparing
</button>
<button
v-if="selectedOrder.status === 'preparing'"
@click="updateOrderStatus(selectedOrder.id, 'out-for-delivery')"
class="btn-status"
>
Out for Delivery
</button>
<button
v-if="selectedOrder.status === 'out-for-delivery'"
@click="updateOrderStatus(selectedOrder.id, 'delivered')"
class="btn-status success"
>
Mark as Delivered
</button>
<button
v-if="!['delivered', 'cancelled'].includes(selectedOrder.status)"
@click="updateOrderStatus(selectedOrder.id, 'cancelled')"
class="btn-status danger"
>
Cancel Order
</button>
</div>
</div>
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

.modal {
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
background: rgba(0, 0, 0, 0.5);
display: flex;
align-items: center;
justify-content: center;
z-index: 1000;
padding: 1rem;
}

.modal-content {
background: white;
border-radius: 12px;
max-width: 800px;
width: 100%;
max-height: 90vh;
overflow-y: auto;
}

.modal-content.large {
max-width: 900px;
}

.modal-header {
display: flex;
justify-content: space-between;
align-items: center;
padding: 1.5rem;
border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
font-size: 1.5rem;
color: #333;
}

.btn-close {
width: 36px;
height: 36px;
border: none;
background: #f5f5f5;
border-radius: 50%;
font-size: 1.5rem;
cursor: pointer;
transition: background 0.3s;
}

.btn-close:hover {
background: #e0e0e0;
}

.modal-body {
padding: 1.5rem;
}

.order-details {
display: flex;
flex-direction: column;
gap: 2rem;
}

.detail-section {
background: #f9f9f9;
padding: 1.5rem;
border-radius: 8px;
}

.detail-section h3 {
color: #333;
margin-bottom: 1rem;
font-size: 1.25rem;
}

.detail-section p {
color: #666;
margin: 0.5rem 0;
}

.section-header-inline {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 1rem;
}

.btn-modify {
padding: 0.5rem 1rem;
background: #f59e0b;
color: white;
border: none;
border-radius: 6px;
font-weight: 600;
cursor: pointer;
}

.items-list {
display: flex;
flex-direction: column;
gap: 0.75rem;
}

.item-row {
display: flex;
justify-content: space-between;
padding: 0.75rem;
background: white;
border-radius: 6px;
}

.items-list-editable {
display: flex;
flex-direction: column;
gap: 1rem;
}

.item-row-editable {
display: grid;
grid-template-columns: 1fr auto auto auto;
gap: 1rem;
align-items: center;
padding: 0.75rem;
background: white;
border-radius: 6px;
}

.item-name {
color: #333;
font-weight: 500;
}

.quantity-controls {
display: flex;
align-items: center;
gap: 0.5rem;
}

.quantity-controls button {
width: 28px;
height: 28px;
border: none;
background: #667eea;
color: white;
border-radius: 4px;
cursor: pointer;
font-size: 1.1rem;
}

.item-price {
font-weight: 600;
color: #667eea;
}

.btn-remove-item {
width: 28px;
height: 28px;
border: none;
background: #ef4444;
color: white;
border-radius: 4px;
cursor: pointer;
font-size: 1.25rem;
}

.modify-actions {
display: flex;
gap: 1rem;
margin-top: 1rem;
}

.btn-save-modify,
.btn-cancel-modify {
flex: 1;
padding: 0.875rem;
border: none;
border-radius: 8px;
font-weight: 600;
cursor: pointer;
}

.btn-save-modify {
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
color: white;
}

.btn-cancel-modify {
background: #f5f5f5;
color: #333;
}

.summary-row {
display: flex;
justify-content: space-between;
margin-bottom: 0.75rem;
color: #666;
}

.summary-row.total {
font-size: 1.25rem;
font-weight: 700;
color: #333;
padding-top: 0.75rem;
border-top: 2px solid #e0e0e0;
margin-top: 0.75rem;
}

.status-buttons {
display: flex;
flex-wrap: wrap;
gap: 0.75rem;
}

.btn-status {
padding: 0.875rem 1.5rem;
background: #667eea;
color: white;
border: none;
border-radius: 8px;
font-weight: 600;
cursor: pointer;
transition: all 0.3s;
}

.btn-status.success {
background: #10b981;
}

.btn-status.danger {
background: #ef4444;
}

.btn-status:hover {
transform: translateY(-2px);
}

@media (max-width: 768px) {
.orders-list {
grid-template-columns: 1fr;
}

.item-row-editable {
grid-template-columns: 1fr;
gap: 0.75rem;
}

.modify-actions {
flex-direction: column;
}

.status-buttons {
flex-direction: column;
}
}
</style>
