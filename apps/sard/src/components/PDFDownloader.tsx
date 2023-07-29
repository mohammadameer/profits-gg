import React from "react";
import { Button } from "@profits-gg/ui";

const PdfDownloader = ({
  rootElementId,
  downloadFileName,
  text,
}: {
  rootElementId: string;
  downloadFileName: string;
  text?: string;
}) => {
  const [isDownloading, setIsDownloading] = React.useState(false);

  const downloadPdfDocument = () => {
    if (isDownloading) return;
    setIsDownloading(true);

    const input = document.getElementById(rootElementId) as HTMLElement;

    // @ts-ignore
    import("html2pdf.js").then((html2pdf) => {
      html2pdf
        .default()
        .set({
          margin: 0,
          filename: downloadFileName,
          enableLinks: true,
          pagebreak: {
            before: "#page-break-before",
            after: "#page-break-after",
            avoid: ["p", "h1", "h2", "h3", "h4", "h5", "h6"],
          },
          image: { type: "jpeg", quality: 0.98, backgroundColor: "#e5e7eb" },
          html2canvas: {
            background: "#e5e7eb",
            backgroundColor: "#e5e7eb",
            scale: 2,
            logging: false,
            dpi: 192,
            letterRendering: true,
          },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        })
        .from(input)
        .save();
      setIsDownloading(false);
    });
  };

  return (
    <Button
      loading={isDownloading}
      disabled={isDownloading}
      onClick={downloadPdfDocument}
      text={text || "تحميل القصة كملف PDF"}
      printHidden={true}
    />
  );
};

export default PdfDownloader;
