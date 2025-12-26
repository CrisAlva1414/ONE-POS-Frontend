# ERP Q-Cube Demo - Documentación Completa

Sistema de demostración ERP para impresoras térmicas Q-Cube. Desarrollado con React, TypeScript y Vite.

## 🎯 Propósito

Este proyecto es una aplicación de demostración técnica diseñada para mostrar las capacidades de las impresoras térmicas Q-Cube en un entorno ERP real. Simula un sistema completo de gestión logística con funcionalidades de:

- **Gestión de Inventario**: Control de stock con alertas automáticas
- **Órdenes de Despacho**: Creación, seguimiento y control de órdenes
- **Impresión Térmica**: Generación automática de tickets de picking, faltantes y despacho
- **Gestión de Clientes**: Base de datos de clientes
- **Movimientos de Inventario**: Historial completo de entradas, salidas y ajustes
- **Monitoreo de Impresión**: Cola de trabajos en tiempo real

## 🏗️ Arquitectura

### Frontend (Este proyecto)
- **React 19** con TypeScript
- **Vite** como build tool
- **CSS Modules** para estilos
- Diseño responsive optimizado para escritorio

### Backend (Servidor de Impresión)
- **FastAPI** (Python) - Ver proyecto `ONE-POS-Utilidades`
- Endpoints REST para impresión
- Soporte para impresoras USB y Windows
- Cola de trabajos con estado

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Servidor de impresión corriendo (ONE-POS-Utilidades)

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

### Configuración

1. Acceder a la aplicación en `http://localhost:5173`
2. Ir a **Configuración** en el menú lateral
3. Configurar la URL del servidor de impresión (ej: `http://192.168.0.50:8080`)
4. Probar conexión con el botón "Probar Conexión"

## 📋 Funcionalidades Principales

### Dashboard
- Estadísticas en tiempo real
- Alertas de stock bajo
- Resumen de órdenes pendientes y despachadas
- Acciones rápidas

### Inventario
- Gestión completa de SKUs
- Control de stock mínimo
- Categorización de productos
- Precios y ubicaciones
- Búsqueda y filtros
- Impresión de reporte completo

### Órdenes de Despacho
- Creación de órdenes con múltiples items
- Asignación de clientes
- Estados: CREADA, PREPARACION, FALTANTE, DESPACHADA, CANCELADA
- Vista expandible con detalle de items
- Validación automática de stock
- Impresión de documentos:
  - **Picking List**: Lista para preparar la orden
  - **Faltantes**: Reporte de items sin stock
  - **Ticket de Despacho**: Comprobante final

### Clientes
- Registro de clientes con datos completos
- Historial de órdenes por cliente
- Edición y eliminación

### Movimientos de Inventario
- Registro de entradas (compras, devoluciones)
- Registro de salidas (ventas, pérdidas)
- Ajustes de inventario
- Trazabilidad completa
- Vinculación con órdenes

### Cola de Impresión
- Visualización en tiempo real
- Trabajos pendientes
- Historial de impresos
- Detección de errores
- Actualización automática cada 3 segundos

### Configuración
- URL del servidor de impresión
- Test de conectividad
- Estado de la impresora
- Información del sistema

## 🖨️ Integración con Impresora

El sistema se comunica con un servidor FastAPI que gestiona la impresión térmica:

### Endpoints utilizados:
- `GET /salud` - Estado del servidor y disponibilidad de impresora
- `GET /estado` - Configuración de la impresora
- `GET /cola` - Cola de trabajos
- `POST /imprimir-imagen` - Enviar documento a imprimir

### Formato de Documentos
Los documentos se generan como imágenes PNG de 384px de ancho (58mm a 203dpi) usando Canvas API, optimizados para impresoras térmicas.

## 🎨 Diseño UI/UX

- **Tema oscuro** profesional tipo ERP
- **Grid responsivo** que aprovecha todo el ancho de pantalla
- **Componentes reutilizables** y modulares
- **Feedback visual** inmediato en todas las acciones
- **Estados de carga** y manejo de errores
- **Persistencia local** con localStorage

## 📦 Estructura del Proyecto

```
src/
├── components/
│   ├── common/          # Componentes reutilizables
│   │   ├── StateBadge.tsx
│   │   └── ModalNuevaOrden.tsx
│   └── layout/          # Componentes de layout
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── layout.css
├── pages/               # Páginas principales
│   ├── Dashboard.tsx
│   ├── Inventory.tsx
│   ├── Orders.tsx
│   ├── Clientes.tsx
│   ├── Movimientos.tsx
│   ├── ColaImpresion.tsx
│   └── Settings.tsx
├── services/            # Lógica de negocio
│   ├── printer.ts       # Comunicación con servidor
│   ├── imageGenerator.ts # Generación de tickets
│   └── config.ts        # Configuración
├── models/              # Tipos TypeScript
│   └── types.ts
├── data/                # Persistencia local
│   └── storage.ts
└── App.tsx              # Componente principal
```

## 🔧 Desarrollo

### Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Preview del build
npm run lint     # Linter
```

### Datos de Demostración

El sistema incluye datos de ejemplo para facilitar las demos:
- 5 SKUs de productos
- 2 clientes registrados
- Órdenes generadas automáticamente

Todos los datos se persisten en localStorage del navegador.

## 🎯 Uso en Demos

### Preparación
1. Asegurar que el servidor de impresión esté corriendo
2. Verificar conexión en Configuración
3. Revisar que la impresora esté disponible

### Flujo de Demo Típico

1. **Mostrar Dashboard**
   - Explicar estadísticas en tiempo real
   - Mostrar alertas de stock bajo

2. **Gestión de Inventario**
   - Agregar nuevos productos
   - Ajustar stock
   - Imprimir reporte de inventario

3. **Crear Orden**
   - Usar el botón "Nueva Orden"
   - Seleccionar cliente
   - Agregar items
   - Mostrar validación automática de stock

4. **Proceso de Picking**
   - Imprimir lista de picking
   - Si hay faltantes, mostrar reporte

5. **Despacho**
   - Confirmar despacho (descuenta stock)
   - Imprimir ticket de despacho
   - Mostrar actualización en Dashboard

6. **Monitoreo**
   - Ver cola de impresión
   - Mostrar trabajos en tiempo real

## 📄 Licencia

Proyecto de demostración técnica para ONE-POS.

## 🤝 Soporte

Para soporte técnico o consultas sobre las impresoras Q-Cube, contactar al equipo de ONE-POS.
