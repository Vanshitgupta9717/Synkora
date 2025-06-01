FROM node:20-alpine



WORKDIR /src


COPY package.json .

COPY package-lock.json .

RUN npm install

COPY . .


RUN npm run build


EXPOSE 3000


CMD ["npm", "run", "start"]




# FROM node:20-alpine

# # Set working directory
# WORKDIR /src

# # Copy package.json and package-lock.json first to leverage caching
# COPY package.json .
# COPY package-lock.json .

# # Install dependencies
# RUN npm install

# # Copy the rest of the application
# COPY . .

# # Run Next.js build (skip type checking during build step)
# RUN npm run build:skip-check

# # Expose port 3000 for the app
# EXPOSE 3000

# # Start the app
# CMD ["npm", "run", "start"]
