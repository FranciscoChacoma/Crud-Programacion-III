import { useCallback, useEffect, useState } from 'react';
import { addCourt, createVenue, deleteCourt, deleteVenue, getVenues } from '../api/venues';
import { useAuth } from '../context/AuthContext';
import { Alert, Button, Card, EmptyState, Icon, IconButton, Input, LoadingBlock, useFeedback } from './ui';
import type { Venue } from '../types';

interface Props {
  /** Si se pasa, cada sede muestra un interruptor "Usar en este torneo". */
  selectedIds?: string[];
  onToggle?: (venue: Venue, selected: boolean) => void;
  /** Avisa que cambiaron canchas o sedes (para refrescar contadores). */
  onChanged?: (venues: Venue[]) => void;
}

function CourtAdder({ venue, onAdded }: { venue: Venue; onAdded: (v: Venue) => void }) {
  const { token } = useAuth();
  const { toast } = useFeedback();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const suggestion = `Cancha ${venue.courts.length + 1}`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      onAdded(await addCourt(venue.id, name.trim() || suggestion, token));
      setName('');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error al agregar la cancha', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="input-group court-adder" onSubmit={submit}>
      <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder={suggestion}
        aria-label={`Nueva cancha en ${venue.name}`} />
      <Button type="submit" variant="secondary" icon="plus" loading={saving}>Cancha</Button>
    </form>
  );
}

export function VenueManager({ selectedIds, onToggle, onChanged }: Props) {
  const { token } = useAuth();
  const { confirm, toast } = useFeedback();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const update = useCallback((next: Venue[]) => {
    setVenues(next);
    onChanged?.(next);
  }, [onChanged]);

  useEffect(() => {
    if (!token) return;
    getVenues(token).then(setVenues)
      .catch(err => toast(err instanceof Error ? err.message : 'Error al obtener las sedes', 'error'))
      .finally(() => setLoading(false));
  }, [token, toast]);

  const replace = (v: Venue) => update(venues.map(x => x.id === v.id ? v : x));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !name.trim()) return;
    setError('');
    setCreating(true);
    try {
      const v = await createVenue(name.trim(), address.trim(), token);
      update([...venues, v].sort((a, b) => a.name.localeCompare(b.name)));
      setName('');
      setAddress('');
      toast(`Sede "${v.name}" creada. Agregale sus canchas.`);
      onToggle?.(v, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la sede');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteVenue = async (v: Venue) => {
    if (!token) return;
    const ok = await confirm({ title: `Eliminar la sede "${v.name}"`, message: 'Se eliminan también sus canchas.', confirmLabel: 'Eliminar sede' });
    if (!ok) return;
    try {
      await deleteVenue(v.id, token);
      update(venues.filter(x => x.id !== v.id));
      toast('Sede eliminada');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error al eliminar la sede', 'error');
    }
  };

  const handleDeleteCourt = async (v: Venue, courtId: string) => {
    if (!token) return;
    try {
      replace(await deleteCourt(v.id, courtId, token));
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error al eliminar la cancha', 'error');
    }
  };

  if (loading) return <LoadingBlock />;

  return (
    <div className="venues">
      <Card>
        <form className="card-body venue-create" onSubmit={handleCreate}>
          <Input label="Nueva sede" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Padel Maipú" required />
          <Input label="Dirección (opcional)" value={address} onChange={e => setAddress(e.target.value)} placeholder="Ej: Av. San Martín 1234" />
          <Button type="submit" icon="plus" loading={creating}>Crear sede</Button>
        </form>
        {error && <div style={{ padding: '0 24px 20px' }}><Alert>{error}</Alert></div>}
      </Card>

      {venues.length === 0 ? (
        <Card>
          <EmptyState icon="building" title="Todavía no cargaste sedes"
            description="Creá una sede (el club donde se juega) y agregale sus canchas. Las sedes quedan guardadas para tus próximos torneos." />
        </Card>
      ) : venues.map(v => {
        const selected = selectedIds?.includes(v.id) ?? false;
        return (
          <Card key={v.id} className={`venue${selectedIds && !selected ? ' venue-off' : ''}`}>
            <div className="venue-head">
              <span className="venue-icon"><Icon name="building" size={18} /></span>
              <div className="venue-title">
                <div className="card-title">{v.name}</div>
                <div className="card-subtitle">
                  {v.address && <><Icon name="mapPin" size={12} /> {v.address} · </>}
                  {v.courts.length} cancha{v.courts.length === 1 ? '' : 's'}
                </div>
              </div>
              {selectedIds && onToggle && (
                <label className={`switch${selected ? ' on' : ''}`}>
                  <input type="checkbox" checked={selected} onChange={e => onToggle(v, e.target.checked)} />
                  <span className="switch-track"><span className="switch-thumb" /></span>
                  <span>{selected ? 'Se usa en este torneo' : 'No se usa'}</span>
                </label>
              )}
              <IconButton icon="trash" label="Eliminar sede" danger onClick={() => handleDeleteVenue(v)} />
            </div>
            <div className="venue-courts">
              {v.courts.map(c => (
                <span key={c.id} className="court-chip">
                  <Icon name="court" size={14} />
                  {c.name}
                  <button type="button" aria-label={`Eliminar ${c.name}`} title="Eliminar cancha"
                    onClick={() => handleDeleteCourt(v, c.id)}>
                    <Icon name="x" size={12} />
                  </button>
                </span>
              ))}
              <CourtAdder venue={v} onAdded={replace} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
