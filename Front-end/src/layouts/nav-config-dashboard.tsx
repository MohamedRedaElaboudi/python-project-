import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';
import HomeIcon from '@mui/icons-material/Home';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} />
);

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('ic-analytics'),
  },

  // ================== ADMIN ==================
  {
    title: 'Salles',
    path: '/salles',
    icon:  <HomeIcon sx={{ width: 24, height: 24 }} />, // ou ic-building si tu as
  },
  {
    title: 'Soutenances',
    path: '/soutenances',
    icon: <CalendarMonthIcon sx={{ width: 24, height: 24 }} />,
  },
  {
    title: 'Utilisateurs',
    path: '/utilisateurs',
    icon: icon('ic-user'),
    info: (
      <Label color="info" variant="inverted">
        Admin
      </Label>
    ),
  },

  // ================== AUTRES ==================
  {
    title: 'Blog',
    path: '/blog',
    icon: icon('ic-blog'),
  },
  {
    title: 'Sign in',
    path: '/sign-in',
    icon: icon('ic-lock'),
  },
];
