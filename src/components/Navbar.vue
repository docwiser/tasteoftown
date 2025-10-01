<script setup>
import {ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Modal from "./modal.vue";
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';
import { logout } from '../firebase/auth';
const router = useRouter();
const { user, userProfile } = useAuthStore();
const { cartCount } = useCartStore();
const signoutmodal = ref(null);
const handleLogout = async () => {
await logout();
signoutmodal.value.closeModal();
router.push('/');
};
const isAdmin = computed(() => userProfile.value?.role === 'admin');
</script>
<template>
<nav class="navbar">
<div class="nav-container">
<router-link to="/" class="brand" role="button">
Taste of Town
</router-link>
<div class="nav-links">
<router-link role="button" to="/menu" class="nav-link">Menu</router-link>
<router-link v-if="user" role="button" to="/orders" class="nav-link">Orders</router-link>
<router-link v-if="isAdmin" role="button" to="/admin" class="nav-link admin-link">Administrator dashboard</router-link>
<router-link role="button" to="/cart" class="nav-link cart-link">
<span>Cart</span>
<span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
</router-link>
<div v-if="user" class="user-menu">
<router-link role="button" to="/profile" class="nav-link">
Open my Profile ({{ userProfile?.displayName || user.email }})
</router-link>
<Modal :showButton="true" buttonLabel="Sign out" title="Sign out?" ref="signoutmodal">
<p>Are you sure you want to sign out?</p>
<button @click="() => signoutmodal.closeModal()">Cancel</button>
<button @click="handleLogout" class="btn-logout">Sign out</button>
</Modal>
</div>
<router-link v-else role="button" to="/login" class="btn-login">Sign in</router-link>
</div>
</div>
</nav>
</template>

<style scoped>
.navbar {
background: white;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
position: sticky;
top: 0;
z-index: 100;
}

.nav-container {
max-width: 1200px;
margin: 0 auto;
padding: 1rem 1.5rem;
display: flex;
justify-content: space-between;
align-items: center;
}

.brand {
text-decoration: none;
}

.brand h1 {
color: #667eea;
font-size: 1.5rem;
font-weight: 700;
margin: 0;
}

.nav-links {
display: flex;
align-items: center;
gap: 1.5rem;
}

.nav-link {
text-decoration: none;
color: #333;
font-weight: 500;
transition: color 0.3s;
position: relative;
}

.nav-link:hover {
color: #667eea;
}

.cart-link {
display: flex;
align-items: center;
gap: 0.5rem;
}

.cart-badge {
background: #667eea;
color: white;
border-radius: 50%;
width: 20px;
height: 20px;
display: flex;
align-items: center;
justify-content: center;
font-size: 0.75rem;
font-weight: 600;
}

.admin-link {
color: #667eea;
font-weight: 600;
}

.user-menu {
display: flex;
align-items: center;
gap: 1rem;
}

.btn-logout,
.btn-login {
padding: 0.5rem 1.25rem;
border-radius: 8px;
font-weight: 600;
cursor: pointer;
transition: all 0.3s;
border: none;
text-decoration: none;
}

.btn-logout {
background: #f5f5f5;
color: #333;
}

.btn-logout:hover {
background: #e0e0e0;
}

.btn-login {
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
color: white;
display: inline-block;
}

.btn-login:hover {
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
.nav-container {
flex-wrap: wrap;
padding: 1rem;
}

.nav-links {
width: 100%;
margin-top: 1rem;
justify-content: space-between;
gap: 1rem;
}

.nav-link {
font-size: 0.9rem;
}
}
</style>
