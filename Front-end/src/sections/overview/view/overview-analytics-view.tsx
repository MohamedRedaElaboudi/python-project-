import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import { DashboardContent } from 'src/layouts/dashboard';
import { getUserName } from 'src/utils/auth';

// Composants d'administration
import { AnalyticsSoutenancesStats } from '../analytics-soutenances-stats';
import { AnalyticsUsersSummary } from '../analytics-users-summary';
import { AnalyticsRapportsStats } from '../analytics-rapports-stats';
import { AnalyticsSallesStats } from '../analytics-salles-stats';
import { AnalyticsUsersByRole } from '../analytics-users-by-role';
import { AnalyticsUpcomingSoutenances } from '../analytics-upcoming-soutenances';

// Types basés sur votre API Flask
interface DashboardStats {
  soutenances: {

    total: number;
  };
  users: {
    total: number;
    admin: number;
    teacher: number;
    student: number;
    jury: number;
  };
  rapports: {
    total: number;
  };
  salles: {
    total: number;
    occupied: number;
  };
  upcomingSoutenances: Array<{
    id: number;
    date_soutenance: string;
    heure_debut: string;
    salle?: string;
    student_name: string;
    student_filiere: string;
  }>;
  usersByRole: Array<{
    role: 'admin' | 'teacher' | 'student' | 'jury';
    count: number;
    percentage: number;
  }>;
  filiereStats?: Array<{
    filiere: string;
    count: number;
  }>;
}

// Valeurs par défaut
const defaultStats: DashboardStats = {
  soutenances: { total: 0 },
  users: { total: 0, admin: 0, teacher: 0, student: 0, jury: 0 },
  rapports: { total: 0 },
  salles: { total: 0, occupied: 0 },
  upcomingSoutenances: [],
  usersByRole: [],
  filiereStats: []
};

