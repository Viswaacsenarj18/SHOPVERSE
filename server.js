const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config(); // Load .env file

const app = express();

// CORS — allow Netlify frontend + localhost for development
const allowedOrigins = [
  'http://localhost:5500',          // VS Code Live Server
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000',
  // ↓ Add your Netlify URL here after deploying
  'https://shopverse-viswa.netlify.app',
  'https://shopverse-bt3k.onrender.com',
];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS blocked: ' + origin));
    }
  },
  credentials: true,
}));
app.use(bodyParser.json());

// ============================================================
//  Smart DB Connection — works for BOTH:
//    LOCAL:      DB_SSL=false  → plain MySQL (localhost/XAMPP)
//    PRODUCTION: DB_SSL=true   → Aiven Cloud MySQL with SSL
// ============================================================
const isProduction = process.env.DB_SSL === "true";

const dbConfig = {
  host:     process.env.DB_HOST     || "localhost",
  port:     Number(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || "root",
  password: process.env.DB_PASSWORD || "12345",
  database: process.env.DB_NAME     || "shopverse",
};

// SSL for Aiven Cloud — use CA cert if provided, else accept Aiven's cert
if (isProduction) {
  dbConfig.ssl = process.env.DB_CA_CERT
    ? { rejectUnauthorized: true, ca: process.env.DB_CA_CERT }
    : { rejectUnauthorized: false }; // works with Aiven without manual CA cert
}

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL Connection Failed:", err.message);
    console.error("   Host:", dbConfig.host, "| Port:", dbConfig.port, "| DB:", dbConfig.database);
    console.error("   Tip: Check your .env file settings.");
  } else {
    const env = isProduction ? "☁️  Aiven Cloud (Production)" : "💻 Localhost (Development)";
    console.log(`✅ MySQL Connected — ${env}`);
    console.log(`   Host: ${dbConfig.host} | DB: ${dbConfig.database}`);
  }
});

app.get("/", (req, res) => {
  res.send("ShopVerse Backend Running 🚀");
});

// --- Dashboard Stats API ---
app.get("/api/stats", (req, res) => {
  const stats = {};
  db.query("SELECT COUNT(*) AS total_users FROM users WHERE is_admin = FALSE", (err, userRes) => {
    if (err) return res.status(500).json({ error: err.message });
    stats.totalUsers = userRes[0].total_users;
    
    db.query("SELECT COUNT(*) AS total_products FROM products", (err, prodRes) => {
      if (err) return res.status(500).json({ error: err.message });
      stats.totalProducts = prodRes[0].total_products;
      
      db.query("SELECT COUNT(*) AS total_categories FROM categories", (err, catRes) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.totalCategories = catRes[0].total_categories;

        db.query("SELECT COUNT(*) AS total_orders, COALESCE(SUM(total_price), 0) AS total_revenue FROM orders", (err, orderRes) => {
          if (err) return res.status(500).json({ error: err.message });
          stats.totalOrders = orderRes[0].total_orders;
          stats.totalRevenue = orderRes[0].total_revenue;
          stats.activeSessions = Math.floor(Math.random() * 45) + 12;
          res.json(stats);
        });
      });
    });
  });
});

