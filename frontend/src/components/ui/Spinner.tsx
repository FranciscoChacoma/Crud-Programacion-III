export function Spinner({ size = 20 }: { size?: number }) {
  return <span className="spinner" style={{ width: size, height: size }} role="status" aria-label="Cargando" />;
}

export function LoadingBlock() {
  return <div className="loading-block"><Spinner size={28} /></div>;
}
