<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
const goToMenu = () => {
router.push('/menu');
};
</script>
<template>
<div class="home">
<section class="hero">
<div class="hero-content">
<h1>Welcome to Taste of Town</h1>
<p class="hero-subtitle">Delicious Food Delivered to Your Doorstep</p>
<p class="hero-description">
Experience authentic flavors from Damo, Madhya Pradesh. Fresh ingredients, traditional recipes, and fast delivery.
</p>
<button @click="goToMenu" class="btn-hero">
Browse Menu
</button>
</div>
</section>
<section class="features">
<div class="features-container">
<div class="feature">
<div class="feature-icon">🍽️</div>
<h3>Quality Food</h3>
<p>Fresh ingredients and authentic recipes for the best taste</p>
</div>
<div class="feature">
<div class="feature-icon">🚀</div>
<h3>Fast Delivery</h3>
<p>Quick delivery to your location in Damo and surrounding areas</p>
</div>
<div class="feature">
<div class="feature-icon">💰</div>
<h3>Great Prices</h3>
<p>Affordable prices with special offers and discounts</p>
</div>
<div class="feature">
<div class="feature-icon">📱</div>
<h3>Easy Ordering</h3>
<p>Simple and intuitive ordering process with real-time tracking</p>
</div>
</div>
</section>
<section class="categories-preview">
<h2>Popular Categories</h2>
<div class="categories-grid">
<div class="category-card" @click="goToMenu">
<div class="category-icon">🥗</div>
<h3>Starters</h3>
</div>
<div class="category-card" @click="goToMenu">
<div class="category-icon">🍛</div>
<h3>Main Course</h3>
</div>
<div class="category-card" @click="goToMenu">
<div class="category-icon">🍰</div>
<h3>Desserts</h3>
</div>
<div class="category-card" @click="goToMenu">
<div class="category-icon">🥤</div>
<h3>Beverages</h3>
</div>
</div>
</section>
<section class="cta">
<div class="cta-content">
<h2>Ready to Order?</h2>
<p>Browse our menu and place your order now!</p>
<button @click="goToMenu" class="btn-cta">
Order Now
</button>
</div>
</section>
</div>
</template>

<style scoped>
.home {
min-height: calc(100vh - 80px);
}

.hero {
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
color: white;
padding: 5rem 1.5rem;
text-align: center;
}

.hero-content {
max-width: 800px;
margin: 0 auto;
}

.hero h1 {
font-size: 3rem;
margin-bottom: 1rem;
font-weight: 700;
}

.hero-subtitle {
font-size: 1.5rem;
margin-bottom: 1rem;
font-weight: 500;
}

.hero-description {
font-size: 1.1rem;
margin-bottom: 2rem;
opacity: 0.95;
line-height: 1.6;
}

.btn-hero {
background: white;
color: #667eea;
padding: 1rem 2.5rem;
border: none;
border-radius: 8px;
font-size: 1.1rem;
font-weight: 600;
cursor: pointer;
transition: all 0.3s;
}

.btn-hero:hover {
transform: translateY(-3px);
box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.features {
padding: 4rem 1.5rem;
background: #f9f9f9;
}

.features-container {
max-width: 1200px;
margin: 0 auto;
display: grid;
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
gap: 2rem;
}

.feature {
text-align: center;
padding: 2rem;
background: white;
border-radius: 12px;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
transition: transform 0.3s;
}

.feature:hover {
transform: translateY(-5px);
}

.feature-icon {
font-size: 3rem;
margin-bottom: 1rem;
}

.feature h3 {
color: #333;
margin-bottom: 0.75rem;
font-size: 1.25rem;
}

.feature p {
color: #666;
line-height: 1.6;
}

.categories-preview {
padding: 4rem 1.5rem;
max-width: 1200px;
margin: 0 auto;
}

.categories-preview h2 {
text-align: center;
font-size: 2rem;
margin-bottom: 2.5rem;
color: #333;
}

.categories-grid {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
gap: 1.5rem;
}

.category-card {
background: white;
border-radius: 12px;
padding: 2rem;
text-align: center;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
cursor: pointer;
transition: all 0.3s;
}

.category-card:hover {
transform: translateY(-5px);
box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.category-icon {
font-size: 3rem;
margin-bottom: 1rem;
}

.category-card h3 {
color: #333;
font-size: 1.25rem;
}

.cta {
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
color: white;
padding: 4rem 1.5rem;
text-align: center;
}

.cta-content {
max-width: 600px;
margin: 0 auto;
}

.cta h2 {
font-size: 2.5rem;
margin-bottom: 1rem;
}

.cta p {
font-size: 1.2rem;
margin-bottom: 2rem;
}

.btn-cta {
background: white;
color: #667eea;
padding: 1rem 2.5rem;
border: none;
border-radius: 8px;
font-size: 1.1rem;
font-weight: 600;
cursor: pointer;
transition: all 0.3s;
}

.btn-cta:hover {
transform: translateY(-3px);
box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
.hero h1 {
font-size: 2rem;
}

.hero-subtitle {
font-size: 1.2rem;
}

.hero-description {
font-size: 1rem;
}

.features-container {
grid-template-columns: 1fr;
}

.categories-grid {
grid-template-columns: repeat(2, 1fr);
}

.cta h2 {
font-size: 1.75rem;
}
}
</style>
