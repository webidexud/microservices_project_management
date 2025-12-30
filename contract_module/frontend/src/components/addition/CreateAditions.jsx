import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { FileDigit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/select.jsx"
import { catalogData, createAddition } from "@/lib/api.jsx"

export default function CreateAditions({ id, onSuccess }) {

    const { register, handleSubmit, watch, setValue } = useForm()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { data: catalogs = {} } = useQuery({
        queryKey: ["catalogs"],
        queryFn: async () => {
            const res = await catalogData()
            return res.data.catalogs || {}
        },
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    })

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true)
            await createAddition(data, id)
            onSuccess ? onSuccess() : alert("✅ Adicional creado correctamente")
        } catch {
            alert("Error al crear el adicional D':")
        } finally {
            setIsSubmitting(false)
        }
    }

    const additionType = watch("BA_addition_type_id")
    const start_date_addition = watch("BA_start_date_addition")
    const end_date_addition = watch("BA_end_date_addition")

    const rangeDate = (start, end) => {
        const s = new Date(start)
        const e = new Date(end)
        const diff = Math.abs(e - s)
        return Math.ceil(diff / (1000 * 60 * 60 * 24))
    }

    useEffect(() => {
        if (start_date_addition && end_date_addition) {
            setValue("EX_time_extension", rangeDate(start_date_addition, end_date_addition))
        }
    }, [start_date_addition, end_date_addition])


    return (
        <Card className="p-4">
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* ------------------ TIPO DE ADICIONAL ------------------ */}
                    <div className="space-y-2">
                        <Label htmlFor="BA_addition_type_id">Tipo de Adicional</Label>
                        <Select {...register("BA_addition_type_id", { valueAsNumber: true })}>
                            <option value="">Seleccione...</option>
                            {catalogs?.addition_type?.map((e) => (
                                <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                        </Select>
                    </div>

                    {/* ------------------ FECHAS ------------------ */}
                    <Card>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                            <div className="space-y-2">
                                <Label>Fecha de inicio</Label>
                                <Input type="date" {...register("BA_start_date_addition")} />
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha de fin</Label>
                                <Input type="date" {...register("BA_end_date_addition")} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* ------------------ JUSTIFICACIÓN ------------------ */}
                    <div className="space-y-2">
                        <Label>Justificación</Label>
                        <Input type="text" {...register("BA_justification")} />
                    </div>

                    {/* ------------------ SECCIONES DINÁMICAS ------------------ */}

                    {/* PRÓRROGA */}
                    {additionType === 1 && (
                        <Card className="border-blue-300">
                            <CardContent className="p-4 space-y-2">
                                <Label>Tiempo de extensión (días)</Label>
                                <Input type="number" {...register("EX_time_extension")} />
                            </CardContent>
                        </Card>
                    )}

                    {/* ADICIÓN */}
                    {additionType === 2 && (
                        <Card className="border-green-300">
                            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Método de pago</Label>
                                    <Select {...register("AD_payment_method_id")}>
                                        <option value="">Seleccione...</option>
                                        {catalogs?.payment_method?.map((e) => (
                                            <option key={e.id} value={e.id}>{e.name}</option>
                                        ))}
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Valor</Label>
                                    <Input type="number" {...register("AD_value")} />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* MODIFICACIONES */}
                    {additionType === 3 && (
                        <Card>
                            <CardContent className="p-4 space-y-2">
                                <Label>Cláusula de modificación</Label>
                                <Input type="text" {...register("MO_clause_modification")} />
                            </CardContent>
                        </Card>
                    )}

                    {/* ALCANCE */}
                    {additionType === 4 && (
                        <Card>
                            <CardContent className="p-4 space-y-2">
                                <Label>Nuevas obligaciones</Label>
                                <Input type="text" {...register("SC_new_obligations")} />
                            </CardContent>
                        </Card>
                    )}

                    {/* SUSPENSIÓN */}
                    {additionType === 5 && (
                        <Card>
                            <CardContent className="p-4 space-y-2">
                                <Label>Periodo</Label>
                                <Input type="text" {...register("SP_period")} />
                            </CardContent>
                        </Card>
                    )}

                    {/* REINICIO */}
                    {additionType === 6 && (
                        <Card>
                            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Periodo</Label>
                                    <Input type="text" {...register("RE_period")} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Actualizar garantía</Label>
                                    <Input type="text" {...register("RE_update_warranty")} />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* CESIÓN */}
                    {additionType === 7 && (
                        <Card>
                            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    ["AS_value_assignor", "Valor del asignador"],
                                    ["AS_amount_due", "Cantidad adeudada"],
                                    ["AS_value_given", "Valor del asignado"],
                                    ["AS_update_warranty", "Actualizar garantía"]
                                ].map(([field, label]) => (
                                    <div key={field} className="space-y-2">
                                        <Label>{label}</Label>
                                        <Input type="text" {...register(field)} />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* LIQUIDACIÓN BILATERAL */}
                    {additionType === 8 && (
                        <Card>
                            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    ["BS_suspension", "Suspensión"],
                                    ["BS_number_extension", "Número de extensión"],
                                    ["BS_number_addition", "Número de adición"],
                                    ["BS_final_value_whit_addition", "Valor final con adición"],
                                    ["BS_percentage_completion", "Porcentaje de cumplimiento"],
                                    ["BS_value_execution", "Valor ejecutado"],
                                    ["BS_amount_due", "Cantidad adeudada"],
                                    ["BS_value_released", "Valor liberado"],
                                    ["BS_liquidation_request", "Solicitud de liquidación"]
                                ].map(([field, label]) => (
                                    <div key={field} className="space-y-2">
                                        <Label>{label}</Label>
                                        <Input type="text" {...register(field)} />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* LIQUIDACIÓN UNILATERAL */}
                    {additionType === 9 && (
                        <Card>
                            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    ["UL_resolution_date", "Fecha de resolución"],
                                    ["UL_resolution_number", "Número de resolución"],
                                    ["UL_causal", "Causal"],
                                    ["UL_analysis_causal", "Causal de análisis"]
                                ].map(([field, label]) => (
                                    <div key={field} className="space-y-2">
                                        <Label>{label}</Label>
                                        <Input type="text" {...register(field)} />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* BOTÓN DE GUARDAR */}
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? (
                            <>
                                <FileDigit className="mr-2 h-4 w-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <FileDigit className="mr-2 h-4 w-4" />
                                Guardar
                            </>
                        )}
                    </Button>

                </form>
            </CardContent>
        </Card>
    )
}
