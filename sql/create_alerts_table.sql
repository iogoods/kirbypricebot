-- Create the Alerts table with utf8mb4 encoding
CREATE TABLE Alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chatId BIGINT NOT NULL, -- Telegram chat ID
    coin VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL, -- Cryptocurrency name (e.g., bitcoin)
    condition ENUM('above', 'below') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL, -- Alert condition
    price DECIMAL(10, 2) NOT NULL, -- Target price for the alert
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of when the alert was created
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Timestamp of the last update
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add an index for performance (optional)
CREATE INDEX idx_chatId ON Alerts (chatId);
