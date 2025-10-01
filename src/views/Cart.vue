<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCartStore();
const { user } = useAuthStore();

const isEmpty = computed(() => cartItems.value.length === 0);

const proceedToCheckout = () => {
  if (!user.value) {
    router.push({ name: 'Login', query: { redirect: '/checkout' } });
  } else {
    router.push('/checkout');
  }
};

const continueShopping = () => {
  router.push('/menu');
};
</script>

<template>
  <div class="cart-page">
    <div class="cart-container">
      <h1>Shopping Cart</h1>

      <div v-if="isEmpty" class="empty-cart">
        <p>Your cart is empty</p>
        <button @click="continueShopping" class="btn-primary">
          Browse Menu
        </button>
      </div>

      <div v-else class="cart-content">
        <div class="cart-items">
          <div
            v-for="item in cartItems"
            :key="item.id"
            class="cart-item"
          >
            <div class="item-image">
              <img :src="item.imageUrl" :alt="item.name" />
            </div>

            <div class="item-details">
              <h3>{{ item.name }}</h3>
              <p class="item-type">
                {{ item.type === 'veg' ? '🟢 Veg' : '🔴 Non-Veg' }}
              </p>
              <p class="item-price">₹{{ item.price }}</p>
            </div>

            <div class="item-actions">
              <div class="quantity-controls">
                <button
                  @click="updateQuantity(item.id, item.quantity - 1)"
                  class="qty-btn"
                >
                  -
                </button>
                <span class="quantity">{{ item.quantity }}</span>
                <button
                  @click="updateQuantity(item.id, item.quantity + 1)"
                  class="qty-btn"
                >
                  +
                </button>
              </div>

              <button
                @click="removeFromCart(item.id)"
                class="btn-remove"
              >
                Remove
              </button>
            </div>

            <div class="item-total">
              ₹{{ (item.price * item.quantity).toFixed(2) }}
            </div>
          </div>
        </div>

        <div class="cart-summary">
          <h2>Order Summary</h2>

          <div class="summary-row">
            <span>Subtotal</span>
            <span>₹{{ cartTotal.toFixed(2) }}</span>
          </div>

          <div class="summary-row">
            <span>Delivery Fee</span>
            <span>₹40.00</span>
          </div>

          <div class="summary-divider"></div>

          <div class="summary-row total">
            <span>Total</span>
            <span>₹{{ (cartTotal + 40).toFixed(2) }}</span>
          </div>

          <button @click="proceedToCheckout" class="btn-checkout">
            Proceed to Checkout
          </button>

          <button @click="continueShopping" class="btn-continue">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-page {
  min-height: calc(100vh - 80px);
  background: #f9f9f9;
  padding: 2rem 1.5rem;
}

.cart-container {
  max-width: 1200px;
  margin: 0 auto;
}

.cart-container h1 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #333;
}

.empty-cart {
  background: white;
  padding: 4rem 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.empty-cart p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  display: grid;
  grid-template-columns: 100px 1fr auto auto;
  gap: 1.5rem;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.item-image {
  width: 100px;
  height: 100px;
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
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.item-type {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.item-price {
  font-weight: 600;
  color: #667eea;
  font-size: 1.1rem;
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f5f5f5;
  padding: 0.5rem;
  border-radius: 8px;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #667eea;
  color: white;
  border-radius: 6px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background 0.3s;
}

.qty-btn:hover {
  background: #5568d3;
}

.quantity {
  font-weight: 600;
  min-width: 30px;
  text-align: center;
}

.btn-remove {
  padding: 0.5rem 1rem;
  background: #fee;
  color: #c33;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-remove:hover {
  background: #fdd;
}

.item-total {
  font-size: 1.25rem;
  font-weight: 700;
  color: #333;
}

.cart-summary {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  height: fit-content;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  sticky: top 100px;
}

.cart-summary h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #333;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  color: #666;
  font-size: 1rem;
}

.summary-row.total {
  font-size: 1.25rem;
  font-weight: 700;
  color: #333;
}

.summary-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 1.5rem 0;
}

.btn-checkout,
.btn-continue,
.btn-primary {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-checkout {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-bottom: 1rem;
}

.btn-checkout:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-continue,
.btn-primary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-continue:hover,
.btn-primary:hover {
  background: #f5f5ff;
}

@media (max-width: 968px) {
  .cart-content {
    grid-template-columns: 1fr;
  }

  .cart-item {
    grid-template-columns: 80px 1fr;
    gap: 1rem;
  }

  .item-actions {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: space-between;
  }

  .item-total {
    grid-column: 1 / -1;
    text-align: center;
    padding-top: 1rem;
    border-top: 1px solid #e0e0e0;
  }
}
</style>
