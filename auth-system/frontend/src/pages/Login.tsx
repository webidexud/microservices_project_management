import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '../services/auth'
import { Eye, EyeOff, Shield, GraduationCap, Building } from 'lucide-react'

const loginSchema = z.object({
  username: z.string().min(1, 'Usuario es requerido'),
  password: z.string().min(1, 'Contraseña es requerida'),
})

type LoginFormData = z.infer<typeof loginSchema>

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const login = useAuthStore((state) => state.login)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError('')

    try {
      await login(data.username, data.password)
    }catch (err: any) {
      if (err.response) {
        console.error('Error Backend:', err.response)
        setError(err.response.data?.message || JSON.stringify(err.response.data))
      } else if (err.request) {
        console.error('Sin respuesta del servidor:', err.request)
        setError('Sin respuesta del servidor')
      } else {
        console.error('Error Axios:', err.message)
        setError(err.message)
      }
    // } catch (err: any) {
    //   setError(err.message || 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="relative max-w-lg w-full space-y-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-10 z-10">
        {/* Header Institucional */}
        <div className="text-center">
          {/* Logos Institucionales */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            {/* Logo Universidad Distrital */}
            <div className="flex-shrink-0">
              <img 
                src="https://idexud.udistrital.edu.co/wp-content/uploads/2023/02/logo_universidad_acreditacion.png" 
                alt="Universidad Distrital Francisco José de Caldas"
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  // Fallback si la imagen no carga
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                }}
              />
              {/* Fallback logo */}
              <div className="hidden h-16 w-16 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
            </div>

            {/* Logo Oficina de Extensión */}
            <div className="flex-shrink-0">
              <img 
                src="https://idexud.udistrital.edu.co/wp-content/uploads/2024/05/6.png" 
                alt="Oficina de Extensión"
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  // Fallback si la imagen no carga
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                }}
              />
              {/* Fallback logo */}
              <div className="hidden h-16 w-16 bg-green-600 rounded-lg flex items-center justify-center">
                <Building className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          {/* Títulos Institucionales */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Universidad Distrital
            </h1>
            <h2 className="text-lg font-semibold text-blue-700 mb-1">
              Francisco José de Caldas
            </h2>
            <p className="text-sm text-green-700 font-medium mb-4">
              Oficina de Extensión
            </p>
            
            {/* Sistema de Autenticación */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-center mb-2">
                <Shield className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-semibold text-gray-800">
                  Sistema de Autenticación Centralizado
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Acceso seguro a los servicios institucionales
              </p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Campo Usuario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuario Institucional
            </label>
            <div className="relative">
              <input
                {...register('username')}
                type="text"
                placeholder="Ingrese su usuario"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <GraduationCap className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            {errors.username && (
              <p className="mt-2 text-sm text-red-600">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Campo Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Ingrese su contraseña"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500 pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Botón de login */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold text-base hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Iniciando sesión...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Ingresar al Sistema
                </div>
              )}
            </button>
          </div>
        </form>

        {/* Footer Institucional */}
        <div className="border-t border-gray-200 pt-6">
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-600">
              <strong>Universidad Distrital Francisco José de Caldas</strong>
            </p>
            <p className="text-xs text-gray-500">
              Oficina de Extensión - Sistema de Autenticación
            </p>
            <p className="text-xs text-gray-400">
              © 2025 - Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login