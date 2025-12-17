// src/types/dashboard.ts
export interface UserStats {
  admin: number;
  teacher: number;
  student: number;
  jury: number;
  chef: number;
  total: number;
}

export interface SoutenanceStats {
  planned: number;
  done: number;
  cancelled: number;
  total: number;
}

export interface RapportStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export interface SalleStats {
  total: number;
  occupied: number;
  free: number;
}

export interface Soutenance {
  id: number;
  date_soutenance: string;
  heure_debut: string;
  salle?: string;
  student_name: string;
  student_filiere: string;
  statut: 'planned' | 'done' | 'cancelled';
}

export interface UserByRole {
  role: 'admin' | 'teacher' | 'student' | 'jury' | 'chef';
  count: number;
  percentage: number;
}

export interface MonthlyStat {
  month: string;
  planned: number;
  done: number;
  cancelled: number;
}

export interface FiliereStat {
  filiere: string;
  count: number;
}

export interface DashboardStats {
  soutenances: SoutenanceStats;
  users: UserStats;
  rapports: RapportStats;
  salles: SalleStats;
  usersByRole: UserByRole[];
  upcomingSoutenances: Soutenance[];
  monthlyStats: MonthlyStat[];
  filiereStats: FiliereStat[];
}