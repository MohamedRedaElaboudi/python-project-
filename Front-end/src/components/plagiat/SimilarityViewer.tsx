import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";

import { OpenInNew } from "@mui/icons-material";
import { PlagiatMatch } from "./index";

// ----------------------------------------------------------------------

type Props = {
  match: PlagiatMatch;
};

export function SimilarityViewer({ match }: Props) {
  if (!match) return null;

  return (
    <Card>
      <CardHeader
        title="Détails de la correspondance"
        subheader={`Source: ${match.source || 'Inconnue'}`}
      />

      <CardContent>
        <Stack spacing={3}>
          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: 'background.neutral',
              border: (theme) => `solid 1px ${theme.palette.divider}`,
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
              Texte du rapport :
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              "{match.content_snippet || match.text || '...'}"
            </Typography>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: 'error.lighter',
              color: 'error.darker',
              border: (theme) => `solid 1px ${theme.palette.error.light}`,
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'error.dark' }}>
              Texte source trouvé :
            </Typography>
            <Typography variant="body2">
              "{match.matched_text || '...'}"
            </Typography>
          </Box>

          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                component="span"
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  mr: 1,
                  bgcolor: (match.similarity ?? 0) > 70 ? 'error.main' : (match.similarity ?? 0) > 40 ? 'warning.main' : 'success.main'
                }}
              />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {match.similarity?.toFixed(1)}% de similarité
              </Typography>
            </Box>

            {match.source_url && (
              <Tooltip title="Ouvrir la source originale">
                <IconButton
                  component={Link}
                  href={match.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: 'primary.main' }}
                >
                  <OpenInNew />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

