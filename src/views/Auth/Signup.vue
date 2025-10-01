<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { signUpWithEmail, signInWithGoogle } from '../../firebase/auth';
const router = useRouter();
const displayName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const loading = ref(false);
const handleEmailSignup = async () => {
if (!displayName.value || !email.value || !password.value || !confirmPassword.value) {
error.value = 'Please fill in all fields';
return;
}
if (password.value !== confirmPassword.value) {
error.value = 'Passwords do not match';
return;
}
if (password.value.length < 6) {
error.value = 'Password must be at least 6 characters';
return;
}
loading.value = true;
error.value = '';
const { user, error: authError } = await signUpWithEmail(email.value, password.value, displayName.value);
if (authError) {
error.value = authError;
loading.value = false;
} else {
router.push('/');
}
};
const handleGoogleSignup = async () => {
loading.value = true;
error.value = '';
const { error: authError } = await signInWithGoogle();
if (authError) {
error.value = authError;
loading.value = false;
}
};
</script>
<template>
<div class="auth-page">
<div class="auth-container">
<div class="auth-card">
<div class="brand">
<h1>Taste of Town</h1>
<p>Create your account</p>
</div>
<form @submit.prevent="handleEmailSignup" class="auth-form">
<div class="form-group">
<label for="displayName">Full Name</label>
<input
id="displayName"
v-model="displayName"
type="text"
placeholder="Enter your full name"
required
:disabled="loading"
/>
</div>
<div class="form-group">
<label for="email">Email</label>
<input
id="email"
v-model="email"
type="email"
placeholder="Enter your email"
required
:disabled="loading"
/>
</div>
<div class="form-group">
<label for="password">Password</label>
<input
id="password"
v-model="password"
type="password"
placeholder="Create a password"
required
:disabled="loading"
/>
</div>
<div class="form-group">
<label for="confirmPassword">Confirm Password</label>
<input
id="confirmPassword"
v-model="confirmPassword"
type="password"
placeholder="Confirm your password"
required
:disabled="loading"
/>
</div>
<div v-if="error" class="error-message" role="alert">
{{ error }}
</div>
<button type="submit" class="btn btn-primary" :disabled="loading">
{{ loading ? 'Creating account...' : 'Sign Up' }}
</button>
</form>
<div class="divider">
<span>OR</span>
</div>
<button @click="handleGoogleSignup" class="btn btn-google" :disabled="loading">
<span>Continue with Google</span>
</button>
<p class="auth-link">
Already have an account?
<router-link role="button" to="/login">Login</router-link>
</p>
</div>
</div>
</div>
</template>

<style scoped>
.auth-page {
min-height: 100vh;
display: flex;
align-items: center;
justify-content: center;
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
padding: 1rem;
}

.auth-container {
width: 100%;
max-width: 420px;
}

.auth-card {
background: white;
border-radius: 12px;
padding: 2.5rem;
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.brand {
text-align: center;
margin-bottom: 2rem;
}

.brand h1 {
color: #333;
font-size: 2rem;
margin-bottom: 0.5rem;
font-weight: 700;
}

.brand p {
color: #666;
font-size: 1rem;
}

.auth-form {
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
font-size: 0.95rem;
}

.form-group input {
width: 100%;
padding: 0.875rem;
border: 2px solid #e0e0e0;
border-radius: 8px;
font-size: 1rem;
transition: border-color 0.3s;
}

.form-group input:focus {
outline: none;
border-color: #667eea;
}

.form-group input:disabled {
background-color: #f5f5f5;
cursor: not-allowed;
}

.error-message {
background-color: #fee;
color: #c33;
padding: 0.875rem;
border-radius: 8px;
margin-bottom: 1rem;
font-size: 0.9rem;
}

.btn {
width: 100%;
padding: 0.875rem;
border: none;
border-radius: 8px;
font-size: 1rem;
font-weight: 600;
cursor: pointer;
transition: all 0.3s;
}

.btn:disabled {
opacity: 0.6;
cursor: not-allowed;
}

.btn-primary {
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
color: white;
}

.btn-primary:hover:not(:disabled) {
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.divider {
display: flex;
align-items: center;
margin: 1.5rem 0;
color: #999;
font-size: 0.9rem;
}

.divider::before,
.divider::after {
content: '';
flex: 1;
height: 1px;
background: #e0e0e0;
}

.divider span {
padding: 0 1rem;
}

.btn-google {
background: white;
color: #333;
border: 2px solid #e0e0e0;
}

.btn-google:hover:not(:disabled) {
background: #f5f5f5;
border-color: #ccc;
}

.auth-link {
text-align: center;
margin-top: 1.5rem;
color: #666;
font-size: 0.95rem;
}

.auth-link a {
color: #667eea;
text-decoration: none;
font-weight: 600;
}

.auth-link a:hover {
text-decoration: underline;
}

@media (max-width: 480px) {
.auth-card {
padding: 2rem 1.5rem;
}

.brand h1 {
font-size: 1.75rem;
}
}
</style>
