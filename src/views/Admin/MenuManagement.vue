<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { subscribeToCollection, addDocument, updateDocument, deleteDocument } from '../../firebase/firestore';

const menuItems = ref([]);
const categories = ref([]);
const loading = ref(true);
const showItemForm = ref(false);
const showCategoryForm = ref(false);
const editingItem = ref(null);

const itemForm = ref({
name: '',
description: '',
price: '',
category: '',
type: 'veg',
imageUrl: '',
available: true
});

const categoryForm = ref({
name: '',
description: ''
});

let unsubscribeItems = null;
let unsubscribeCategories = null;

onMounted(() => {
unsubscribeItems = subscribeToCollection('menuItems', [], (data) => {
menuItems.value = data;
loading.value = false;
});

unsubscribeCategories = subscribeToCollection('categories', [], (data) => {
categories.value = data;
});
});

onUnmounted(() => {
if (unsubscribeItems) unsubscribeItems();
if (unsubscribeCategories) unsubscribeCategories();
});

const openItemForm = (item = null) => {
if (item) {
editingItem.value = item;
itemForm.value = { ...item };
} else {
editingItem.value = null;
itemForm.value = {
name: '',
description: '',
price: '',
category: categories.value[0]?.name || '',
type: 'veg',
imageUrl: '',
available: true
};
}
showItemForm.value = true;
};

const closeItemForm = () => {
showItemForm.value = false;
editingItem.value = null;
};

const saveItem = async () => {
const data = {
...itemForm.value,
price: parseFloat(itemForm.value.price)
};

if (editingItem.value) {
await updateDocument('menuItems', editingItem.value.id, data);
} else {
await addDocument('menuItems', data);
}

closeItemForm();
};

const toggleAvailability = async (item) => {
await updateDocument('menuItems', item.id, {
available: !item.available
});
};

const deleteItem = async (itemId) => {
if (confirm('Are you sure you want to delete this item?')) {
await deleteDocument('menuItems', itemId);
}
};

const saveCategory = async () => {
await addDocument('categories', categoryForm.value);
categoryForm.value = { name: '', description: '' };
showCategoryForm.value = false;
};

const deleteCategory = async (categoryId) => {
if (confirm('Are you sure you want to delete this category?')) {
await deleteDocument('categories', categoryId);
}
};
</script>

<template>
<div class="admin-menu">
<div class="admin-container">
<h1>Menu Management</h1>

<div class="admin-nav">
<router-link role="button" to="/admin" class="admin-nav-link">Dashboard</router-link>
<router-link role="button" to="/admin/menu" class="admin-nav-link">Customize Menu</router-link>
<router-link role="button" to="/admin/orders" class="admin-nav-link">View and manage Orders</router-link>
<router-link role="button" to="/admin/coupons" class="admin-nav-link active">Coupons Manager</router-link>
<router-link role="button" to="/admin/users" class="admin-nav-link">Users</router-link>
</div>

<div class="section">
<div class="section-header">
<h2>Categories</h2>
<button @click="showCategoryForm = !showCategoryForm" class="btn-add">
{{ showCategoryForm ? 'Cancel' : '+ Add Category' }}
</button>
</div>

<div v-if="showCategoryForm" class="form-card">
<div class="form-group">
<label>Category Name</label>
<input v-model="categoryForm.name" type="text" />
</div>

<div class="form-group">
<label>Description</label>
<input v-model="categoryForm.description" type="text" />
</div>

<button @click="saveCategory" class="btn-save">Save Category</button>
</div>

<div class="categories-grid">
<div v-for="cat in categories" :key="cat.id" class="category-card">
<h3>{{ cat.name }}</h3>
<p>{{ cat.description }}</p>
<button @click="deleteCategory(cat.id)" class="btn-delete-small">Delete</button>
</div>
</div>
</div>

<div class="section">
<div class="section-header">
<h2>Menu Items</h2>
<button @click="openItemForm()" class="btn-add">+ Add Item</button>
</div>

<div v-if="loading" class="loading">Loading...</div>

<div v-else class="items-grid">
<div v-for="item in menuItems" :key="item.id" class="item-card">
<div class="item-image">
<img :src="item.imageUrl" :alt="item.name" />
<span class="item-type-badge" :class="item.type">
{{ item.type === 'veg' ? '🟢' : '🔴' }}
</span>
<span v-if="!item.available" class="unavailable-badge">Unavailable</span>
</div>

<div class="item-details">
<h3>{{ item.name }}</h3>
<p class="item-category">{{ item.category }}</p>
<p class="item-description">{{ item.description }}</p>
<p class="item-price">₹{{ item.price }}</p>

