FROM node:20-alpine AS build
WORKDIR /projects
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /projects/dist /usr/share/nginx/html
