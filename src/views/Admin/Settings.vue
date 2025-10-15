<template>
  <div class="settings-page">
    <div class="settings-container">
      <h1>Settings</h1>
      <div class="settings-card">
        <h2>Order Timings</h2>
        <p>Set the time range during which customers can place orders.</p>
        <div class="time-inputs">
          <div class="time-input">
            <label for="open-time">Open From</label>
            <input type="time" id="open-time" v-model="openTime" />
          </div>
          <div class="time-input">
            <label for="close-time">Open To</label>
            <input type="time" id="close-time" v-model="closeTime" />
          </div>
        </div>
        <button @click="saveSettings" class="btn-primary">Save Settings</button>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getDocument, setDocument } from '../../firebase/firestore';

const openTime = ref('');
const closeTime = ref('');
const successMessage = ref('');
const errorMessage = ref('');

onMounted(async () => {
  const { data } = await getDocument('settings', 'orderTimings');
  if (data) {
    openTime.value = data.openTime;
    closeTime.value = data.closeTime;
  }
});

const saveSettings = async () => {
  if (openTime.value && closeTime.value) {
    await setDocument('settings', 'orderTimings', { openTime: openTime.value, closeTime: closeTime.value });
    successMessage.value = 'Settings saved successfully.';
    errorMessage.value = '';
    setTimeout(() => successMessage.value = '', 3000);
  } else {
    errorMessage.value = 'Please select both open and close times.';
    successMessage.value = '';
  }
};
</script>

<style scoped>
.settings-page {
  padding: 2rem;
}

.settings-container {
  max-width: 800px;
  margin: 0 auto;
}

.settings-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.time-inputs {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  margin-bottom: 2rem;
}

.time-input {
  display: flex;
  flex-direction: column;
}

.time-input label {
  margin-bottom: 0.5rem;
}

.time-input input {
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.success-message {
  color: green;
  margin-top: 1rem;
}

.error-message {
  color: red;
  margin-top: 1rem;
}
</style>
