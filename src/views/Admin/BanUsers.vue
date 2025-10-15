<template>
  <div class="ban-users-page">
    <div class="ban-users-container">
      <h1>Ban Users</h1>
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else>
        <div v-for="user in users" :key="user.id" class="user-card">
          <div class="user-info">
            <p><strong>{{ user.displayName || 'No Name' }}</strong> ({{ user.email }})</p>
            <p v-if="user.isBanned" class="banned-status">Banned</p>
          </div>
          <div class="user-actions">
            <button @click="toggleBan(user)" :class="{ 'unban-button': user.isBanned, 'ban-button': !user.isBanned }">
              {{ user.isBanned ? 'Unban' : 'Ban' }}
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

const toggleBan = async (user) => {
  const updatedUser = { ...user, isBanned: !user.isBanned };
  await updateDocument('users', user.id, updatedUser);
  const index = users.value.findIndex(u => u.id === user.id);
  if (index !== -1) {
    users.value.splice(index, 1, updatedUser);
  }
};
</script>

<style scoped>
.ban-users-page {
  padding: 2rem;
}
.ban-users-container {
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
.banned-status {
  color: red;
  font-weight: bold;
}
.ban-button {
  background-color: red;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
}
.unban-button {
  background-color: green;
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
