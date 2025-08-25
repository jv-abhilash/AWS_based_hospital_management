const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure the logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Create a logger instance with custom transport rules
const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.json()
    ),
    transports: [
        // Separate files for different levels
        new winston.transports.File({
            filename: path.join(logsDir, 'audit.log'),
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                winston.format.json(),
                winston.format.printf(info => {
                    // Only log info level messages here
                    return info.level === 'info' ? JSON.stringify(info) : null;
                })
            )
        }),
        new winston.transports.File({
            filename: path.join(logsDir, 'errors.log'),
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                winston.format.json(),
                winston.format.printf(error => {
                    // Only log error level messages here
                    return error.level === 'error' ? JSON.stringify(error) : null;
                })
            )
        }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});

module.exports = logger;