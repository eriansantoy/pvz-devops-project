CREATE TABLE IF NOT EXISTS plants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    damage INT DEFAULT 0,
    sun_cost INT DEFAULT 0,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Add some starting data
INSERT INTO plants (name, damage, sun_cost, description) VALUES 
('Peashooter', 20, 100, 'Shoots peas at zombies'),
('Sunflower', 0, 50, 'Gives you extra sun');
