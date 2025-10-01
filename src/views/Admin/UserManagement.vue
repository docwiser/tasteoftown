<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { subscribeToCollection } from '../../firebase/firestore';

const users = ref([]);
const loading = ref(true);
const searchQuery = ref('');

let unsubscribeUsers = null;

onMounted(() => {
unsubscribeUsers = subscribeToCollection('users', [], (data) => {
users.value = data;
loading.value = false;
});
});

onUnmounted(() => {
if (unsubscribeUsers) unsubscribeUsers();
});

const filteredUsers = () => {
if (!searchQuery.value) return users.value;

const query = searchQuery.value.toLowerCase();
return users.value.filter(
user =>
user.email?.toLowerCase().includes(query) ||
user.displayName?.toLowerCase().includes(query)
);
};

const formatDate = (timestamp) => {
if (!timestamp) return 'N/A';
const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
return date.toLocaleDateString('en-IN', {
day: 'numeric',
month: 'short',
year: 'numeric'
});
};
</script>

<template>
<div class="admin-users">
<div class="admin-container">
<h1>User Management</h1>

<div class="admin-nav">
<router-link role="button" to="/admin" class="admin-nav-link">Dashboard</router-link>
<router-link role="button" to="/admin/menu" class="admin-nav-link">Customize Menu</router-link>
<router-link role="button" to="/admin/orders" class="admin-nav-link">View and manage Orders</router-link>
<router-link role="button" to="/admin/coupons" class="admin-nav-link active">Coupons Manager</router-link>
<router-link role="button" to="/admin/users" class="admin-nav-link">Users</router-link>
</div>

<div class="section">
<div class="section-header">
<h2>All Users</h2>
<input
v-model="searchQuery"
type="text"
placeholder="Search users..."
class="search-input"
/>
</div>

<div v-if="loading" class="loading">Loading...</div>

<div v-else-if="filteredUsers().length === 0" class="no-users">
<p>No users found</p>
</div>

<div v-else class="users-table">
<table>
<thead>
<tr>
<th>Name</th>
<th>Email</th>
<th>Phone</th>
<th>Role</th>
<th>Joined</th>
<th>Addresses</th>
</tr>
</thead>
<tbody>
<tr v-for="user in filteredUsers()" :key="user.id">
<td>{{ user.displayName || 'N/A' }}</td>
<td>{{ user.email }}</td>
<td>{{ user.phone || 'N/A' }}</td>
<td>
<span class="role-badge" :class="user.role">
{{ user.role || 'customer' }}
</span>
</td>
<td>{{ formatDate(user.createdAt) }}</td>
<td>{{ user.addresses?.length || 0 }}</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</div>
</template>

<style scoped>
.admin-users {
min-height: calc(100vh - 80px);
background: #f9f9f9;
padding: 2rem 1.5rem;
}

.admin-container {
max-width: 1400px;
margin: 0 auto;
}

.admin-container h1 {
font-size: 2.5rem;
margin-bottom: 2rem;
color: #333;
}

.admin-nav {
display: flex;
gap: 1rem;
margin-bottom: 2rem;
flex-wrap: wrap;
}

.admin-nav-link {
padding: 0.75rem 1.5rem;
background: white;
color: #667eea;
text-decoration: none;
border-radius: 8px;
font-weight: 600;
transition: all 0.3s;
box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.admin-nav-link:hover {
background: #f5f5ff;
}

.admin-nav-link.active {
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
color: white;
}

.section {
background: white;
padding: 2rem;
border-radius: 12px;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.section-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 2rem;
gap: 2rem;
}

.section h2 {
font-size: 1.5rem;
color: #333;
}

.search-input {
padding: 0.75rem 1rem;
border: 2px solid #e0e0e0;
border-radius: 8px;
font-size: 1rem;
min-width: 300px;
}

.search-input:focus {
outline: none;
border-color: #667eea;
}

.loading,
.no-users {
text-align: center;
padding: 3rem;
color: #666;
}

.users-table {
overflow-x: auto;
}

table {
width: 100%;
border-collapse: collapse;
}

th {
text-align: left;
padding: 1rem;
background: #f9f9f9;
color: #333;
font-weight: 600;
border-bottom: 2px solid #e0e0e0;
}

td {
padding: 1rem;
border-bottom: 1px solid #e0e0e0;
color: #666;
}

.role-badge {
padding: 0.375rem 0.875rem;
border-radius: 12px;
font-size: 0.85rem;
font-weight: 600;
display: inline-block;
}

.role-badge.admin {
background: #e0e7ff;
color: #667eea;
}

.role-badge.customer {
background: #f0fdf4;
color: #10b981;
}

@media (max-width: 968px) {
.section-header {
flex-direction: column;
align-items: stretch;
}

.search-input {
min-width: auto;
}

.users-table {
font-size: 0.9rem;
}

th,
td {
padding: 0.75rem;
}
}
</style>
