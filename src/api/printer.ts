// Mantener compatibilidad: wrappers que delegan al nuevo servicio
import { getSalud as _getSalud, getCola as _getCola, imprimirPNG as _imprimirPNG } from "../services/printer";

export async function getSalud() {
  return _getSalud();
}

export async function getCola() {
  return _getCola();
}

// Wrapper para interfaz previa que esperaba File (PDF)
// Ahora enviamos PNG. Si se recibe File, se delega igual (debe ser image/png)
export async function imprimirPDF(file: File) {
  return _imprimirPNG(file, file.name || "documento.png");
}
