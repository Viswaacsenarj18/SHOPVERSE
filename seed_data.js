const mysql = require("mysql2/promise");

async function seed() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345",
    database: "shopverse"
  });

  console.log("✅ Connected to MySQL for ShopVerse Flipkart-Style mega seeding...");

  await connection.query("DELETE FROM order_items");
  await connection.query("DELETE FROM orders");
  await connection.query("DELETE FROM products");
  await connection.query("DELETE FROM categories");

  // Comprehensive Flipkart-style categories
  const categories = [
    {
      name: "Mobiles & Tablets",
      slug: "mobiles-tablets",
      description: "Latest 5G smartphones, iPads, Android tablets and accessories",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
      has_sizes: 0
    },
    {
      name: "Electronics & Gadgets",
      slug: "electronics",
      description: "Wireless earbuds, smartwatches, power banks, gaming audio and cameras",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      has_sizes: 0
    },
    {
      name: "Laptops & Computers",
      slug: "laptops-computers",
      description: "Gaming laptops, ultra-slim notebooks, 4K monitors and mechanical keyboards",
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
      has_sizes: 0
    },
    {
      name: "Fashion & Apparel",
      slug: "fashion-apparel",
      description: "Trending streetwear, ethnic wear, denim jackets, shirts and dresses",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80",
      has_sizes: 1
    },
    {
      name: "Footwear & Shoes",
      slug: "footwear",
      description: "Air sneakers, running sports shoes, formal leather brogues and casual loafers",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
      has_sizes: 1
    },
    {
      name: "Home & Kitchen",
      slug: "home-kitchen",
      description: "Air fryers, espresso machines, cookware sets, aroma diffusers and decor",
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
      has_sizes: 0
    },
    {
      name: "Beauty & Personal Care",
      slug: "beauty-grooming",
      description: "Vitamin C serums, luxury perfumes, beard grooming kits and styling tools",
      image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
      has_sizes: 0
    },
    {
      name: "Sports & Fitness",
      slug: "sports-fitness",
      description: "Dumbbell sets, cricket bats, footballs, yoga mats and resistance bands",
      image: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80",
      has_sizes: 0
    },
    {
      name: "Watches & Accessories",
      slug: "watches-accessories",
      description: "Analog chronograph watches, polarized sunglasses, leather wallets & backpacks",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
      has_sizes: 0
    },
    {
      name: "Home Appliances",
      slug: "home-appliances",
      description: "Smart 4K LED TVs, robotic vacuum cleaners, microwave ovens and air purifiers",
      image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80",
      has_sizes: 0
    },
    {
      name: "Books & Stationery",
      slug: "books-stationery",
      description: "Bestselling novels, self-improvement guides, hardbound journals and art pens",
      image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
      has_sizes: 0
    },
    {
      name: "Trophies & Awards",
      slug: "trophies-awards",
      description: "Championship cups, corporate award plaques, and gold star medals",
      image: "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&w=800&q=80",
      has_sizes: 0
    }
  ];

  const catMap = {};
  for (const c of categories) {
    const [res] = await connection.query(
      "INSERT INTO categories (name, slug, description, image, has_sizes) VALUES (?, ?, ?, ?, ?)",
      [c.name, c.slug, c.description, c.image, c.has_sizes]
    );
    catMap[c.name] = res.insertId;
    console.log(`✅ Category inserted: ${c.name} (ID: ${res.insertId})`);
  }

  // Mega multi-category product catalog
  const products = [
    // 1. Mobiles & Tablets
    {
      title: "Apple iPhone 15 (128 GB) - Blue",
      brand: "Apple",
      price: 69999.00,
      image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
      category_name: "Mobiles & Tablets",
      stock: 25,
      status: "In Stock"
    },
    {
      title: "Samsung Galaxy S24 Ultra 5G (Titanium Gray)",
      brand: "Samsung",
      price: 119999.00,
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80",
      category_name: "Mobiles & Tablets",
      stock: 18,
      status: "In Stock"
    },
    {
      title: "OnePlus 12R 5G (Cool Blue, 16GB RAM)",
      brand: "OnePlus",
      price: 39999.00,
      image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80",
      category_name: "Mobiles & Tablets",
      stock: 30,
      status: "In Stock"
    },
    {
      title: "Apple iPad Air M2 11-inch Liquid Retina",
      brand: "Apple",
      price: 59900.00,
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
      category_name: "Mobiles & Tablets",
      stock: 14,
      status: "In Stock"
    },

    // 2. Electronics & Gadgets
    {
      title: "Sony WH-1000XM5 Wireless Active Noise Cancelling Headphones",
      brand: "Sony",
      price: 26990.00,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      category_name: "Electronics & Gadgets",
      stock: 20,
      status: "In Stock"
    },
    {
      title: "boAt Airdopes 141 ANC True Wireless Earbuds",
      brand: "boAt",
      price: 1499.00,
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
      category_name: "Electronics & Gadgets",
      stock: 80,
      status: "In Stock"
    },
    {
      title: "Noise ColorFit Pulse 2 Max 1.85\" Smartwatch",
      brand: "Noise",
      price: 1799.00,
      image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
      category_name: "Electronics & Gadgets",
      stock: 65,
      status: "In Stock"
    },
    {
      title: "Anker 20,000mAh 30W Fast Charging Power Bank",
      brand: "Anker",
      price: 2899.00,
      image: "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format&fit=crop&w=800&q=80",
      category_name: "Electronics & Gadgets",
      stock: 45,
      status: "In Stock"
    },

    // 3. Laptops & Computers
    {
      title: "Apple MacBook Air M3 15-inch (Midnight, 16GB)",
      brand: "Apple",
      price: 124900.00,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
      category_name: "Laptops & Computers",
      stock: 12,
      status: "In Stock"
    },
    {
      title: "ASUS ROG Strix G16 Gaming Laptop (RTX 4060, Core i7)",
      brand: "ASUS",
      price: 114990.00,
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80",
      category_name: "Laptops & Computers",
      stock: 10,
      status: "In Stock"
    },
    {
      title: "Logitech MX Master 3S Wireless Ergonomic Mouse",
      brand: "Logitech",
      price: 8495.00,
      image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
      category_name: "Laptops & Computers",
      stock: 35,
      status: "In Stock"
    },
    {
      title: "Keychron K2 RGB Wireless Mechanical Keyboard",
      brand: "Keychron",
      price: 6899.00,
      image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
      category_name: "Laptops & Computers",
      stock: 22,
      status: "In Stock"
    },

    // 4. Fashion & Apparel
    {
      title: "Levi's Men's 511 Slim Fit Stretchable Denim Jeans",
      brand: "Levi's",
      price: 2499.00,
      image: "https://images.unsplash.com/photo-1542272604-780c96856467?auto=format&fit=crop&w=800&q=80",
      category_name: "Fashion & Apparel",
      stock: 50,
      status: "In Stock"
    },
    {
      title: "Puma Classic Solid Hooded Sweatshirt",
      brand: "Puma",
      price: 1899.00,
      image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
      category_name: "Fashion & Apparel",
      stock: 40,
      status: "In Stock"
    },
    {
      title: "Zara Floral Print Summer Casual Maxi Dress",
      brand: "Zara",
      price: 2990.00,
      image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80",
      category_name: "Fashion & Apparel",
      stock: 28,
      status: "In Stock"
    },
    {
      title: "US Polo Assn Regular Fit Casual Linen Shirt",
      brand: "US Polo",
      price: 1699.00,
      image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
      category_name: "Fashion & Apparel",
      stock: 45,
      status: "In Stock"
    },

    // 5. Footwear & Shoes
    {
      title: "Nike Air Force 1 '07 Triple White Sneakers",
      brand: "Nike",
      price: 8195.00,
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
      category_name: "Footwear & Shoes",
      stock: 35,
      status: "In Stock"
    },
    {
      title: "Adidas Ultraboost Light Running Shoes",
      brand: "Adidas",
      price: 11999.00,
      image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80",
      category_name: "Footwear & Shoes",
      stock: 20,
      status: "In Stock"
    },
    {
      title: "Woodland Men's Leather Casual Outdoor Boots",
      brand: "Woodland",
      price: 3895.00,
      image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=800&q=80",
      category_name: "Footwear & Shoes",
      stock: 25,
      status: "In Stock"
    },
    {
      title: "Crocs Classic Unisex Lightweight Clogs",
      brand: "Crocs",
      price: 2795.00,
      image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80",
      category_name: "Footwear & Shoes",
      stock: 60,
      status: "In Stock"
    },

    // 6. Home & Kitchen
    {
      title: "Philips Digital Air Fryer 4.1L with Rapid Air Technology",
      brand: "Philips",
      price: 6999.00,
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
      category_name: "Home & Kitchen",
      stock: 30,
      status: "In Stock"
    },
    {
      title: "De'Longhi Dedica Espresso Coffee Maker Machine",
      brand: "De'Longhi",
      price: 18990.00,
      image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80",
      category_name: "Home & Kitchen",
      stock: 12,
      status: "In Stock"
    },
    {
      title: "Prestige Granite 3-Piece Non-Stick Cookware Set",
      brand: "Prestige",
      price: 2490.00,
      image: "https://images.unsplash.com/photo-1584990347449-399066601f09?auto=format&fit=crop&w=800&q=80",
      category_name: "Home & Kitchen",
      stock: 40,
      status: "In Stock"
    },
    {
      title: "Nordic Minimalist Warm LED Desk Lamp",
      brand: "Urban Decor",
      price: 1299.00,
      image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
      category_name: "Home & Kitchen",
      stock: 50,
      status: "In Stock"
    },

    // 7. Beauty & Personal Care
    {
      title: "Minimalist 10% Vitamin C Face Serum for Glowing Skin",
      brand: "Minimalist",
      price: 699.00,
      image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
      category_name: "Beauty & Personal Care",
      stock: 75,
      status: "In Stock"
    },
    {
      title: "Dior Sauvage Eau De Parfum for Men (100ml)",
      brand: "Dior",
      price: 11500.00,
      image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80",
      category_name: "Beauty & Personal Care",
      stock: 15,
      status: "In Stock"
    },
    {
      title: "Philips All-in-One Multi Grooming Kit Trimmer",
      brand: "Philips",
      price: 1899.00,
      image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
      category_name: "Beauty & Personal Care",
      stock: 50,
      status: "In Stock"
    },

    // 8. Sports & Fitness
    {
      title: "English Willow Grade 1 Cricket Bat",
      brand: "MRF Grand Edition",
      price: 1850.00,
      image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80",
      category_name: "Sports & Fitness",
      stock: 20,
      status: "In Stock"
    },
    {
      title: "Hexagonal Rubber Dumbbells Set (5kg x 2)",
      brand: "CoreFlex",
      price: 990.00,
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
      category_name: "Sports & Fitness",
      stock: 35,
      status: "In Stock"
    },
    {
      title: "FIFA Approved Match Football (Size 5)",
      brand: "Nivia",
      price: 699.00,
      image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80",
      category_name: "Sports & Fitness",
      stock: 45,
      status: "In Stock"
    },

    // 9. Watches & Accessories
    {
      title: "Fossil Grant Chronograph Blue Leather Watch",
      brand: "Fossil",
      price: 8495.00,
      image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
      category_name: "Watches & Accessories",
      stock: 25,
      status: "In Stock"
    },
    {
      title: "Ray-Ban Aviator Classic Polarized Sunglasses",
      brand: "Ray-Ban",
      price: 6890.00,
      image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
      category_name: "Watches & Accessories",
      stock: 30,
      status: "In Stock"
    },
    {
      title: "Wildcraft 35L Water Resistant Travel Laptop Backpack",
      brand: "Wildcraft",
      price: 1999.00,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
      category_name: "Watches & Accessories",
      stock: 55,
      status: "In Stock"
    },

    // 10. Home Appliances
    {
      title: "Samsung 55-inch Crystal 4K Ultra HD Smart TV",
      brand: "Samsung",
      price: 43990.00,
      image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80",
      category_name: "Home Appliances",
      stock: 15,
      status: "In Stock"
    },
    {
      title: "Dyson V8 Cordless Vacuum Cleaner for Home",
      brand: "Dyson",
      price: 29900.00,
      image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80",
      category_name: "Home Appliances",
      stock: 8,
      status: "In Stock"
    },

    // 11. Books & Stationery
    {
      title: "Atomic Habits by James Clear (Hardcover Edition)",
      brand: "Penguin Random House",
      price: 499.00,
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
      category_name: "Books & Stationery",
      stock: 90,
      status: "In Stock"
    },
    {
      title: "Moleskine Classic Hard Cover Ruled Journal Notebook",
      brand: "Moleskine",
      price: 1499.00,
      image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=800&q=80",
      category_name: "Books & Stationery",
      stock: 45,
      status: "In Stock"
    },

    // 12. Trophies & Awards
    {
      title: "Golden Victory Star Trophy Award",
      brand: "ShopVerse Awards",
      price: 322.00,
      image: "https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?auto=format&fit=crop&w=800&q=80",
      category_name: "Trophies & Awards",
      stock: 30,
      status: "In Stock"
    },
    {
      title: "Cricket Championship Gold Cup Trophy",
      brand: "ShopVerse Awards",
      price: 450.00,
      image: "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&w=800&q=80",
      category_name: "Trophies & Awards",
      stock: 25,
      status: "In Stock"
    }
  ];

  for (const p of products) {
    const catId = catMap[p.category_name] || null;
    await connection.query(
      "INSERT INTO products (title, brand, price, image, category_id, stock, status, has_sizes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [p.title, p.brand, p.price, p.image, catId, p.stock, p.status, 0]
    );
    console.log(`✅ Product inserted: ${p.title} -> Cat ID ${catId} (${p.category_name})`);
  }

  console.log("🎉 Complete Flipkart-style catalog seeded successfully!");
  await connection.end();
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seeding Error:", err);
  process.exit(1);
});
