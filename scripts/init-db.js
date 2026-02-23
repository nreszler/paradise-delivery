const path = require('path');
const fs = require('fs');

// Try to load sqlite3 with error handling
let sqlite3;
try {
    sqlite3 = require('sqlite3').verbose();
    console.log('✅ SQLite3 module loaded');
} catch (err) {
    console.error('❌ Failed to load sqlite3:', err.message);
    process.exit(1);
}

// Use /tmp on Render (writable), otherwise use project root
const isRender = process.env.RENDER === 'true' || process.env.RENDER_EXTERNAL_URL;
const dbDir = isRender ? '/tmp' : path.join(__dirname, '..');
const dbPath = path.join(dbDir, 'paradise.db');
const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');

console.log('🖥️  Environment:', isRender ? 'Render' : 'Local');
console.log('💾 Database:', dbPath);
console.log('📄 Schema:', schemaPath);

async function initDatabase() {
    console.log('🔄 Initializing database...');
    
    // Create directory
    if (!fs.existsSync(dbDir)) {
        console.log('📂 Creating directory...');
        fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // Check schema exists
    if (!fs.existsSync(schemaPath)) {
        console.error('❌ Schema not found:', schemaPath);
        process.exit(1);
    }
    
    const dbExists = fs.existsSync(dbPath);
    
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('❌ Error opening database:', err.message);
                reject(err);
                return;
            }
            console.log('✅ Database connected');
            
            // Read and execute schema
            const schema = fs.readFileSync(schemaPath, 'utf8');
            const statements = schema.split(';').filter(s => s.trim().length > 0);
            
            let completed = 0;
            let hasError = false;
            
            statements.forEach((stmt, i) => {
                db.run(stmt + ';', (err) => {
                    if (err && !err.message.includes('already exists')) {
                        console.error(`❌ Statement ${i + 1} failed:`, err.message);
                        hasError = true;
                    }
                    
                    completed++;
                    if (completed === statements.length) {
                        if (hasError) {
                            console.log('⚠️  Schema initialized with warnings');
                        } else {
                            console.log('✅ Schema initialized');
                        }
                        
                        if (!dbExists) {
                            seedDemoData(db).then(resolve).catch(reject);
                        } else {
                            db.close();
                            console.log('🎉 Database ready!');
                            resolve();
                        }
                    }
                });
            });
        });
    });
}

async function seedDemoData(db) {
    console.log('🌱 Seeding demo data...');
    
    const demoData = `
        INSERT INTO restaurants (id, name, description, cuisine_type, address, city, state, zip, phone, email, commission_rate, status, rating) 
        VALUES (1, 'Maria''s Kitchen', 'Authentic Mexican food made with love', 'Mexican', '6491 Clark Rd', 'Paradise', 'CA', '95969', '(530) 555-0123', 'maria@mariaskitchen.com', 18.00, 'active', 4.8);
        
        INSERT INTO menu_categories (id, restaurant_id, name, description, sort_order) VALUES
        (1, 1, 'Appetizers', 'Start your meal right', 1),
        (2, 1, 'Burritos', 'Our famous burritos', 2),
        (3, 1, 'Tacos', 'Street-style tacos', 3),
        (4, 1, 'Drinks', 'Refreshing beverages', 4);
        
        INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, is_available, sort_order) VALUES
        (1, 1, 1, 'Chips & Guacamole', 'Fresh avocado, lime, cilantro, served with house-made tortilla chips', 6.99, 1, 1),
        (2, 1, 1, 'Queso Fundido', 'Melted cheese with chorizo, served with flour tortillas', 8.99, 1, 2),
        (3, 1, 2, 'Maria''s Special Burrito', 'Flour tortilla, rice, beans, cheese, salsa, guac. Choice of chicken, beef, or veggie.', 12.35, 1, 1),
        (4, 1, 2, 'California Burrito', 'Carne asada, fries, cheese, sour cream, guacamole', 13.99, 1, 2),
        (5, 1, 2, 'Breakfast Burrito', 'Eggs, bacon, potatoes, cheese, salsa (served all day)', 10.99, 1, 3),
        (6, 1, 3, 'Street Tacos (3)', 'Corn tortillas, choice of meat, onions, cilantro, lime', 10.29, 1, 1),
        (7, 1, 3, 'Fish Tacos (2)', 'Grilled fish, cabbage slaw, chipotle crema, flour tortillas', 11.99, 1, 2),
        (8, 1, 4, 'Horchata (Large)', 'House-made rice drink with cinnamon', 3.99, 1, 1),
        (9, 1, 4, 'Mexican Coke', 'Made with real cane sugar', 3.49, 1, 2);
        
        INSERT INTO restaurant_hours (restaurant_id, day_of_week, open_time, close_time, is_closed) VALUES
        (1, 0, '08:00', '21:00', 0), (1, 1, '08:00', '21:00', 0), (1, 2, '08:00', '21:00', 0),
        (1, 3, '08:00', '21:00', 0), (1, 4, '08:00', '21:00', 0), (1, 5, '08:00', '22:00', 0), (1, 6, '08:00', '22:00', 0);
    `;
    
    return new Promise((resolve, reject) => {
        const statements = demoData.split(';').filter(s => s.trim().length > 0);
        let completed = 0;
        
        statements.forEach((stmt) => {
            db.run(stmt + ';', (err) => {
                if (err && !err.message.includes('UNIQUE constraint failed')) {
                    console.error('❌ Seed error:', err.message);
                }
                completed++;
                if (completed === statements.length) {
                    db.close();
                    console.log('✅ Demo data seeded');
                    console.log('🎉 Database ready with demo restaurant!');
                    resolve();
                }
            });
        });
    });
}

// Run initialization
initDatabase()
    .then(() => {
        console.log('✅ Database initialization complete');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Database initialization failed:', err.message);
        process.exit(1);
    });
