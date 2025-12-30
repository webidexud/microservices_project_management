import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm, useFieldArray } from "react-hook-form"

import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/select.jsx"
import ContractPreview from "../components/docs/ContractPreview.jsx"

import { updateContract, catalogData, getContractById } from "../lib/api.jsx"
import { formatDate, formatDateToYYYYMMDD } from "../lib/utils.js"

export default function EditContract() {
  const navigate = useNavigate()
  const { register, control, handleSubmit, watch, reset, setValue } = useForm({
    defaultValues: {
      cdps: [{ CDP_number: "", CDP_date: "" }], // al menos un CDP vacío por defecto
      amparos: [{ amparo_id: "", valor: "" }]
    }
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const today = new Date().toISOString().split("T")[0];

  const { id } = useParams()
  const legalRepresentant = watch("legal_representative")


  const { data: contract = {}, refetch } = useQuery({
    queryKey: ["contract", id],
    queryFn: async () => {
      const res = await getContractById(id);
      console.log(res.data.contract);
      res.data.contract.CB_issue_date = formatDateToYYYYMMDD(res.data.contract.CB_issue_date);
      res.data.contract.CB_signature_ci_date = formatDateToYYYYMMDD(res.data.contract.CB_signature_ci_date);
      res.data.contract.CB_start_date = formatDateToYYYYMMDD(res.data.contract.CB_start_date);
      res.data.contract.CB_end_date = formatDateToYYYYMMDD(res.data.contract.CB_end_date);
      return res.data.contract || {};
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });




  const reglasDeEstado = {
    1: [1, 2],      // incompleto
    // 2: [3, 4],      // revisión
    // 3: [5, 6],      // firmado abogado
    // 4: [9, 10],     // firmado cliente
    // 5: [6],         // firmado líder
    // 6: [1, 2],      // activo
  };

  const estadoActual = contract?.CB_status_type_id;
  const opcionesPermitidas = reglasDeEstado[estadoActual] || [];



  useEffect(() => {
    if (Object.keys(contract).length > 0) {
      reset(contract);
    }
  }, [contract, reset]);



  const { data: catalogs = {} } = useQuery({
    queryKey: ["catalogs"],
    queryFn: async () => {
      const res = await catalogData()
      return res.data.catalogs || {}
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })


  const queryClient = useQueryClient()
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true)
      await updateContract(id, data)
      // reset()
      await queryClient.invalidateQueries(["contracts"])
      // refetch()
      alert("✅ Contrato actualizado correctamente")
      navigate("/contract")
    } catch (error) {
      alert("Error al actualizar el contrato D':")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Detectar el tipo de contrato para mostrar secciones condicionales
  const contractTypeId = watch("CB_contract_type_id")

  const { fields, append, remove } = useFieldArray({
    control,
    name: "CDP",
  })
  const { fields: amparoFields, append: appendAmparo, remove: removeAmparo } = useFieldArray({
    control,
    name: "amparos", // nombre distinto al otro arreglo
  })

  const startDate = watch("CB_start_date")
  const endDate = watch("CB_end_date")
  useEffect(() => {

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      setValue("CB_total_duration", 0);
      return;
    }

    const diffinMs = end - start

    // Convertir a días (1 día = 1000 * 60 * 60 * 24 ms)
    const diffInDays = Math.ceil(diffinMs / (1000 * 60 * 60 * 24));
    setValue("CB_total_duration", diffInDays)
  }, [startDate, endDate])

  const formValues = watch()


  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b shadow-sm">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/contract")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Editar el Contrato # {id}</h1>
              <p className="text-sm text-text-secondary mt-0.5">
                Complete la información del contrato para registrarlo en el sistema.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/contract")}>
              Cancelar
            </Button>
            <Button
              form="project-form"
              type="submit"
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Guardando..." : "Actualizar Contrato"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 lg:px-8">
        {/* Formulario principal */}
        <form id="project-form" onSubmit={handleSubmit(onSubmit)} className="my-6 space-y-6 col-span-2">

          {/* 🧩 Información General */}
          <Card>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Información General</h3>

              <div>
                <Label htmlFor="CB_contract_type_id">Tipo de Contrato</Label>
                {/* <Input {...register("contract_type_id")}/> */}

                <Select {...register("CB_contract_type_id")} id="CB_contract_type_id" style={{
                  pointerEvents: "none",
                  backgroundColor: "#eee",
                }}>
                  <option value="">Seleccione...</option>
                  {catalogs?.Contract_type?.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>{tipo.name}</option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="CB_payment_method_id">Método de Pago</Label>
                <Select {...register("CB_payment_method_id")} id="CB_payment_method_id">
                  <option value="">Seleccione...</option>
                  {catalogs?.payment_method?.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="CB_project_name">Nombre del Projecto</Label>
                <Input {...register("CB_project_name")} type="text" placeholder="Nombre del Proyecto" />
              </div>

              <div>
                <Label htmlFor="CB_execution_location">Lugar de Ejecución</Label>
                <Input {...register("CB_execution_location")} type="text" placeholder="Lugar de Ejecución" />
              </div>


              <div>
                <Label htmlFor="CB_value">Valor del Contrato</Label>
                <Input {...register("CB_value")} type="number" placeholder="Valor del contrato" />
              </div>
            </CardContent>
          </Card>

          {/* 📅 Fechas */}
          <Card>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Duración</h3>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="CB_start_date">Fecha de inicio</Label>
                  <Input {...register("CB_start_date")} type="date" />
                </div>
                <div>
                  <Label htmlFor="CB_end_date">Fecha de fin</Label>
                  <Input {...register("CB_end_date")} type="date" />
                </div>

                <div>
                  <Label htmlFor="CB_signature_ci_date">Fecha de firma de Contrato Interadministrativo</Label>
                  <Input {...register("CB_signature_ci_date")} type="date" />
                </div>
                <div>
                  <Label htmlFor="CB_issue_date">Fecha del contrato</Label>
                  <Input {...register("CB_issue_date")} type="date" readOnly />
                </div>
              </div>

              <div>
                <Label htmlFor="CB_total_duration">Duración total del contrato en Días</Label>
                <Input {...register("CB_total_duration")} type="text" readOnly />
              </div>


            </CardContent>

          </Card>




          {/* 🧾 CDP */}
          <Card>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 flex justify-between items-center">
                <span>Certificado de Disponibilidad Presupuestal (CDP)</span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ CDP_number: "", CDP_date: "" })}
                >
                  + Agregar CDP
                </Button>
              </h3>

              {fields.map((item, index) => (
                <div key={item.id} className="grid grid-cols-2 gap-5 items-end border-b pb-3">
                  <div>
                    <Label>Numero CDP</Label>
                    <Input
                      {...register(`CDP.${index}.CDP_number`)}
                      type="number"
                      placeholder="# del CDP"
                    />
                  </div>
                  <div>
                    <Label>Fecha CDP</Label>
                    <Input
                      {...register(`CDP.${index}.CDP_date`)}
                      type="date"
                    />
                  </div>
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => remove(index)}
                      className="col-span-2 w-fit"
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>



          {/* 📑 Contrato Derivado */}
          {contractTypeId === 1 && (
            <Card>
              <CardContent className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Contrato Derivado</h3>
                <div>
                  <Label htmlFor="CD_contracting_entity">Entidad Contratante</Label>
                  <Input {...register("CD_contracting_entity")} type="text" placeholder="Nombre de la entidad" />
                </div>

                <div>
                  <Label htmlFor="CD_cia_object">Objeto de CIA</Label>
                  <Input {...register("CD_cia_object")} type="text" placeholder="Objeto de CIA" />
                </div>

                <div>
                  <Label htmlFor="CD_contract_purpose">Proposito Contractual</Label>
                  <Input {...register("CD_contract_purpose")} type="text" placeholder="Proposito Contractual" />
                </div>
                <div>
                  <Label htmlFor="CD_specific_obligations">Obligaciones Especificas</Label>
                  <Input {...register("CD_specific_obligations")} type="text" placeholder="Actividad 1; Actividad 2; Actividad 3;..." />
                </div>

                <div>
                  <Label htmlFor="CD_deliverables">Entregables</Label>
                  <Input {...register("CD_deliverables")} type="text" placeholder="Entregable 1; Entregable 2; Entregable 3;..." />
                </div>


                <div>
                  <Label htmlFor="CD_education_level_id">Nivel Educativo</Label>
                  <Select {...register("CD_education_level_id")}>
                    <option value="">Seleccione...</option>
                    {catalogs?.education_level?.map((e) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </Select>
                </div>

              </CardContent>
            </Card>
          )}

          {/* 🧾 Contrato Comercial */}
          {contractTypeId === "6" && (
            <Card>
              <CardContent className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Contrato Comercial</h3>
                <div>
                  <Label htmlFor="agreement">Acuerdo</Label>
                  <Input {...register("agreement")} placeholder="Descripción del acuerdo" />
                </div>

                <div>
                  <Label htmlFor="supplier_justification">Justificación del Proveedor</Label>
                  <Input {...register("supplier_justification")} placeholder="Motivo de selección" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* 🧾 proveedor */}
          {contractTypeId === "6" && (
            <Card>
              <CardContent className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Proveedor y Representante Legal</h3>

                <div>
                  <Label htmlFor="supplier_name">Nombre del Proveedor</Label>
                  <Input {...register("supplier_name")} type="text" placeholder="Proveedor S.A.S" />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="type_identification_id_supplier">Tipo de Identificación del Proveedor</Label>
                    <Select {...register("type_identification_id_supplier")}>
                      <option value="">Seleccione...</option>
                      {catalogs?.type_identification?.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="number_identification_id_supplier"># de identificación del Proveedor</Label>
                    <Input {...register("number_identification_id_supplier")} type="number" placeholder="0123456789" />
                  </div>

                  <div>
                    <Label htmlFor="phone_supplier">Teléfono del Proveedor</Label>
                    <Input {...register("phone_supplier")} type="text" placeholder="3001234567" />
                  </div>
                  <div>
                    <Label htmlFor="email_supplier">Email del Proveedor</Label>
                    <Input {...register("email_supplier")} type="text" placeholder="proveedor@empresa.com" />
                  </div>

                </div>

                <div>
                  <Label htmlFor="legal_representative">¿Tiene representante Legal?</Label>
                  <Select {...register("legal_representative")}>
                    <option value="false">No</option>
                    <option value="true">Si</option>
                  </Select>
                </div>
                {/* REPRESENTANTE LEGAL */}
                {String(legalRepresentant) === "true" && (
                  <div className="border p-2 rounded-md space-y-4">
                    <h2 className="font-semibold">Información del Representante legal</h2>
                    <div>
                      <Label htmlFor="legal_representative_name">Nombre del representante legal</Label>
                      <Input {...register("legal_representative_name")} type="text" placeholder="Nombre del representante legal" />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <Label htmlFor="type_identification_id">Tipo de Identificación del representante legal</Label>
                        <Select {...register("type_identification_id")}>
                          <option value="">Seleccione...</option>
                          {catalogs?.type_identification?.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="legal_representative_id_number"># de identificación del representante legal</Label>
                        <Input {...register("legal_representative_name")} type="text" placeholder="0123456789" />
                      </div>

                      <div>
                        <Label htmlFor="legal_representative_email">Email del representante legal</Label>
                        <Input {...register("legal_representative_email")} type="text" placeholder="replegal@comercio.com" />
                      </div>
                      <div>
                        <Label htmlFor="legal_representative_phone">Numero del representante legal</Label>
                        <Input {...register("legal_representative_phone")} type="text" placeholder="301567890" />
                      </div>
                    </div>

                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 🛡️ Amparos */}
          {contractTypeId === "6" && (
            <Card>
              <CardContent className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2 flex justify-between items-center">
                  <span>Amparos Asociados al Contrato</span>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendAmparo({ amparo_id: "", valor: "" })}
                  >
                    + Agregar Amparo
                  </Button>
                </h3>

                {amparoFields.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-3 gap-5 items-end border-b pb-3">
                    <div>
                      <Label htmlFor={`amparos.${index}.amparo_id`}>
                        Tipo de Amparo
                      </Label>
                      <Input {...register(`amparos.${index}.amparo_id`)} type="text" placeholder="Amparo" />
                    </div>

                    <div>
                      <Label htmlFor={`amparos.${index}.valor`}>
                        Valor del Amparo
                      </Label>
                      <Input {...register(`amparos.${index}.valor`)} type="number" placeholder="Amparo" />
                    </div>

                    {index > 0 && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeAmparo(index)}
                        className="w-fit"
                      >
                        Eliminar
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}



          {/* Estado y contactos */}
          <Card>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Estado y Contacto</h3>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="CB_email">Correo de contacto</Label>
                  <Input {...register("CB_email")} type="email" placeholder="correo@empresa.com" />
                </div>
                <div>
                  <Label htmlFor="CB_status_type_id">Estado del contrato</Label>

                  <Select {...register("CB_status_type_id")} id="CB_status_type_id">
                    <option value="">Seleccione...</option>
                    {catalogs?.status_type?.map(tipo => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.name.replace(/_/g, " ")}
                      </option>
                    ))}

                  </Select>

                </div>

              </div>
            </CardContent>
          </Card>


        </form>

        {/* Columna derecha: previsualización */}
        <div
          className="
            col-span-1
            sticky top-20
            max-h-[calc(100vh-6rem)]
            overflow-y-auto
            bg-white
            dark:bg-gray-900
            rounded-xl
            shadow-md
            p-4
            m-5
          "
        >
          <ContractPreview data={formValues} />
        </div>
      </div>
    </div>
  )
}
