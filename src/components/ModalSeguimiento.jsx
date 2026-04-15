import { useState, useEffect } from "react";
import { listarEstudiantes } from "../api/estudiantes";
import { listarTutores, crearTutorAPI } from "../api/tutores";
import { listarDocentes } from "../api/docentes";

export default function ModalSeguimiento({
  abierto,
  cerrar,
  guardar,
  seguimientoEditar
}) {

  const [estudiantes, setEstudiantes] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [docentes, setDocentes] = useState([]);

  /* =========================
     MODO TUTOR
  ========================= */
  const [modoTutor, setModoTutor] = useState("EXISTENTE");

  /* =========================
     FORM SEGUIMIENTO
  ========================= */
  const [form, setForm] = useState({
    estudiante_id: "",
    tutor_id: "",
    tema: "",
    estado: "En desarrollo",
    observaciones: ""
  });

  /* =========================
     FORM NUEVO TUTOR
  ========================= */
  const [tutorNuevo, setTutorNuevo] = useState({
    nombre_completo: "",
    ci: "",
    correo: "",
    celular: "",
    tipo: "EXTERNO",
    docente_id: ""
  });

  /* =========================
     CARGAR DATOS
  ========================= */
  useEffect(() => {
    if (!abierto) return;

    const cargar = async () => {
      setEstudiantes(await listarEstudiantes());
      setTutores(await listarTutores());
      setDocentes(await listarDocentes());
    };

    cargar();
  }, [abierto]);

  /* =========================
     EDITAR
  ========================= */
  useEffect(() => {
    if (seguimientoEditar) {
      setForm(seguimientoEditar);
      setModoTutor("EXISTENTE");
    }
  }, [seguimientoEditar]);

  /* =========================
     HANDLERS
  ========================= */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleTutorChange = (e) =>
    setTutorNuevo({ ...tutorNuevo, [e.target.name]: e.target.value });

  /* =========================
     AUTOCOMPLETAR DOCENTE
  ========================= */
  const seleccionarDocente = (id) => {

    const docente = docentes.find(d => d.id == id);
    if (!docente) return;

    setTutorNuevo({
      ...tutorNuevo,
      docente_id: docente.id,
      nombre_completo: docente.nombre_completo,
      ci: docente.ci,
      correo: docente.correo || "",
      celular: docente.celular || ""
    });
  };

  /* =========================
     GUARDAR
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    let tutor_id = form.tutor_id;

    if (modoTutor === "NUEVO") {
      const resp = await crearTutorAPI(tutorNuevo);
      tutor_id = resp.id;
    }

    await guardar({
      ...form,
      tutor_id
    });
  };

  if (!abierto) return null;

  return (
    <div className="modal-overlay">
      <div
        className="modal"
        style={{
          maxHeight: "85vh",
          overflowY: "auto",
          paddingRight: 8,
          width:"400px"
        }}
      >

        <h3>Seguimiento Académico</h3>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14
          }}
        >

          {/* ================= ESTUDIANTE ================= */}
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            <label>Estudiante</label>
            <select
              name="estudiante_id"
              value={form.estudiante_id}
              onChange={handleChange}
              required
              style={{ width:"100%" }}
            >
              <option value="">Seleccione</option>
              {estudiantes.map(e => (
                <option key={e.id} value={e.id}>
                  {e.nombre_completo}
                </option>
              ))}
            </select>
          </div>

          {/* ================= TUTOR ================= */}
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: 12
            }}
          >
            <label style={{ fontWeight:600 }}>Tutor</label>

            <div style={{ display:"flex", gap:20, margin:"8px 0" }}>
              <label style={{ display:"flex", alignItems:"center", gap:6 }}>
                <input
                  type="radio"
                  checked={modoTutor==="EXISTENTE"}
                  onChange={()=>setModoTutor("EXISTENTE")}
                />
                Tutor existente
              </label>

              <label style={{ display:"flex", alignItems:"center", gap:6 }}>
                <input
                  type="radio"
                  checked={modoTutor==="NUEVO"}
                  onChange={()=>setModoTutor("NUEVO")}
                />
                Nuevo tutor
              </label>
            </div>

            {/* EXISTENTE */}
            {modoTutor==="EXISTENTE" && (
              <select
                name="tutor_id"
                value={form.tutor_id}
                onChange={handleChange}
                style={{ width:"100%" }}
              >
                <option value="">Sin tutor</option>
                {tutores.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.nombre_completo}
                  </option>
                ))}
              </select>
            )}

            {/* NUEVO TUTOR */}
            {modoTutor==="NUEVO" && (
              <div
                style={{
                  display:"grid",
                  gridTemplateColumns:"1fr 1fr",
                  gap:10,
                  marginTop:10
                }}
              >

                <div style={{ gridColumn:"1 / span 2", display:"flex", flexDirection:"column" }}>
                  <label>Tipo</label>
                  <select
                    name="tipo"
                    value={tutorNuevo.tipo}
                    onChange={handleTutorChange}
                  >
                    <option value="EXTERNO">Externo</option>
                    <option value="INTERNO">Docente interno</option>
                  </select>
                </div>

                {tutorNuevo.tipo==="INTERNO" && (
                  <div style={{ gridColumn:"1 / span 2", display:"flex", flexDirection:"column" }}>
                    <label>Seleccionar docente</label>
                    <select
                      value={tutorNuevo.docente_id}
                      onChange={(e)=>seleccionarDocente(e.target.value)}
                    >
                      <option value="">Seleccione</option>
                      {docentes.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.nombre_completo}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {[
                  ["Nombre","nombre_completo"],
                  ["CI","ci"],
                  ["Correo","correo"],
                  ["Celular","celular"]
                ].map(([label,name]) => (
                  <div key={name} style={{ display:"flex", flexDirection:"column" }}>
                    <label>{label}</label>
                    <input
                      name={name}
                      value={tutorNuevo[name]}
                      onChange={handleTutorChange}
                      disabled={tutorNuevo.tipo==="INTERNO"}
                    />
                  </div>
                ))}

              </div>
            )}
          </div>

          {/* ================= TEMA ================= */}
          <div style={{ display:"flex", flexDirection:"column" }}>
            <label>Tema</label>
            <input
              name="tema"
              value={form.tema}
              onChange={handleChange}
              required
            />
          </div>

          {/* ================= ESTADO ================= */}
          <div style={{ display:"flex", flexDirection:"column" }}>
            <label>Estado</label>
            <select
              name="estado"
              value={form.estado}
              onChange={handleChange}
            >
              <option>En desarrollo</option>
              <option>Revision tutor</option>
              <option>Aprobado tutor</option>
              <option>En defensa</option>
              <option>Defendido</option>
            </select>
          </div>

          {/* ================= OBSERVACIONES ================= */}
          <div style={{ display:"flex", flexDirection:"column" }}>
            <label>Observaciones</label>
            <textarea
              name="observaciones"
              value={form.observaciones || ""}
              onChange={handleChange}
            />
          </div>

          {/* ================= BOTONES ================= */}
          <div
            style={{
              display:"flex",
              justifyContent:"flex-end",
              gap:10,
              marginTop:10
            }}
          >
            <button type="submit" className="btn-agregar">
              Guardar
            </button>

            <button
              type="button"
              className="btn-eliminar"
              onClick={cerrar}
            >
              Cancelar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}