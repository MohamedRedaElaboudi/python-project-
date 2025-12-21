import { useState, Suspense, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LogoutIcon from '@mui/icons-material/Logout';
import ArticleIcon from '@mui/icons-material/Article';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useTheme } from '@mui/material/styles';
import { varAlpha } from 'minimal-shared/utils';

const DRAWER_WIDTH = 280;

// ----------------------------------------------------------------------

export default function JuryLayout() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [openNav, setOpenNav] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard Jury';
    if (path.includes('/assigned-reports')) return 'Rapports Assignés';
    if (path.includes('/evaluation')) return 'Évaluation';
    if (path.includes('/plagiat')) return 'Détection de Plagiat';
    return 'Espace Jury';
  };

  const getUserInitials = () => {
    if (!user) return 'J';
    const firstName = user.prenom || user.firstName || '';
    const lastName = user.nom || user.lastName || user.name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'J';
  };

  const getUserName = () => {
    if (!user) return 'Jury';
    const firstName = user.prenom || user.firstName || '';
    const lastName = user.nom || user.lastName || user.name || '';
    return `${firstName} ${lastName}`.trim() || 'Jury';
  };

  const navItems = [
    { title: 'Dashboard', path: '/jury/dashboard', icon: <DashboardIcon /> },
    { title: 'Rapports Assignés', path: '/jury/assigned-reports', icon: <AssignmentIcon /> },
    { title: 'Plagiat', path: '/plagiat', icon: <ArticleIcon /> },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderContent = (
    <Box
      sx={{
        height: 1,
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.03)} 0%, ${varAlpha(theme.vars.palette.background.paperChannel, 1)} 100%)`,
      }}
    >
      {/* Sidebar Header with Gradient */}
      <Box
        sx={{
          px: 2.5,
          py: 3.5,
          background: `linear-gradient(135deg, ${theme.vars.palette.primary.main} 0%, ${theme.vars.palette.primary.dark} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: varAlpha(theme.vars.palette.common.whiteChannel, 0.1),
            borderRadius: '50%',
            transform: 'translate(30%, -30%)',
          },
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: 'primary.contrastText',
            fontWeight: 700,
            letterSpacing: 0.5,
            position: 'relative',
            zIndex: 1,
          }}
        >
          ⚖️ Jury Espace
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: varAlpha(theme.vars.palette.common.whiteChannel, 0.8),
            position: 'relative',
            zIndex: 1,
            display: 'block',
            mt: 0.5,
          }}
        >
          Plateforme de gestion
        </Typography>
      </Box>

      {/* Navigation Items */}
      <List disablePadding sx={{ px: 1.5, py: 2 }}>
        {navItems.map((item) => {
          const isActive = isActivePath(item.path);
          return (
            <ListItem key={item.title} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setOpenNav(false);
                }}
                sx={{
                  height: 48,
                  px: 2,
                  borderRadius: 1.5,
                  typography: 'body2',
                  color: isActive ? 'primary.main' : 'text.secondary',
                  fontWeight: isActive ? 600 : 500,
                  bgcolor: isActive ? varAlpha(theme.vars.palette.primary.mainChannel, 0.12) : 'transparent',
                  position: 'relative',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    bgcolor: isActive
                      ? varAlpha(theme.vars.palette.primary.mainChannel, 0.16)
                      : varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                    transform: 'translateX(4px)',
                  },
                  '&::before': isActive ? {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 4,
                    height: 24,
                    bgcolor: 'primary.main',
                    borderRadius: '0 4px 4px 0',
                  } : {},
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 24,
                    mr: 2,
                    color: isActive ? 'primary.main' : 'inherit',
                    '& svg': {
                      fontSize: '1.25rem',
                    },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      {/* Logout Button */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 1.5,
            typography: 'body2',
            color: 'error.main',
            fontWeight: 600,
            border: `2px solid ${varAlpha(theme.vars.palette.error.mainChannel, 0.2)}`,
            bgcolor: varAlpha(theme.vars.palette.error.mainChannel, 0.04),
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              bgcolor: varAlpha(theme.vars.palette.error.mainChannel, 0.12),
              borderColor: varAlpha(theme.vars.palette.error.mainChannel, 0.4),
              transform: 'translateY(-2px)',
              boxShadow: `0 4px 12px ${varAlpha(theme.vars.palette.error.mainChannel, 0.2)}`,
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 24, mr: 2, color: 'inherit' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Se déconnecter" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { lg: `${DRAWER_WIDTH}px` },
          boxShadow: 'none',
          bgcolor: varAlpha(theme.vars.palette.background.defaultChannel, 0.8),
          backdropFilter: 'blur(6px)',
          borderBottom: `1px solid ${theme.vars.palette.divider}`,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setOpenNav(true)}
            sx={{ mr: 2, display: { lg: 'none' }, color: 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            sx={{
              color: 'text.primary',
              fontWeight: 600,
              display: { xs: 'none', sm: 'block' },
            }}
          >
            {getPageTitle()}
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {/* Notifications */}
          <IconButton
            sx={{ color: 'text.primary', mr: 1 }}
            size="large"
          >
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* User Info */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
              border: `1px solid ${varAlpha(theme.vars.palette.primary.mainChannel, 0.12)}`,
            }}
          >
            <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'right' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {getUserName()}
              </Typography>
              <Chip
                label="Jury"
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                }}
              />
            </Box>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'primary.main',
                fontSize: '0.875rem',
                fontWeight: 700,
              }}
            >
              {getUserInitials()}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { lg: DRAWER_WIDTH }, flexShrink: { lg: 0 } }}
      >
        <Drawer
          open={openNav}
          onClose={() => setOpenNav(false)}
          PaperProps={{
            sx: {
              width: DRAWER_WIDTH,
            },
          }}
          sx={{ display: { xs: 'block', lg: 'none' } }}
        >
          {renderContent}
        </Drawer>

        <Drawer
          variant="permanent"
          PaperProps={{
            sx: {
              width: DRAWER_WIDTH,
              borderRight: `1px solid ${varAlpha(theme.vars.palette.divider, 0.5)}`,
              boxShadow: `4px 0 24px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
            },
          }}
          sx={{ display: { xs: 'none', lg: 'block' } }}
        >
          {renderContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          minHeight: '100vh',
          width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
          pt: { xs: 8, lg: 10 },
        }}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  );
}
