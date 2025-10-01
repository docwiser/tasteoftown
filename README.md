# Taste of Town - Food Delivery Platform

A full-featured food delivery web application built for Taste of Town hotel in Damo, Madhya Pradesh.

## Tech Stack

- **Frontend**: Vue 3 (Composition API with `<script setup>`)
- **Backend**: Firebase (Firestore, Authentication)
- **Routing**: Vue Router
- **Styling**: Scoped CSS

## Features

### Customer Features
- Browse menu by categories
- Search and filter items (veg/non-veg, price)
- Add items to cart
- Place orders with delivery address
- Apply discount coupons
- Real-time order tracking
- Order history
- User profile management
- Multiple saved addresses
- Google Sign-In & Email/Password authentication

### Admin Features
- Dashboard with analytics
- Menu management (add/edit/delete items)
- Category management
- Order management with status updates
- Cart modification with customer approval workflow
- Coupon management
- User management
- Real-time order notifications

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

The Firebase configuration is already set up in `src/firebase/config.js`. The project uses:
- Project ID: `accessible-games`
- Database: Firestore
- Auth: Email/Password & Google Sign-In (redirect method)

### 3. Firestore Database Setup

Create the following collections in your Firebase Firestore:

#### Collections:
- `users` - User profiles
- `menuItems` - Food items
- `categories` - Food categories
- `orders` - Customer orders
- `coupons` - Discount coupons

#### Sample Data Structure:

**users** collection:
```javascript
{
  uid: "user-id",
  email: "user@example.com",
  displayName: "John Doe",
  phone: "1234567890",
  addresses: [],
  role: "customer" // or "admin"
}
```

**menuItems** collection:
```javascript
{
  name: "Paneer Tikka",
  description: "Spicy grilled cottage cheese",
  price: 250,
  category: "Starters",
  type: "veg", // or "non-veg"
  imageUrl: "https://example.com/image.jpg",
  available: true
}
```

**categories** collection:
```javascript
{
  name: "Starters",
  description: "Appetizers and starters"
}
```

**coupons** collection:
```javascript
{
  code: "SAVE20",
  type: "percentage", // or "fixed"
  value: 20,
  minOrder: 300,
  maxDiscount: 100,
  active: true
}
```

### 4. Firebase Authentication Setup

1. Enable Email/Password authentication in Firebase Console
2. Enable Google Sign-In provider
3. Add authorized domain: `fareboard.onrender.com`

### 5. Create Admin User

After signing up a user, manually update their role in Firestore:
```javascript
// Update the user document in 'users' collection
{
  role: "admin"
}
```

### 6. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 7. Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   └── Navbar.vue          # Navigation bar
├── firebase/
│   ├── config.js           # Firebase configuration
│   ├── auth.js             # Authentication functions
│   └── firestore.js        # Firestore operations
├── router/
│   └── index.js            # Vue Router configuration
├── stores/
│   ├── auth.js             # Auth state management
│   └── cart.js             # Cart state management
├── views/
│   ├── Home.vue
│   ├── Menu.vue
│   ├── Cart.vue
│   ├── Checkout.vue
│   ├── ItemDetail.vue
│   ├── Orders.vue
│   ├── OrderDetail.vue
│   ├── Profile.vue
│   ├── Auth/
│   │   ├── Login.vue
│   │   └── Signup.vue
│   └── Admin/
│       ├── Dashboard.vue
│       ├── MenuManagement.vue
│       ├── OrderManagement.vue
│       ├── CouponManagement.vue
│       └── UserManagement.vue
├── App.vue
└── main.js
```

## Key Features Explained

### Cart Modification Workflow
- Admin can modify customer cart if items are unavailable
- Modified cart requires customer approval
- Real-time updates using Firestore listeners
- Customer can approve or reject the changes

### Real-time Order Updates
- Orders update in real-time for both customers and admin
- Status tracking: Placed → Reviewing → Preparing → Out for Delivery → Delivered
- Email notifications can be added via Firebase Cloud Functions

### Authentication Flow
- Email/Password signup with name collection
- Google Sign-In using redirect method (not popup)
- Automatic user profile creation in Firestore
- Protected routes for authenticated users
- Admin-only routes for admin panel

### Responsive Design
- Mobile-first approach
- Breakpoints at 768px and 968px
- Touch-friendly interface
- Accessible design (WCAG 2.1 AA)

## Important Notes

1. **Payment**: Currently only Cash on Delivery is supported
2. **Delivery Area**: Designed for Damo, Madhya Pradesh
3. **Images**: Admins provide image URLs (no upload functionality)
4. **Admin Access**: Role must be manually set in Firestore

## Support

For issues or questions, contact the development team.
