# Angular build

# Stage 1
FROM node:latest AS node
WORKDIR /app
COPY . .
RUN npm install -g @angular/cli && npm install
EXPOSE 4200
CMD ["ng", "serve", "--host", "0.0.0.0"]


# RUN npm run start
# RUN npm run build --prod

# # Stage 2
# FROM nginx:alpine
# COPY --from=node /app/dist/lambda-config/browser /usr/share/nginx/html