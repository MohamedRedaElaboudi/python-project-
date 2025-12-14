import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';

import RuleIcon from '@mui/icons-material/Rule';
import GavelIcon from '@mui/icons-material/Gavel';
import CancelIcon from '@mui/icons-material/Cancel';
import PsychologyIcon from '@mui/icons-material/Psychology';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { AnalysisResult } from '../../services/audit-service';

type Props = {
  result: AnalysisResult;
};

export function AuditResult({ result }: Props) {
  return (
    <Grid container spacing={3}>
      {/* 1. Résumé */}
      <Grid item xs={12}>
        <Card sx={{ boxShadow: 3 }}>
          <CardHeader
            title="Résumé du rapport"
            avatar={<DescriptionIcon color="info" />}
            titleTypographyProps={{ variant: 'h6' }}
          />
          <CardContent>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'justify' }}>
              {result.summary}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* 2. Audit de la FORME */}
      <Grid item xs={12} md={6}>
        <Card sx={{ border: '1px solid', borderColor: 'error.light', height: '100%' }}>
          <CardHeader
            title="Audit de la FORME"
            avatar={<RuleIcon color="error" />}
            action={<Chip label={result.layout_validation.score} color="error" variant="filled" />}
            sx={{ bgcolor: 'error.lighter', color: 'error.darker' }}
          />
          <CardContent>
            <List dense>
              {result.layout_validation.issues.length > 0 ? (
                result.layout_validation.issues.map((issue, index) => (
                  <ListItem key={index}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CancelIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary={issue} primaryTypographyProps={{ color: 'error.main' }} />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                  <ListItemText primary="Aucune erreur de forme détectée." />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* 3. Audit du FOND */}
      <Grid item xs={12} md={6}>
        <Card sx={{ border: '1px solid', borderColor: 'warning.light', height: '100%' }}>
          <CardHeader
            title="Audit du FOND (Contenu)"
            avatar={<PsychologyIcon color="warning" />}
            action={<Chip label={result.content_validation.score} color="warning" variant="filled" />}
            sx={{ bgcolor: 'warning.lighter', color: 'warning.darker' }}
          />
          <CardContent>
            <Typography variant="subtitle2" sx={{ color: 'success.main', fontWeight: 'bold', mt: 1 }}>
              Points Forts :
            </Typography>
            <List dense sx={{ mb: 2 }}>
              {result.content_validation.strengths.map((str, index) => (
                <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                  <ListItemText primary={`• ${str}`} primaryTypographyProps={{ variant: 'body2' }} />
                </ListItem>
              ))}
            </List>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Typography variant="subtitle2" sx={{ color: 'error.main', fontWeight: 'bold', mt: 2 }}>
              Faiblesses & Erreurs :
            </Typography>
            <List dense>
              {result.content_validation.weaknesses.map((weak, index) => (
                <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                  <ListItemText primary={`• ${weak}`} primaryTypographyProps={{ variant: 'body2' }} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* 4. Avis Global */}
      <Grid item xs={12}>
        <Card sx={{ bgcolor: 'grey.800', color: 'common.white' }}>
          <CardHeader
            title="Avis global du Jury"
            avatar={<GavelIcon sx={{ color: 'common.white' }} />}
          />
          <CardContent>
            <Typography variant="h6" sx={{ fontStyle: 'italic', opacity: 0.9 }}>
              "{result.content_validation.general_comment}"
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}