export function OverviewAnalyticsView(): React.JSX.Element {
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      let apiData: any = null; // Déclarer apiData en dehors du try pour l'utiliser dans le catch

      try {
        setLoading(true);
        console.log('🔄 Chargement des données...');

        const name = getUserName();
        setUserName(name || '');

        const token = localStorage.getItem('token');

        const response = await fetch('http://localhost:5000/api/dashboard/stats', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
        });

        console.log('📡 Statut de la réponse:', response.status);

        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}`);
        }

        apiData = await response.json(); // Assigner à apiData
        console.log('📊 DONNÉES BRUTES DE L\'API:', apiData);

        // EXTRACTION DES DONNÉES UTILISATEURS
        let usersData = {
          total: 0,
          admin: 0,
          teacher: 0,
          student: 0,
          jury: 0,
        };

        let usersByRole: Array<{ role: string, count: number, percentage: number }> = [];

        if (apiData.users) {
          console.log('📊 Structure users:', apiData.users);

          // Votre API retourne probablement {total: X, byRole: [...]}
          if (apiData.users.byRole && Array.isArray(apiData.users.byRole)) {
            console.log('✅ Format détecté: users = {total: X, byRole: [...]}');

            // Extraire les counts depuis byRole
            apiData.users.byRole.forEach((item: any) => {
              if (item.role === 'admin') usersData.admin = item.count || 0;
              else if (item.role === 'teacher') usersData.teacher = item.count || 0;
              else if (item.role === 'student') usersData.student = item.count || 0;
              else if (item.role === 'jury') usersData.jury = item.count || 0;
            });

            usersData.total = apiData.users.total ||
              (usersData.admin + usersData.teacher + usersData.student +
                usersData.jury);

            usersByRole = apiData.users.byRole;
          }
          // Si l'API retourne directement les propriétés
          else if (apiData.users.admin !== undefined) {
            console.log('✅ Format détecté: users = {admin: X, teacher: Y, ...}');
            usersData = {
              total: apiData.users.total || 0,
              admin: apiData.users.admin || 0,
              teacher: apiData.users.teacher || 0,
              student: apiData.users.student || 0,
              jury: apiData.users.jury || 0,
            };

            // Créer usersByRole si non présent
            if (!apiData.usersByRole) {
              usersByRole = [
                {
                  role: 'admin',
                  count: usersData.admin,
                  percentage: usersData.total > 0 ? Math.round((usersData.admin / usersData.total) * 1000) / 10 : 0
                },
                {
                  role: 'teacher',
                  count: usersData.teacher,
                  percentage: usersData.total > 0 ? Math.round((usersData.teacher / usersData.total) * 1000) / 10 : 0
                },
                {
                  role: 'student',
                  count: usersData.student,
                  percentage: usersData.total > 0 ? Math.round((usersData.student / usersData.total) * 1000) / 10 : 0
                },
                {
                  role: 'jury',
                  count: usersData.jury,
                  percentage: usersData.total > 0 ? Math.round((usersData.jury / usersData.total) * 1000) / 10 : 0
                },

              ];
            }
          }
        }

        console.log('📊 Données utilisateurs extraites:', usersData);
        console.log('📊 usersByRole:', usersByRole);

        // TRANSFORMATION COMPLÈTE DES DONNÉES
        const transformedData: DashboardStats = {
          soutenances: apiData.soutenances || {
            planned: 0,
            done: 0,
            cancelled: 0,
            total: 0
          },
          users: usersData,
          rapports: apiData.rapports || {
            pending: 0,
            approved: 0,
            rejected: 0,
            total: 0
          },
          salles: apiData.salles || {
            total: 0,
            occupied: 0,
          },
          upcomingSoutenances: apiData.upcomingSoutenances || [],
          usersByRole: usersByRole.length > 0 ? usersByRole : apiData.usersByRole || []
        };

        console.log('✅ Données transformées pour le dashboard:', transformedData);
        setStats(transformedData);

      } catch (err: any) {
        console.error('❌ Erreur lors du chargement des données:', err);
        setError('Erreur lors du chargement des données: ' + (err.message || 'Erreur inconnue'));

        // Fallback avec données mockées - utiliser apiData si disponible
        const fallbackUpcoming = apiData?.upcomingSoutenances || [];

        setStats({
          soutenances: { total: 16 },
          users: { total: 40, admin: 0, teacher: 0, student: 40, jury: 0 },
          rapports: { total: 1 },
          salles: { total: 9, occupied: 0 },
          upcomingSoutenances: fallbackUpcoming,
          usersByRole: [
            { role: 'student', count: 40, percentage: 100 }
          ]
        });

      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);



  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        {loading ? (
          <Skeleton width={200} />
        ) : userName ? (
          `Hi, Welcome ${userName} 👋`
        ) : (
          'Tableau de bord administrateur'
        )}
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* CORRECTION ICI : Utilisez 'size' au lieu de 'item xs sm md' */}
      <Grid container spacing={3}>
        {/* Carte 1: Statistiques des soutenances */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {loading ? (
            <Skeleton variant="rectangular" height={180} />
          ) : (
            <AnalyticsSoutenancesStats
              title="Soutenances"
              stats={stats.soutenances}
            />
          )}
        </Grid>

        {/* Carte 2: Statistiques des utilisateurs */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {loading ? (
            <Skeleton variant="rectangular" height={180} />
          ) : (
            <AnalyticsUsersSummary
              title="Utilisateurs"
              stats={stats.users}
            />
          )}
        </Grid>

        {/* Carte 3: Statistiques des rapports */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {loading ? (
            <Skeleton variant="rectangular" height={180} />
          ) : (
            <AnalyticsRapportsStats
              title="Rapports"
              stats={stats.rapports}
            />
          )}
        </Grid>

        {/* Carte 4: Statistiques des salles */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {loading ? (
            <Skeleton variant="rectangular" height={180} />
          ) : (
            <AnalyticsSallesStats
              title="Salles"
              stats={stats.salles}
            />
          )}
        </Grid>

        {/* Graphique: Répartition des utilisateurs par rôle */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          {loading ? (
            <Skeleton variant="rectangular" height={400} />
          ) : (
            <AnalyticsUsersByRole
              title="Répartition par rôle"
              data={stats.usersByRole}
            />
          )}
        </Grid>

        {/* Liste: Soutenances à venir */}
        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          {loading ? (
            <Skeleton variant="rectangular" height={400} />
          ) : (
            <AnalyticsUpcomingSoutenances
              title="Soutenances à venir"
              soutenances={stats.upcomingSoutenances}
              maxItems={5}
            />
          )}
        </Grid>


      </Grid>
    </DashboardContent>
  );
}