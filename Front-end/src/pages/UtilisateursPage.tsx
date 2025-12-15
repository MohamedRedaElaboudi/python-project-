// UtilisateursPage.tsx - VERSION COMPLÈTE CORRIGÉE
import { useEffect, useState } from "react";
import "./UtilisateursPage.css";

interface User {
  id: number;
  prenom: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'jury' | 'admin' | 'chef';
  created_at: string;
  updated_at: string | null;
}

interface JuryTeacher {
  id: number;
  teacher_id: number;
  teacher_name: string;
  teacher_email: string;
  role: string;
  role_label: string;
  soutenance_id: number;
  soutenance_date: string;
  student_name: string;
  salle_name: string;
}

interface JuryStats {
  total_jurys: number;
  teachers_in_jurys: number;
  president_count: number;
  member_count: number;
  supervisor_count: number;
  total_soutenances: number;
}

export default function UtilisateursPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [jurys, setJurys] = useState<JuryTeacher[]>([]);
  const [juryStats, setJuryStats] = useState<JuryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingJurys, setLoadingJurys] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedTab, setSelectedTab] = useState<'users' | 'jurys'>('users');

  // États pour les modales et la sélection
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // États pour le formulaire d'édition/ajout
  const [formData, setFormData] = useState({
    prenom: '',
    name: '',
    email: '',
    role: 'student' as 'student' | 'teacher' | 'jury' | 'admin' | 'chef',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Récupérer le token JWT du localStorage
  const getAuthToken = () => localStorage.getItem('token') || '';

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const res = await fetch("http://localhost:5000/api/users/", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error(`Erreur HTTP: ${res.status}`);
      }

      const data: User[] = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      alert("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const fetchJurysData = async () => {
    try {
      setLoadingJurys(true);
      const token = getAuthToken();

      // ESSAYEZ D'ABORD LA NOUVELLE ROUTE /all
      let juryList: JuryTeacher[] = [];

      try {
        // Route 1: /api/jurys/all (nouvelle route plus simple)
        const resAll = await fetch("http://localhost:5000/api/jurys/all", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (resAll.ok) {
          const data = await resAll.json();
          juryList = data.map((jury: any) => ({
            id: jury.id,
            teacher_id: jury.teacher_id,
            teacher_name: jury.teacher_name,
            teacher_email: jury.teacher_email,
            role: jury.role,
            role_label: jury.role_label || getRoleLabel(jury.role),
            soutenance_id: jury.soutenance_id,
            soutenance_date: jury.soutenance_date,
            student_name: jury.student_name || 'Non spécifié',
            salle_name: jury.salle_name || 'Non spécifiée'
          }));
        } else {
          // Fallback: route originale
          const resSoutenances = await fetch("http://localhost:5000/api/jurys/soutenances/with-jurys", {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (resSoutenances.ok) {
            const soutenances = await resSoutenances.json();

            soutenances.forEach((soutenance: any) => {
              if (soutenance.jurys && soutenance.jurys.length > 0) {
                soutenance.jurys.forEach((jury: any) => {
                  juryList.push({
                    id: jury.id,
                    teacher_id: jury.teacher_id,
                    teacher_name: jury.teacher_name,
                    teacher_email: jury.teacher_email || '',
                    role: jury.role,
                    role_label: jury.role_label || getRoleLabel(jury.role),
                    soutenance_id: soutenance.id,
                    soutenance_date: soutenance.date_soutenance,
                    student_name: soutenance.student?.name || 'Non spécifié',
                    salle_name: soutenance.salle || 'Non spécifiée'
                  });
                });
              }
            });
          }
        }
      } catch (error) {
        console.error("Erreur avec les routes jury:", error);
      }

      setJurys(juryList);

      // Calculer les statistiques
      const stats: JuryStats = {
        total_jurys: juryList.length,
        teachers_in_jurys: new Set(juryList.map(j => j.teacher_id)).size,
        president_count: juryList.filter(j => j.role === 'president').length,
        member_count: juryList.filter(j => j.role === 'member').length,
        supervisor_count: juryList.filter(j => j.role === 'supervisor').length,
        total_soutenances: new Set(juryList.map(j => j.soutenance_id)).size
      };

      setJuryStats(stats);

      // Debug: afficher les données récupérées
      console.log("Jurys récupérés:", juryList);
      console.log("Statistiques:", stats);

    } catch (error) {
      console.error("Erreur lors de la récupération des jurys:", error);
      alert("Erreur lors du chargement des données des jurys");
    } finally {
      setLoadingJurys(false);
    }
  };

  const getRoleLabel = (role: string): string => {
    const labels: Record<string, string> = {
      'president': 'Président du Jury',
      'member': 'Membre du Jury',
      'supervisor': 'Encadrant'
    };
    return labels[role] || role;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedTab === 'jurys') {
      fetchJurysData();
    }
  }, [selectedTab]);

  // AJOUT DES FONCTIONS MANQUANTES :

  // Fonction pour ouvrir la modale d'ajout
  const handleAddUser = () => {
    setSelectedUser(null);
    setFormData({
      prenom: '',
      name: '',
      email: '',
      role: 'student',
      password: '',
      confirmPassword: ''
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  // Fonction pour ouvrir la modale de visualisation
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  // Fonction pour ouvrir la modale d'édition
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      prenom: user.prenom,
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
      confirmPassword: ''
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  // Fonction pour ouvrir la modale de suppression
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Fonction pour supprimer un utilisateur
  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const token = getAuthToken();
      const res = await fetch(`http://localhost:5000/api/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erreur lors de la suppression');
      }

      const result = await res.json();
      alert(result.message);

      // Rafraîchir la liste
      fetchUsers();
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      alert(error.message || "Erreur lors de la suppression de l'utilisateur");
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.prenom.trim()) errors.prenom = "Le prénom est requis";
    if (!formData.name.trim()) errors.name = "Le nom est requis";
    if (!formData.email.trim()) errors.email = "L'email est requis";

    if (!selectedUser && !formData.password) {
      errors.password = "Le mot de passe est requis pour un nouvel utilisateur";
    }

    if (formData.password && formData.password.length < 6) {
      errors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fonction pour enregistrer les modifications
  const saveUserChanges = async () => {
    if (!validateForm()) return;

    try {
      const token = getAuthToken();
      const url = selectedUser
        ? `http://localhost:5000/api/users/${selectedUser.id}`
        : 'http://localhost:5000/api/users/';

      const method = selectedUser ? 'PUT' : 'POST';

      const payload: any = {
        prenom: formData.prenom,
        name: formData.name,
        email: formData.email,
        role: formData.role
      };

      // Inclure le mot de passe seulement s'il a été modifié ou pour un nouvel utilisateur
      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || `Erreur HTTP: ${res.status}`);
      }

      const result = await res.json();
      alert(result.message);

      // Rafraîchir la liste
      fetchUsers();
      setShowEditModal(false);
      setShowAddModal(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error("Erreur lors de l'enregistrement:", error);
      alert(error.message || "Erreur lors de l'enregistrement");
    }
  };

  // Filtrage des utilisateurs
  const filteredUsers = users.filter(user =>
    (searchTerm === "" ||
      user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedRole === "all" || user.role === selectedRole)
  );

  // Filtrage des jurys
  const filteredJurys = jurys.filter(jury =>
    searchTerm === "" ||
    jury.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jury.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jury.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Grouper les jurys par enseignant
  const jurysByTeacher = filteredJurys.reduce((acc, jury) => {
    if (!acc[jury.teacher_id]) {
      acc[jury.teacher_id] = {
        teacher_id: jury.teacher_id,
        teacher_name: jury.teacher_name,
        teacher_email: jury.teacher_email,
        total_jurys: 0,
        as_president: 0,
        as_member: 0,
        as_supervisor: 0,
        soutenances: []
      };
    }

    acc[jury.teacher_id].total_jurys += 1;
    if (jury.role === 'president') acc[jury.teacher_id].as_president += 1;
    if (jury.role === 'member') acc[jury.teacher_id].as_member += 1;
    if (jury.role === 'supervisor') acc[jury.teacher_id].as_supervisor += 1;
    acc[jury.teacher_id].soutenances.push({
      id: jury.soutenance_id,
      date: jury.soutenance_date,
      student: jury.student_name,
      salle: jury.salle_name,
      role: jury.role
    });

    return acc;
  }, {} as Record<number, any>);

  const teachersWithJurys = Object.values(jurysByTeacher);

  // Nombre total d'utilisateurs par rôle
  const roleCounts = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const roleLabels: Record<string, string> = {
    'student': 'Étudiant',
    'teacher': 'Enseignant',
    'jury': 'Membre du Jury',
    'admin': 'Administrateur',
    'chef': 'Chef de Département'
  };

  const roleColors: Record<string, string> = {
    'student': '#4CAF50',
    'teacher': '#2196F3',
    'jury': '#9C27B0',
    'admin': '#FF9800',
    'chef': '#F44336'
  };

  const juryRoleColors: Record<string, string> = {
    'president': '#FF9800',
    'member': '#2196F3',
    'supervisor': '#4CAF50'
  };

  // Ajouter ces constantes pour les statistiques
  const statsData = [
    { label: 'Enseignants dans les jurys', value: juryStats?.teachers_in_jurys || 0, color: '#2196F3' },
    { label: 'Total des affectations', value: juryStats?.total_jurys || 0, color: '#4CAF50' },
    { label: 'Présidents', value: juryStats?.president_count || 0, color: '#FF9800' },
    { label: 'Membres', value: juryStats?.member_count || 0, color: '#9C27B0' },
    { label: 'Encadrants', value: juryStats?.supervisor_count || 0, color: '#00BCD4' },
    { label: 'Soutenances avec jury', value: juryStats?.total_soutenances || 0, color: '#E91E63' }
  ];

  return (
    <div className="utilisateurs-page">
      <header className="header">
        <div className="header-content">
          <div>
            <h1 className="title">Gestion des Utilisateurs</h1>
            <p className="subtitle">
              {users.length} utilisateurs au total
            </p>
          </div>
          <button className="add-user-btn" onClick={handleAddUser}>
            + Ajouter un utilisateur
          </button>
        </div>
      </header>

      <main className="container">
        {/* Onglets */}
        <div className="tabs-container">
          <div className="tabs">
            <button
              className={`tab ${selectedTab === 'users' ? 'active' : ''}`}
              onClick={() => setSelectedTab('users')}
            >
              Utilisateurs ({users.length})
            </button>
            <button
              className={`tab ${selectedTab === 'jurys' ? 'active' : ''}`}
              onClick={() => setSelectedTab('jurys')}
            >
              Jurys ({juryStats?.total_jurys || 0})
            </button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="filters-section">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder={
                selectedTab === 'users'
                  ? "Rechercher un utilisateur..."
                  : "Rechercher un enseignant, étudiant..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {selectedTab === 'users' && (
            <div className="filter-buttons">
              <button
                className={`filter-button ${selectedRole === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedRole('all')}
              >
                Tous ({users.length})
              </button>
              {Object.keys(roleLabels).map((role) => (
                <button
                  key={role}
                  className={`filter-button ${selectedRole === role ? 'active' : ''}`}
                  onClick={() => setSelectedRole(role)}
                  style={selectedRole === role ? { backgroundColor: roleColors[role] } : {}}
                >
                  {roleLabels[role]} ({roleCounts[role] || 0})
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedTab === 'users' ? (
          <>
            {loading ? (
              <div className="loading-container">
                <div className="loader" />
                <p>Chargement des utilisateurs...</p>
              </div>
            ) : (
              <div className="table-section">
                <h2 className="section-title">Liste des Utilisateurs ({filteredUsers.length} résultats)</h2>

                <div className="table-container">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Nom & Prénom</th>
                        <th>Email</th>
                        <th>Rôle</th>
                        <th>Date d'inscription</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="no-data">
                            Aucun utilisateur trouvé
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.id}>
                            <td>
                              <div className="user-cell">
                                <div className="avatar-small">
                                  {user.prenom[0]}{user.name[0]}
                                </div>
                                <div>
                                  <div className="user-fullname">
                                    {user.prenom} {user.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="user-email-cell">{user.email}</td>
                            <td>
                              <span
                                className="role-badge"
                                style={{ backgroundColor: roleColors[user.role] }}
                              >
                                {roleLabels[user.role]}
                              </span>
                            </td>
                            <td className="date-cell">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td>
                              <div className="table-actions">
                                <button
                                  className="table-btn view"
                                  onClick={() => handleViewUser(user)}
                                  title="Voir les détails"
                                >
                                  👁
                                </button>
                                <button
                                  className="table-btn edit"
                                  onClick={() => handleEditUser(user)}
                                  title="Modifier"
                                >
                                  ✏️
                                </button>
                                <button
                                  className="table-btn delete"
                                  onClick={() => handleDeleteUser(user)}
                                  title="Supprimer"
                                >
                                  🗑
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Statistiques des jurys */}
            <div className="jury-stats">
              <h2 className="section-title">Statistiques des Jurys</h2>
              <div className="stats-grid">
                {statsData.map((stat, index) => (
                  <div key={index} className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                      {stat.value}
                    </div>
                    <div className="stat-info">
                      <h3 className="stat-label">{stat.label}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {loadingJurys ? (
              <div className="loading-container">
                <div className="loader" />
                <p>Chargement des données des jurys...</p>
              </div>
            ) : (
              <div className="table-section">
                <h2 className="section-title">
                  Enseignants Participant aux Jurys ({teachersWithJurys.length} enseignants)
                </h2>

                <div className="table-container">
                  <table className="jurys-table">
                    <thead>
                      <tr>
                        <th>Enseignant</th>
                        <th>Email</th>
                        <th>Rôles dans les jurys</th>
                        <th>Nombre de jurys</th>
                        <th>Dernière soutenance</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachersWithJurys.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="no-data">
                            {jurys.length === 0 ? "Aucun jury trouvé dans la base de données" : "Aucun enseignant trouvé dans les jurys"}
                          </td>
                        </tr>
                      ) : (
                        teachersWithJurys.map((teacher) => (
                          <tr key={teacher.teacher_id}>
                            <td>
                              <div className="user-cell">
                                <div className="avatar-small">
                                  {teacher.teacher_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                </div>
                                <div>
                                  <div className="user-fullname">
                                    {teacher.teacher_name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="user-email-cell">{teacher.teacher_email}</td>
                            <td>
                              <div className="jury-roles">
                                {teacher.as_president > 0 && (
                                  <span className="jury-role-badge" style={{ backgroundColor: juryRoleColors.president }}>
                                    Président ({teacher.as_president})
                                  </span>
                                )}
                                {teacher.as_member > 0 && (
                                  <span className="jury-role-badge" style={{ backgroundColor: juryRoleColors.member }}>
                                    Membre ({teacher.as_member})
                                  </span>
                                )}
                                {teacher.as_supervisor > 0 && (
                                  <span className="jury-role-badge" style={{ backgroundColor: juryRoleColors.supervisor }}>
                                    Encadrant ({teacher.as_supervisor})
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="jury-count">
                                <span className="count-badge">{teacher.total_jurys}</span>
                                <small>affectation(s)</small>
                              </div>
                            </td>
                            <td>
                              {teacher.soutenances.length > 0 ? (
                                <div className="last-soutenance">
                                  <div className="soutenance-date">
                                    {new Date(teacher.soutenances[0].date).toLocaleDateString()}
                                  </div>
                                  <div className="soutenance-info">
                                    {teacher.soutenances[0].student} ({teacher.soutenances[0].salle})
                                  </div>
                                </div>
                              ) : (
                                <span className="no-soutenance">Aucune</span>
                              )}
                            </td>
                            <td>
                              <div className="table-actions">
                                <button
                                  className="table-btn view"
                                  title="Voir les détails"
                                  onClick={() => {
                                    // Vous pouvez implémenter la vue détaillée des jurys d'un enseignant
                                    alert(`Détails des jurys pour ${teacher.teacher_name}`);
                                  }}
                                >
                                  👁
                                </button>
                                <button
                                  className="table-btn edit"
                                  title="Gérer les jurys"
                                >
                                  🎯
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Liste détaillée de tous les jurys */}
                <div className="detailed-jurys-section">
                  <h3 className="section-subtitle">Toutes les Affectations de Jury ({filteredJurys.length})</h3>
                  <div className="jurys-details-grid">
                    {filteredJurys.map((jury) => (
                      <div key={jury.id} className="jury-detail-card">
                        <div className="jury-detail-header">
                          <span
                            className="jury-role-badge small"
                            style={{ backgroundColor: juryRoleColors[jury.role] }}
                          >
                            {jury.role_label}
                          </span>
                          <span className="jury-soutenance-id">Soutenance #{jury.soutenance_id}</span>
                        </div>
                        <div className="jury-detail-body">
                          <div className="jury-teacher">
                            <strong>{jury.teacher_name}</strong>
                            <small>{jury.teacher_email}</small>
                          </div>
                          <div className="jury-info">
                            <div className="info-row">
                              <span className="info-label">Étudiant:</span>
                              <span className="info-value">{jury.student_name}</span>
                            </div>
                            <div className="info-row">
                              <span className="info-label">Date:</span>
                              <span className="info-value">
                                {new Date(jury.soutenance_date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="info-row">
                              <span className="info-label">Salle:</span>
                              <span className="info-value">{jury.salle_name}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modale de visualisation */}
      {showViewModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Détails de l&apos;utilisateur</h2>
              <button className="close-btn" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="user-detail-view">
                <div className="detail-avatar">
                  {selectedUser.prenom[0]}{selectedUser.name[0]}
                </div>
                <div className="detail-info">
                  <div className="detail-row">
                    <span className="detail-label">ID:</span>
                    <span className="detail-value">#{selectedUser.id}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Nom complet:</span>
                    <span className="detail-value">{selectedUser.prenom} {selectedUser.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedUser.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Rôle:</span>
                    <span
                      className="detail-value role-tag"
                      style={{ backgroundColor: roleColors[selectedUser.role] }}
                    >
                      {roleLabels[selectedUser.role]}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Inscrit le:</span>
                    <span className="detail-value">
                      {new Date(selectedUser.created_at).toLocaleString()}
                    </span>
                  </div>
                  {selectedUser.updated_at && (
                    <div className="detail-row">
                      <span className="detail-label">Dernière modification:</span>
                      <span className="detail-value">
                        {new Date(selectedUser.updated_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="modal-btn secondary"
                onClick={() => setShowViewModal(false)}
              >
                Fermer
              </button>
              <button
                className="modal-btn primary"
                onClick={() => {
                  setShowViewModal(false);
                  handleEditUser(selectedUser);
                }}
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale d'édition/ajout */}
      {(showEditModal || showAddModal) && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{selectedUser ? 'Modifier l&apos;utilisateur' : 'Ajouter un utilisateur'}</h2>
              <button className="close-btn" onClick={() => {
                setShowEditModal(false);
                setShowAddModal(false);
              }}>×</button>
            </div>
            <div className="modal-body">
              <form className="user-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label>Prénom *</label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                    className={formErrors.prenom ? 'error' : ''}
                  />
                  {formErrors.prenom && <span className="error-message">{formErrors.prenom}</span>}
                </div>

                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={formErrors.name ? 'error' : ''}
                  />
                  {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={formErrors.email ? 'error' : ''}
                  />
                  {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Rôle *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                  >
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {!selectedUser && (
                  <>
                    <div className="form-group">
                      <label>Mot de passe *</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className={formErrors.password ? 'error' : ''}
                      />
                      {formErrors.password && <span className="error-message">{formErrors.password}</span>}
                    </div>

                    <div className="form-group">
                      <label>Confirmer le mot de passe *</label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className={formErrors.confirmPassword ? 'error' : ''}
                      />
                      {formErrors.confirmPassword && <span className="error-message">{formErrors.confirmPassword}</span>}
                    </div>
                  </>
                )}

                {selectedUser && (
                  <div className="form-group">
                    <label>Nouveau mot de passe (laisser vide pour ne pas changer)</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                    <small className="form-hint">Minimum 6 caractères</small>
                  </div>
                )}
              </form>
            </div>
            <div className="modal-footer">
              <button
                className="modal-btn secondary"
                onClick={() => {
                  setShowEditModal(false);
                  setShowAddModal(false);
                }}
              >
                Annuler
              </button>
              <button
                className="modal-btn primary"
                onClick={saveUserChanges}
              >
                {selectedUser ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de confirmation de suppression */}
      {showDeleteModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Confirmer la suppression</h2>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="delete-confirmation">
                <div className="warning-icon">⚠️</div>
                <p>Êtes-vous sûr de vouloir supprimer l&apos;utilisateur :</p>
                <p className="user-to-delete">
                  <strong>{selectedUser.prenom} {selectedUser.name}</strong> ({selectedUser.email})
                </p>
                <p className="warning-text">
                  Cette action est irréversible. Toutes les données associées à cet utilisateur seront supprimées.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="modal-btn secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </button>
              <button
                className="modal-btn danger"
                onClick={confirmDeleteUser}
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}