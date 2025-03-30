# Sử dụng Node.js LTS phiên bản 18
FROM node:21

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy package.json và package-lock.json trước để tận dụng cache của Docker
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ code vào container
COPY . .

# Lệnh chạy ứng dụng
CMD ["npm", "start"]

# Mở cổng 5000 cho container
EXPOSE 5000