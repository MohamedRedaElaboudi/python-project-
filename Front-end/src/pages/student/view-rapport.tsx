import PdfViewer from "../../components/PdfViewer";
import { Typography } from "@mui/material";

export default function ViewRapport() {
  const pdfUrl = "http://localhost:5000/api/v1/rapports/download";

  return (
    <>
      <Typography variant="h5" mb={2}>📄 Aperçu du rapport</Typography>
      <PdfViewer url={pdfUrl} />
    </>
  );
}
