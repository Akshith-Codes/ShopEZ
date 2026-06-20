import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './src/models/User.js';
import Product from './src/models/Product.js';
import Order from './src/models/Order.js';
import { connectDB } from './src/config/db.js';

dotenv.config();

const seedProducts = [
  {
    title: 'iPhone 15 Pro',
    description: 'The most advanced iPhone with titanium design and A17 Pro chip.',
    category: 'smartphones',
    brand: 'Apple',
    sku: 'IP15P-256',
    price: 1199,
    discountPercentage: 5,
    stock: 42,
    thumbnail: 'https://cdn.dummyjson.com/products/images/smartphones/iPhone%2015%20Pro/1.png',
    images: ['https://cdn.dummyjson.com/products/images/smartphones/iPhone%2015%20Pro/1.png'],
    rating: 4.8,
    tags: ['apple', '5g', 'flagship']
  },
  {
    title: 'Samsung Galaxy S24 Ultra',
    description: 'AI-powered smartphone with S Pen and 200MP camera.',
    category: 'smartphones',
    brand: 'Samsung',
    sku: 'SGS24U-512',
    price: 1299,
    discountPercentage: 8,
    stock: 35,
    thumbnail: 'https://cdn.dummyjson.com/products/images/smartphones/Samsung%20Galaxy%20S24%20Ultra/1.png',
    images: ['https://cdn.dummyjson.com/products/images/smartphones/Samsung%20Galaxy%20S24%20Ultra/1.png'],
    rating: 4.7,
    tags: ['samsung', '5g', 's-pen']
  },
  {
    title: 'Google Pixel 8 Pro',
    description: 'The best of Google AI with advanced camera features.',
    category: 'smartphones',
    brand: 'Google',
    sku: 'GP8P-128',
    price: 999,
    discountPercentage: 10,
    stock: 28,
    thumbnail: 'https://cdn.dummyjson.com/products/images/smartphones/Google%20Pixel%208%20Pro/1.png',
    images: ['https://cdn.dummyjson.com/products/images/smartphones/Google%20Pixel%208%20Pro/1.png'],
    rating: 4.6,
    tags: ['google', 'ai', 'camera']
  },
  {
    title: 'MacBook Pro 14-inch',
    description: 'Supercharged by M3 Pro or M3 Max, the most advanced Mac laptop for pros.',
    category: 'laptops',
    brand: 'Apple',
    sku: 'MBP14-M3',
    price: 1999,
    discountPercentage: 0,
    stock: 18,
    thumbnail: 'https://cdn.dummyjson.com/products/images/laptops/Apple%20MacBook%20Pro%2014%20Inch%20Space%20Gray/1.png',
    images: ['https://cdn.dummyjson.com/products/images/laptops/Apple%20MacBook%20Pro%2014%20Inch%20Space%20Gray/1.png'],
    rating: 4.9,
    tags: ['apple', 'm3', 'pro']
  },
  {
    title: 'Dell XPS 15',
    description: 'Premium laptop with stunning OLED display and powerful performance.',
    category: 'laptops',
    brand: 'Dell',
    sku: 'XPS15-9530',
    price: 1799,
    discountPercentage: 12,
    stock: 22,
    thumbnail: 'https://cdn.dummyjson.com/products/images/laptops/Dell%20XPS%2015/1.png',
    images: ['https://cdn.dummyjson.com/products/images/laptops/Dell%20XPS%2015/1.png'],
    rating: 4.5,
    tags: ['dell', 'oled', 'premium']
  },
  {
    title: 'Lenovo ThinkPad X1 Carbon',
    description: 'Ultra-light business laptop with legendary durability.',
    category: 'laptops',
    brand: 'Lenovo',
    sku: 'TPX1C-12',
    price: 1599,
    discountPercentage: 15,
    stock: 15,
    thumbnail: 'https://cdn.dummyjson.com/products/images/laptops/Lenovo%20ThinkPad%20X1%20Carbon/1.png',
    images: ['https://cdn.dummyjson.com/products/images/laptops/Lenovo%20ThinkPad%20X1%20Carbon/1.png'],
    rating: 4.7,
    tags: ['lenovo', 'business', 'lightweight']
  },
  {
    title: 'Chanel No. 5',
    description: 'Iconic fragrance with notes of jasmine, rose, and ylang-ylang.',
    category: 'fragrances',
    brand: 'Chanel',
    sku: 'CN5-100ML',
    price: 135,
    discountPercentage: 0,
    stock: 50,
    thumbnail: 'https://cdn.dummyjson.com/products/images/fragrances/Chanel%20Coco%20Noir%20Eau%20De/1.png',
    images: ['https://cdn.dummyjson.com/products/images/fragrances/Chanel%20Coco%20Noir%20Eau%20De/1.png'],
    rating: 4.8,
    tags: ['luxury', 'classic', 'women']
  },
  {
    title: 'Dior Sauvage',
    description: 'Bold and fresh masculine fragrance with bergamot and ambroxan.',
    category: 'fragrances',
    brand: 'Dior',
    sku: 'DSV-60ML',
    price: 95,
    discountPercentage: 10,
    stock: 65,
    thumbnail: 'https://cdn.dummyjson.com/products/images/fragrances/Dior%20Jadore/1.png',
    images: ['https://cdn.dummyjson.com/products/images/fragrances/Dior%20Jadore/1.png'],
    rating: 4.6,
    tags: ['men', 'fresh', 'cologne']
  },
  {
    title: 'Tom Ford Black Orchid',
    description: 'Luxurious dark and sensual scent with black truffle and patchouli.',
    category: 'fragrances',
    brand: 'Tom Ford',
    sku: 'TFBO-50ML',
    price: 185,
    discountPercentage: 0,
    stock: 30,
    thumbnail: 'https://cdn.dummyjson.com/products/images/fragrances/Calvin%20Klein%20CK%20One/1.png',
    images: ['https://cdn.dummyjson.com/products/images/fragrances/Calvin%20Klein%20CK%20One/1.png'],
    rating: 4.7,
    tags: ['luxury', 'unisex', 'dark']
  },
  {
    title: 'Sony WH-1000XM5',
    description: 'Industry-leading noise canceling headphones with 30-hour battery.',
    category: 'electronics',
    brand: 'Sony',
    sku: 'WHXM5-BLK',
    price: 348,
    discountPercentage: 20,
    stock: 40,
    thumbnail: 'https://cdn.dummyjson.com/products/images/mobile-accessories/Sony%20WH-1000XM5/1.png',
    images: ['https://cdn.dummyjson.com/products/images/mobile-accessories/Sony%20WH-1000XM5/1.png'],
    rating: 4.8,
    tags: ['noise-canceling', 'wireless', 'audio']
  },
  {
    title: 'Apple AirPods Pro 2',
    description: 'Magical wireless earbuds with H2 chip and Adaptive Audio.',
    category: 'electronics',
    brand: 'Apple',
    sku: 'APP2-USB',
    price: 249,
    discountPercentage: 0,
    stock: 80,
    thumbnail: 'https://cdn.dummyjson.com/products/images/mobile-accessories/Apple%20AirPods%20Pro%202nd%20Gen/1.png',
    images: ['https://cdn.dummyjson.com/products/images/mobile-accessories/Apple%20AirPods%20Pro%202nd%20Gen/1.png'],
    rating: 4.7,
    tags: ['wireless', 'noise-canceling', 'earbuds']
  },
  {
    title: 'iPad Pro 12.9-inch',
    description: 'Ultimate iPad experience with M2 chip and Liquid Retina XDR display.',
    category: 'electronics',
    brand: 'Apple',
    sku: 'IPDP12-M2',
    price: 1099,
    discountPercentage: 5,
    stock: 25,
    thumbnail: 'https://cdn.dummyjson.com/products/images/tablets/Apple%20iPad%20Pro%2011%20Inch/1.png',
    images: ['https://cdn.dummyjson.com/products/images/tablets/Apple%20iPad%20Pro%2011%20Inch/1.png'],
    rating: 4.8,
    tags: ['apple', 'm2', 'tablet']
  },
  {
    title: 'Nike Air Force 1',
    description: 'Classic basketball-inspired sneakers with premium leather.',
    category: 'fashion',
    brand: 'Nike',
    sku: 'AF1-WHT-10',
    price: 110,
    discountPercentage: 0,
    stock: 120,
    thumbnail: 'https://cdn.dummyjson.com/products/images/mens-shoes/Nike%20Air%20Force%201%20%2707/1.png',
    images: ['https://cdn.dummyjson.com/products/images/mens-shoes/Nike%20Air%20Force%201%20%2707/1.png'],
    rating: 4.6,
    tags: ['classic', 'sneakers', 'casual']
  },
  {
    title: 'Ray-Ban Aviator Classic',
    description: 'Timeless sunglasses with gold metal frame and green lenses.',
    category: 'fashion',
    brand: 'Ray-Ban',
    sku: 'RB3025-G58',
    price: 163,
    discountPercentage: 15,
    stock: 45,
    thumbnail: 'https://cdn.dummyjson.com/products/images/sunglasses/Ray-Ban%20RB3025%20Aviator/1.png',
    images: ['https://cdn.dummyjson.com/products/images/sunglasses/Ray-Ban%20RB3025%20Aviator/1.png'],
    rating: 4.7,
    tags: ['classic', 'sunglasses', 'gold']
  },
  {
    title: 'Herman Miller Aeron',
    description: 'Ergonomic office chair with breathable mesh and adjustable support.',
    category: 'home',
    brand: 'Herman Miller',
    sku: 'HMA-B-GRAPH',
    price: 1450,
    discountPercentage: 0,
    stock: 10,
    thumbnail: 'https://cdn.dummyjson.com/products/images/furniture/Annibale%20Colombo%20Bed/1.png',
    images: ['https://cdn.dummyjson.com/products/images/furniture/Annibale%20Colombo%20Bed/1.png'],
    rating: 4.9,
    tags: ['ergonomic', 'office', 'premium']
  },
  {
    title: 'Dyson V15 Detect',
    description: 'Laser-equipped cordless vacuum with powerful suction and intelligent optimization.',
    category: 'home',
    brand: 'Dyson',
    sku: 'DYV15-DET',
    price: 699,
    discountPercentage: 10,
    stock: 20,
    thumbnail: 'https://cdn.dummyjson.com/products/images/groceries/Dyson%20V15%20Detect/1.png',
    images: ['https://cdn.dummyjson.com/products/images/groceries/Dyson%20V15%20Detect/1.png'],
    rating: 4.8,
    tags: ['cordless', 'vacuum', 'smart']
  },
  {
    title: 'Samsung 55" Neo QLED 4K',
    description: 'Stunning 4K TV with Quantum Matrix Technology and AI upscaling.',
    category: 'home',
    brand: 'Samsung',
    sku: 'QN55QN90D',
    price: 1799,
    discountPercentage: 18,
    stock: 12,
    thumbnail: 'https://cdn.dummyjson.com/products/images/tv/Samsung%2055%22%20Neo%20QLED%204K/1.png',
    images: ['https://cdn.dummyjson.com/products/images/tv/Samsung%2055%22%20Neo%20QLED%204K/1.png'],
    rating: 4.7,
    tags: ['4k', 'qled', 'smart-tv']
  },
  {
    title: 'Nintendo Switch OLED',
    description: 'Versatile gaming console with vibrant OLED screen and enhanced audio.',
    category: 'electronics',
    brand: 'Nintendo',
    sku: 'NSW-OLED-WHT',
    price: 349,
    discountPercentage: 5,
    stock: 55,
    thumbnail: 'https://cdn.dummyjson.com/products/images/gaming/Nintendo%20Switch%20OLED/1.png',
    images: ['https://cdn.dummyjson.com/products/images/gaming/Nintendo%20Switch%20OLED/1.png'],
    rating: 4.8,
    tags: ['gaming', 'portable', 'console']
  },
  {
    title: 'GoPro Hero 12 Black',
    description: 'Ultimate action camera with 5.3K video and HyperSmooth 6.0 stabilization.',
    category: 'electronics',
    brand: 'GoPro',
    sku: 'GP12-BLK',
    price: 399,
    discountPercentage: 12,
    stock: 30,
    thumbnail: 'https://cdn.dummyjson.com/products/images/cameras/GoPro%20Hero%2012%20Black/1.png',
    images: ['https://cdn.dummyjson.com/products/images/cameras/GoPro%20Hero%2012%20Black/1.png'],
    rating: 4.6,
    tags: ['action', 'waterproof', '4k']
  },
  {
    title: 'Adidas Ultraboost Light',
    description: 'Revolutionary running shoes with lighter BOOST cushioning and Primeknit upper.',
    category: 'fashion',
    brand: 'Adidas',
    sku: 'UBLT-WHT-9',
    price: 190,
    discountPercentage: 0,
    stock: 75,
    thumbnail: 'https://cdn.dummyjson.com/products/images/sports-accessories/Adidas%20Ultraboost%20Light/1.png',
    images: ['https://cdn.dummyjson.com/products/images/sports-accessories/Adidas%20Ultraboost%20Light/1.png'],
    rating: 4.7,
    tags: ['running', 'comfort', 'lightweight']
  }
];

