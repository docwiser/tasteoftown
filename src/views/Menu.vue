<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { getDocuments } from '../firebase/firestore';

const router = useRouter();
const { 
  cartItems,
  addToCart, 
  increaseQuantity,
  decreaseQuantity
} = useCartStore();

const menuItems = ref([]);
const categories = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const filterType = ref('all');
const sortBy = ref('name');

onMounted(async () => {
  await loadMenu();
});

const loadMenu = async () => {
  loading.value = true;
  const { data: items, error: itemsError } = await getDocuments('menuItems', [
    { type: 'where', field: 'available', operator: '==', value: true }
  ]);
  if (!itemsError && items) {
    menuItems.value = items;
  }

  const { data: cats, error: catsError } = await getDocuments('categories');
  if (!catsError && cats) {
    categories.value = cats;
  }
  loading.value = false;
};

const filteredItemsByCategory = computed(() => {
  const itemsByCat = {};

  categories.value.forEach(cat => {
    itemsByCat[cat.name] = [];
  });

  let items = menuItems.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    items = items.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  }

  if (filterType.value !== 'all') {
    items = items.filter(item => item.type === filterType.value);
  }

  items.forEach(item => {
    if (itemsByCat[item.category]) {
      itemsByCat[item.category].push(item);
    }
  });

  // Sorting within categories
  for (const category in itemsByCat) {
    itemsByCat[category].sort((a, b) => {
      if (sortBy.value === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy.value === 'price-low') {
        return a.price - b.price;
      } else if (sortBy.value === 'price-high') {
        return b.price - a.price;
      }
      return 0;
    });
  }

  return itemsByCat;
});

const getItemQuantity = (itemId) => {
  const item = cartItems.value.find(i => i.id === itemId);
  return item ? item.quantity : 0;
};

const handleAddToCart = (item) => {
  addToCart(item);
};

const viewItemDetail = (itemId) => {
  router.push(`/item/${itemId}`);
};

const goToCart = () => {
  router.push('/cart');
};
</script>

<template>
  <div class="menu-page">
    <div class="menu-header">
      <h1>Our Menu</h1>
      <p>Explore our delicious offerings</p>
    </div>

    <div class="menu-container">
      <div class="filters">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by food name..."
            class="search-input"
          />
        </div>
        <div class="filter-group">
          <label>Type</label>
          <select v-model="filterType" class="filter-select">
            <option value="all">All</option>
            <option value="veg">Veg</option>
            <option value="non-veg">Non-Veg</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Sort By</label>
          <select v-model="sortBy" class="filter-select">
            <option value="name">Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="loading">Loading menu...</div>

      <div v-else class="categories-container">
        <details v-for="(items, category) in filteredItemsByCategory" :key="category" open>
          <summary>{{ category }}</summary>
          <div v-if="items.length === 0" class="no-items">
            <p>No items found in this category</p>
          </div>
          <div v-else class="menu-grid">
            <div
              v-for="item in items"
              :key="item.id"
              class="menu-item"
            >
              <div class="item-image" @click="viewItemDetail(item.id)">
                <img :src="item.imageUrl" :alt="item.name" />
                <span class="item-type" :class="item.type">
                  {{ item.type === 'veg' ? '🟢' : '🔴' }}
                </span>
              </div>
              <div class="item-content">
                <h3 @click="viewItemDetail(item.id)" role="button">{{ item.name }}</h3>
                <p class="item-description">{{ item.description }}</p>
                <div class="item-footer">
                  <span class="item-price">₹{{ item.price }}</span>
                  <div v-if="getItemQuantity(item.id) === 0">
                    <button @click="handleAddToCart(item)" class="btn-add">
                      Add to Cart
                    </button>
                  </div>
                  <div v-else class="quantity-control">
                    <button @click="decreaseQuantity(item.id)" class="btn-quantity">-</button>
                    <span>{{ getItemQuantity(item.id) }}</span>
                    <button @click="increaseQuantity(item.id)" class="btn-quantity">+</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>

    <div v-if="cartCount > 0" class="floating-cart-button" @click="goToCart">
      <span>{{ cartCount }} items in Cart</span>
      <span>Total: ₹{{ cartTotal.toFixed(2) }}</span>
      <span>View Cart</span>
    </div>
  </div>
</template>

<style scoped>
/* Basic Styles */
.menu-page {
  min-height: calc(100vh - 80px);
  background: #f9f9f9;
}

.menu-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 1.5rem;
  text-align: center;
}

.menu-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.menu-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

/* Filters */
.filters {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.search-input, .filter-select {
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
}

/* Categories */
details {
  margin-bottom: 1.5rem;
}

summary {
  font-size: 1.5rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem;
}

/* Menu Grid */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding-top: 1rem;
}

/* Menu Item */
.menu-item {
  /* styles remain the same */
}

/* Quantity Control */
.quantity-control {
  display: flex;
  align-items: center;
}

.btn-quantity {
  /* styles for quantity buttons */
}

/* Floating Cart Button */
.floating-cart-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}
</style>