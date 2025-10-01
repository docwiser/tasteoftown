<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import { useCartStore } from './stores/cart';
import { handleRedirectResult } from './firebase/auth';
import Navbar from './components/Navbar.vue';

const { initAuth } = useAuthStore();
const { loadCart } = useCartStore();

onMounted(async () => {
initAuth();
loadCart();

await handleRedirectResult();
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
<footer>

</footer>
</div>
</template>

<style>
* {
margin: 0;
padding: 0;
box-sizing: border-box;
}

body {
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
background: #f9f9f9;
}

#app {
min-height: 100vh;
}
</style>
