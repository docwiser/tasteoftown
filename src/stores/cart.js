import { ref, computed } from 'vue';

const cartItems = ref([]);

export const useCartStore = () => {
  const addToCart = (item) => {
    const existingItem = cartItems.value.find(i => i.id === item.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cartItems.value.push({ ...item, quantity: 1 });
    }
    saveCart();
  };

  const removeFromCart = (itemId) => {
    const index = cartItems.value.findIndex(i => i.id === itemId);
    if (index > -1) {
      cartItems.value.splice(index, 1);
      saveCart();
    }
  };

  const updateQuantity = (itemId, quantity) => {
    const item = cartItems.value.find(i => i.id === itemId);
    if (item) {
      if (quantity <= 0) {
        removeFromCart(itemId);
      } else {
        item.quantity = quantity;
        saveCart();
      }
    }
  };

  const increaseQuantity = (itemId) => {
    const item = cartItems.value.find(i => i.id === itemId);
    if (item) {
      item.quantity++;
      saveCart();
    }
  };

  const decreaseQuantity = (itemId) => {
    const item = cartItems.value.find(i => i.id === itemId);
    if (item) {
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        removeFromCart(itemId);
      }
      saveCart();
    }
  };


  const clearCart = () => {
    cartItems.value = [];
    saveCart();
  };

  const replaceCart = (newItems) => {
    cartItems.value = newItems;
    saveCart();
  };

  const cartTotal = computed(() => {
    return cartItems.value.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  });

  const cartCount = computed(() => {
    return cartItems.value.reduce((count, item) => count + item.quantity, 0);
  });

  const saveCart = () => {
    localStorage.setItem('cart', JSON.stringify(cartItems.value));
  };

  const loadCart = () => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      cartItems.value = JSON.parse(saved);
    }
  };

  return {
    cartItems,
    cartTotal,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    replaceCart,
    loadCart
  };
};
