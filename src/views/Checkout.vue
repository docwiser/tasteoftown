<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';
import { addDocument, getDocument, getDocuments } from '../firebase/firestore';
const router = useRouter();
const { user, userProfile, updateUserProfile } = useAuthStore();
const { cartItems, cartTotal, clearCart } = useCartStore();
const selectedAddress = ref(null);
const newAddress = ref({
label: '',
street: '',
city: '',
state: 'Madhya Pradesh',
pincode: '',
phone: ''
});
const showAddressForm = ref(false);
const couponCode = ref('');
const appliedCoupon = ref(null);
const discount = ref(0);
const paymentMethod = ref('cod');
const loading = ref(false);
const error = ref('');
const orderTimings = ref(null);
const isRestaurantOpen = ref(true);
const timeUntilOpen = ref('');
const isBanned = ref(false);

onMounted(async () => {
  if (userProfile.value?.isBanned) {
    isBanned.value = true;
    return;
  }

  if (userProfile.value?.addresses?.length > 0) {
    selectedAddress.value = userProfile.value.addresses[0];
  }
  const { data } = await getDocument('settings', 'orderTimings');
  if (data) {
    orderTimings.value = data;
    checkRestaurantStatus();
    setInterval(checkRestaurantStatus, 60000); // Check every minute
  }
});

const checkRestaurantStatus = () => {
  if (!orderTimings.value) {
    isRestaurantOpen.value = true;
    return;
  }

  const now = new Date();
  const openTime = new Date();
  const closeTime = new Date();

  const [openHours, openMinutes] = orderTimings.value.openTime.split(':').map(Number);
  const [closeHours, closeMinutes] = orderTimings.value.closeTime.split(':').map(Number);

  openTime.setHours(openHours, openMinutes, 0, 0);
  closeTime.setHours(closeHours, closeMinutes, 0, 0);

  if (now >= openTime && now <= closeTime) {
    isRestaurantOpen.value = true;
  } else {
    isRestaurantOpen.value = false;
    let timeDiff;
    if (now < openTime) {
      timeDiff = openTime - now;
    } else {
      // Restaurant is closed for the day, calculate time until next day's opening
      const tomorrowOpenTime = new Date(openTime);
      tomorrowOpenTime.setDate(openTime.getDate() + 1);
      timeDiff = tomorrowOpenTime - now;
    }

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    timeUntilOpen.value = `${hours} Hours ${minutes} Minutes`;
  }
};

const deliveryFee = 40;
const finalTotal = computed(() => {
return cartTotal.value + deliveryFee - discount.value;
});
const saveNewAddress = async () => {
if (!newAddress.value.label || !newAddress.value.street || !newAddress.value.city || !newAddress.value.pincode || !newAddress.value.phone) {
error.value = 'Please fill all address fields';
return;
}
const addresses = [...(userProfile.value?.addresses || []), newAddress.value];
await updateUserProfile({ addresses });
selectedAddress.value = newAddress.value;
showAddressForm.value = false;
newAddress.value = {
label: '',
street: '',
city: '',
state: 'Madhya Pradesh',
pincode: '',
phone: ''
};
};
const applyCoupon = async () => {
if (!couponCode.value) return;
const { data: coupons, error: couponError } = await getDocuments('coupons', [
{ type: 'where', field: 'code', operator: '==', value: couponCode.value.toUpperCase() },
{ type: 'where', field: 'active', operator: '==', value: true }
]);
if (couponError || !coupons || coupons.length === 0) {
error.value = 'Invalid or expired coupon code';
return;
}
const coupon = coupons[0];
if (cartTotal.value < coupon.minOrder) {
error.value = `Minimum order of ₹${coupon.minOrder} required`;
return;
}
appliedCoupon.value = coupon;
if (coupon.type === 'percentage') {
discount.value = (cartTotal.value * coupon.value) / 100;
if (coupon.maxDiscount) {
discount.value = Math.min(discount.value, coupon.maxDiscount);
}
} else {
discount.value = coupon.value;
}
error.value = '';
};
const removeCoupon = () => {
appliedCoupon.value = null;
discount.value = 0;
couponCode.value = '';
};
const placeOrder = async () => {
if (!selectedAddress.value) {
error.value = 'Please select a delivery address';
return;
}
loading.value = true;
error.value = '';
const orderData = {
userId: user.value.uid,
userEmail: user.value.email,
userName: userProfile.value?.displayName || user.value.email,
items: cartItems.value,
address: selectedAddress.value,
subtotal: cartTotal.value,
deliveryFee: deliveryFee,
discount: discount.value,
total: finalTotal.value,
coupon: appliedCoupon.value ? appliedCoupon.value.code : null,
paymentMethod: paymentMethod.value,
status: 'placed',
statusHistory: [
{
status: 'placed',
timestamp: new Date().toISOString(),
note: 'Order placed successfully'
}
],
modifiedByAdmin: false,
pendingApproval: false
};
const { id, error: orderError } = await addDocument('orders', orderData);
if (orderError) {
error.value = 'Failed to place order. Please try again.';
loading.value = false;
return;
}
clearCart();
router.push(`/order/${id}`);
};
</script>
<template>
<div class="checkout-page">
<div class="checkout-container">
<h1>Checkout</h1>
<div v-if="isBanned" class="banned-message">
  <p>Your account has been banned from placing orders. Please contact us for more information.</p>
  <a href="https://tasteoftown.in/contact" target="_blank" class="contact-link">Contact Us</a>
