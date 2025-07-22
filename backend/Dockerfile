# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies, using --omit=dev for a smaller production image
RUN npm install --omit=dev

# Bundle app source
COPY . .

# The app binds to port 5000
EXPOSE 5000

# Define the command to run the app
CMD [ "npm", "start" ]