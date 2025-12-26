# 🖨️ ERP Q-Cube Demo

Sistema de demostración ERP profesional para impresoras térmicas Q-Cube. Desarrollado con React 19, TypeScript y Vite.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white)

## 📋 Descripción

Aplicación de demostración técnica que simula un sistema ERP completo de gestión logística, diseñada específicamente para mostrar las capacidades de las impresoras térmicas Q-Cube en un entorno real.

### ✨ Características Principales

- **Dashboard Ejecutivo**: Estadísticas en tiempo real, alertas de stock bajo
- **Gestión de Inventario**: Control completo de SKUs con categorías y alertas
- **Órdenes de Despacho**: Picking, control de faltantes, múltiples estados
- **Impresión Térmica**: Generación automática de tickets (picking, faltantes, despacho)
- **Gestión de Clientes**: CRUD completo con historial
- **Movimientos de Inventario**: Trazabilidad de entradas, salidas y ajustes
- **Cola de Impresión**: Monitoreo en tiempo real de trabajos

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- npm o yarn  
- Servidor de impresión FastAPI corriendo

### Instalación

\`\`\`bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
\`\`\`

La aplicación estará disponible en \`http://localhost:5173\`

### Configuración

1. Abrir la aplicación en el navegador
2. Ir a **Configuración** en el menú lateral
3. Configurar la URL del servidor de impresión (ej: \`http://192.168.0.50:8080\`)
4. Hacer clic en "Probar Conexión"

## 📄 Documentación

Ver [DOCS.md](./DOCS.md) para documentación completa del sistema.

## 🛠️ Scripts Disponibles

\`\`\`bash
npm run dev      # Servidor de desarrollo (Puerto 5173)
npm run build    # Build de producción
npm run preview  # Preview del build
npm run lint     # Ejecutar ESLint
\`\`\`

## 📝 Licencia

Proyecto de demostración técnica - ONE-POS

---

Desarrollado con ❤️ para demostrar las capacidades de las impresoras térmicas Q-Cube
