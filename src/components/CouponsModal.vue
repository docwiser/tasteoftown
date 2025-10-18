<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Available Coupons</h2>
        <button @click="close" class="btn-close">×</button>
      </div>
      <div class="modal-body">
        <div v-if="loading">Loading...</div>
        <div v-else-if="availableCoupons.length === 0" class="no-coupons">
          <p>No coupons available for this order.</p>
        </div>
        <div v-else class="coupons-list">
          <div v-for="coupon in availableCoupons" :key="coupon.id" class="coupon-item">
            <div class="coupon-info">
              <div class="coupon-code">{{ coupon.code }}</div>
              <div class="coupon-description">
                <p>{{ getCouponDescription(coupon) }}</p>
                <p v-if="coupon.minOrder > 0">Minimum order: ₹{{ coupon.minOrder }}</p>
                <p v-if="coupon.maxDiscount > 0">Maximum discount: ₹{{ coupon.maxDiscount }}</p>
              </div>
            </div>
            <div class="coupon-actions">
              <div v-if="isCouponApplicable(coupon)" class="applicable">
                <p class="savings">You save ₹{{ calculateDiscount(coupon) }}</p>
                <button @click="applyCoupon(coupon)" class="btn-apply">Apply</button>
              </div>
              <div v-else class="not-applicable">
                <p>{{ getRequirementMessage(coupon) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { subscribeToCollection } from '../firebase/firestore';
import { useAuthStore } from '../stores/auth';

const props = defineProps({
  show: Boolean,
  cartTotal: Number
});

const emit = defineEmits(['close', 'apply-coupon']);

const coupons = ref([]);
const loading = ref(true);
const { user } = useAuthStore();
let unsubscribeCoupons = null;

onMounted(() => {
  unsubscribeCoupons = subscribeToCollection('coupons', [], (data) => {
    coupons.value = data;
    loading.value = false;
  });
});

onUnmounted(() => {
  if (unsubscribeCoupons) unsubscribeCoupons();
});

const availableCoupons = computed(() => {
  if (!user.value) return [];
  return coupons.value.filter(coupon => {
    return coupon.active && (!coupon.userId || coupon.userId === user.value.uid || coupon.userId === user.value.email);
  });
});

const isCouponApplicable = (coupon) => {
  return props.cartTotal >= coupon.minOrder;
};

const calculateDiscount = (coupon) => {
  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (props.cartTotal * coupon.value) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.value;
  }
  return discount.toFixed(2);
};

const getCouponDescription = (coupon) => {
  if (coupon.type === 'percentage') {
    return `${coupon.value}% off on your order.`;
  } else {
    return `Get ₹${coupon.value} off on your order.`;
  }
};

const getRequirementMessage = (coupon) => {
  if (props.cartTotal < coupon.minOrder) {
    const diff = coupon.minOrder - props.cartTotal;
    return `Add items worth ₹${diff.toFixed(2)} more to avail this coupon.`
  }
  return 'This coupon is not applicable to your cart.';
};

const applyCoupon = (coupon) => {
  emit('apply-coupon', coupon);
  emit('close');
};

const close = () => {
  emit('close');
};

</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.75rem;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
}

.no-coupons {
  text-align: center;
  padding: 2rem;
}

.coupons-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.coupon-item {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
}

.coupon-info {
  margin-bottom: 1rem;
}

.coupon-code {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.coupon-description p {
  margin: 0.25rem 0;
  color: #666;
}

.coupon-actions .applicable {
  text-align: center;
}

.savings {
  color: #10b981;
  font-weight: 600;
  margin-bottom: 1rem;
}

.btn-apply {
  width: 100%;
  padding: 0.875rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.coupon-actions .not-applicable p {
  color: #ef4444;
  font-weight: 500;
  text-align: center;
}

</style>
