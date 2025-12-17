import { useState, Suspense } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
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
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTheme } from '@mui/material/styles';
import { varAlpha } from 'minimal-shared/utils';

const DRAWER_WIDTH = 280;

// ----------------------------------------------------------------------

export default function JuryLayout() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [openNav, setOpenNav] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { title: 'Dashboard', path: '/jury/dashboard', icon: <DashboardIcon /> },
    { title: 'Rapports Assignés', path: '/jury/assigned-reports', icon: <AssignmentIcon /> },
  ];

  const renderContent = (
    <Box
      sx={{
        height: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ px: 2.5, py: 3, display: 'inline-flex' }}>
        <Typography variant="h6" sx={{ color: 'text.primary' }}>
          Jury Espace
        </Typography>
      </Box>

      <List disablePadding>
        {navItems.map((item) => (
          <ListItem key={item.title} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                setOpenNav(false);
              }}
              sx={{
                height: 48,
                px: 2.5,
                borderRadius: 0.75,
                typography: 'body2',
                textTransform: 'capitalize',
                color: 'text.secondary',
                fontWeight: 'fontWeightMedium',
                '&:hover': {
                  bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.12),
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 24, mr: 2, color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ p: 2.5 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 0.75,
            typography: 'body2',
            color: 'error.main',
            border: `1px solid ${varAlpha(theme.vars.palette.error.mainChannel, 0.4)}`,
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
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
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
          <Box sx={{ flexGrow: 1 }} />
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
              borderRight: `1px dashed ${theme.vars.palette.divider}`,
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
