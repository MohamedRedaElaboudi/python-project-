import { useState, useEffect } from "react";
import "./SallesPage.css";

interface Salle {
  id: number;
  name: string;
}

export default function SallesPage() {
  const [salles, setSalles] = useState<Salle[]>([]);
  const [newSalle, setNewSalle] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchSalles = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/salles/");
      const data: Salle[] = await res.json();
      setSalles(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des salles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalles();
  }, []);

  const handleAddSalle = async () => {
    if (!newSalle.trim()) return;

    try {
      const res = await fetch("http://localhost:5000/api/salles/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSalle }),
      });

      if (res.ok) {
        setNewSalle("");
        fetchSalles();
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de la salle:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSalle();
    }
  };

  return (
    <div className="salles-page">
      <header className="header">
        <h1 className="title">Gestion des Salles</h1>
      </header>

      <main className="container">
        <div className="add-salle-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Nom de la nouvelle salle"
              value={newSalle}
              onChange={(e) => setNewSalle(e.target.value)}
              onKeyPress={handleKeyPress}
              className="salle-input"
            />
            <button
              onClick={handleAddSalle}
              className="add-button"
              disabled={!newSalle.trim()}
            >
              <span className="button-text">Ajouter</span>
              <span className="button-icon">+</span>
            </button>
          </div>
          <p className="form-hint">Appuyez sur Entrée pour ajouter rapidement</p>
        </div>

        <section className="salles-section">
          <h2 className="section-title">Liste des Salles ({salles.length})</h2>

          {loading ? (
            <div className="loading-container">
              <div className="loader" />
              <p>Chargement des salles...</p>
            </div>
          ) : salles.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏢</div>
              <p>Aucune salle disponible. Ajoutez votre première salle !</p>
            </div>
          ) : (
            <div className="salles-grid">
              {salles.map((salle, index) => {
                // Utilisation d'un index pour alterner les couleurs
                const colorClass = `salle-color-${(index % 3) + 1}`;

                return (
                  <div
                    key={salle.id}
                    className={`salle-card ${colorClass}`}
                  >
                    <div className="salle-header">

                      <span className="salle-type">
                        {salle.name.includes('Amphi') || salle.name.includes('AMPHI') ? 'Amphithéâtre' :
                         salle.name.includes('Lab') || salle.name.includes('LAB') ? 'Laboratoire' : 'Salle'}
                      </span>
                    </div>

                    <div className="salle-body">
                      <h3 className="salle-name">{salle.name}</h3>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}