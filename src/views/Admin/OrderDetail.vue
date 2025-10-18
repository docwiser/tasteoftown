<template>
  <div class="admin-order-detail">
    <div v-if="loading">Loading...</div>
    <div v-if="order">
      <h1>Order #{{ order.id.slice(-8) }}</h1>
      <div class="order-details">
        <div class="detail-section">
          <h3>Customer Information</h3>
          <p><strong>Name:</strong> {{ order.userName }}</p>
          <p><strong>Email:</strong> {{ order.userEmail }}</p>
          <p><strong>Phone:</strong> {{ order.address.phone }}</p>
        </div>
        <div class="detail-section">
          <h3>Delivery Address</h3>
          <p>{{ order.address.label }}</p>
          <p>{{ order.address.street }}</p>
          <p>{{ order.address.city }}, {{ order.address.state }} - {{ order.address.pincode }}</p>
        </div>
        <div class="detail-section">
          <div class="section-header-inline">
            <h3>Order Items</h3>
            <button
              v-if="!modifyingCart && order.status === 'placed'"
              @click="startModifyingCart"
              class="btn-modify"
            >
              Modify Cart
            </button>
          </div>
          <div v-if="!modifyingCart" class="items-list">
            <div v-for="(item, index) in order.items" :key="index" class="item-row">
              <span>{{ item.name }} x {{ item.quantity }}</span>
              <span>₹{{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>
          <div v-else class="items-list-editable">
            <div v-for="(item, index) in modifiedItems" :key="index" class="item-row-editable">
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
              <button @click="saveModifiedCart" class="btn-save-modify">Save & Send for Approval</button>
              <button @click="cancelModifyCart" class="btn-cancel-modify">Cancel</button>
            </div>
          </div>
        </div>
        <div class="detail-section">
          <h3>Order Summary</h3>
          <div class="summary-row">
            <span>Subtotal</span>
            <span>₹{{ order.subtotal.toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span>Delivery Fee</span>
            <span>₹{{ order.deliveryFee.toFixed(2) }}</span>
          </div>
          <div v-if="order.discount > 0" class="summary-row">
            <span>Discount</span>
            <span>-₹{{ order.discount.toFixed(2) }}</span>
          </div>
          <div class="summary-row total">
            <span>Total</span>
            <span>₹{{ order.total.toFixed(2) }}</span>
          </div>
        </div>
        <div class="detail-section">
          <h3>Order Status</h3>
          <p>Current Status: <strong>{{ order.status }}</strong></p>
          <div class="status-buttons">
            <button @click="updateStatus('preparing')">Preparing</button>
            <button @click="updateStatus('out-for-delivery')">Out for Delivery</button>
            <button @click="updateStatus('delivered')">Delivered</button>
            <button @click="updateStatus('cancelled')">Cancelled</button>
          </div>
        </div>
        <div class="detail-section">
          <h3>Order Timeline</h3>
          <div class="timeline">
            <div v-for="(entry, index) in order.statusHistory" :key="index" class="timeline-entry">
              <p><strong>{{ entry.status }}</strong></p>
              <p>{{ new Date(entry.timestamp).toLocaleString() }}</p>
              <p>{{ entry.note }}</p>
            </div>
          </div>
          <div class="timeline-add">
            <input v-model="newTimelineName" placeholder="Timeline entry name" />
            <input v-model="newTimelineNote" placeholder="Add a note to the timeline" />
            <button @click="addTimelineEntry">Add to Timeline</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { subscribeToDocument, updateDocument } from '../../firebase/firestore';

const route = useRoute();
const orderId = route.params.orderid;
const order = ref(null);
const loading = ref(true);
const newTimelineName = ref('');
const newTimelineNote = ref('');
const modifyingCart = ref(false);
const modifiedItems = ref([]);

let unsubscribe = null;

onMounted(() => {
  unsubscribe = subscribeToDocument('orders', orderId, (data) => {
    order.value = data;
    if (data) {
      modifiedItems.value = JSON.parse(JSON.stringify(data.items));
    }
    loading.value = false;
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

const updateStatus = async (newStatus) => {
  if (!order.value) return;

  const newEntry = {
    status: newStatus,
    timestamp: new Date().toISOString(),
    note: `Order status changed to ${newStatus}`,
  };

  const updatedHistory = [...(order.value.statusHistory || []), newEntry];

  await updateDocument('orders', orderId, { 
    status: newStatus,
    statusHistory: updatedHistory
  });
};

const addTimelineEntry = async () => {
  if (!order.value || !newTimelineNote.value || !newTimelineName.value) return;

  const newEntry = {
    status: newTimelineName.value,
    timestamp: new Date().toISOString(),
    note: newTimelineNote.value,
  };

  const updatedHistory = [...(order.value.statusHistory || []), newEntry];

  await updateDocument('orders', orderId, {
    statusHistory: updatedHistory,
  });

  newTimelineName.value = '';
  newTimelineNote.value = '';
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

  const newTotal = newSubtotal + order.value.deliveryFee - order.value.discount;

  await updateDocument('orders', order.value.id, {
    items: modifiedItems.value,
    subtotal: newSubtotal,
    total: newTotal,
    modifiedByAdmin: true,
    pendingApproval: true,
    status: 'reviewing'
  });

  modifyingCart.value = false;
};

const cancelModifyCart = () => {
  modifiedItems.value = JSON.parse(JSON.stringify(order.value.items));
  modifyingCart.value = false;
};

</script>

<style scoped>
.admin-order-detail {
  padding: 2rem;
}

.order-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.detail-section {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
}

.item-row, .summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.total {
  font-weight: bold;
  margin-top: 1rem;
  border-top: 1px solid #ccc;
  padding-top: 0.5rem;
}

.status-buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.timeline {
  margin-top: 1rem;
}

.timeline-entry {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.timeline-add {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

input {
  padding: 0.5rem;
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
</style>
