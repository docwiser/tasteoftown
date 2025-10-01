<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { getDocuments } from '../firebase/firestore';

const router = useRouter();
const { addToCart } = useCartStore();

const menuItems = ref([]);
const categories = ref([]);
const loading = ref(true);
const selectedCategory = ref('All');
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

const filteredItems = computed(() => {
  let items = menuItems.value;

  if (selectedCategory.value !== 'All') {
    items = items.filter(item => item.category === selectedCategory.value);
  }

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

  items = [...items].sort((a, b) => {
    if (sortBy.value === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy.value === 'price-low') {
      return a.price - b.price;
    } else if (sortBy.value === 'price-high') {
      return b.price - a.price;
    }
    return 0;
  });

  return items;
});

const handleAddToCart = (item) => {
  addToCart(item);
};

const viewItemDetail = (itemId) => {
  router.push(`/item/${itemId}`);
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
            placeholder="Search menu..."
            class="search-input"
          />
        </div>

        <div class="filter-group">
          <label>Category</label>
          <select v-model="selectedCategory" class="filter-select">
            <option value="All">All Categories</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.name">
              {{ cat.name }}
            </option>
          </select>
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

      <div v-else-if="filteredItems.length === 0" class="no-items">
        <p>No items found</p>
      </div>

      <div v-else class="menu-grid">
        <div
          v-for="item in filteredItems"
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
            <h3 @click="viewItemDetail(item.id)">{{ item.name }}</h3>
            <p class="item-description">{{ item.description }}</p>

            <div class="item-footer">
              <span class="item-price">₹{{ item.price }}</span>
              <button @click="handleAddToCart(item)" class="btn-add">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.search-box {
  grid-column: 1 / -1;
}

.search-input {
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.filter-select {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
}

.loading,
.no-items {
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.menu-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s;
}

.menu-item:hover {
  transform: translateY(-5px);
}

.item-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  cursor: pointer;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-type {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 1.5rem;
}

.item-content {
  padding: 1.25rem;
}

.item-content h3 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
  cursor: pointer;
}

.item-content h3:hover {
  color: #667eea;
}

.item-description {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 1rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
}

.btn-add {
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .menu-header h1 {
    font-size: 2rem;
  }

  .filters {
    grid-template-columns: 1fr;
  }

  .menu-grid {
    grid-template-columns: 1fr;
  }
}
</style>
