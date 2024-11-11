FROM node:23
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=optional
COPY . .
ENV PORT=5173
EXPOSE 5173
CMD ["npm", "run", "dev"]