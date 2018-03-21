# Use node 4.4.5 LTS
FROM node:8.10

# Copy source code
COPY . /app

# Change working directory
WORKDIR /app

# Install dependencies
RUN npm install

# Run the thing
#CMD ["node", "scripts/runTest.js"]
