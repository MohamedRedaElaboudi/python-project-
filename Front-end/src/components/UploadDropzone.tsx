import { useDropzone } from "react-dropzone";
import { Box, Typography } from "@mui/material";

export default function UploadDropzone({ onFile }: { onFile: (f: File) => void }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    onDrop: (files) => onFile(files[0]),
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
        p: 4,
        textAlign: "center",
        border: "2px dashed #1976D2",
        borderRadius: 3,
        backgroundColor: isDragActive ? "#E3F2FD" : "#FAFAFA",
        cursor: "pointer",
      }}
    >
      <input {...getInputProps()} />
      <Typography variant="h6">
        📄 Glissez votre rapport PDF ici
      </Typography>
      <Typography variant="body2" color="text.secondary">
        ou cliquez pour sélectionner
      </Typography>
    </Box>
  );
}
