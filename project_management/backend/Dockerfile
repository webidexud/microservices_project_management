FROM node:18-alpine

WORKDIR /app

# Deshabilitar SSL para npm (red corporativa/proxy)
RUN npm config set strict-ssl false

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

EXPOSE 8000

CMD ["npm", "start"]