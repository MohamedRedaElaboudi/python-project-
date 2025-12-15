// src/utils/auth.ts
export interface User {
  id: number;
  prenom?: string;
  name?: string;
  email: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;

  const userData = localStorage.getItem('user');
  if (!userData) return null;

  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error('Erreur de parsing utilisateur:', error);
    return null;
  }
}

export function getUserName(): string {
  const user = getCurrentUser();
  if (!user) return '';

  // Priorité: prenom > name > email
  return user.prenom || user.name || user.email.split('@')[0] || 'Utilisateur';
}