</div>
<div v-else class="checkout-content">
<div class="checkout-main">
<div class="section">
<h2>Delivery Address</h2>
<div v-if="userProfile?.addresses?.length > 0" class="addresses">
<div
v-for="(address, index) in userProfile.addresses"
:key="index"
class="address-card"
:class="{ selected: selectedAddress === address }"
@click="selectedAddress = address"
role="button"
>
<div class="address-header">
<strong>{{ address.label }}</strong>
<span v-if="selectedAddress === address" class="selected-badge">Selected</span>
</div>
<p>{{ address.street }}</p>
<p>{{ address.city }}, {{ address.state }} - {{ address.pincode }}</p>
<p>Phone: {{ address.phone }}</p>
</div>
</div>
<button @click="showAddressForm = !showAddressForm" class="btn-secondary">
{{ showAddressForm ? 'Cancel' : '+ Add New Address' }}
</button>
<div v-if="showAddressForm" class="address-form">
<div class="form-group">
<label for="addressLabel">Address Label (e.g., Home, Office)</label>
<input id="addressLabel" v-model="newAddress.label" type="text" required />
</div>
<div class="form-group">
<label for="street">Street Address</label>
<input id="street" v-model="newAddress.street" type="text" required />
</div>
<div class="form-row">
<div class="form-group">
<label for="city">City</label>
<input id="city" v-model="newAddress.city" type="text" required />
</div>
<div class="form-group">
<label for="state">State</label>
<input id="state" v-model="newAddress.state" type="text" required />
</div>
<div class="form-group">
<label for="pin">Pincode</label>
<input id="pin" v-model="newAddress.pincode" type="number" required />
</div>
</div>
<div class="form-group">
<label for="phone">Phone Number</label>
<input id="phone" v-model="newAddress.phone" type="tel" required />
</div>
<button @click="saveNewAddress" class="btn-primary">
Save Address
</button>
</div>
</div>
<div class="section">
<h2>Payment Method</h2>
<div class="payment-methods">
<label class="payment-option">
<input
v-model="paymentMethod"
type="radio"
value="cod"
/>
<span>Cash on Delivery</span>
</label>
</div>
</div>
</div>
<div class="checkout-sidebar">
<div class="order-summary">
<h2>Order Summary</h2>
<div class="summary-items">
<div v-for="item in cartItems" :key="item.id" class="summary-item">
<span>{{ item.name }} × {{ item.quantity }}</span>
<span>₹{{ (item.price * item.quantity).toFixed(2) }}</span>
</div>
</div>
<div class="coupon-section">
<h3>Apply Coupon</h3>
<div class="coupon-input">
<input
v-model="couponCode"
type="text"
placeholder="Enter coupon code"
:disabled="appliedCoupon !== null"
/>
<button
v-if="!appliedCoupon"
@click="applyCoupon"
class="btn-apply"
>
Apply
</button>
<button
v-else
@click="removeCoupon"
class="btn-remove-coupon"
>
Remove
</button>
</div>
<p v-if="appliedCoupon" class="coupon-applied">
Coupon "{{ appliedCoupon.code }}" applied!
</p>
</div>
<div class="summary-totals">
<div class="summary-row">
<span>Subtotal</span>
<span>₹{{ cartTotal.toFixed(2) }}</span>
</div>
<div class="summary-row">
<span>Delivery Fee</span>
<span>₹{{ deliveryFee.toFixed(2) }}</span>
</div>
<div v-if="discount > 0" class="summary-row discount">
<span>Discount</span>
<span>-₹{{ discount.toFixed(2) }}</span>
</div>
<div class="summary-divider"></div>
<div class="summary-row total">
<span>Total</span>
<span>₹{{ finalTotal.toFixed(2) }}</span>
</div>
</div>
<div v-if="error" class="error-message" role="alert">{{ error }}</div>
            <div v-if="orderTimings && !isRestaurantOpen" class="timing-info">
              <p>You can place orders from {{ orderTimings.openTime }} to {{ orderTimings.closeTime }}.</p>
              <p>Orders will be collected after {{ timeUntilOpen }}.</p>
            </div>
