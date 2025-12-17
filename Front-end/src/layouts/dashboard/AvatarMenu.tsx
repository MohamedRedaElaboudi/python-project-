// AvatarMenu.tsx
import React, { useState } from 'react';
import { Menu, MenuItem, Box } from '@mui/material';

interface AvatarMenuProps {
  user: {
    name?: string;
    prenom?: string;
    email?: string;
    displayName?: string;
  } | null;
  onLogout: () => void;
}

export function AvatarMenu({ user, onLogout }: AvatarMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleClose();
    onLogout();
  };

  const getInitials = () => {
    if (!user) return 'U';
    
    if (user.prenom && user.name) {
      return (user.prenom.charAt(0) + user.name.charAt(0)).toUpperCase();
    }
    
    if (user.displayName) {
      const parts = user.displayName.split(' ');
      if (parts.length >= 2) {
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
      }
      return parts[0].charAt(0).toUpperCase();
    }
    
    return 'U';
  };

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: '50%',
          bgcolor: '#1976d2',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          mr: 2,
          '&:hover': {
            bgcolor: '#1565c0',
          },
        }}
      >
        {getInitials()}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
          },
        }}
      >
        {user && (
          <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ fontWeight: 'bold' }}>
              {user.prenom} {user.name}
            </Box>
            <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
              {user.email}
            </Box>
          </Box>
        )}
        
        <MenuItem 
          onClick={handleLogoutClick}
          sx={{ 
            color: 'error.main',
            py: 1.5,
          }}
        >
          Déconnexion
        </MenuItem>
      </Menu>
    </>
  );
}