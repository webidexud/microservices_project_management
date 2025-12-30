import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Loader2, AlertCircle } from "lucide-react";
import { downloadDocument } from "@/lib/api.jsx";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DownloadDocumentButton({ contractId, children, variant = "outline", size = "default", className = "" }) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState(null);

    const handleDownload = async () => {
        if (!contractId) {
            setError("No hay un contrato seleccionado");
            return;
        }

        try {
            setIsDownloading(true);
            setError(null);

            // Llama a la API para obtener el documento
            const response = await downloadDocument(contractId);

            // Verificar si la respuesta es válida
            if (!response.data) {
                throw new Error("No se recibieron datos del documento");
            }

            // Crear blob y descargar
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Contrato-${contractId}-${new Date().toISOString().split('T')[0]}.docx`;

            // Añadir al DOM, hacer click y limpiar
            document.body.appendChild(link);
            link.click();

            // Limpiar recursos
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);

        } catch (error) {
            console.error('Error al descargar el documento:', error);
            setError(error.response?.data?.message || error.message || "Error al descargar el documento");

            // Mostrar alerta si no hay sistema de notificaciones
            if (!error.response) {
                alert("No se pudo conectar con el servidor. Verifique su conexión.");
            }
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="w-full">
            {error && (
                <Alert variant="destructive" className="mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                        {error}
                    </AlertDescription>
                </Alert>
            )}

            <Button
                variant={variant}
                className={`w-full justify-start h-auto py-2 sm:py-3 ${className}`}
                onClick={handleDownload}
                disabled={isDownloading || !contractId}
            >
                {isDownloading ? (
                    <Loader2 className="mr-2 h-4 w-4 flex-shrink-0 animate-spin" />
                ) : (
                    <Download className="mr-2 h-4 w-4 flex-shrink-0" />
                )}
                <span className="truncate text-left">
                    {isDownloading ? "Generando documento..." : (children || "Descargar Documento")}
                </span>
            </Button>
        </div>
    );
}