// --- Categories API with dynamic product_count ---
app.get("/api/categories", (req, res) => {
  const query = `
    SELECT c.*, COUNT(p.id) AS product_count 
    FROM categories c 
    LEFT JOIN products p ON c.id = p.category_id 
    GROUP BY c.id 
    ORDER BY c.name ASC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/api/categories", (req, res) => {
  const { name, slug, description, image, has_sizes } = req.body;
  if (!name || !slug) return res.status(400).json({ error: "Name and slug are required" });

  db.query(
    "INSERT INTO categories (name, slug, description, image, has_sizes) VALUES (?, ?, ?, ?, ?)",
    [name, slug, description, image, has_sizes ? 1 : 0],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Category added successfully", id: result.insertId });
    }
  );
});

app.put("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  const { name, slug, description, image, has_sizes } = req.body;

  db.query(
    "UPDATE categories SET name=?, slug=?, description=?, image=?, has_sizes=? WHERE id=?",
    [name, slug, description, image, has_sizes ? 1 : 0, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Category updated successfully" });
    }
  );
});

app.delete("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM categories WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Category deleted successfully" });
  });
});

// --- Products API with advanced filters (search, category_id, min_price, max_price, sort) ---
app.get("/api/products", (req, res) => {
  const { category_id, category_name, min_price, max_price, search, sort, limit } = req.query;

  let query = `
    SELECT p.*, c.name AS category_name, c.slug AS category_slug
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (category_id && category_id !== 'all') {
    query += " AND p.category_id = ?";
    params.push(category_id);
  } else if (category_name && category_name !== 'all') {
    query += " AND (c.name = ? OR c.slug = ?)";
    params.push(category_name, category_name);
  }

  if (min_price && !isNaN(min_price)) {
    query += " AND p.price >= ?";
    params.push(parseFloat(min_price));
  }

  if (max_price && !isNaN(max_price)) {
    query += " AND p.price <= ?";
    params.push(parseFloat(max_price));
  }

  if (search && search.trim() !== '') {
    query += " AND (p.title LIKE ? OR p.brand LIKE ? OR c.name LIKE ?)";
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  if (sort === 'price_asc') {
    query += " ORDER BY p.price ASC";
  } else if (sort === 'price_desc') {
    query += " ORDER BY p.price DESC";
  } else if (sort === 'title_asc') {
    query += " ORDER BY p.title ASC";
  } else {
    query += " ORDER BY p.created_at DESC, p.id DESC";
  }

  if (limit && !isNaN(limit)) {
    query += " LIMIT ?";
    params.push(parseInt(limit, 10));
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Single Product API
app.get("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT p.*, c.name AS category_name, c.slug AS category_slug
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `;
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json(results[0]);
  });
});

app.post("/api/products", (req, res) => {
  const { title, brand, price, image, category_id, stock, status, has_sizes } = req.body;

  if (!title || !price || !image) {
    return res.status(400).json({ error: "Title, price and image are required" });
  }

  db.query(
    "INSERT INTO products (title, brand, price, image, category_id, stock, status, has_sizes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [title, brand || 'ShopVerse', price, image, category_id || null, stock || 10, status || 'In Stock', has_sizes ? 1 : 0],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Product added successfully" });
    }
  );
});

app.put("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const { title, brand, price, image, category_id, stock, status, has_sizes } = req.body;

  db.query(
    "UPDATE products SET title=?, brand=?, price=?, image=?, category_id=?, stock=?, status=?, has_sizes=? WHERE id=?",
    [title, brand || 'ShopVerse', price, image, category_id || null, stock || 0, status || 'In Stock', has_sizes ? 1 : 0, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Product updated successfully" });
    }
  );
});

app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM order_items WHERE product_id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to remove product from orders: " + err.message });
    db.query("DELETE FROM products WHERE id = ?", [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: "Product not found" });
      res.json({ message: "Product deleted successfully" });
    });
  });
});

// --- Orders API ---
app.post("/api/orders", (req, res) => {
  const { user_id, total_price, shipping_address, payment_method, cartItems } = req.body;
  if (!total_price || !shipping_address || !payment_method || !cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: "All fields and cart items are required" });
  }
  if (payment_method !== "Cash on Delivery") {
    return res.status(400).json({ error: "Only Cash on Delivery is available" });
  }

  // Ensure valid user_id
  db.query("SELECT id FROM users WHERE id = ?", [user_id || 0], (err, uRes) => {
    let validUserId = (uRes && uRes.length > 0) ? user_id : null;

    if (!validUserId) {
      db.query("SELECT id FROM users LIMIT 1", (err2, firstUser) => {
        validUserId = (firstUser && firstUser.length > 0) ? firstUser[0].id : 2;
        validateAndInsertOrder(validUserId);
      });
    } else {
      validateAndInsertOrder(validUserId);
    }
  });

  function validateAndInsertOrder(targetUserId) {
    // Validate that each product_id in cartItems actually exists in the products table
    const productIds = cartItems.map(item => parseInt(item.id)).filter(id => !isNaN(id));
    if (productIds.length === 0) {
      return res.status(400).json({ error: "Cart items have invalid product IDs" });
    }

    db.query("SELECT id FROM products WHERE id IN (?)", [productIds], (err, validProducts) => {
      if (err) return res.status(500).json({ error: err.message });

      const validIds = new Set(validProducts.map(p => p.id));
      const invalidItems = cartItems.filter(item => !validIds.has(parseInt(item.id)));

      if (invalidItems.length > 0) {
        const badNames = invalidItems.map(i => i.title || `ID:${i.id}`).join(', ');
        return res.status(400).json({
          error: `Some products no longer exist in the store: ${badNames}. Please refresh your cart and try again.`
        });
      }

      insertOrder(targetUserId);
    });
  }

  function insertOrder(targetUserId) {
    db.query(
      "INSERT INTO orders (user_id, total_price, shipping_address, payment_method, status) VALUES (?, ?, ?, ?, 'Processing')",
      [targetUserId, total_price, shipping_address, payment_method],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const orderId = result.insertId;
        const orderItemsData = cartItems.map(item => [orderId, parseInt(item.id), item.quantity || 1, parseFloat(item.price)]);
        
        db.query(
          "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?",
          [orderItemsData],
          (err) => {
            if (err) return res.status(500).json({ error: "Failed to save order items: " + err.message });
            res.json({ message: "Order placed successfully", orderId });
          }
        );
      }
    );
  }
});

app.get("/api/orders", (req, res) => {
  const { user_id } = req.query;
  let query = `
    SELECT o.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
  `;
  const params = [];
  
  if (user_id) {
    query += " WHERE o.user_id = ?";
    params.push(user_id);
  }
  
  query += " ORDER BY o.created_at DESC";

  db.query(query, params, (err, orders) => {
    if (err) return res.status(500).json({ error: err.message });
    if (orders.length === 0) return res.json([]);

    const orderIds = orders.map(o => o.id);
    const itemsQuery = `
      SELECT oi.*, p.title AS product_title, p.image AS product_image, p.brand AS product_brand
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id IN (?)
    `;

    db.query(itemsQuery, [orderIds], (err, items) => {
      if (err) {
        // Return orders even if item fetch fails
        return res.json(orders);
      }

      const ordersWithItems = orders.map(order => {
        return {
          ...order,
          items: items.filter(item => item.order_id === order.id)
        };
      });

      res.json(ordersWithItems);
    });
  });
});

app.put("/api/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "Status is required" });

  db.query("UPDATE orders SET status = ? WHERE id = ?", [status, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Order status updated successfully" });
  });
});

// Admin reply to an order
app.put("/api/orders/:id/reply", (req, res) => {
  const { id } = req.params;
  const { admin_reply } = req.body;
  if (admin_reply === undefined) return res.status(400).json({ error: "admin_reply is required" });

  // Try to add admin_reply column if not exists (safe)
  db.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_reply TEXT DEFAULT NULL", () => {
    db.query("UPDATE orders SET admin_reply = ? WHERE id = ?", [admin_reply, id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Admin reply saved successfully" });
    });
  });
});

// --- Users API ---
app.get("/api/users", (req, res) => {
  db.query("SELECT id, name, email, phone, is_admin, created_at FROM users ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "User deleted successfully" });
  });
});

app.post("/api/users/signup", (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) return res.status(400).json({ error: "User already exists with this email" });

    db.query(
      "INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)",
      [name, email, phone, password],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "User registered successfully", userId: result.insertId });
      }
    );
  });
});

app.post("/api/users/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  db.query("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) {
      res.json({ message: "Login successful", user: results[0] });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  });
});

// Contact message API
app.post("/api/contact", (req, res) => {
  const { name, email, subject, message } = req.body;
  console.log("📩 Received Contact Message:", { name, email, subject, message });
  res.json({ message: "Message received successfully! We will get back to you shortly." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 ShopVerse Server running on http://localhost:${PORT}`);
});
