<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { subscribeToCollection, addDocument, updateDocument, deleteDocument } from '../../firebase/firestore';

const coupons = ref([]);
const loading = ref(true);
const showCouponForm = ref(false);
const editingCoupon = ref(null);

const couponForm = ref({
  code: '',
  type: 'percentage',
  value: '',
  minOrder: '',
  maxDiscount: '',
  active: true,
  userId: '',
  oneTimeUse: false
});

let unsubscribeCoupons = null;

onMounted(() => {
  unsubscribeCoupons = subscribeToCollection('coupons', [], (data) => {
    coupons.value = data;
    loading.value = false;
  });
});

onUnmounted(() => {
  if (unsubscribeCoupons) unsubscribeCoupons();
});

const openCouponForm = (coupon = null) => {
  if (coupon) {
    editingCoupon.value = coupon;
    couponForm.value = { ...coupon, oneTimeUse: coupon.oneTimeUse || false };
  } else {
    editingCoupon.value = null;
    couponForm.value = {
      code: '',
      type: 'percentage',
      value: '',
      minOrder: '',
      maxDiscount: '',
      active: true,
      userId: '',
      oneTimeUse: false
    };
  }
  showCouponForm.value = true;
};

const closeCouponForm = () => {
  showCouponForm.value = false;
  editingCoupon.value = null;
};

const saveCoupon = async () => {
  const data = {
    ...couponForm.value,
    code: couponForm.value.code.toUpperCase(),
    value: parseFloat(couponForm.value.value),
    minOrder: parseFloat(couponForm.value.minOrder) || 0,
    maxDiscount: couponForm.value.maxDiscount ? parseFloat(couponForm.value.maxDiscount) : null,
    userId: couponForm.value.userId || null,
    oneTimeUse: couponForm.value.oneTimeUse
  };

  if (editingCoupon.value) {
    await updateDocument('coupons', editingCoupon.value.id, data);
  } else {
    await addDocument('coupons', data);
  }

  closeCouponForm();
};

const toggleCouponStatus = async (coupon) => {
  await updateDocument('coupons', coupon.id, {
    active: !coupon.active
  });
};

const deleteCoupon = async (couponId) => {
  if (confirm('Are you sure you want to delete this coupon?')) {
    await deleteDocument('coupons', couponId);
  }
};
</script>

<template>
  <div class="admin-coupons">
    <div class="admin-container">
      <h1>Coupon Management</h1>

      <div class="admin-nav">
        <router-link role="button" to="/admin" class="admin-nav-link">Dashboard</router-link>
        <router-link role="button" to="/admin/menu" class="admin-nav-link">Customize Menu</router-link>
        <router-link role="button" to="/admin/orders" class="admin-nav-link">View and manage Orders</router-link>
        <router-link role="button" to="/admin/coupons" class="admin-nav-link active">Coupons Manager</router-link>
        <router-link role="button" to="/admin/users" class="admin-nav-link">Users</router-link>
      </div>
      <div class="section">
        <div class="section-header">
          <h2>Discount Coupons</h2>
          <button @click="openCouponForm()" class="btn-add">+ Add Coupon</button>
        </div>

        <div v-if="loading" class="loading">Loading...</div>

        <div v-else-if="coupons.length === 0" class="no-coupons">
          <p>No coupons created yet</p>
        </div>

        <div v-else class="coupons-grid">
          <div v-for="coupon in coupons" :key="coupon.id" class="coupon-card">
            <div class="coupon-header">
              <div class="coupon-code">{{ coupon.code }}</div>
              <span class="coupon-status" :class="{ active: coupon.active, inactive: !coupon.active }">
                {{ coupon.active ? 'Active' : 'Inactive' }}
              </span>
            </div>

            <div class="coupon-details">
              <p>
                <strong>Discount:</strong>
                {{ coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}` }}
              </p>
              <p><strong>Min Order:</strong> ₹{{ coupon.minOrder }}</p>
              <p v-if="coupon.maxDiscount">
                <strong>Max Discount:</strong> ₹{{ coupon.maxDiscount }}
              </p>
              <p v-if="coupon.userId">
                <strong>User specific:</strong> {{ coupon.userId }}
              </p>
              <p v-if="coupon.oneTimeUse">
                <strong>Usage:</strong> One-time use
              </p>
            </div>

            <div class="coupon-actions">
              <button @click="openCouponForm(coupon)" class="btn-edit">Edit</button>
              <button @click="toggleCouponStatus(coupon)" class="btn-toggle">
                {{ coupon.active ? 'Deactivate' : 'Activate' }}
              </button>
              <button @click="deleteCoupon(coupon.id)" class="btn-delete">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showCouponForm" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ editingCoupon ? 'Edit Coupon' : 'Add New Coupon' }}</h2>
          <button @click="closeCouponForm" class="btn-close">×</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>Coupon Code</label>
            <input v-model="couponForm.code" type="text" placeholder="e.g., SAVE20" style="text-transform: uppercase" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Discount Type</label>
              <select v-model="couponForm.type">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            <div class="form-group">
              <label>
                {{ couponForm.type === 'percentage' ? 'Percentage (%)' : 'Amount (₹)' }}
              </label>
              <input v-model="couponForm.value" type="number" step="0.01" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Minimum Order (₹)</label>
              <input v-model="couponForm.minOrder" type="number" step="0.01" />
            </div>

            <div class="form-group">
              <label>Max Discount (₹) - Optional</label>
              <input v-model="couponForm.maxDiscount" type="number" step="0.01" />
            </div>
          </div>

          <div class="form-group">
            <label>User ID (optional, for user-specific coupons)</label>
            <input v-model="couponForm.userId" type="text" placeholder="Enter user ID or email" />
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="couponForm.active" type="checkbox" />
              <span>Active</span>
            </label>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="couponForm.oneTimeUse" type="checkbox" />
              <span>One-time use</span>
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="saveCoupon" class="btn-save">Save Coupon</button>
          <button @click="closeCouponForm" class="btn-cancel">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-coupons {
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
}

.section h2 {
  font-size: 1.5rem;
  color: #333;
}

.btn-add {
  padding: 0.75rem 1.5rem;
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

.loading,
.no-coupons {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.coupons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.coupon-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  border-radius: 12px;
  color: white;
}

.coupon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.coupon-code {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 1px;
}

.coupon-status {
  padding: 0.375rem 0.875rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.coupon-status.active {
  background: rgba(16, 185, 129, 0.3);
  color: #d1fae5;
}

.coupon-status.inactive {
  background: rgba(239, 68, 68, 0.3);
  color: #fee2e2;
}

.coupon-details {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.coupon-details p {
  margin: 0.5rem 0;
  opacity: 0.95;
}

.coupon-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-edit,
.btn-toggle,
.btn-delete {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-edit {
  background: white;
  color: #667eea;
}

.btn-toggle {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.btn-delete {
  background: #ef4444;
  color: white;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  font-size: 1.5rem;
  color: #333;
}

.btn-close {
  width: 36px;
  height: 36px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-close:hover {
  background: #e0e0e0;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input {
  width: auto;
  cursor: pointer;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
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

.btn-cancel {
  background: #f5f5f5;
  color: #333;
}

@media (max-width: 768px) {
  .coupons-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
