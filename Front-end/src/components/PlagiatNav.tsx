import { Link, useLocation } from 'react-router-dom';
import {
  FileText,
  GitCompare
} from 'lucide-react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  useTheme,
  alpha,
} from '@mui/material';
import { useState, useEffect } from 'react';

export function PlagiatNav() {
  const location = useLocation();
  const theme = useTheme();
  const [value, setValue] = useState(0);

  const navItems = [
    // Ordre conservé : Général en premier, Spécifique en second
    {
      path: '/plagiat',
      label: 'Accueil',
      icon: FileText
    },
    {
      path: '/plagiat/dashboard',
      label: 'Tous les résultats',
      icon: GitCompare
    },
  ];

  // Mettre à jour l'onglet actif quand l'URL change
  useEffect(() => {
    const currentPath = location.pathname;
    let selectedIndex = 0; // Défaut à 'Accueil' (index 0)

    // Itérer en sens inverse (du plus spécifique au plus général)
    // pour que le chemin le plus long ("/plagiat/dashboard") soit vérifié en premier.
    for (let i = navItems.length - 1; i >= 0; i--) {
        const item = navItems[i];

        // Vérification d'une correspondance exacte ou d'un chemin parent
        if (currentPath === item.path || currentPath.startsWith(item.path + '/')) {
            selectedIndex = i;
            break; // Le chemin le plus spécifique (le plus long) a été trouvé, on s'arrête.
        }
    }

    setValue(selectedIndex);
  }, [location.pathname]); // `navItems` est considéré comme stable dans ce contexte.

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        px: 3,
        py: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          sx={{
            minHeight: 40,
            '& .MuiTab-root': {
              minHeight: 40,
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
            },
            '& .Mui-selected': {
              color: 'primary.main',
              fontWeight: 600,
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'primary.main',
            }
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Tab
                key={item.path}
                component={Link}
                to={item.path}
                icon={<Icon style={{ width: 16, height: 16 }} />}
                iconPosition="start"
                label={item.label}
                sx={{
                  borderRadius: 1,
                  mx: 0.5,
                  minHeight: 36,
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              />
            );
          })}
        </Tabs>
      </Box>
    </Paper>
  );
}