# Etapa 1: Construcción
ARG NODE_VERSION=20.11.0
FROM node:${NODE_VERSION}-alpine AS build

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json para instalar dependencias
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

# Copiar el resto de los archivos fuente
COPY . .

# Etapa 2: Producción
FROM node:${NODE_VERSION}-alpine

# Usar entorno de producción por defecto
ENV NODE_ENV production

# Crear directorio de trabajo
WORKDIR /app

# Copiar solo los archivos necesarios desde la etapa de construcción
COPY --from=build /app ./

# Ejecutar la aplicación como un usuario no root
USER node

# Exponer el puerto que la aplicación usa
EXPOSE 3001

# Ejecutar la aplicación
CMD ["node", "server.js"]
