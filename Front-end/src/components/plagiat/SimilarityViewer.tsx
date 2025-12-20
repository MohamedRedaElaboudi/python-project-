import React from "react";
import { Grid, Typography, Tooltip, IconButton, Box } from "@mui/material";
import { OpenInNew } from "@mui/icons-material";

type Match = {
  id: string;
  text: string;
  similarity?: number; // valeur en %
  sourceUrl?: string;
};

type Props = {
  matches: Match[];
  onSourceClick?: (id: string) => void;
};

const SimilarityViewer: React.FC<Props> = ({ matches, onSourceClick }) => {
  const summary = React.useMemo(() => {
    const totalSimilarity = matches.reduce(
      (sum, match) => sum + (match.similarity ?? 0),
      0
    );
    const avgSimilarity =
      matches.length > 0 ? totalSimilarity / matches.length : 0;
    const maxSimilarity =
      matches.length > 0
        ? Math.max(...matches.map((m) => m.similarity ?? 0))
        : 0;

    return { avgSimilarity, maxSimilarity, totalMatches: matches.length };
  }, [matches]);

  return (
    <Grid container spacing={3}>
      {/* Résumé */}
      <Grid item xs={12}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Résumé
        </Typography>
        <Typography>Matches totaux: {summary.totalMatches}</Typography>
        <Typography>
          Similarité moyenne: {summary.avgSimilarity.toFixed(1)}%
        </Typography>
        <Typography>
          Similarité maximale: {summary.maxSimilarity.toFixed(1)}%
        </Typography>
      </Grid>

      {/* Liste des matches */}
      {matches.map((match) => (
        <Grid item key={match.id} xs={12} md={4}>
          <Box
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              minHeight: 100,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="body2" sx={{ mb: 1 }}>
              {match.text}
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {match.sourceUrl && (
                <Tooltip title="Ouvrir la source">
                  <IconButton
                    size="small"
                    onClick={() => onSourceClick?.(match.id)}
                  >
                    <OpenInNew fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Typography variant="caption" color="text.secondary">
                Similarité: {(match.similarity ?? 0).toFixed(1)}%
              </Typography>
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export { SimilarityViewer };
