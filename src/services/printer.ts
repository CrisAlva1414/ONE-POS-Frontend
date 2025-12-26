// Servicio de impresión: comunica con FastAPI local
// Requisito: enviar imágenes PNG como multipart/form-data

import { loadConfig } from "./config";

function apiBase() {
  return loadConfig().printerBaseUrl;
}

// Verificar disponibilidad del servidor y la impresora
export async function getSalud() {
  try {
    const res = await fetch(`${apiBase()}/salud`);
    if (!res.ok) throw new Error(`Servidor de impresión respondió ${res.status}`);
    const data = await res.json();
    return data;
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : "No se pudo conectar con el servidor de impresión");
  }
}

export async function getEstado() {
  try {
    const res = await fetch(`${apiBase()}/estado`);
    if (!res.ok) throw new Error(`Error consultando estado (${res.status})`);
    const data = await res.json();
    return data;
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : "Error consultando estado");
  }
}

export async function getCola() {
  try {
    const res = await fetch(`${apiBase()}/cola`);
    if (!res.ok) throw new Error(`Error consultando cola (${res.status})`);
    const data = await res.json();
    return data;
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : "Error consultando cola");
  }
}

// Convierte un Blob/PNG a File si hiciera falta
function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type || "image/png" });
}

// Enviar PNG (Blob o File) a imprimir — usar endpoint /imprimir-imagen del backend
export async function imprimirPNG(input: Blob | File, filename = "documento.png") {
  const file = input instanceof File ? input : blobToFile(input, filename);
  const formData = new FormData();
  formData.append("archivo", file);

  try {
    const res = await fetch(`${apiBase()}/imprimir-imagen`, {
      method: "POST",
      body: formData,
    });

    // Si la respuesta es exitosa (2xx), consideramos que se imprimió correctamente
    if (res.ok) {
      // Intentar parsear JSON, pero si no hay contenido o falla, devolver objeto de éxito
      try {
        const json = await res.json();
        return json;
      } catch {
        // Si no hay JSON válido pero el status es OK, la impresión fue exitosa
        return { ok: true, mensaje: "Documento enviado a imprimir" };
      }
    }

    // Si la respuesta no es OK, intentar obtener el mensaje de error
    const json = await res.json().catch(() => ({}));
    throw new Error(json.detail || `Error en la impresión (${res.status})`);
    
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : "Error enviando a impresión");
  }
}
