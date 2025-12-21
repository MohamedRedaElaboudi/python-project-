import React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RoomIcon from '@mui/icons-material/Room';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface Soutenance {
  id: number;
  date_soutenance: string;
  heure_debut: string;
  salle?: string;
  student_name: string;
  student_filiere: string;
}

interface AnalyticsUpcomingSoutenancesProps {
  title?: string;
  soutenances: Soutenance[];
  maxItems?: number;
}

const statutColors = {
  planned: 'primary',
  done: 'success',
  cancelled: 'error'
} as const;

const statutLabels = {
  planned: 'Planifiée',
  done: 'Terminée',
  cancelled: 'Annulée'
};

export function AnalyticsUpcomingSoutenances({
  title = 'Soutenances à venir',
  soutenances = [],
  maxItems = 5
}: AnalyticsUpcomingSoutenancesProps): React.JSX.Element {

  const displayedSoutenances = [...soutenances]
    .sort((a, b) => new Date(a.date_soutenance).getTime() - new Date(b.date_soutenance).getTime())
    .slice(0, maxItems);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  // CORRECTION ICI : Utiliser la syntaxe implicite
  const formatTime = (timeString: string): string => timeString.substring(0, 5);

  if (soutenances.length === 0) {
    return (
      <Card>
        <CardHeader title={title} />
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Aucune soutenance à venir
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title={title}
        subheader={`${soutenances.length} soutenances programmées`}
        action={
          <IconButton size="small">
            <MoreVertIcon />
          </IconButton>
        }
      />
      <CardContent sx={{ p: 0 }}>
        <List disablePadding>
          {displayedSoutenances.map((soutenance) => (
            <ListItem
              key={soutenance.id}
              sx={{
                py: 2,
                px: 3,
                borderBottom: 1,
                borderColor: 'divider',
                '&:last-child': {
                  borderBottom: 0
                }
              }}

            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.light' }}>
                  <CalendarTodayIcon fontSize="small" />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle2">
                    {soutenance.student_name}
                  </Typography>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <AccessTimeIcon fontSize="small" sx={{ fontSize: 14, opacity: 0.7 }} />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(soutenance.date_soutenance)} à {formatTime(soutenance.heure_debut)}
                      </Typography>
                    </Box>
                    {soutenance.salle && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <RoomIcon fontSize="small" sx={{ fontSize: 14, opacity: 0.7 }} />
                        <Typography variant="caption" color="text.secondary">
                          Salle {soutenance.salle}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SchoolIcon fontSize="small" sx={{ fontSize: 14, opacity: 0.7 }} />
                      <Typography variant="caption" color="text.secondary">
                        {soutenance.student_filiere}
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>

        {soutenances.length > maxItems && (
          <Box sx={{ p: 2, textAlign: 'center', borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="primary">
              +{soutenances.length - maxItems} autres soutenances
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}