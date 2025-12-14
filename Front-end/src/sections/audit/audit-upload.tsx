import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AnalyticsIcon from '@mui/icons-material/Analytics';

type Props = {
  file: File | null;
  loading: boolean;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
};

export function AuditUpload({ file, loading, onFileChange, onAnalyze }: Props) {
  return (
    <Box
      sx={{
        mb: 5,
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'primary.lighter',
        borderRadius: 2,
        border: '1px dashed',
        borderColor: 'primary.main',
      }}
    >
      <Typography variant="h6" sx={{ color: 'primary.dark', mb: 2 }}>
        Déposez votre rapport (PDF)
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center">
        <Button
          component="label"
          variant="outlined"
          startIcon={<CloudUploadIcon />}
          sx={{ bgcolor: 'common.white' }}
        >
          {file ? file.name : "Choisir un fichier"}
          <input type="file" hidden accept=".pdf" onChange={onFileChange} />
        </Button>

        <Button
          variant="contained"
          size="large"
          onClick={onAnalyze}
          disabled={loading || !file}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AnalyticsIcon />}
          sx={{ px: 4 }}
        >
          {loading ? "Analyse..." : "Lancer l'audit"}
        </Button>
      </Stack>
    </Box>
  );
}