// Tipos del ERP logístico con funcionalidades completas
// Diseño didáctico: claridad y comentarios en español

export type SKU = {
  sku: string;
  nombre: string;
  stock: number;
  ubicacion: string;
  categoria?: string;
  precio?: number;
  stockMinimo?: number;
};

export type OrdenEstado = "CREADA" | "PREPARACION" | "FALTANTE" | "DESPACHADA" | "CANCELADA";

export type OrdenItem = {
  sku: string;
  requerido: number;
  preparado?: number;
};

export type Orden = {
  id: string;
  fecha: number; // timestamp
  estado: OrdenEstado;
  items: OrdenItem[];
  clienteId?: string;
  notas?: string;
  despachada?: number; // timestamp de despacho
};

export type Cliente = {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  fechaRegistro: number;
};

export type MovimientoInventario = {
  id: string;
  fecha: number;
  tipo: "ENTRADA" | "SALIDA" | "AJUSTE";
  sku: string;
  cantidad: number;
  razon: string;
  ordenId?: string;
};

export type PrintJob = {
  id: string;
  fecha: number;
  tipo: string;
  estado: string;
  ordenId?: string;
};

export type ConfiguracionImpresora = {
  url: string;
  nombre: string;
  disponible: boolean;
  ultimaComprobacion?: number;
};
