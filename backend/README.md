# ShopEZ Backend

Node.js + Express + MongoDB backend for the ShopEZ e-commerce application.

## Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from the example:
```bash
cp .env.example .env
```

3. Fill in your `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shopez
JWT_SECRET=your-super-secret-key-change-in-production
PORT=5000
CLIENT_URL=http://localhost:5173
```

4. Seed the database with sample data:
```bash
npm run seed
```

5. Start the development server:
```bash
npm run dev
```

## Default Login Credentials

After seeding, you can log in with:
- **Admin:** `admin@shopez.com` / `admin123`
- **Customer:** `demo@shopez.com` / `demo123`

## API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user (requires token)

### Users
- `PUT /api/users/me` — Update profile
- `POST /api/users/me/addresses` — Add address
- `PUT /api/users/me/addresses/:id` — Update address
- `DELETE /api/users/me/addresses/:id` — Remove address
- `PUT /api/users/me/addresses/:id/default` — Set default address

### Products
- `GET /api/products` — List/search/filter products
- `GET /api/products/categories` — Get all categories
- `GET /api/products/:id` — Get single product
- `POST /api/products` — Create product (admin only)
- `PUT /api/products/:id` — Update product (admin only)
- `DELETE /api/products/:id` — Delete product (admin only)

### Cart
- `GET /api/cart` — Get cart
- `POST /api/cart` — Add item to cart
- `PUT /api/cart/:productId` — Update cart item quantity
- `DELETE /api/cart/:productId` — Remove item from cart
- `DELETE /api/cart` — Clear cart

### Wishlist
- `GET /api/wishlist` — Get wishlist
- `POST /api/wishlist` — Add item to wishlist
- `DELETE /api/wishlist/:productId` — Remove item from wishlist
- `DELETE /api/wishlist` — Clear wishlist

### Orders
- `POST /api/orders` — Create order
- `GET /api/orders/me` — Get current user's orders
- `GET /api/orders/:id` — Get single order
- `GET /api/orders` — Get all orders (admin only)
- `PUT /api/orders/:id/status` — Update order status (admin only)

## Authentication

All protected endpoints require an `Authorization` header with a Bearer token:
```
Authorization: Bearer <jwt-token>
```

The token is returned on login/register and is valid for 7 days.
