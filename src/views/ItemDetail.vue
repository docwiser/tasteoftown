<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { getDocument } from '../firebase/firestore';

const route = useRoute();
const router = useRouter();
const { addToCart } = useCartStore();

const item = ref(null);
const loading = ref(true);
const quantity = ref(1);

onMounted(async () => {
  const { data, error } = await getDocument('menuItems', route.params.id);

  if (!error && data) {
    item.value = data;
  }

  loading.value = false;
});

const handleAddToCart = () => {
  for (let i = 0; i < quantity.value; i++) {
    addToCart(item.value);
  }
  router.push('/cart');
};
</script>

<template>
  <div class="item-detail-page">
    <div v-if="loading" class="loading">Loading...</div>

    <div v-else-if="!item" class="not-found">
      <p>Item not found</p>
      <router-link to="/menu" class="btn-primary">Back to Menu</router-link>
    </div>

    <div v-else class="item-detail">
      <div class="item-image">
        <img :src="item.imageUrl" :alt="item.name" />
        <span class="item-type-badge" :class="item.type">
          {{ item.type === 'veg' ? '🟢 Vegetarian' : '🔴 Non-Vegetarian' }}
        </span>
      </div>

      <div class="item-info">
        <h1>{{ item.name }}</h1>
        <p class="item-category">{{ item.category }}</p>

        <div class="item-price">₹{{ item.price }}</div>

        <div class="item-description">
          <h3>Description</h3>
          <p>{{ item.description }}</p>
        </div>

        <div class="item-actions">
          <div class="quantity-selector">
            <label>Quantity</label>
            <div class="quantity-controls">
              <button @click="quantity = Math.max(1, quantity - 1)" class="qty-btn">-</button>
              <span class="quantity">{{ quantity }}</span>
              <button @click="quantity++" class="qty-btn">+</button>
            </div>
          </div>

          <button @click="handleAddToCart" class="btn-add-cart">
            Add {{ quantity }} to Cart - ₹{{ (item.price * quantity).toFixed(2) }}
          </button>
        </div>

        <router-link to="/menu" class="back-link">← Back to Menu</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.item-detail-page {
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

.item-detail {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
}

.item-image {
  position: relative;
  width: 100%;
  height: 500px;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-type-badge {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.item-info {
  padding: 3rem 3rem 3rem 0;
  display: flex;
  flex-direction: column;
}

.item-info h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.item-category {
  color: #667eea;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.item-price {
  font-size: 2.5rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 2rem;
}

.item-description {
  margin-bottom: 2rem;
}

.item-description h3 {
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 0.75rem;
}

.item-description p {
  color: #666;
  line-height: 1.6;
  font-size: 1.05rem;
}

.item-actions {
  margin-top: auto;
}

.quantity-selector {
  margin-bottom: 1.5rem;
}

.quantity-selector label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: #333;
}

.quantity-controls {
  display: inline-flex;
  align-items: center;
  gap: 1.5rem;
  background: #f5f5f5;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
}

.qty-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #667eea;
  color: white;
  border-radius: 8px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: background 0.3s;
}

.qty-btn:hover {
  background: #5568d3;
}

.quantity {
  font-weight: 700;
  font-size: 1.25rem;
  min-width: 40px;
  text-align: center;
}

.btn-add-cart {
  width: 100%;
  padding: 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-add-cart:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.back-link {
  display: inline-block;
  margin-top: 1.5rem;
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.back-link:hover {
  text-decoration: underline;
}

@media (max-width: 968px) {
  .item-detail {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .item-image {
    height: 300px;
  }

  .item-info {
    padding: 2rem;
  }

  .item-info h1 {
    font-size: 2rem;
  }

  .item-price {
    font-size: 2rem;
  }
}
</style>
