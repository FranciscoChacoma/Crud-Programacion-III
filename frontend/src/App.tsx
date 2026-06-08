import { useState, useEffect } from 'react';
import axios from 'axios';

export default function App() {
  const [jugadores, setJugadores] = useState([]);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [idSeleccionado, setIdSeleccionado] = useState(null); // Para saber si estamos editando

  const url = "http://localhost:8080/api/jugadores";

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    const res = await axios.get(url);
    setJugadores(res.data);
  };

  const guardar = async () => {
    if (idSeleccionado) {
      // Si hay un ID, es una MODIFICACIÓN (PUT)
      await axios.put(`${url}/${idSeleccionado}`, { nombre, apellido });
    } else {
      // Si NO hay ID, es un ALTA (POST)
      await axios.post(url, { nombre, apellido });
    }
    limpiar();
    cargar();
  };

  const prepararEdicion = (j: any) => {
    setNombre(j.nombre);
    setApellido(j.apellido);
    setIdSeleccionado(j.id); // Guardamos el ID para saber que estamos editando
  };

  const borrar = async (id: any) => {
    await axios.delete(`${url}/${id}`);
    cargar();
  };

  const limpiar = () => {
    setNombre('');
    setApellido('');
    setIdSeleccionado(null);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Formulario</h2>
      <input placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
      <input placeholder="Apellido" value={apellido} onChange={e => setApellido(e.target.value)} />
      
      <button onClick={guardar}>{idSeleccionado ? 'Actualizar' : 'Guardar'}</button>
      {idSeleccionado && <button onClick={limpiar}>Cancelar</button>}

      <h2>Tabla de Jugadores</h2>
      <table border={1} width="100%">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {jugadores.map((j: any) => (
            <tr key={j.id}>
              <td>{j.nombre}</td>
              <td>{j.apellido}</td>
              <td>
                <button onClick={() => prepararEdicion(j)}>Editar</button>
                <button onClick={() => borrar(j.id)}>Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
