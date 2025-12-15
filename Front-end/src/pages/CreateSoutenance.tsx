import { useState } from "react";
import { createSoutenance } from "../services/soutenances";

export default function CreateSoutenance() {
  const [form, setForm] = useState<any>({});

  const submit = () => {
    createSoutenance(form).then(() =>
      alert("Soutenance créée")
    );
  };

  return (
    <div>
      <h2>Créer une soutenance</h2>
      <input placeholder="Rapport ID" onChange={e => setForm({...form, rapport_id:e.target.value})}/>
      <input type="date" onChange={e => setForm({...form, date:e.target.value})}/>
      <input type="time" onChange={e => setForm({...form, heure_debut:e.target.value})}/>
      <input type="time" onChange={e => setForm({...form, heure_fin:e.target.value})}/>
      <button onClick={submit}>Créer</button>
    </div>
  );
}