<div class="item-actions">
<button @click="openItemForm(item)" class="btn-edit-small">Edit</button>
<button @click="toggleAvailability(item)" class="btn-toggle">
{{ item.available ? 'Mark Unavailable' : 'Mark Available' }}
</button>
<button @click="deleteItem(item.id)" class="btn-delete-small">Delete</button>
</div>
</div>
</div>
</div>
</div>
</div>

<div v-if="showItemForm" class="modal">
<div class="modal-content">
<div class="modal-header">
<h2>{{ editingItem ? 'Edit Item' : 'Add New Item' }}</h2>
<button @click="closeItemForm" class="btn-close">×</button>
</div>

<div class="modal-body">
<div class="form-group">
<label>Name</label>
<input v-model="itemForm.name" type="text" />
</div>

<div class="form-group">
<label>Description</label>
<textarea v-model="itemForm.description" rows="3"></textarea>
</div>

<div class="form-row">
<div class="form-group">
<label>Price (₹)</label>
<input v-model="itemForm.price" type="number" step="0.01" />
</div>

<div class="form-group">
<label>Category</label>
<select v-model="itemForm.category">
<option v-for="cat in categories" :key="cat.id" :value="cat.name">
{{ cat.name }}
</option>
</select>
</div>

<div class="form-group">
<label>Type</label>
<select v-model="itemForm.type">
<option value="veg">Veg</option>
<option value="non-veg">Non-Veg</option>
</select>
</div>
</div>

<div class="form-group">
<label>Image URL</label>
<input v-model="itemForm.imageUrl" type="text" />
</div>

<div class="form-group">
<label class="checkbox-label">
<input v-model="itemForm.available" type="checkbox" />
<span>Available</span>
</label>
</div>
</div>

<div class="modal-footer">
<button @click="saveItem" class="btn-save">Save Item</button>
<button @click="closeItemForm" class="btn-cancel">Cancel</button>
</div>
</div>
</div>
</div>
</template>

<style scoped>
.admin-menu {
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
margin-bottom: 2rem;
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

.form-card {
background: #f9f9f9;
padding: 1.5rem;
border-radius: 8px;
margin-bottom: 1.5rem;
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
.form-group select,
.form-group textarea {
width: 100%;
padding: 0.875rem;
border: 2px solid #e0e0e0;
border-radius: 8px;
font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
outline: none;
border-color: #667eea;
}

.form-row {
display: grid;
grid-template-columns: repeat(3, 1fr);
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

.categories-grid {
display: grid;
grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
gap: 1rem;
}

.category-card {
padding: 1.5rem;
background: #f9f9f9;
border-radius: 8px;
}

.category-card h3 {
color: #333;
margin-bottom: 0.5rem;
}

.category-card p {
color: #666;
margin-bottom: 1rem;
font-size: 0.9rem;
}

.items-grid {
display: grid;
grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
gap: 1.5rem;
}

.item-card {
background: #f9f9f9;
border-radius: 12px;
overflow: hidden;
}

.item-image {
position: relative;
width: 100%;
height: 200px;
}

.item-image img {
width: 100%;
height: 100%;
object-fit: cover;
}

.item-type-badge {
position: absolute;
top: 10px;
left: 10px;
font-size: 1.5rem;
}

.unavailable-badge {
position: absolute;
top: 10px;
right: 10px;
background: #ef4444;
color: white;
padding: 0.375rem 0.875rem;
border-radius: 12px;
font-size: 0.85rem;
font-weight: 600;
}

.item-details {
padding: 1.25rem;
}

.item-details h3 {
color: #333;
margin-bottom: 0.25rem;
}

.item-category {
color: #667eea;
font-weight: 600;
font-size: 0.9rem;
margin-bottom: 0.5rem;
}

.item-description {
color: #666;
font-size: 0.9rem;
margin-bottom: 0.75rem;
line-height: 1.4;
}

.item-price {
font-size: 1.25rem;
font-weight: 700;
color: #333;
margin-bottom: 1rem;
}

.item-actions {
display: flex;
gap: 0.5rem;
flex-wrap: wrap;
}

.btn-edit-small,
.btn-toggle,
.btn-delete-small {
padding: 0.5rem 0.875rem;
border: none;
border-radius: 6px;
font-size: 0.85rem;
font-weight: 600;
cursor: pointer;
transition: all 0.3s;
}

.btn-edit-small {
background: #667eea;
color: white;
}

.btn-toggle {
background: #f59e0b;
color: white;
}

.btn-delete-small {
background: #ef4444;
color: white;
}

.loading {
text-align: center;
padding: 3rem;
color: #666;
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
.form-row {
grid-template-columns: 1fr;
}

.items-grid {
grid-template-columns: 1fr;
}

.categories-grid {
grid-template-columns: 1fr;
}
}
</style>
