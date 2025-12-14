import { useEffect, useState } from "react";
import "./SallesPage.css";

interface Salle {
  id: number;
  name: string;
  disponible: boolean;
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
        <p className="subtitle">Gérez les salles et leur disponibilité</p>
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
              {salles.map((salle) => (
                <div
                  key={salle.id}
                  className={`salle-card ${salle.disponible ? 'disponible' : 'indisponible'}`}
                >
                  <div className="salle-header">
                    <span className="salle-id">#{salle.id}</span>
                    <span className={`status-badge ${salle.disponible ? 'available' : 'unavailable'}`}>
                      {salle.disponible ? "Disponible" : "Indisponible"}
                    </span>
                  </div>

                  <div className="salle-body">
                    <h3 className="salle-name">{salle.name}</h3>
                    <div className="salle-status-indicator">
                      <div className={`status-dot ${salle.disponible ? 'dot-available' : 'dot-unavailable'}`} />
                      <span className="status-text">
                        {salle.disponible ? "Prête à être réservée" : "Non disponible pour le moment"}
                      </span>
                    </div>
                  </div>

                  <div className="salle-footer">
                    <div className="action-buttons">
                      <button className="action-button edit-button">Modifier</button>
                      <button className="action-button toggle-button">
                        {salle.disponible ? "Marquer indisponible" : "Marquer disponible"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}