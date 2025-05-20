# Use the official Node.js 18 LTS image as the base
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json from the root directory into the image
COPY ../../package*.json ./

# Install dependencies
RUN npm install --silent

# Copy the src folder and other necessary files from the root directory
COPY ../../src ./src
COPY ../../artifacts ./artifacts
COPY ../../tsconfig*.json ./
COPY ../../docker/be/.env.example ./.env

# Build the NestJS application
RUN npm run build

# Expose the port the app runs on
EXPOSE 5900

# Set the default command to start the application
CMD ["npm", "run", "start:prod"]
