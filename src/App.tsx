import { useEffect, useState } from "react";
import "./App.css";
import type { SKU, Orden, OrdenEstado, Cliente, MovimientoInventario } from "./models/types";
import { loadJSON, saveJSON } from "./data/storage";
import { generarPickingList, generarFaltantes, generarTicketDespacho, generarReporteInventario } from "./services/imageGenerator";
import { imprimirPNG, getSalud } from "./services/printer";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { ModalNuevaOrden } from "./components/common/ModalNuevaOrden";
import "./components/layout/layout.css";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Orders from "./pages/Orders";
import Settings from "./pages/Settings";
import Clientes from "./pages/Clientes";
import Movimientos from "./pages/Movimientos";
import ColaImpresion from "./pages/ColaImpresion";

// Claves de almacenamiento
const K_INV = "erp_inventario";
const K_ORD = "erp_ordenes";
const K_CLI = "erp_clientes";
const K_MOV = "erp_movimientos";

function nuevaOrdenId() {
  return `ORD-${Date.now()}`;
}

function evaluarEstado(orden: Orden, inventario: SKU[]): OrdenEstado {
  // Si algún item no tiene stock suficiente -> FALTANTE
  for (const it of orden.items) {
    const sku = inventario.find(s => s.sku === it.sku);
    const stock = sku ? sku.stock : 0;
    if (stock < it.requerido) return "FALTANTE";
  }
  // Si todo disponible -> PREPARACION
  return "PREPARACION";
}

