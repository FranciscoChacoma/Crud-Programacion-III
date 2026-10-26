import { useState } from 'react';
import { createPlayer, updatePlayer } from '../api/players';
import { Alert, Button, Input, Modal, useFeedback } from './ui';
import type { Player, PlayerFormData } from '../types';

interface Props {
  player?: Player;
  onClose: () => void;
  onSaved: () => void;
}

export function PlayerFormModal({ player, onClose, onSaved }: Props) {
  const { toast } = useFeedback();
  const [form, setForm] = useState<PlayerFormData>({
    name: player?.name ?? '',
    lastName: player?.lastName ?? '',
    email: player?.email ?? '',
    phone: player?.phone ?? '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (field: keyof PlayerFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (player) {
        await updatePlayer(player.id, form);
        toast('Jugador actualizado');
      } else {
        await createPlayer(form);
        toast('Jugador creado');
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el jugador');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={player ? 'Editar jugador' : 'Nuevo jugador'}
      description="Los datos de contacto se usan para avisarle sus próximos partidos."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="player-form" loading={saving}>{player ? 'Guardar cambios' : 'Crear jugador'}</Button>
        </>
      }
    >
      <form id="player-form" className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <Input label="Nombre" value={form.name} onChange={set('name')} required autoFocus />
          <Input label="Apellido" value={form.lastName} onChange={set('lastName')} required />
        </div>
        <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="jugador@mail.com" hint="Opcional" />
        <Input label="Teléfono" type="tel" value={form.phone} onChange={set('phone')} placeholder="+54 9 261 555 1234" hint="Opcional" />
        {error && <Alert>{error}</Alert>}
      </form>
    </Modal>
  );
}
