<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <h2>New Orders</h2>
      <p>Time remaining: {{ remainingTime }} seconds</p>
      <ul class="order-list">
        <li v-for="order in newOrders" :key="order.id" class="order-card">
          <div class="order-info">
            <h4>Order from {{ order.userName }}</h4>
            <p class="order-total">Total: ₹{{ order.total.toFixed(2) }}</p>
          </div>
          <div class="item-list">
            <strong>Items:</strong>
            <ul>
              <li v-for="item in order.items" :key="item.id">
                {{ item.name }} &times; {{ item.quantity }}
              </li>
            </ul>
          </div>
          <div class="order-actions">
            <button @click="acceptOrder(order)" class="btn-accept">Accept</button>
            <button @click="rejectOrder(order)" class="btn-reject">Reject</button>
            <button @click="viewOrder(order)" class="btn-view">View</button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue';
import { updateDocument } from '../firebase/firestore';
import { useRouter } from 'vue-router';

const props = defineProps({
  show: Boolean,
  orders: Array
});

const emit = defineEmits(['close', 'update:orders']);
const router = useRouter();

const newOrders = ref([...props.orders]);
const remainingTime = ref(300); // 5 minutes in seconds
let timer = null;
const audio = new Audio('https://tasteoftown.in/file/tone.mp3');
audio.loop = true;

const startTimer = () => {
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    remainingTime.value--;
    if (remainingTime.value <= 0) {
      clearInterval(timer);
      props.orders.forEach(order => rejectOrder(order));
      emit('close');
    }
  }, 1000);
};

const resetTimer = () => {
  remainingTime.value = 300;
  startTimer();
};

watch(() => props.show, (newValue) => {
  if (newValue) {
    newOrders.value = [...props.orders];
    resetTimer();
    audio.play();
  } else {
    clearInterval(timer);
    audio.pause();
  }
});

watch(() => props.orders, (newVal) => {
  newOrders.value = [...newVal];
  if (newVal.length > 0) {
    remainingTime.value += 300; // Add 5 minutes for each new order
    audio.play();
  }
});

const acceptOrder = async (order) => {
  await updateDocument('orders', order.id, { status: 'preparing' });
  removeOrderFromList(order);
};

const rejectOrder = async (order) => {
  await updateDocument('orders', order.id, { status: 'cancelled' });
  removeOrderFromList(order);
};

const viewOrder = (order) => {
  router.push(`/admin/orders/${order.id}`);
  emit('close');
};

const removeOrderFromList = (order) => {
  const updatedOrders = newOrders.value.filter(o => o.id !== order.id);
  newOrders.value = updatedOrders;
  if (updatedOrders.length === 0) {
    emit('close');
  }
  emit('update:orders', updatedOrders);
};

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

h2 {
    text-align: center;
    margin-bottom: 1rem;
    color: #333;
}

.order-list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.order-card {
    background: #f9f9f9;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid #eee;
}

.order-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
}

.order-info h4 {
    margin: 0;
    color: #333;
}

.order-total {
    margin: 0;
    font-weight: bold;
    color: #667eea;
}

.item-list {
    margin-bottom: 1.5rem;
}

.item-list ul {
    list-style: none;
    padding: 0;
    margin-top: 0.5rem;
    color: #666;
}

.order-actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
}

button {
    padding: 0.75rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.2s;
}

.btn-accept {
    background-color: #10b981;
    color: white;
}
.btn-accept:hover {
    background-color: #059669;
}

.btn-reject {
    background-color: #ef4444;
    color: white;
}
.btn-reject:hover {
    background-color: #dc2626;
}

.btn-view {
    background-color: #6b7280;
    color: white;
}
.btn-view:hover {
    background-color: #4b5563;
}
</style>
