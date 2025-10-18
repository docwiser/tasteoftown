  <template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <h2>New Orders</h2>
      <p>Time remaining: {{ remainingTime }} seconds</p>
      <ul>
        <li v-for="order in newOrders" :key="order.id">
          <span>Order from {{ order.customerName }}</span>
          <div>
            <button @click="acceptOrder(order)">Accept</button>
            <button @click="rejectOrder(order)">Reject</button>
            <button @click="viewOrder(order)">View</button>
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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
}
</style>
