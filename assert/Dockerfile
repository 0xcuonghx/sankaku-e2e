# Use a Node.js base image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package files to install dependencies
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the project files
COPY . .

# Compile TypeScript to JavaScript
RUN npx tsc

# Run the compiled entry point
CMD ["node", "dist/index.js"]