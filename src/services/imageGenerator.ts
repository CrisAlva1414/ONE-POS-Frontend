// Generación de documentos como PNG usando Canvas
// Enfoque: impresora térmica 58mm (~384px a 203dpi), monoespaciado

import type { Orden, SKU } from "../models/types";

// Configuración básica del "ticket" térmico
const WIDTH = 384; // px
const PADDING = 12; // px
const LINE_HEIGHT = 22; // px
const FONT = "16px monospace"; // monoespaciada

function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
  ctx.fillText(text, x, y);
}

function drawHeader(ctx: CanvasRenderingContext2D, title: string, y: number) {
  ctx.font = "bold 18px monospace";
  drawText(ctx, title, PADDING, y);
  ctx.font = FONT;
  return y + LINE_HEIGHT;
}

function measureLines(texts: string[]) {
  return texts.length * LINE_HEIGHT + PADDING * 2;
}

// Construye un canvas con alto dinámico según contenido
function createCanvas(height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  // Fondo blanco y texto negro
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000000";
  ctx.font = FONT;
  return { canvas, ctx };
}

// Genera Picking List
export async function generarPickingList(orden: Orden, inventario: SKU[]): Promise<Blob> {
  const lines: string[] = [];
  lines.push(`Orden: ${orden.id}`);
  lines.push(`Estado: ${orden.estado}`);
  lines.push(`Fecha: ${new Date(orden.fecha).toLocaleString()}`);
  lines.push("");
  lines.push("Items:");

  for (const it of orden.items) {
    const sku = inventario.find(s => s.sku === it.sku);
    const stock = sku ? sku.stock : 0;
    lines.push(`${it.sku} req:${it.requerido} stock:${stock}`);
  }

  const height = measureLines(["Picking List", ...lines]) + PADDING;
  const { canvas, ctx } = createCanvas(height);

  let y = PADDING + LINE_HEIGHT;
  y = drawHeader(ctx, "Picking List", y);
  for (const line of lines) {
    drawText(ctx, line, PADDING, y);
    y += LINE_HEIGHT;
  }

  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("No se pudo generar PNG");
  return blob;
}

// Genera Reporte de Faltantes
export async function generarFaltantes(orden: Orden, inventario: SKU[]): Promise<Blob> {
  const lines: string[] = [];
  lines.push(`Orden: ${orden.id}`);
  lines.push(`Estado: ${orden.estado}`);
  lines.push("");
  lines.push("Faltantes:");

  for (const it of orden.items) {
    const sku = inventario.find(s => s.sku === it.sku);
    const stock = sku ? sku.stock : 0;
    if (stock < it.requerido) {
      lines.push(`${it.sku} req:${it.requerido} stock:${stock} -> FALTA:${it.requerido - stock}`);
    }
  }

  const height = measureLines(["Reporte de Faltantes", ...lines]) + PADDING;
  const { canvas, ctx } = createCanvas(height);

  let y = PADDING + LINE_HEIGHT;
  y = drawHeader(ctx, "Reporte de Faltantes", y);
  for (const line of lines) {
    drawText(ctx, line, PADDING, y);
    y += LINE_HEIGHT;
  }

  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("No se pudo generar PNG");
  return blob;
}

// Genera Ticket de Despacho
export async function generarTicketDespacho(orden: Orden): Promise<Blob> {
  const lines: string[] = [];
  lines.push(`Orden: ${orden.id}`);
  lines.push("Estado: DESPACHADA");
  lines.push("");
  lines.push("Despacho:");

  for (const it of orden.items) {
    lines.push(`${it.sku} cant:${it.requerido}`);
  }

  const height = measureLines(["Ticket de Despacho", ...lines]) + PADDING;
  const { canvas, ctx } = createCanvas(height);

  let y = PADDING + LINE_HEIGHT;
  y = drawHeader(ctx, "Ticket de Despacho", y);
  for (const line of lines) {
    drawText(ctx, line, PADDING, y);
    y += LINE_HEIGHT;
  }

  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("No se pudo generar PNG");
  return blob;
}

// Genera Reporte de Inventario Completo
export async function generarReporteInventario(inventario: SKU[]): Promise<Blob> {
  const lines: string[] = [];
  lines.push("REPORTE DE INVENTARIO");
  lines.push(`Fecha: ${new Date().toLocaleDateString()}`);
  lines.push("");
  lines.push(`Total SKUs: ${inventario.length}`);
  lines.push("");

  for (const sku of inventario) {
    lines.push(`${sku.sku} - ${sku.nombre}`);
    lines.push(`Stock: ${sku.stock} | Ubic: ${sku.ubicacion}`);
    if (sku.stockMinimo && sku.stock < sku.stockMinimo) {
      lines.push(`ALERTA: Stock bajo minimo (${sku.stockMinimo})`);
    }
    lines.push("");
  }

  const height = measureLines(lines) + PADDING * 2;
  const { canvas, ctx } = createCanvas(height);

  let y = PADDING + LINE_HEIGHT;
  for (const line of lines) {
    if (line.startsWith("REPORTE")) {
      ctx.font = "bold 18px monospace";
    } else if (line.startsWith("ALERTA")) {
      ctx.font = "bold 16px monospace";
    } else {
      ctx.font = FONT;
    }
    drawText(ctx, line, PADDING, y);
    y += LINE_HEIGHT;
  }

  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("No se pudo generar PNG");
  return blob;
}