const seed = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      email: 'admin@shopez.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      addresses: []
    });
    console.log('Created admin user:', admin.email);

    // Create demo customer
    const demoPassword = await bcrypt.hash('demo123', 10);
    const demo = await User.create({
      email: 'demo@shopez.com',
      password: demoPassword,
      firstName: 'Demo',
      lastName: 'Customer',
      role: 'customer',
      addresses: [
        {
          id: 'addr-1',
          type: 'home',
          street: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'US',
          isDefault: true
        }
      ]
    });
    console.log('Created demo customer:', demo.email);

    // Create products
    const products = await Product.insertMany(seedProducts);
    console.log(`Created ${products.length} products`);

    // Create a sample order for the demo user
    const sampleOrder = await Order.create({
      userId: demo._id,
      items: [
        {
          productId: products[0].id,
          title: products[0].title,
          quantity: 1,
          price: products[0].price,
          image: products[0].thumbnail
        }
      ],
      subtotal: products[0].price,
      shipping: 15,
      total: products[0].price + 15,
      status: 'processing',
      statusTimeline: [
        { status: 'processing', date: new Date(), completed: true },
        { status: 'shipped', date: new Date(), completed: false },
        { status: 'delivered', date: new Date(), completed: false }
      ],
      shippingAddress: {
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'US'
      }
    });
    console.log('Created sample order:', sampleOrder.id);

    console.log('\nSeeding completed successfully!');
    console.log('Login credentials:');
    console.log('  Admin:    admin@shopez.com / admin123');
    console.log('  Customer: demo@shopez.com  / demo123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
