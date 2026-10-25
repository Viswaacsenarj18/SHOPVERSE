const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12345",
  database: "shopverse"
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL Connection Failed:", err.message);
    process.exit(1);
  }
  console.log("✅ MySQL Connected...");

  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(20) NOT NULL,
        password VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const alterUsersTable = `
    ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
  `;

  const insertAdmin = `
    INSERT IGNORE INTO users (name, email, phone, password, is_admin)
    VALUES ('Admin', 'admin@example.com', '0000', '1919', TRUE)
  `;

  const createCategoriesTable = `
    CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        description VARCHAR(255),
        image VARCHAR(500),
        has_sizes BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const alterCategoriesTable = `
    ALTER TABLE categories 
    ADD COLUMN slug VARCHAR(255) NOT NULL,
    ADD COLUMN description VARCHAR(255),
    ADD COLUMN image VARCHAR(500),
    ADD COLUMN has_sizes BOOLEAN DEFAULT FALSE;
  `;

  const createProductsTable = `
    CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        brand VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        image VARCHAR(500) NOT NULL,
        category_id INT,
        stock INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'In Stock',
        has_sizes BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `;

  const alterProductsCategory = `ALTER TABLE products ADD COLUMN category_id INT;`;
  const alterProductsStock = `ALTER TABLE products ADD COLUMN stock INT DEFAULT 0;`;
  const alterProductsStatus = `ALTER TABLE products ADD COLUMN status VARCHAR(50) DEFAULT 'In Stock';`;
  const alterProductsSizes = `ALTER TABLE products ADD COLUMN has_sizes BOOLEAN DEFAULT FALSE;`;

  const createOrdersTable = `
    CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        shipping_address TEXT NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  const createOrderItemsTable = `
    CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `;

  const runQuery = (query, name) => {
    return new Promise((resolve, reject) => {
      db.query(query, (err) => {
        if (err && err.code !== 'ER_DUP_FIELDNAME') {
          console.error(`❌ Failed on ${name}:`, err.message);
          resolve(); // Resolve anyway to continue script
        } else {
          console.log(`✅ ${name} executed.`);
          resolve();
        }
      });
    });
  };

  const setupDatabase = async () => {
    await runQuery(createUsersTable, "Create users table");
    await runQuery(alterUsersTable, "Alter users table");
    await runQuery(insertAdmin, "Insert default admin");
    await runQuery(createCategoriesTable, "Create categories table");
    await runQuery(alterCategoriesTable, "Alter categories table");
    await runQuery(createProductsTable, "Create products table");
    await runQuery(alterProductsCategory, "Alter products table - category_id");
    await runQuery(alterProductsStock, "Alter products table - stock");
    await runQuery(alterProductsStatus, "Alter products table - status");
    await runQuery(alterProductsSizes, "Alter products table - sizes");
    await runQuery(createOrdersTable, "Create orders table");
    await runQuery(createOrderItemsTable, "Create order_items table");
    
    console.log("✅ Database setup complete.");
    db.end();
    process.exit(0);
  };

  setupDatabase();
});
