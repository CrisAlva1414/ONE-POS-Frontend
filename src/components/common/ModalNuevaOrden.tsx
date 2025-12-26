import { useState } from "react";
import type { Orden, SKU, Cliente, OrdenItem } from "../../models/types";

export function ModalNuevaOrden({
  onClose,
  onCreate,
  inventario,
  clientes,
}: {
  onClose: () => void;
  onCreate: (orden: Partial<Orden>) => void;
  inventario: SKU[];
  clientes: Cliente[];
}) {
  const [clienteId, setClienteId] = useState(clientes[0]?.id || "");
  const [notas, setNotas] = useState("");
  const [items, setItems] = useState<OrdenItem[]>([
    { sku: inventario[0]?.sku || "", requerido: 1 },
  ]);

  function agregarItem() {
    setItems([...items, { sku: inventario[0]?.sku || "", requerido: 1 }]);
  }

  function eliminarItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function actualizarItem(index: number, campo: keyof OrdenItem, valor: any) {
    setItems(items.map((item, i) => (i === index ? { ...item, [campo]: valor } : item)));
  }

  function handleCreate() {
    if (items.length === 0) {
      alert("Debe agregar al menos un item");
      return;
    }
    if (items.some(it => !it.sku || it.requerido <= 0)) {
      alert("Complete todos los items correctamente");
      return;
    }

    onCreate({
      clienteId: clienteId || undefined,
      notas: notas || undefined,
      items,
    });
    onClose();
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: 700,
          width: "90%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="card-title" style={{ marginBottom: 24 }}>
          Nueva Orden de Despacho
        </div>

        <div className="form-group">
          <label>Cliente</label>
          <select className="input" value={clienteId} onChange={e => setClienteId(e.target.value)}>
            <option value="">Sin cliente</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Notas</label>
          <input
            className="input"
            placeholder="Notas adicionales sobre la orden..."
            value={notas}
            onChange={e => setNotas(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 12, fontWeight: 600 }}>Items</label>
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 120px 40px",
                gap: 12,
                marginBottom: 12,
                alignItems: "center",
              }}
            >
              <div>
                <select
                  className="input"
                  value={item.sku}
                  onChange={e => actualizarItem(i, "sku", e.target.value)}
                >
                  {inventario.map(s => (
                    <option key={s.sku} value={s.sku}>
                      {s.sku} - {s.nombre} (Stock: {s.stock})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  className="input"
                  type="number"
                  min="1"
                  placeholder="Cant."
                  value={item.requerido}
                  onChange={e => actualizarItem(i, "requerido", Number(e.target.value))}
                />
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => eliminarItem(i)}>
                🗑️
              </button>
            </div>
          ))}
          <button className="btn btn-sm" onClick={agregarItem}>
            ➕ Agregar Item
          </button>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button className="btn btn-primary" onClick={handleCreate}>
            Crear Orden
          </button>
          <button className="btn" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
