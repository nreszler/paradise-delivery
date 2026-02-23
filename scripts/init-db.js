const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'paradise.db');
const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');

console.log('🔄 Initializing database...');

// Check if database exists
const dbExists = fs.existsSync(dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to SQLite database');
});

// Read and execute schema
const schema = fs.readFileSync(schemaPath, 'utf8');

// Split schema into individual statements
const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);

let completed = 0;
const total = statements.length;

statements.forEach((statement, index) => {
    db.run(statement + ';', (err) => {
        completed++;
        
        if (err) {
            // Ignore "already exists" errors
            if (!err.message.includes('already exists')) {
                console.error(`❌ Error executing statement ${index + 1}:`, err.message);
            }
        }
        
        if (completed === total) {
            console.log('✅ Database schema initialized');
            
            // Seed demo data if new database
            if (!dbExists) {
                seedDemoData();
            } else {
                db.close();
                console.log('🎉 Database ready!');
            }
        }
    });
});

function seedDemoData() {
    console.log('🌱 Seeding demo data...');
    
    const demoData = `
        -- Demo Restaurant: Maria's Kitchen
        INSERT INTO restaurants (id, name, description, cuisine_type, address, city, state, zip, phone, email, commission_rate, status, rating) 
        VALUES (1, 'Maria''s Kitchen', 'Authentic Mexican food made with love', 'Mexican', '6491 Clark Rd', 'Paradise', 'CA', '95969', '(530) 555-0123', 'maria@mariaskitchen.com', 18.00, 'active', 4.8);
        
        -- Demo menu categories
        INSERT INTO menu_categories (id, restaurant_id, name, description, sort_order) VALUES
        (1, 1, 'Appetizers', 'Start your meal right', 1),
        (2, 1, 'Burritos', 'Our famous burritos', 2),
        (3, 1, 'Tacos', 'Street-style tacos', 3),
        (4, 1, 'Drinks', 'Refreshing beverages', 4);
        
        -- Demo menu items
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
        
        -- Demo restaurant hours
        INSERT INTO restaurant_hours (restaurant_id, day_of_week, open_time, close_time, is_closed) VALUES
        (1, 0, '08:00', '21:00', 0), -- Sunday
        (1, 1, '08:00', '21:00', 0), -- Monday
        (1, 2, '08:00', '21:00', 0), -- Tuesday
        (1, 3, '08:00', '21:00', 0), -- Wednesday
        (1, 4, '08:00', '21:00', 0), -- Thursday
        (1, 5, '08:00', '22:00', 0), -- Friday
        (1, 6, '08:00', '22:00', 0); -- Saturday
    `;
    
    const seedStatements = demoData.split(';').filter(stmt => stmt.trim().length > 0);
    
    let seedCompleted = 0;
    
    seedStatements.forEach((statement) => {
        db.run(statement + ';', (err) => {
            seedCompleted++;
            
            if (err && !err.message.includes('UNIQUE constraint failed')) {
                console.error('❌ Error seeding:', err.message);
            }
            
            if (seedCompleted === seedStatements.length) {
                db.close();
                console.log('✅ Demo data seeded');
                console.log('🎉 Database ready with demo restaurant!');
            }
        });
    });
}