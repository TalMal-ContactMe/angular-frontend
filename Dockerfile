FROM node:16-alpine AS builder
COPY package.json package-lock.json ./
RUN npm i && mkdir /ng-app && mv ./node_modules ./ng-app
WORKDIR /ng-app
COPY . .
RUN $(npm bin)/ng build --prod --output-path=dist

FROM nginx:1.23.3-alpine
COPY nginx/default.conf /etc/nginx/conf.d/
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /ng-app/dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]