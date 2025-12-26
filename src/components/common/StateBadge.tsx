import "../layout/layout.css";
import type { OrdenEstado } from "../../models/types";

export function StateBadge({ estado }: { estado: OrdenEstado }){
  return <span className={`state state-${estado}`}>{estado}</span>;
}
