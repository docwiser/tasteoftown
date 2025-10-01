<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { subscribeToDocument, updateDocument } from '../firebase/firestore';

const route = useRoute();
const router = useRouter();
const { user } = useAuthStore();

const order = ref(null);
const loading = ref(true);
let unsubscribe = null;

onMounted(() => {
  unsubscribe = subscribeToDocument('orders', route.params.id, (data) => {
    if (data && data.userId === user.value.uid) {
      order.value = data;
    }
    loading.value = false;
  });
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

const approveModifiedCart = async () => {
  await updateDocument('orders', order.value.id, {
    pendingApproval: false,
    modifiedByAdmin: false,
    status: 'preparing'
  });
};

const rejectModifiedCart = async () => {
  await updateDocument('orders', order.value.id, {
    pendingApproval: false,
    modifiedByAdmin: false,
    status: 'cancelled'
  });
};
</script>

<template>
  <div class="order-detail-page">
    <div v-if="loading" class="loading">Loading order...</div>

    <div v-else-if="!order" class="not-found">
      <p>Order not found</p>
      <router-link to="/orders" class="btn-primary">Back to Orders</router-link>
    </div>

    <div v-else class="order-detail">
      <div class="order-header">
        <div>
          <h1>Order #{{ order.id.slice(-8) }}</h1>
          <p class="order-date">{{ formatDate(order.createdAt) }}</p>
        </div>
        <div
          class="order-status"
          :style="{ background: getStatusColor(order.status) }"
        >
          {{ getStatusText(order.status) }}
        </div>
      </div>

      <div v-if="order.pendingApproval" class="approval-section">
        <h2>Modified Cart - Approval Required</h2>
        <p>
          The admin has modified your cart due to item availability. Please review the changes below and approve or reject the order.
        </p>
        <div class="approval-actions">
          <button @click="approveModifiedCart" class="btn-approve">
            Approve & Continue
          </button>
          <button @click="rejectModifiedCart" class="btn-reject">
            Reject Order
          </button>
        </div>
      </div>

      <div class="order-content">
        <div class="order-main">
          <div class="section">
            <h2>Order Items</h2>
            <div class="order-items">
              <div
                v-for="(item, index) in order.items"
                :key="index"
                class="order-item"
              >
                <div class="item-image">
                  <img :src="item.imageUrl" :alt="item.name" />
                </div>
                <div class="item-details">
                  <h3>{{ item.name }}</h3>
                  <p>{{ item.type === 'veg' ? '🟢 Veg' : '🔴 Non-Veg' }}</p>
                  <p>Quantity: {{ item.quantity }}</p>
                </div>
                <div class="item-price">
                  ₹{{ (item.price * item.quantity).toFixed(2) }}
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Delivery Address</h2>
            <div class="address-info">
              <p><strong>{{ order.address.label }}</strong></p>
              <p>{{ order.address.street }}</p>
              <p>{{ order.address.city }}, {{ order.address.state }} - {{ order.address.pincode }}</p>
              <p>Phone: {{ order.address.phone }}</p>
            </div>
          </div>

          <div class="section">
            <h2>Order Timeline</h2>
            <div class="timeline">
              <div
                v-for="(entry, index) in order.statusHistory"
                :key="index"
                class="timeline-item"
              >
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <h4>{{ getStatusText(entry.status) }}</h4>
                  <p>{{ formatDate(entry.timestamp) }}</p>
                  <p v-if="entry.note" class="timeline-note">{{ entry.note }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="order-sidebar">
          <div class="order-summary">
            <h2>Order Summary</h2>

            <div class="summary-row">
              <span>Subtotal</span>
              <span>₹{{ order.subtotal.toFixed(2) }}</span>
            </div>

            <div class="summary-row">
              <span>Delivery Fee</span>
              <span>₹{{ order.deliveryFee.toFixed(2) }}</span>
            </div>

            <div v-if="order.discount > 0" class="summary-row discount">
              <span>Discount</span>
              <span>-₹{{ order.discount.toFixed(2) }}</span>
            </div>

            <div class="summary-divider"></div>

            <div class="summary-row total">
              <span>Total</span>
              <span>₹{{ order.total.toFixed(2) }}</span>
            </div>

            <div class="payment-method">
              <p><strong>Payment Method</strong></p>
              <p>{{ order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod }}</p>
            </div>
          </div>

          <router-link to="/orders" class="btn-back">
            ← Back to Orders
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.order-detail-page {
  min-height: calc(100vh - 80px);
  background: #f9f9f9;
  padding: 2rem 1.5rem;
}

.loading,
.not-found {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.not-found .btn-primary {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
}

.order-detail {
  max-width: 1200px;
  margin: 0 auto;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.order-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 0.25rem;
}

.order-date {
  color: #666;
  font-size: 1rem;
}

.order-status {
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.approval-section {
  background: #fff3cd;
  border: 2px solid #ffc107;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.approval-section h2 {
  color: #856404;
  margin-bottom: 1rem;
}

.approval-section p {
  color: #856404;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.approval-actions {
  display: flex;
  gap: 1rem;
}

.btn-approve,
.btn-reject {
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-approve {
  background: #10b981;
  color: white;
}

.btn-approve:hover {
  background: #059669;
}

.btn-reject {
  background: #ef4444;
  color: white;
}

.btn-reject:hover {
  background: #dc2626;
}

.order-content {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
}

.order-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.section h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #333;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-item {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 1.25rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details h3 {
  color: #333;
  margin-bottom: 0.25rem;
  font-size: 1.1rem;
}

.item-details p {
  color: #666;
  font-size: 0.9rem;
  margin: 0.25rem 0;
}

.item-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #667eea;
}

.address-info {
  line-height: 1.8;
  color: #666;
}

.address-info p {
  margin: 0.25rem 0;
}

.timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline-item {
  position: relative;
  padding-bottom: 2rem;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -2rem;
  top: 0;
  width: 16px;
  height: 16px;
  background: #667eea;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 0 2px #667eea;
}

.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: -1.5rem;
  top: 16px;
  width: 2px;
  height: calc(100% - 16px);
  background: #e0e0e0;
}

.timeline-content h4 {
  color: #333;
  margin-bottom: 0.25rem;
  font-size: 1.1rem;
}

.timeline-content p {
  color: #666;
  font-size: 0.9rem;
}

.timeline-note {
  margin-top: 0.5rem;
  color: #667eea !important;
  font-style: italic;
}

.order-sidebar {
  height: fit-content;
  position: sticky;
  top: 100px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-summary {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.order-summary h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #333;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  color: #666;
}

.summary-row.discount {
  color: #10b981;
  font-weight: 600;
}

.summary-row.total {
  font-size: 1.25rem;
  font-weight: 700;
  color: #333;
}

.summary-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 1rem 0;
}

.payment-method {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

.payment-method p {
  margin: 0.5rem 0;
  color: #666;
}

.btn-back {
  display: block;
  width: 100%;
  padding: 0.875rem;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 8px;
  text-align: center;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-back:hover {
  background: #f5f5ff;
}

@media (max-width: 968px) {
  .order-header {
    flex-direction: column;
    gap: 1rem;
  }

  .order-content {
    grid-template-columns: 1fr;
  }

  .order-sidebar {
    position: static;
  }

  .approval-actions {
    flex-direction: column;
  }

  .order-item {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
