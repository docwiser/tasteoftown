<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';

const { user, userProfile, updateUserProfile } = useAuthStore();

const editing = ref(false);
const form = ref({
  displayName: userProfile.value?.displayName || '',
  phone: userProfile.value?.phone || ''
});
const loading = ref(false);
const message = ref('');

const startEdit = () => {
  form.value = {
    displayName: userProfile.value?.displayName || '',
    phone: userProfile.value?.phone || ''
  };
  editing.value = true;
};

const cancelEdit = () => {
  editing.value = false;
  message.value = '';
};

const saveProfile = async () => {
  loading.value = true;
  message.value = '';

  const { error } = await updateUserProfile(form.value);

  if (error) {
    message.value = 'Failed to update profile';
  } else {
    message.value = 'Profile updated successfully';
    editing.value = false;
  }

  loading.value = false;
};

const deleteAddress = async (index) => {
  const addresses = [...userProfile.value.addresses];
  addresses.splice(index, 1);
  await updateUserProfile({ addresses });
};
</script>

<template>
  <div class="profile-page">
    <div class="profile-container">
      <h1>My Profile</h1>

      <div class="profile-content">
        <div class="section">
          <div class="section-header">
            <h2>Personal Information</h2>
            <button v-if="!editing" @click="startEdit" class="btn-edit">
              Edit
            </button>
          </div>

          <div v-if="!editing" class="info-display">
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span>{{ userProfile?.displayName || 'Not set' }}</span>
            </div>

            <div class="info-row">
              <span class="info-label">Email:</span>
              <span>{{ user.email }}</span>
            </div>

            <div class="info-row">
              <span class="info-label">Phone:</span>
              <span>{{ userProfile?.phone || 'Not set' }}</span>
            </div>
          </div>

          <div v-else class="info-form">
            <div class="form-group">
              <label>Name</label>
              <input v-model="form.displayName" type="text" />
            </div>

            <div class="form-group">
              <label>Email</label>
              <input :value="user.email" type="email" disabled />
            </div>

            <div class="form-group">
              <label>Phone</label>
              <input v-model="form.phone" type="tel" />
            </div>

            <div v-if="message" class="message">{{ message }}</div>

            <div class="form-actions">
              <button @click="saveProfile" class="btn-save" :disabled="loading">
                {{ loading ? 'Saving...' : 'Save Changes' }}
              </button>
              <button @click="cancelEdit" class="btn-cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Saved Addresses</h2>

          <div v-if="!userProfile?.addresses || userProfile.addresses.length === 0" class="no-addresses">
            <p>No saved addresses yet</p>
            <p class="hint">Add addresses during checkout</p>
          </div>

          <div v-else class="addresses-list">
            <div
              v-for="(address, index) in userProfile.addresses"
              :key="index"
              class="address-card"
            >
              <div class="address-header">
                <strong>{{ address.label }}</strong>
                <button @click="deleteAddress(index)" class="btn-delete">
                  Delete
                </button>
              </div>
              <p>{{ address.street }}</p>
              <p>{{ address.city }}, {{ address.state }} - {{ address.pincode }}</p>
              <p>Phone: {{ address.phone }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: calc(100vh - 80px);
  background: #f9f9f9;
  padding: 2rem 1.5rem;
}

.profile-container {
  max-width: 900px;
  margin: 0 auto;
}

.profile-container h1 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #333;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
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
  margin-bottom: 1.5rem;
}

.section h2 {
  font-size: 1.5rem;
  color: #333;
}

.btn-edit {
  padding: 0.5rem 1.25rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-edit:hover {
  background: #5568d3;
}

.info-display {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.info-row {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.info-label {
  font-weight: 600;
  color: #333;
  min-width: 80px;
}

.info-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #333;
}

.form-group input {
  padding: 0.875rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.message {
  padding: 0.875rem;
  background: #d4edda;
  color: #155724;
  border-radius: 8px;
  text-align: center;
}

.form-actions {
  display: flex;
  gap: 1rem;
}

.btn-save,
.btn-cancel {
  flex: 1;
  padding: 0.875rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background: #f5f5f5;
  color: #333;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.no-addresses {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.hint {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #999;
}

.addresses-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.address-card {
  padding: 1.25rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.address-card p {
  margin: 0.25rem 0;
  color: #666;
}

.btn-delete {
  padding: 0.5rem 1rem;
  background: #fee;
  color: #c33;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-delete:hover {
  background: #fdd;
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
  }

  .info-row {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
