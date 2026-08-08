# 💻 InventorySystemFront

Frontend del Sistema de Gestión de Inventarios desarrollado con **Angular**, **TypeScript** y **Tailwind CSS v4**.

---

## 📋 Descripción del Proyecto

`InventorySystemFront` es una aplicación web moderna, interactiva y con diseño responsive para el control y administración de inventarios. Proporciona una interfaz intuitiva para interactuar con la API REST de `InventorySystemBack`.

### ✨ Características Principales

- **Panel de Control (Dashboard)**: Métricas clave en tiempo real (total de productos, alertas de stock bajo, accesos rápidos a movimientos).
- **Gestión de Productos**: Alta, edición, eliminación lógica, búsqueda y filtrado de productos con control de precios y stock.
- **Movimientos de Inventario**: Registro sencillo de Entradas y Salidas de inventario con actualización automática del stock.
- **Gestión de Catálogos**: Administración de Categorías, Unidades de Medida y Proveedores.
- **Reportes en PDF**: Generación y visualización previa de reportes de inventario y movimientos.
- **Autenticación Completa**: Inicio de sesión tradicional, registro de usuarios e integración con Google Sign-In.
- **Diseño Moderno & Responsive**: Estilizado con Tailwind CSS v4, componentes accesibles y micro-interacciones.

---

## 🛠️ Tecnologías Utilizadas

- **Framework**: Angular 22 (Standalone Components, Signals, Reactive Forms)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS v4 / PostCSS
- **Manejo de Estado / Reactividad**: RxJS & Angular Signals
- **Pruebas Unitarias**: Vitest / Angular Testing Utilities
- **Servidor Dev / Proxy**: Angular CLI Development Server con `proxy.conf.json`

---

## 🏗️ Estructura del Proyecto

```text
InventorySystemFront/
├── public/                 # Archivos estáticos e imágenes.
├── src/
│   ├── app/
│   │   ├── core/           # Servicios core, guards de autenticación, interceptores HTTP.
│   │   ├── features/       # Módulos y vistas principales de la aplicación:
│   │   │   ├── auth/       # Pantallas de Login, Registro e integración con Google Auth.
│   │   │   ├── dashboard/  # Vista principal con métricas y alertas.
│   │   │   └── inventory/  # Control de productos, catálogos, movimientos y reportes.
│   │   └── shared/         # Componentes reutilizables, modales, pipes y directivas.
│   ├── app.config.ts       # Configuración global de providers (HttpClient, Router).
│   ├── app.routes.ts       # Definición de rutas y protección con AuthGuard.
│   └── app.css             # Estilos globales y directivas de Tailwind CSS.
├── proxy.conf.json         # Configuración de proxy para redirigir peticiones /api al Backend.
├── angular.json            # Configuración del proyecto Angular CLI.
└── package.json            # Scripts de NPM y dependencias del proyecto.
```

---

## ⚙️ Requisitos Previos

Asegúrate de contar con los siguientes elementos instalados en tu sistema:

- [Node.js](https://nodejs.org/) (versión 18.x, 20.x o superior recomendada)
- `npm` (incluido con Node.js)
- [Angular CLI](https://angular.dev/tools/cli) (opcional, instalable vía `npm install -g @angular/cli`)

---

## 🚀 Configuración y Ejecución Detallada

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Jcer07/InventorySystemFront.git
cd InventorySystemFront
```

### 2. Instalar Dependencias

Ejecuta el siguiente comando para instalar las librerías necesarias:

```bash
npm install
```

### 3. Configuración de Proxy (Conexión con el Backend)

Para evitar problemas de CORS durante el desarrollo local, el proyecto utiliza un proxy configurado en `proxy.conf.json`:

```json
{
  "/api": {
    "target": "https://localhost:7015",
    "secure": false,
    "changeOrigin": true
  }
}
```

> **Nota**: Si tu backend `InventorySystemBack` se ejecuta en un puerto diferente, actualiza la propiedad `"target"` en `proxy.conf.json`.

### 4. Iniciar el Servidor de Desarrollo (HTTPS Obligatorio)

> 🔒 **Importante**: La aplicación maneja la autenticación y sesiones de usuario mediante **cookies seguras** (`SameSite` / `HttpOnly`). Por esta razón, el servidor de desarrollo **debe ejecutarse obligatoriamente utilizando el protocolo HTTPS** (`https://localhost:4200`) para que las cookies de sesión se transmitan y almacenen correctamente entre el navegador y el servidor.

Ejecuta:

```bash
npm start
```
o
```bash
ng serve --ssl
```

Una vez compilado, la aplicación estará disponible en:

👉 **[https://localhost:4200/](https://localhost:4200/)**

La aplicación se recargará automáticamente si realizas cambios en los archivos fuente.

---

## 🔑 Credenciales de Prueba

Para ingresar al sistema utilizando los datos generados por el backend:

- **Usuario**: `admin@admin.com`
- **Contraseña**: `Admin123`
