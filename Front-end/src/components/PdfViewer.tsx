export default function PdfViewer({ url }: { url: string }) {
  return (
    <iframe
      src={url}
      width="100%"
      height="600px"
      title="PDF Viewer"
      style={{ border: "none" }}
    />
  );
}