<button @click="placeOrder" class="btn-place-order" :disabled="loading || !isRestaurantOpen">
{{ loading ? 'Placing Order...' : 'Place Order' }}
</button>
</div>
</div>
</div>
</div>
</div>
</template>
<style scoped>
.checkout-page {
min-height: calc(100vh - 80px);
background: #f9f9f9;
padding: 2rem 1.5rem;
}

.checkout-container {
max-width: 1200px;
margin: 0 auto;
}

.checkout-container h1 {
font-size: 2.5rem;
margin-bottom: 2rem;
color: #333;
}

.checkout-content {
display: grid;
grid-template-columns: 1fr 400px;
gap: 2rem;
}

.checkout-main {
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

.addresses {
display: flex;
flex-direction: column;
gap: 1rem;
margin-bottom: 1rem;
}

.address-card {
padding: 1.25rem;
border: 2px solid #e0e0e0;
border-radius: 8px;
cursor: pointer;
transition: all 0.3s;
}

.address-card:hover {
border-color: #667eea;
}

.address-card.selected {
border-color: #667eea;
background: #f5f5ff;
}

.address-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 0.5rem;
}

.selected-badge {
background: #667eea;
color: white;
padding: 0.25rem 0.75rem;
border-radius: 12px;
font-size: 0.85rem;
font-weight: 600;
}

.address-card p {
color: #666;
margin: 0.25rem 0;
}

.address-form {
margin-top: 1.5rem;
padding-top: 1.5rem;
border-top: 1px solid #e0e0e0;
}

.form-group {
margin-bottom: 1.25rem;
}

.form-group label {
display: block;
margin-bottom: 0.5rem;
color: #333;
font-weight: 500;
}

.form-group input {
width: 100%;
padding: 0.875rem;
border: 2px solid #e0e0e0;
border-radius: 8px;
font-size: 1rem;
}

.form-group input:focus {
outline: none;
border-color: #667eea;
}

.form-row {
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 1rem;
}

.payment-methods {
display: flex;
flex-direction: column;
gap: 1rem;
}

.payment-option {
display: flex;
align-items: center;
gap: 0.75rem;
padding: 1rem;
border: 2px solid #e0e0e0;
border-radius: 8px;
cursor: pointer;
}

.payment-option input {
cursor: pointer;
}

.checkout-sidebar {
height: fit-content;
position: sticky;
top: 100px;
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

.summary-items {
margin-bottom: 1.5rem;
}

.summary-item {
display: flex;
justify-content: space-between;
margin-bottom: 0.75rem;
color: #666;
}

.coupon-section {
margin: 1.5rem 0;
padding: 1.5rem 0;
border-top: 1px solid #e0e0e0;
border-bottom: 1px solid #e0e0e0;
}

.coupon-section h3 {
font-size: 1.1rem;
margin-bottom: 0.75rem;
color: #333;
}

.coupon-input {
display: flex;
gap: 0.5rem;
}

.coupon-input input {
flex: 1;
padding: 0.75rem;
border: 2px solid #e0e0e0;
border-radius: 8px;
}

.btn-apply,
.btn-remove-coupon {
padding: 0.75rem 1.25rem;
border: none;
border-radius: 8px;
font-weight: 600;
cursor: pointer;
}

.btn-apply {
background: #667eea;
color: white;
}

.btn-remove-coupon {
background: #fee;
color: #c33;
}

.coupon-applied {
margin-top: 0.5rem;
color: #2d7a2d;
font-size: 0.9rem;
font-weight: 500;
}

.summary-totals {
margin-top: 1.5rem;
}

.summary-row {
display: flex;
justify-content: space-between;
margin-bottom: 0.75rem;
color: #666;
}

.summary-row.discount {
color: #2d7a2d;
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

.error-message {
background: #fee;
color: #c33;
padding: 0.875rem;
border-radius: 8px;
margin-bottom: 1rem;
font-size: 0.9rem;
}

.timing-info {
  background: #fff3cd;
  color: #856404;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
}

.banned-message {
  background: #fee;
  color: #c33;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
}

.contact-link {
  color: #c33;
  text-decoration: underline;
}

.btn-primary,
.btn-secondary,
.btn-place-order {
width: 100%;
padding: 0.875rem;
border: none;
border-radius: 8px;
font-size: 1rem;
font-weight: 600;
cursor: pointer;
transition: all 0.3s;
}

.btn-primary,
.btn-place-order {
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
color: white;
}

.btn-primary:hover,
.btn-place-order:hover {
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
background: white;
color: #667eea;
border: 2px solid #667eea;
}

.btn-secondary:hover {
background: #f5f5ff;
}

.btn-place-order:disabled {
opacity: 0.6;
cursor: not-allowed;
}

@media (max-width: 968px) {
.checkout-content {
grid-template-columns: 1fr;
}

.checkout-sidebar {
position: static;
}

.form-row {
grid-template-columns: 1fr;
}
}
</style>
