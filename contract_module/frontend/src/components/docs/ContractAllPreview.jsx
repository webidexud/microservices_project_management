// src/components/ContractPreview.jsx
import React from "react"
import { Card, CardContent } from "../ui/card.jsx"
import { formatCurrency, formatDate, numeroALetras } from "../../lib/utils.js"

export default function ContractAllPreview({ data }) {
    if (!data) return null

    console.log(data)

    // Función para normalizar arrays que pueden venir en diferentes formatos
    const normalizeArray = (input) => {
        if (!input) return []

        try {
            // Si ya es un array
            if (Array.isArray(input)) {
                return input
                    .flatMap(item => {
                        if (typeof item === 'string') {
                            // Limpiar items que vengan como "{item1,item2}"
                            const cleanStr = item.replace(/[{}"]/g, '').trim()
                            return cleanStr.split(',').map(subItem => subItem.trim()).filter(subItem => subItem)
                        }
                        return [item]
                    })
                    .filter(item => item && item.toString().trim().length > 0)
            }

            // Si es string
            if (typeof input === 'string') {
                const cleanStr = input.replace(/[{}"]/g, '').trim()
                return cleanStr.split(',').map(item => item.trim()).filter(item => item)
            }

            return []
        } catch (error) {
            console.error('Error parsing array:', error, input)
            return []
        }
    }

    // Obtener datos normalizados
    const specificObligations = normalizeArray(data.CB_specific_obligations)
    const deliverables = normalizeArray(data.CB_deliverables)

    // Formatear texto de CDPs
    const getCdpsText = () => {
        if (data.CB_cdps && data.CB_cdps.length > 0) {
            return data.CB_cdps.map(cdp => `número ${cdp.cdp_number || cdp.number || "___"}`).join(", ")
        }
        if (data.CB_cdps_text) return data.CB_cdps_text
        return "_______"
    }

    // Obtener fecha actual si no hay fecha de creación
    const getCreationDate = () => {
        return data.CB_creation_day || data.CB_created_at || new Date().toLocaleDateString('es-ES')
    }

    // Formatear valor numérico
    const formatValue = (value) => {
        if (!value && value !== 0) return "_______"
        return formatCurrency(value)
    }

    // Obtener valor en letras
    const getValueInLetters = (value) => {
        if (!value && value !== 0) return "_______"
        return numeroALetras(value)
    }

    // Función para renderizar texto con variables reemplazadas en ROJO
    const renderText = (text) => {
        if (!text) return ""

        const variables = {
            // Información personal
            '{nombre}': data.CB_nombre || "_______",
            '{apellido}': data.CB_apellido || "_______",
            '{denCedula}': data.CB_denCedula || data.CB_type_identification_name || "_______",
            '{cedulaNum}': data.CB_cedulaNum || data.CB_number_identification || "_______",
            '{expedicion}': data.CB_expedicion || "_______",
            '{email}': data.CB_email || "_______",

            // Información del contrato
            '{signaturecidate}': formatDate(data.CB_signature_ci_date) || "_______",
            '{contractingentity}': data.CB_contracting_entity || "_______",
            '{contracttypename}': data.CB_contract_type_name || "_______",
            '{ciaobject}': data.CB_cia_object || "_______",
            '{educationlevelname}': data.CB_education_level_name || "_______",
            '{contractpurpose}': data.CB_contract_purpose || "_______",
            '{value}': formatValue(data.CB_value) || "_______",
            '{valueinletters}': getValueInLetters(data.CB_value) || "_______",
            '{cdps_text}': getCdpsText() || "_______",
            '{paymentmethodname}': data.CB_payment_method_name || "_______",
            '{totalduration}': data.CB_total_duration || "_______",
            '{executionlocation}': data.CB_execution_location || "_______",
            '{creationday}': formatDate(getCreationDate()) || "_______",

            // Listas
            '{specificobligations}': specificObligations.length > 0
                ? specificObligations.map((item, index) => `${index + 1}. ${item}`).join("\n")
                : "_______",
            '{deliverables}': deliverables.length > 0
                ? deliverables.map((item, index) => `${index + 1}. ${item}`).join("\n")
                : "_______",

            // Firmas
            '{signed_boss}': data.CB_signed_boss || "Firma",
            '{signed_client}': data.CB_signed_client || "Firma",
            '{signed_abog}': data.CB_signed_abog || "Firma",
            '{signed_leader}': data.CB_signed_leader || "Firma",
            '{NomAbogado}': data.CB_NomAbogado || "_______"
        }

        // Reemplazar todas las variables con spans en ROJO
        let result = text

        // Primero, manejar las tablas especiales
        result = result.replace(/\+-{2,}/g, '____') // Reemplazar líneas de tabla
        result = result.replace(/:={2,}:/g, '______') // Reemplazar separadores de tabla

        // Ahora reemplazar las variables
        Object.keys(variables).forEach(key => {
            const value = variables[key]
            if (value) {
                // Crear el span con estilo rojo (usa 'class' no 'className' para HTML)
                const replacement = `<span class="text-red-600 font-semibold bg-red-50 px-1 rounded">${value}</span>`
                result = result.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement)
            }
        })

        return result
    }

    // Texto completo del contrato
    const contractText = `
Entre los suscritos, de una parte,  CESAR ANDREY PERDOMO CHARRY, 
identificado con Cédula de Ciudadanía 7.724.669, expedida en Neiva
(Huila), quien actúa en calidad de  Jefe de la Oficina de Extensión -
IDEXUD  según Resolución No.112 del 19 de febrero de 2025 emanada de
la Rectoría de la  UNIVERSIDAD DISTRITAL FRANCISCO JOSÉ DE CALDAS ,
Acuerdo 015 de 2023 emanado del Consejo Superior Universitario ente
Universitario autónomo de conformidad con la ley 30 de 1992, debidamente
autorizado para contratar según Acuerdo No. 002 del 29 de febrero de
2000, Articulo 10 Literal i, quien en lo sucesivo se denominará  LA
UNIVERSIDAD  con  NIT 899999230-7  y  {nombre} {apellido} 
identificado (a) con  Cédula de {denCedula} No.{cedulaNum}  de
 {expedicion}  actuando en nombre propio, quién declara que no se
encuentra incurso en ninguna de las causales de inhabilidad o de
incompatibilidad consagradas en la Constitución, los artículos 8 de la
ley 80 de 1993, 18 de la ley 1150 de 2007 y la ley 1474 de 2011, y quien
en adelante se denominará  EL CONTRATISTA,  quienes hemos convenido
celebrar el presente Contrato de Prestación de Servicios que se regirá
por lo previsto en la Ley 80 de 1993, ley 1150 de 2007, Acuerdo 03 de
2015 de la UDFJ, Resolución 025 de 2022 de la UDFJ y demás normas,
decretos reglamentarios aplicables, acuerdos y resoluciones internas
previas las siguientes  CONSIDERACIONES: I.  Que, mediante el Acuerdo
04 de 2013 "*Por el cual modifica la denominación del Instituto de
Extensión de la Universidad Distrital, se define y desarrolla el Fondo
Especial de Promoción de la Extensión y la Proyección Social de la
Universidad Distrital Francisco José de Caldas y se dictan otras
disposiciones"*, se determinó en su artículo 2 crear el *"Fondo
Especial de Promoción de la Extensión y la Proyección Social de la
Universidad Distrital es un sistema especial para el manejo y
administración de recursos financieros generados por el Instituto de
Extensión y Educación para el Trabajo y Desarrollo humano IDEXUD. Estos
recursos están orientados al desarrollo de actividades de extensión"*,
es así como, la Unidad Ejecutora del Fondo Especial de Promoción de la
Extensión y la Proyección Social es el Instituto de Extensión y
Educación para el Trabajo y Desarrollo humano IDEXUD, o la Unidad
Académico Administrativa que haga sus veces, en atención al Acuerdo en
mención.  II.  El Acuerdo citado, se reglamentó a través de la
Resolución 503 de 2013, emanada por Rectoría, la cual, contempló en su
artículo 2, las actividades de extensión que se realizan a través del
Fondo Especial de Promoción de la Extensión y la Proyección Social, de
donde se establecieron entre otras modalidades: a. Asesorías; b.
Consultorías; c. Interventoría; D. Asistencia Técnica y/o tecnológica;
e. Veedurías; f. Auditorias; g. Peritazgos; h. Órdenes Judiciales; i.
Educación para el Trabajo; j. Proyectos de Educación Continuada; k.
Proyectos Especiales  III.  Que mediante Acuerdo 015 de 2023 emanado
del Consejo Superior Universitario se *"Por el cual se fija la planta de
cargos administrativos de la Universidad Distrital Francisco José de
Caldas y se subroga el acuerdo 012 de 2023"* se denomina al Director del
IDEXUD como jefe de la Oficina de Extensión  IV . Que el día
 {signaturecidate}  entre  {contractingentity}  y la Universidad
Distrital Francisco José de Caldas fue suscrito el
 {contracttypename}  cuyo objeto es  *"{ciaobject}" * el cual del
presupuesto aprobado y el plan de trabajo proyectado por parte de los
Supervisores, coordinadores y participantes en la ejecución contractual,
en aras de ejecutar las labores contenidas en el presente documento, las
cuales se consideran indispensables, necesarias y precisas para el
debido cumplimiento del objeto principal existe apropiación presupuestal
para proveer el perfil nivel  {educationlevelname}  requerido de
acuerdo con los estudios previos, la solicitud de necesidad y
documentación aportada por parte de la Supervisión del contrato en
debida forma. Por lo anterior, las partes celebran el presente contrato,
el cual se regirá por las siguientes  CLÁUSULAS: Cláusula 1 -- Objeto
del Contrato. {contractpurpose}. Cláusula 2 -- Actividades específicas
del Contratista.   {specificobligations} .  Cláusula 3 - Valor del
contrato.  El valor del presente contrato corresponde a la suma de
 {valueinletters} PESOS ({value}).  Este valor contiene todos los costos,
directos e indirectos, que conllevan la plena ejecución del contrato,
así como los impuestos a que haya lugar.  PARAGRAFO PRIMERO.
DISPONIBILIDAD PRESUPUESTAL.  Como contraprestación por el cumplimiento
del objeto contratado, LA UNIVERSIDAD pagará el valor del presente
contrato de prestación de servicios con cargo a los recursos del
 Certificado de Disponibilidad Presupuestal {cdps_text}.  El presente
Contrato está sujeto a registro presupuestal y el pago de su valor a las
apropiaciones presupuestales.  PARAGRAFO SEGUNDO.  Según el formulario
del Registro Único Tributario,  EL CONTRATISTA  informa el régimen
tributario correspondiente y cualquier cambio al mismo será
responsabilidad exclusiva de este y deberá dar aviso al Supervisor del
contrato;  LA UNIVERSIDAD  no reconocerá el valor adicional al
contrato por este concepto.  Cláusula 4 - Forma de pago.  LA
UNIVERSIDAD pagará a EL CONTRATISTA el valor del presente contrato de la
siguiente manera:  {paymentmethodname}.   PARAGRAFO PRIMERO. LA
UNIVERSIDAD  pagara a  EL CONTRATISTA  el valor del presente contrato
previa entrega de un informe que contenga las actividades pactadas de
manera detallada, verificable y avalada por el SUPERVISOR de la
prestación del servicio de conformidad con los productos asociados y
recibidos a satisfacción por parte de la Entidad Contratante
 {contractingentity}  conforme la Cláusula 6 - Productos o entregables
del presente contrato.  Cláusula 5 -- Pago.  Los pagos están sujetos a
los desembolsos por parte de la ENTIDAD CONTRATANTE
 {contractingentity}  a LA UNIVERSIDAD.  PARAGRAFO PRIMERO.  Todos
los pagos están sujetos a los descuentos de ley.  PARÁGRAFO SEGUNDO: 
Para los pagos EL CONTRATISTA deberá presentar copia del recibo de pago
al Sistema General de Seguridad Social (Salud, Pensión y ARL)
correspondiente al presente contrato de prestación de servicios, de
conformidad con lo dispuesto en la ley. La verificación de este
requisito será responsabilidad del supervisor del presente Contrato.
 Cláusula 6 -- Productos o entregables del contrato.  De acuerdo con
las actividades a ser desarrolladas por el contratista, se considera que
son soportes de la ejecución contractuales los siguientes productos o
entregables:  {deliverables}.   PARAGRAFO PRIMERO.  Estos productos
o entregables serán exigibles por parte de la Supervisión del contrato y
la Oficina de Extensión-IDEXUD en la revisión y aval de los informes de
actividades del contratista de conformidad con los productos o
entregables asociados y recibidos a satisfacción por parte de la Entidad
Contratante  {contractingentity}.   Cláusula 7 --Declaraciones del
Contratista .  EL CONTRATISTA  hace las siguientes declaraciones:
 7.1 . Se encuentra debidamente facultado para suscribir el presente
contrato.  7.2 . Al momento de la celebración del presente contrato no
se encuentra en ninguna causal de inhabilidad e incompatibilidad.
 7.3 . Está a paz y salvo con sus obligaciones laborales frente al
sistema de seguridad social integral.  7.4.  El valor del contrato
incluye todos los gastos, costos, derechos, impuestos, tasas y demás
contribuciones relacionadas con el cumplimiento del objeto del presente
contrato.  7.5  Manifiesta que los recursos que componen su patrimonio
no provienen de lavado de activos, financiación del terrorismo,
narcotráfico, captación ilegal de dineros y en general de cualquier
actividad ilícita, de igual manera manifiesta que los recursos recibidos
en desarrollo de este contrato no serán destinados a ninguna de las
actividades antes descritas.  Cláusula 8 -- Plazo.  El plazo de
ejecución es de  {totalduration} días,  sin superar la fecha de
finalización del Contrato/Convenio Interadministrativo o proyecto.
 Cláusula 9 - Derechos del Contratista. 9.1.  Recibir la remuneración
pactada en los términos de la Cláusula 4 del presente contrato.  9.2. 
Recibir de parte de  LA UNIVERSIDAD  toda la colaboración que requiera
para la debida ejecución del contrato.  9.3.  Conocer la
implementación del Sistema de Gestión de la Seguridad y Salud en el
Trabajo a cargo de Subsistema de Gestión Seguridad y Salud en el Trabajo
con el que cuenta la Universidad o quien haga de sus veces a cargo de la
Entidad Contratante.  Cláusula 10 - Propiedad Intelectual.  Si de la
ejecución del presente contrato resultan estudios, investigaciones,
descubrimientos, invenciones, información, mejoras y/o diseños, éstos
pertenecen a  LA UNIVERSIDAD , de conformidad con lo establecido en el
Artículo 20 de la Ley 23 de 1982. Así mismo,  EL CONTRATISTA 
garantiza que los trabajos y servicios prestados a  LA UNIVERSIDAD 
por el objeto de este contrato no infringen ni vulneran los derechos de
propiedad intelectual o industrial o cualesquiera otros derechos legales
o contractuales de terceros.  Cláusula 11 -- Confidencialidad. EL
CONTRATISTA  asume con  LA UNIVERSIDAD  un compromiso de reserva y
confidencialidad y a no divulgar, difundir y/o usar por ningún medio,
sin consentimiento escrito, la información que le haya sido revelada.
Igualmente se compromete a mantenerla información y documentos de  LA
UNIVERSIDAD  en reserva o secreto y mantenerla debidamente protegida
del acceso de terceros con el fin de no permitir su conocimiento y
manejo por personas no autorizadas. No podrá permitir la copia,
reproducción y eliminación total o parcial de los mismos sin previa
autorización expresa o escrita de  LA UNIVERSIDAD. Cláusula 12 - Multas
y cláusula penal pecuniaria.  Las partes acuerdan que, en caso de mora
o retardo en el cumplimiento de cualquiera de las obligaciones señaladas
en el contrato a cargo de  EL CONTRATISTA , así como de cumplimiento
defectuoso, y como apremio para que las atienda oportuna y
adecuadamente,  EL CONTRATISTA  pagará, a favor de  LA UNIVERSIDAD ,
multas equivalentes al uno por ciento (1%) del valor del contrato, por
cada día de atraso en el cumplimiento de sus obligaciones, sin que el
valor total de estas pueda exceder el diez por ciento (10%) del valor
total del mismo. Si  EL CONTRATISTA  no diere cumplimiento, en forma
total o parcial, al objeto o a las obligaciones emanadas del contrato,
así como si, por su incumplimiento, se derivara perjuicio para  LA
UNIVERSIDAD , pagará a  LA UNIVERSIDAD  el diez por ciento (10%) del
valor total del mismo, como estimación anticipada de perjuicios, sin que
lo anterior sea óbice para que se demande su valor real ante la
Jurisdicción Contencioso Administrativa.  PARÁGRAFO. Procedimiento para
hacer efectiva la cláusula de multa y penal pecuniaria . En el evento
de presentarse incumplimiento de sus obligaciones por parte de  EL
CONTRATISTA , previo informe del Supervisor con los debidos soportes y
acompañado de los correspondientes requerimientos, se adelantará el
procedimiento de que trata el capítulo III(de los posibles
incumplimientos) de la Resolución de Rectoría 629 de noviembre 17 de
2016 (Manual de Supervisión e Interventoría), con citación de la
compañía aseguradora que expidió la garantía única que ampara el
cumplimiento de las obligaciones contractuales. Declarado el
incumplimiento y en firme el correspondiente acto administrativo, previa
comunicación,  EL CONTRATISTA  o la aseguradora dispondrán de un (1)
mes para realizar el respectivo pago. En el evento de que vencido este
plazo no se realice el pago, este se demandará ante la jurisdicción
contencioso- administrativa, mediante el procedimiento ejecutivo. El
título ejecutivo lo constituirá el acto administrativo que declara el
incumplimiento, su constancia de ejecutoria y la correspondiente
garantía única.  Cláusula 13 -Garantías.  Para asegurar el
cumplimiento de las obligaciones adquiridas en virtud del presente
contrato,  EL CONTRATISTA  se obliga a constituir en una Compañía de
Seguros legalmente autorizada para funcionar en Colombia, a favor de
 LA UNIVERSIDAD  y dentro de los tres (3) días hábiles siguientes a la
fecha de firma del presente contrato, una garantía que ampare el
 CUMPLIMIENTO DEL CONTRATO , equivalente al diez por ciento (10%) del
valor total del mismo, con una vigencia igual a la del plazo de
ejecución del contrato y cuatro (4) meses más.  [Para los perfiles que
requieran un nivel profesional o superior, se deberá solicitar
adicionalmente el amparo de calidad del servicio con vigencia del plazo
del contrato y seis (6) meses más, equivalente al 10% del valor del
contrato]{.underline} .  PARÁGRAFO PRIMERO.  Las pólizas aquí
estipuladas serán de denominación en el mercado asegurador *"Póliza de
Cumplimiento ante Entidades Públicas con Régimen Privado de
Contratación"* la cual deberá ser aprobada por la Oficina de Extensión-
IDEXUD.  PARÁGRAFO SEGUNDO.  Corresponde al Supervisor del contrato
verificar de manera constante la vigencia de las garantías, de acuerdo
con la efectiva ejecución presupuestal del contrato y en todo caso
siempre las garantías deberán corresponder a la vigencia establecida en
esta cláusula.  PARÁGRAFO TERCERO.  En caso de que haya necesidad de
adicionar, prorrogar o suspender el contrato o en cualquier otro evento
necesario, el contratista se obliga a modificar las garantías de acuerdo
con las normas legales vigentes y a la modificación realizada al
contrato.  PARÁGRAFO CUARTO.  La garantía aquí referida debe cobijar
el término establecido para la ejecución contractual desde la fecha de
expedición de la misma, en caso de no cumplir con la cobertura indicada,
el contratista deberá solicitar a la aseguradora el ajuste de las
mismas.  Cláusula 14 - ESTAMPILLA U. D. F. J. C., PRO CULTURA Y ADULTO
MAYOR . De conformidad con lo dispuesto en el Acuerdo 187 del 20 de
diciembre de 2005 del Concejo de Bogotá, D.C., del valor bruto del
contrato y de sus adicionales, si las hubiere, se retendrá el 0.5% por
concepto de la Estampilla Pro-Cultura. De conformidad con lo dispuesto
en el Acuerdo 645 de junio 9 de 2016 del Concejo de Bogotá D.C., del
valor bruto del contrato y de sus adiciones, si las hubiere, se retendrá
el 2% por concepto de la Estampilla Adulto Mayor.  PARÁGRAFO PRIMERO .
Conforme a lo establecido en el parágrafo del artículo segundo del
Acuerdo 696 de diciembre 28 de 2017, están excluidos del pago de la
Estampilla Universidad Distrital Francisco José de Caldas 50 años los
contratos de prestación de servicios suscritos con personas naturales,
cuyo valor no supere las 315 Unidades de Valor Tributario -- UVT por
concepto de honorarios mensuales.  Cláusula 15 - No existencia de
subordinación ni relación laboral y exención de prestaciones sociales .
Los servicios contratados se ejecutarán de manera temporal, autónoma y
sin subordinación, razón por lo cual no genera relación laboral ni
prestaciones sociales y ningún tipo de costos distintos al valor
acordado en el presente contrato de prestación de servicios de
conformidad con lo preceptuado en el numeral 3 del artículo 32 de la Ley
80 de 1993 por lo cual el presente contrato no vincula a la Universidad
Distrital Francisco José de Caldas ni laboral, ni prestacionalmente con
 EL CONTRATISTA .  Cláusula 16 - Cesión .  EL CONTRATISTA  no
puede ceder parcial ni totalmente sus obligaciones o derechos derivados
del presente Contrato, sin la autorización previa y por escrito de  LA
UNIVERSIDAD .  Cláusula 17 - Modificación, adición y/o prórroga . El
contrato solo podrá ser modificado, adicionado y/o prorrogado de mutuo
acuerdo entre las partes, mediante OTROSI, el cual hará parte integral
del presente contrato.  Cláusula 18 -- Terminación.  Serán causales de
terminación del contrato el común acuerdo de las partes al respecto, la
ocurrencia de cualquier circunstancia de fuerza mayor, caso fortuito o
voluntad de EL CONTRATISTA que impida la ejecución del contrato, así
como el cumplimiento del plazo pactado para su ejecución y cuando
existan saldos a favor de la Universidad.  PARAGRAFO PRIMERO.  El
presente contrato no será objeto de liquidación, salvo la ocurrencia de
las situaciones mencionadas en la cláusula 18, de acuerdo con lo
dispuesto en el artículo 22 del Acuerdo 003 de 2015, según el cual "no
requieren ser liquidados los contratos de ejecución instantánea, ni los
contratos u órdenes de prestación de servicios".  Cláusula 19 --
Liquidación unilateral.  De acuerdo con lo dispuesto en el capítulo 7
de la CIRCULAR INTERNA ÚNICA JURÍDICA expedida por la Oficina Asesora
Jurídica de la Universidad, será procedente liquidar de manera
unilateral la relación contractual cuando no se perfeccione el contrato
dentro del término estipulado para tal finalidad y represente afectación
a la legalización de la relación contractual y/o por:  (i)  Cuando las
exigencias del servicio público lo requieran o la situación de orden
público lo imponga;  (ii)  Por muerte o incapacidad física permanente
del contratista, si es persona natural, o por disolución de la persona
jurídica del contratista;  (iii)  la no constitución de la garantía
única y sus modificaciones;  (iv)  la no suscripción y remisión de la
presente minuta en un término de 3 días hábiles  (v)  la no
suscripción del Acta de Inicio en un término de 3 días hábiles, entre
otras o se evidencie incumplimiento de las obligaciones formales por
parte del contratista que conlleve a la afectación e incumplimiento con
el objeto del proyecto principal. De igual manera y de manera
excepcional será procedente la liquidación unilateral cuando, tras la
convocatoria reiterada realizada para realizar liquidación bilateral no
exista pronunciamiento por parte del contratista o concurrencia del
mismo a efectos de suscribir la misma, siempre que esta genere una
afectación al normal desarrollo del proyecto.  Cláusula 20 -
Suspensión . Las partes contratantes podrán suspender la ejecución del
contrato, mediante la suscripción de un acta en donde conste tal evento,
cuando medie alguna de las siguientes causales:  1)  Por
circunstancias de fuerza mayor o caso fortuito, debidamente comprobadas,
que imposibiliten su ejecución.  2)  Por solicitud, debidamente
sustentada, elevada por una de las partes. El término de suspensión no
imputable al contratista, no se computará para efectos del plazo
extintivo del presente contrato, sin embargo,  EL CONTRATISTA  se
compromete a presentar certificado de modificación de la garantía única,
ampliando su vigencia por el término que dure la suspensión.  PARÁGRAFO
PRIMERO.  La suspensión del contrato no dará derecho a exigir
indemnización, sobrecostos o reajustes, ni a reclamar gastos diferentes
a los pactados en el contrato.  Cláusula 21 - Bienes .  EL
CONTRATISTA  se compromete a cuidar todos los bienes de  LA
UNIVERSIDAD  con los que tenga contacto en virtud de la ejecución del
presente contrato, así como a responder en el evento de que cause daño a
éstos. Adicionalmente, deberá entregar, al finalizar el contrato y en
perfecto estado, los bienes que, en calidad de préstamo, se le hayan
entregado, para ejecutar las actividades a su cargo.  Cláusula 22 -
Indemnidad. EL CONTRATISTA  se obliga a indemnizar a  LA UNIVERSIDAD 
con ocasión de la violación o el incumplimiento de las obligaciones
previstas en el presente Contrato.  EL CONTRATISTA  se obliga a
mantener indemne a  LA UNIVERSIDAD  de cualquier daño o perjuicio
originado en reclamaciones de terceros que tengan como causa sus
actuaciones hasta por el monto del daño o perjuicio causado y hasta por
el valor del presente Contrato.  EL CONTRATISTA  mantendrá indemne a
 LA UNIVERSIDAD  por cualquier obligación de carácter laboral o
relacionado que se originen en el incumbimiento de las obligaciones
laborales que  EL CONTRATISTA  asume frente al personal, subordinados
o terceros que se vinculen a la ejecución de las obligaciones derivadas
del presente Contrato.  Cláusula 23 - Solución de Controversias.  Las
controversias o diferencias que surjan entre  EL CONTRATISTA  y  LA
UNIVERSIDAD , con ocasión del presente contrato serán sometidas a la
revisión de las partes para buscar un arreglo directo, en un término no
mayor a cinco (5) días hábiles contados a partir de la fecha en que
cualquiera de las partes comunique por escrito a la otra la existencia
de una diferencia. Cuando la controversia no pueda arreglarse de manera
directa la parte interesada quedará con autonomía para acudir a la
Jurisdicción Contenciosa Administrativa.  Cláusula 24 - Supervisión .
Esta función será adelantada por  EL JEFE Y LA OFICINA DE EXTENSIÓN-
IDEXUD O SU DELEGADO  para tal finalidad y sus funciones serán las
estipuladas en el Acuerdo 003 de 2015, así como en la Resolución
Reglamentaria No. 262 de 2015 y en la Resolución No. 629 de noviembre 17
de 2016 (Manual de Supervisión e Interventoría de la Universidad
Distrital Francisco José de Caldas), emanadas de Rectoría, y las demás
inherentes a la función desempeñada.  Cláusula 25 - Documentos .
Forman parte integrante del contrato los siguientes documentos:
 25.1 . Propuesta de servicio,  25.2 . Certificados de
Disponibilidad y Registro Presupuestal,  25.3 . Acta de inicio.
 25.4.  Acta de Aprobación de Póliza y  25.5 . Los demás que se
generen durante la ejecución.  Cláusula 26 - Perfeccionamiento y
ejecución . El presente contrato requiere para su perfeccionamiento y
ejecución la suscripción por las partes del presente documento y del
acta de inicio, no obstante, para la suscripción de la segunda se hace
necesaria constitución previa de la garantía única; cuya vigencia deberá
cubrir a cabalidad el tiempo estimado en el la cláusula de Garantías.
 Cláusula 27 -- Notificación . Con ocasión a los artículos 56
modificado por el artículo 10 de la Ley 2080 de 2021 y el artículo 66
del Código de Procedimiento Administrativo y de lo Contencioso
Administrativo téngase autorizado el correo electrónico brindado por el
CONTRATISTA en la Hoja de vida SIDEAP aportada dentro de la etapa
precontractual como medio de notificación electrónica. Para tal efecto
el contratista constata que el correo electrónico de notificación será
el siguiente:  {email}   Cláusula 28 - Lugar de ejecución y domicilio
contractual . Se pacta como domicilio contractual la ciudad de Bogotá
D.C. y se establece como lugar de ejecución la ciudad de
 {executionlocation}. 
<br />
<br />
Para constancia se firma el día  {creationday} 
<br />
<br />

<div class="grid grid-cols-2 justify-between">

    <div>
        {signed_boss}
        <p class="font-bold">CESAR ANDREY PERDOMO CHARRY</p>
        <p class="text-sm text-gray-600">Jefe Oficina de Extensión-IDEXUD</p>
    </div>
    <div>
        {signed_client}
        <p class="font-bold">{nombre}</p>
        <p class="text-sm text-gray-600">Contratista</p>
    </div>

</div>


<br />
<br />
<br />

<Table class="w-full border-collapse border border-black">
    <thead>
        <tr>
            <th class="border border-black"></th>
            <th class="border border-black">NOMBRE</th>
            <th class="border border-black">CARGO</th>
            <th class="border border-black">FIRMA</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td class="border border-black">Proyectó</td>
            <td class="border border-black">{NomAbogado}</td>
            <td class="border border-black">CPS: Abogado/a</td>
            <td class="border border-black">{signed_abog}</td>
        </tr>
        <tr>
            <td class="border border-black">Revisó</td>
            <td class="border border-black">{NomAbogado}</td>
            <td class="border border-black">CPS: Abogado/a</td>
            <td class="border border-black">{signed_abog}</td>
        </tr>
    </tbody>
</Table>

<br />
<br />
<br />

`

    return (
        <Card className="max-w-4xl mx-auto">
            <CardContent>
                <div className="text-justify leading-relaxed">
                    <h2 className="text-center font-bold text-xl mb-4">
                        PREVISUALIZACIÓN DEL CONTRATO
                    </h2>

                    <p className="text-center font-bold mb-6">
                        CPS-{data.CB_id || "___"}-I-2025
                    </p>

                    {/* Contrato completo con todas las variables EN ROJO */}
                    <div
                        className="contract-content"

                        dangerouslySetInnerHTML={{ __html: renderText(contractText) }}
                    />

                    {/* Estilos adicionales si es necesario */}
                    <style jsx>{`
                        .contract-content {
                            font-family: 'Times New Roman', Times, serif;
                            font-size: 12pt;
                            line-height: 1.6;
                        }
                        .contract-content b {
                            font-weight: bold;
                        }
                        .contract-content .underline {
                            text-decoration: underline;
                        }
                    `}</style>
                </div>
            </CardContent>
        </Card>
    )
}