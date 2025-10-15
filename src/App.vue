<script setup>
import { onMounted, ref, watch } from 'vue';
import { useAuthStore } from './stores/auth';
import { useCartStore } from './stores/cart';
import { handleRedirectResult } from './firebase/auth';
import Navbar from './components/Navbar.vue';
import NewOrdersModal from './components/NewOrdersModal.vue';
import { subscribeToCollection } from './firebase/firestore';

const { initAuth, userProfile } = useAuthStore();
const { loadCart } = useCartStore();

const showNewOrdersModal = ref(false);
const newOrders = ref([]);

let unsubscribeFromOrders = null;

onMounted(async () => {
  initAuth();
  loadCart();
  await handleRedirectResult();
});

watch(userProfile, (newProfile) => {
  if (newProfile && newProfile.role === 'admin') {
    if (unsubscribeFromOrders) {
      unsubscribeFromOrders();
    }
    unsubscribeFromOrders = subscribeToCollection(
      'orders',
      [{ type: 'where', field: 'status', operator: '==', value: 'placed' }],
      (orders) => {
        if (orders.length > 0) {
          newOrders.value = orders;
          showNewOrdersModal.value = true;
        } else {
          showNewOrdersModal.value = false;
        }
      }
    );
  } else {
    if (unsubscribeFromOrders) {
      unsubscribeFromOrders();
      unsubscribeFromOrders = null;
    }
    showNewOrdersModal.value = false;
  }
});
</script>

<template>
  <div id="app">
    <header>
      <Navbar />
    </header>
    <main>
      <router-view />
    </main>
    <footer></footer>
    <NewOrdersModal
      :show="showNewOrdersModal"
      :orders="newOrders"
      @close="showNewOrdersModal = false"
      v-model:orders="newOrders"
    />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #f9f9f9;
}

#app {
  min-height: 100vh;
}
</style>
