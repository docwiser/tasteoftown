<template>
  <div class="admin-management-page">
    <div class="admin-management-container">
      <h1>Admin Management</h1>
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else>
        <div v-for="user in users" :key="user.id" class="user-card">
          <div class="user-info">
            <p><strong>{{ user.displayName || 'No Name' }}</strong> ({{ user.email }})</p>
            <p v-if="user.role === 'admin'" class="admin-status">Admin</p>
          </div>
          <div class="user-actions">
            <button @click="toggleAdmin(user)" :class="{ 'remove-admin-button': user.role === 'admin', 'make-admin-button': user.role !== 'admin' }">
              {{ user.role === 'admin' ? 'Remove Admin' : 'Make Admin' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getDocuments, updateDocument } from '../../firebase/firestore';

const users = ref([]);
const loading = ref(true);

onMounted(async () => {
  const { data } = await getDocuments('users');
  users.value = data;
  loading.value = false;
});

const toggleAdmin = async (user) => {
  const newRole = user.role === 'admin' ? 'customer' : 'admin';
  const updatedUser = { ...user, role: newRole };
  await updateDocument('users', user.id, updatedUser);
  const index = users.value.findIndex(u => u.id === user.id);
  if (index !== -1) {
    users.value.splice(index, 1, updatedUser);
  }
};
</script>

<style scoped>
.admin-management-page {
  padding: 2rem;
}
.admin-management-container {
  max-width: 800px;
  margin: 0 auto;
}
.user-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.user-info p {
  margin: 0;
}
.admin-status {
  color: blue;
  font-weight: bold;
}
.make-admin-button {
  background-color: blue;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
}
.remove-admin-button {
  background-color: orange;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
}
.loading {
  text-align: center;
}
</style>
