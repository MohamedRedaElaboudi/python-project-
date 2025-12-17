import { useEffect, useState } from "react";
import "./SallesPage.css";

interface Salle {
  id: number;
  name: string;
}

export default function SallesPage() {
  const [salles, setSalles] = useState<Salle[]>([]);
  const [newSalle, setNewSalle] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_BASE = "http://localhost:5000";

  const fetchSalles = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/salles/`);
      const data: Salle[] = await res.json();
      setSalles(data);
    } catch (fetchError) { // Renommer ici
      console.error("Erreur lors de la récupération des salles:", fetchError);
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
      setError(null);
      setSuccess(null);

      const res = await fetch(`${API_BASE}/api/salles/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSalle }),
      });

      const data = await res.json();

      if (res.ok) {
        setNewSalle("");
        setSuccess("Salle ajoutée avec succès!");
        fetchSalles();
      } else {
        setError(data.error || "Erreur lors de l'ajout");
      }
    } catch (addError) { // Renommer ici
      console.error("Erreur lors de l'ajout de la salle:", addError);
      setError("Erreur de connexion au serveur");
    }
  };

  const handleDeleteSalle = async (salleId: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette salle ? Cette action est irréversible.")) {
      return;
    }

    try {
      setDeletingId(salleId);
      setError(null);
      setSuccess(null);

      const res = await fetch(`${API_BASE}/api/salles/${salleId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Salle supprimée avec succès!");
        // Mettre à jour la liste localement sans recharger
        setSalles(salles.filter(s => s.id !== salleId));
      } else {
        setError(data.error || "Erreur lors de la suppression");
      }
    } catch (deleteError) { // Renommer ici
      console.error("Erreur lors de la suppression:", deleteError);
      setError("Erreur de connexion au serveur");
    } finally {
      setDeletingId(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSalle();
    }
  };

  // Fonction pour afficher les messages après 5 secondes
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [error, success]);

  return (
    <div className="salles-page">
      <header className="header">
        <h1 className="title">Gestion des Salles</h1>
      </header>

      <main className="container">
        {/* Messages d'erreur/succès */}
        {error && (
          <div className="message error-message">
            <span className="message-icon">⚠️</span>
            <span className="message-text">{error}</span>
          </div>
        )}

        {success && (
          <div className="message success-message">
            <span className="message-icon">✅</span>
            <span className="message-text">{success}</span>
          </div>
        )}

        <div className="add-salle-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Nom de la nouvelle salle"
              value={newSalle}
              onChange={(e) => setNewSalle(e.target.value)}
              onKeyPress={handleKeyPress}
              className="salle-input"
              disabled={loading}
            />
            <button
              onClick={handleAddSalle}
              className="add-button"
              disabled={!newSalle.trim() || loading}
            >
              {loading ? (
                <span className="button-loading">⏳</span>
              ) : (
                <>
                  <span className="button-text">Ajouter</span>
                  <span className="button-icon">+</span>
                </>
              )}
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
                const colorClass = `salle-color-${(index % 3) + 1}`;
                const isDeleting = deletingId === salle.id;

                return (
                  <div
                    key={salle.id}
                    className={`salle-card ${colorClass} ${isDeleting ? 'deleting' : ''}`}
                  >
                    <div className="salle-header">
                      <span className="salle-type">
                        {salle.name.includes('Amphi') || salle.name.includes('AMPHI') ? 'Amphithéâtre' :
                         salle.name.includes('Lab') || salle.name.includes('LAB') ? 'Laboratoire' : 'Salle'}
                      </span>
                    </div>

                    <div className="salle-body">
                      <h3 className="salle-name">{salle.name}</h3>

                      <div className="salle-footer">
                        <button
                          onClick={() => handleDeleteSalle(salle.id)}
                          className="delete-button"
                          disabled={isDeleting}
                          title="Supprimer cette salle"
                        >
                          {isDeleting ? (
                            <span className="delete-loading">⏳</span>
                          ) : (
                            <span className="delete-icon">🗑️</span>
                          )}
                          <span className="delete-text">
                            {isDeleting ? 'Suppression...' : 'Supprimer'}
                          </span>
                        </button>
                      </div>
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