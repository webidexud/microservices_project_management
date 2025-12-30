// src/components/ContractPreview.jsx
import React from "react"
import { Card, CardContent } from "../ui/card.jsx"

import { formatCurrency, formatDate, numeroALetras } from "../../lib/utils.js"

export default function ContractPreview({ data }) {
    if (!data) return null


    // Función simple para normalizar deliverables
    const getDeliverables = () => {
        if (!data.deliverables) return [];
        
        try {
            // Si es array con string con formato {item1,item2}
            if (Array.isArray(data.deliverables) && data.deliverables.length > 0) {
                const firstItem = data.deliverables[0];
                
                if (typeof firstItem === 'string') {
                    // Limpiar y convertir
                    const cleanStr = firstItem
                        .replace(/[{}"]/g, '') // Remover {, }, y "
                        .trim();
                    
                    return cleanStr
                        .split(',')
                        .map(item => item.trim())
                        .filter(item => item.length > 0);
                }
            }
            
            // Si ya es array normal
            if (Array.isArray(data.deliverables)) {
                return data.deliverables;
            }
            
            return [];
        } catch (error) {
            console.error('Error parsing deliverables:', error);
            return [];
        }
    }

    const deliverables = getDeliverables();


    return (
        <Card>
            <CardContent>
                <div className="text-justify leading-relaxed">

                    <h2 className="text-center font-bold text-xl mb-4">
                        PREVISUALIZACIÓN DEL CONTRATO
                    </h2>

                    {/* ENCABEZADO */}
                    <p className="text-center font-semibold mb-4">
                        CPS-{data.number_contract || "___"}-I-2025
                    </p>

                    {/* PARTES DEL CONTRATO */}
                    <p>
                        Entre los suscritos, de una parte la UNIVERSIDAD y
                        <b> {data.nombre || "___Nom_Contratista____"} </b>,
                        identificado(a) con Cédula de <b>{data.denCedula || "__tipo_ced_contratista_____"}</b> No.
                        <b>{data.cedulaNum || "___#_ced_contratista____"}</b> de <b>{data.expedicion || "___Lug_Expd____"}</b>, quien actúa en nombre propio.
                    </p>

                    {/* CONTRATO PRINCIPAL */}
                    <p className="mt-3">
                        El día <b>{formatDate(data.signature_ci_date) || "_______"}</b>, entre la entidad
                        <b> {data.contracting_entity || "_______"} </b> y la Universidad Distrital se suscribió el
                        <b> {data.contract_type_name || "_______"} </b> cuyo objeto es:
                        <b> "{data.cia_object || "_______"}" </b>.
                    </p>

                    <p className="mt-3">
                        Para este contrato se requiere el perfil nivel
                        <b> {data.education_level_name || "_______"} </b>.
                    </p>

                    {/* OBJETO */}
                    <p className="mt-4">
                        <b>Objeto del contrato:</b> {data.contract_purpose || "_______"}
                    </p>

                    {/* OBLIGACIONES */}
                    <p className="mt-3">
                    <b>Obligaciones específicas:</b><br />
                    {Array.isArray(data.specific_obligations)
                        ? data.specific_obligations.join(", ")
                        : "_______"}
                    </p>

                    {/* VALOR DEL CONTRATO */}
                    <p className="mt-3">
                        El valor del contrato es
                        <b> {numeroALetras(data.value) || "_______"} PESOS </b>
                        ({formatCurrency(data.value) || "_______"} ).
                    </p>

                    <p className="mt-2">
                        {data.cdps && data.cdps.length > 0 ? (
                            data.cdps
                            .map(cdp => `CDP número ${cdp.cdp_number} con fecha ${cdp.cdp_date}`)
                            .join(", ")
                        ) : (
                            "_______"
                        )}
                    </p>

                    {/* FORMA DE PAGO */}
                    <p className="mt-3">
                        <b>Forma de pago:</b> {data.payment_method_name || "_______"}
                    </p>

                    {/* ENTREGABLES */}
                    <p className="mt-3">
                        <b>Productos o entregables:</b><br />
                        {deliverables.length > 0
                            ? deliverables.join(", ")
                            : "_______"}
                    </p>

                    {/* PLAZO */}
                    <p className="mt-3">
                        <b>Plazo de ejecución:</b> {data.total_duration || "_______"} día/s.
                    </p>

                    {/* CORREO Y LUGAR */}
                    <p className="mt-3">
                        Si se requiere información adicional contactese:
                        <b> {data.email || "_______"} </b>
                    </p>

                    <p className="mt-1">
                        El lugar de ejecución es:
                        <b> {data.execution_location || "_______"} </b>
                    </p>

                    {/* FECHA DE FIRMA */}
                    <p className="mt-4">
                        Para constancia se crea el día <b>{formatDate(data.creation_day) || "_______"}</b>.
                    </p>

                    {/* FIRMAS */}
                    <div className="mt-6 flex justify-between">
                        <div>
                            <p><b>CESAR ANDREY PERDOMO CHARRY</b></p>
                            <p>Jefe Oficina de Extensión – IDEXUD</p>
                        </div>

                        <div>
                            <p><b>{data.nombre || "_______"} {data.apellido || "_______"}</b></p>
                            <p>Contratista</p>
                        </div>
                    </div>

                    {/* ABOGADO */}
                    <div className="mt-6">
                        <p><b>Proyectó:</b> {data.NomAbogado || "_______"}</p>
                    </div>

                </div>


            </CardContent>
        </Card>

    )
}
