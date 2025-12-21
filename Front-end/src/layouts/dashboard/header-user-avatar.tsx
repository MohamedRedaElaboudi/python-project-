import { useState } from 'react';
import {
  Box,
  Menu,
  Avatar,
  Tooltip,
  Divider,
  MenuItem,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from 'src/utils/auth';

export function HeaderUserAvatar() {
  const user = getCurrentUser();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    handleCloseMenu();
    navigate('/login');
  };

  const firstLetter = user?.prenom?.[0] || user?.name?.[0] || user?.email?.[0];
  const secondLetter = user?.name?.[1] || '';
  const initials = firstLetter
    ? `${firstLetter}${secondLetter}`.toUpperCase()
    : '?';

  const fullName =
    user?.prenom && user?.name
      ? `${user.prenom} ${user.name}`
      : user?.name || user?.email || 'Utilisateur';

  return (
    <Box
      sx={{
        height: 64,
        px: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        backdropFilter: 'blur(6px)',
        backgroundColor: (theme) =>
          alpha(theme.palette.background.default, 0.8),
      }}
    >
      <Tooltip title={fullName}>
        <Avatar
          onClick={handleOpenMenu}
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'primary.main',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {initials}
        </Avatar>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2">{fullName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>

        <Divider />

        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          Déconnexion
        </MenuItem>
      </Menu>
    </Box>
  );
}
