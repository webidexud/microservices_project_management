import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Plus,
  Search,
  Edit,
  Power,
  PowerOff,
  Building2,
  Briefcase,
  FileType,
  CreditCard,
  Settings as SettingsIcon,
  Users,
  Tag,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select } from "@/components/ui/select"
import { catalogsApi } from "@/lib/api"

// add and general catalog types and their icons automatically here
const catalogTypes = [
  { id: "contract_type", name: "Tipo de contratos", icon: Tag },
  { id: "payment_methods", name: "Formas de pago", icon: CreditCard },
  { id: "cdp", name: "CDP", icon: FileType },
  { id: "education_levels", name: "Niveles de educación", icon: SettingsIcon },
  { id: "amparos", name: "Amparos", icon: Briefcase },
  { id: "type_identifications", name: "Tipos de identificación", icon: Users },

]





export default function Catalogs() {
  
  const [tab, setTab] = useState("categorias")


  
  function renderProbe(){
    return(
      <h1>Hola mundo 1</h1>
    )
  }


  function renderProbe_2(){
    return(
      <h1>Hola mundo 2</h1>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Catálogos</h1>
        <p className="text-text-secondary mt-1">
          Gestión de datos maestros del sistema
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {catalogTypes.map((catalog)=>(
          
            <Button
              onClick={()=>setTab(catalog.id)}
            >
              {/* <Icon
                className={`h-6 w-6 mx-auto mb-2`}
              /> */}
              <p
                className={`text-xs font-medium text-center`}
              >
                {catalog.name}
              </p>
            </Button>

        ))
        }
      </div>

      {tab === "contract_type" && renderProbe()}
      {tab === "cdp" && renderProbe_2()}

      {/* Selector de Catálogo
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {catalogTypes.map((catalog) => {
          const Icon = catalog.icon
          return (
            <button
              key={catalog.id}
              onClick={() => setActiveCatalog(catalog.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                activeCatalog === catalog.id
                  ? "border-primary bg-primary-very-light"
                  : "border-border hover:border-primary-light"
              }`}
            >
              <Icon
                className={`h-6 w-6 mx-auto mb-2 ${
                  activeCatalog === catalog.id
                    ? "text-primary"
                    : "text-text-secondary"
                }`}
              />
              <p
                className={`text-xs font-medium text-center ${
                  activeCatalog === catalog.id
                    ? "text-primary"
                    : "text-text-secondary"
                }`}
              >
                {catalog.name}
              </p>
            </button>
          )
        })}
      </div>

      {/* Barra de acciones (Filtros ,Busquedas, nuevo, etc) */}
      {/* <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <Input
                  placeholder="Buscar..."
                  className="pl-10"
                  value={searchTerm}
                  // onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo
            </Button>
          </div>
        </CardContent>
      </Card> */}

     

      

      
    </div>
  )
}
