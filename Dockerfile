# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first to leverage cache
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Create directory for SQLite database if it doesn't exist
# and ensure permissions are right (important for some hosts)
RUN mkdir -p /app/data
# We might need to move the db file to /app/data at runtime or configure the app to look there

# Expose the port
EXPOSE 3000

# Start command
CMD ["npm", "start"]