export default function App() {
  // Estado principal
  const [inventario, setInventario] = useState<SKU[]>(() => loadJSON<SKU[]>(K_INV, [
    { sku: "SKU-001", nombre: "Caja chica 10x10cm", stock: 15, ubicacion: "A1", categoria: "Embalaje", precio: 2.5, stockMinimo: 5 },
    { sku: "SKU-002", nombre: "Cinta adhesiva transparente", stock: 8, ubicacion: "B3", categoria: "Adhesivos", precio: 1.8, stockMinimo: 10 },
    { sku: "SKU-003", nombre: "Papel burbuja rollo", stock: 3, ubicacion: "C2", categoria: "Embalaje", precio: 15.0, stockMinimo: 5 },
    { sku: "SKU-004", nombre: "Marcador permanente negro", stock: 25, ubicacion: "D1", categoria: "Oficina", precio: 0.9, stockMinimo: 15 },
    { sku: "SKU-005", nombre: "Etiquetas adhesivas", stock: 50, ubicacion: "A2", categoria: "Oficina", precio: 0.5, stockMinimo: 20 },
  ]));

  const [ordenes, setOrdenes] = useState<Orden[]>(() => loadJSON<Orden[]>(K_ORD, []));
  const [clientes, setClientes] = useState<Cliente[]>(() => loadJSON<Cliente[]>(K_CLI, [
    { id: "CLI-001", nombre: "Distribuidora Central", email: "ventas@distcentral.com", telefono: "+56912345678", direccion: "Av. Principal 123", fechaRegistro: Date.now() - 86400000 * 30 },
    { id: "CLI-002", nombre: "Comercial del Sur", email: "contacto@comsur.cl", telefono: "+56987654321", direccion: "Calle Comercio 456", fechaRegistro: Date.now() - 86400000 * 15 },
  ]));
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>(() => loadJSON<MovimientoInventario[]>(K_MOV, []));
  
  const [salud, setSalud] = useState<string>("-");
  const [active, setActive] = useState("dashboard");
  const [loadingPrint, setLoadingPrint] = useState(false);
  const [mostrarModalOrden, setMostrarModalOrden] = useState(false);

  // Persistencia
  useEffect(() => saveJSON(K_INV, inventario), [inventario]);
  useEffect(() => saveJSON(K_ORD, ordenes), [ordenes]);
  useEffect(() => saveJSON(K_CLI, clientes), [clientes]);
  useEffect(() => saveJSON(K_MOV, movimientos), [movimientos]);

  // Consultar salud del servidor de impresión
  useEffect(() => {
    const checkSalud = async () => {
      try {
        const data = await getSalud();
        if (data.impresora_disponible) {
          setSalud("OK");
        } else {
          setSalud("sin impresora");
        }
      } catch {
        setSalud("sin conexión");
      }
    };
    checkSalud();
    const interval = setInterval(checkSalud, 5000);
    return () => clearInterval(interval);
  }, []);

  // Crear orden demo o desde modal
  function crearOrdenDemo() {
    setMostrarModalOrden(true);
  }

  function crearOrden(data: Partial<Orden>) {
    const nueva: Orden = {
      id: nuevaOrdenId(),
      fecha: Date.now(),
      estado: "CREADA",
      items: data.items || [],
      clienteId: data.clienteId,
      notas: data.notas,
    };
    nueva.estado = evaluarEstado(nueva, inventario);
    setOrdenes(prev => [nueva, ...prev]);
    alert("Orden creada: " + nueva.id);
  }

  // Despachar: descontar stock y cambiar estado
  function despachar(orden: Orden) {
    if (!confirm("¿Confirmar despacho? Esto descontará stock del inventario.")) return;
    
    // Verificar stock disponible
    for (const it of orden.items) {
      const sku = inventario.find(s => s.sku === it.sku);
      const stock = sku ? sku.stock : 0;
      if (stock < it.requerido) {
        alert(`Stock insuficiente para ${it.sku}. Disponible: ${stock}, Requerido: ${it.requerido}`);
        return;
      }
    }

    // Descontar stock
    setInventario(prevInv => {
      const copia = [...prevInv];
      for (const it of orden.items) {
        const idx = copia.findIndex(s => s.sku === it.sku);
        if (idx >= 0) {
          copia[idx] = { ...copia[idx], stock: Math.max(0, copia[idx].stock - it.requerido) };
        }
      }
      return copia;
    });

    // Registrar movimientos
    for (const it of orden.items) {
      const mov: MovimientoInventario = {
        id: `MOV-${Date.now()}-${it.sku}`,
        fecha: Date.now(),
        tipo: "SALIDA",
        sku: it.sku,
        cantidad: it.requerido,
        razon: `Despacho de orden ${orden.id}`,
        ordenId: orden.id,
      };
      setMovimientos(prev => [mov, ...prev]);
    }

    // Actualizar estado de orden
    setOrdenes(prevOrd => 
      prevOrd.map(o => (o.id === orden.id ? { ...o, estado: "DESPACHADA", despachada: Date.now() } : o))
    );

    alert("Orden despachada exitosamente");
  }

  // Cancelar orden
  function cancelarOrden(orden: Orden) {
    if (!confirm("¿Cancelar esta orden?")) return;
    setOrdenes(prevOrd => 
      prevOrd.map(o => (o.id === orden.id ? { ...o, estado: "CANCELADA" } : o))
    );
  }

  // Generar y enviar documento a impresión
  async function imprimir(tipo: "picking" | "faltantes" | "despacho", orden: Orden) {
    try {
      setLoadingPrint(true);
      
      // Generar el documento
      let blob: Blob;
      if (tipo === "picking") blob = await generarPickingList(orden, inventario);
      else if (tipo === "faltantes") blob = await generarFaltantes(orden, inventario);
      else blob = await generarTicketDespacho(orden);

      // Enviar a impresión
      const result = await imprimirPNG(blob, `${orden.id}-${tipo}.png`);
      
      console.log("Documento enviado:", result);
      alert(`✓ Documento ${tipo} enviado a la cola de impresión correctamente`);
    } catch (e) {
      console.error("Error al imprimir:", e);
      alert("❌ Error al imprimir: " + (e as Error).message);
    } finally {
      setLoadingPrint(false);
    }
  }

  // Imprimir reporte de inventario
  async function imprimirInventario() {
    try {
      setLoadingPrint(true);
      const blob = await generarReporteInventario(inventario);
      const result = await imprimirPNG(blob, `inventario-${Date.now()}.png`);
      
      console.log("Reporte enviado:", result);
      alert("✓ Reporte de inventario enviado a la cola de impresión");
    } catch (e) {
      console.error("Error al imprimir:", e);
      alert("❌ Error al imprimir: " + (e as Error).message);
    } finally {
      setLoadingPrint(false);
    }
  }

  const items = [
    { key: "dashboard", label: "Dashboard", icon: "📊", section: "Principal" },
    { key: "orders", label: "Órdenes", icon: "📦", section: "Operaciones" },
    { key: "inventory", label: "Inventario", icon: "📋", section: "Operaciones" },
    { key: "movimientos", label: "Movimientos", icon: "📈", section: "Operaciones" },
    { key: "clientes", label: "Clientes", icon: "👥", section: "Gestión" },
    { key: "cola", label: "Cola de Impresión", icon: "🖨️", section: "Sistema" },
    { key: "settings", label: "Configuración", icon: "⚙️", section: "Sistema" },
  ];

  return (
    <div className="app-shell">
      <Sidebar items={items} active={active} onSelect={setActive} />
      <Header title="ERP Q-Cube Demo" status={salud} />
      <main className="content">
        {active === "dashboard" && (
          <Dashboard 
            ordenes={ordenes} 
            inventario={inventario} 
            clientes={clientes}
            onCrearOrden={crearOrdenDemo}
          />
        )}
        {active === "inventory" && (
          <Inventory 
            inventario={inventario} 
            setInventario={setInventario}
            onImprimirInventario={imprimirInventario}
          />
        )}
        {active === "orders" && (
          <>
            <div style={{ marginBottom: 16 }}>
              <button className="btn btn-primary" onClick={crearOrdenDemo}>
                ➕ Nueva Orden
              </button>
              {loadingPrint && <span style={{ marginLeft: 12 }} className="loader" />}
            </div>
            <Orders 
              ordenes={ordenes} 
              inventario={inventario} 
              clientes={clientes}
              onImprimir={imprimir} 
              onDespachar={despachar}
              onCancelar={cancelarOrden}
            />
          </>
        )}
        {active === "clientes" && (
          <Clientes clientes={clientes} setClientes={setClientes} />
        )}
        {active === "movimientos" && (
          <Movimientos 
            movimientos={movimientos} 
            inventario={inventario}
            setMovimientos={setMovimientos}
            setInventario={setInventario}
          />
        )}
        {active === "cola" && (
          <ColaImpresion />
        )}
        {active === "settings" && (
          <Settings />
        )}
      </main>

      {/* Modal para crear nueva orden */}
      {mostrarModalOrden && (
        <ModalNuevaOrden
          onClose={() => setMostrarModalOrden(false)}
          onCreate={crearOrden}
          inventario={inventario}
          clientes={clientes}
        />
      )}
    </div>
  );
}
