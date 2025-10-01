import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Auth/Login.vue')
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../views/Auth/Signup.vue')
  },
  {
    path: '/menu',
    name: 'Menu',
    component: () => import('../views/Menu.vue')
  },
  {
    path: '/item/:id',
    name: 'ItemDetail',
    component: () => import('../views/ItemDetail.vue')
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('../views/Cart.vue')
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('../views/Checkout.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('../views/Orders.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/order/:id',
    name: 'OrderDetail',
    component: () => import('../views/OrderDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('../views/Admin/Dashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/menu',
    name: 'AdminMenu',
    component: () => import('../views/Admin/MenuManagement.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/orders',
    name: 'AdminOrders',
    component: () => import('../views/Admin/OrderManagement.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/coupons',
    name: 'AdminCoupons',
    component: () => import('../views/Admin/CouponManagement.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('../views/Admin/UserManagement.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const { user, userProfile, loading } = useAuthStore();

  if (loading.value) {
    const unwatch = loading;
    const checkAuth = setInterval(() => {
      if (!loading.value) {
        clearInterval(checkAuth);
        proceedWithNavigation();
      }
    }, 100);
    return;
  }

  proceedWithNavigation();

  function proceedWithNavigation() {
    if (to.meta.requiresAuth && !user.value) {
      next({ name: 'Login', query: { redirect: to.fullPath } });
    } else if (to.meta.requiresAdmin && userProfile.value?.role !== 'admin') {
      next({ name: 'Home' });
    } else if ((to.name === 'Login' || to.name === 'Signup') && user.value) {
      next({ name: 'Home' });
    } else {
      next();
    }
  }
});

export default router;
