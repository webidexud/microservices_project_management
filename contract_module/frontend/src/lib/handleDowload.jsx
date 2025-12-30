import { useState } from "react";

export const useDownload = () => {
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownloadWord = async (contractId) => {
    setDownloadingId(contractId);
    
    try {
      const response = await fetch(`http://10.20.100.31:4000/downloadWord/${contractId}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contrato-${contractId}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error en descarga:', error);
      alert('Error al descargar el documento: ' + error.message);
      return false;
    } finally {
      setDownloadingId(null);
    }
  };

  return {
    downloadingId,
    handleDownloadWord
  };
};