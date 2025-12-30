// auth-system/backend/src/services/microservices.service.ts
import { prisma } from '../utils/database';
import { logger } from '../utils/logger';
import { RolesService } from './roles.service';

export class MicroservicesService {
  private rolesService = new RolesService();

  // ✅ NUEVA: Crear microservicio Y generar permisos automáticamente
// ✅ REEMPLAZAR COMPLETAMENTE este método en microservices.service.ts

async createMicroservice(data: {
  name: string;
  description?: string;
  url: string;
  healthCheckUrl?: string;
  allowedRoles?: string[]; // 👈 AGREGAR ESTE CAMPO QUE FALTA
  version?: string;
  requiresAuth?: boolean;
  expectedResponse?: string;
}) {
  try {
    console.log('🚀 Creando microservicio:', { name: data.name, allowedRoles: data.allowedRoles });

    // 1. Crear el microservicio en BD
    const microservice = await prisma.microservice.create({
      data: {
        name: data.name,
        description: data.description,
        url: data.url,
        healthCheckUrl: data.healthCheckUrl,
        expectedResponse: data.expectedResponse,
        version: data.version || '1.0.0',
        requiresAuth: data.requiresAuth ?? true,
        allowedRoles: data.allowedRoles || [],
        isActive: true
      }
    });

    console.log('✅ Microservicio creado en BD:', microservice.id);

    // 2. Generar permisos base automáticamente
    const permissions = await this.rolesService.createMicroservicePermissions(data.name);
    
    console.log('✅ Permisos base creados:', permissions);

    // 3. 🎯 CREAR ROLES AUTOMÁTICAMENTE si se especificaron allowedRoles
    const createdRoles = [];
    
    if (data.allowedRoles && data.allowedRoles.length > 0) {
      console.log('🔄 Procesando allowedRoles:', data.allowedRoles);
      
      const serviceName = data.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      for (const roleType of data.allowedRoles) {
        const roleName = `${serviceName}_${roleType.toLowerCase()}`;
        
        console.log(`🔄 Creando rol: ${roleName}`);
        
        // Permisos base para todos los roles
        let rolePermissions: string[] = [
          `${serviceName}.access`,
          `${serviceName}.view`,
          `${serviceName}.use`,
          'dashboard.view'
        ];

        // Si es admin, agregar permisos adicionales
        if (roleType.toLowerCase() === 'admin') {
          rolePermissions.push(`${serviceName}.upload`);
          console.log(`✅ Rol admin detectado - agregando permiso upload`);
        }

        try {
          const newRole = await this.rolesService.createRole({
            name: roleName,
            description: `${roleType} del microservicio ${data.name}`,
            permissions: rolePermissions
          }, 1); // createdBy = 1 (admin por defecto)

          createdRoles.push(newRole);
          
          console.log(`✅ Rol creado: ${roleName}`, { permissions: rolePermissions });

        } catch (roleError: any) {
          console.error(`❌ Error creando rol ${roleName}:`, roleError.message);
          
          if (roleError.message.includes('Ya existe un rol')) {
            console.log(`⚠️ Rol ${roleName} ya existe, continuando...`);
          } else {
            // Re-lanzar el error si no es de duplicado
            throw roleError;
          }
        }
      }
    } else {
      console.log('ℹ️ No se especificaron allowedRoles, saltando creación de roles');
    }

    logger.info(`Microservicio creado exitosamente: ${data.name}`, {
      microserviceId: microservice.id,
      permissions: permissions,
      createdRoles: createdRoles.map(r => r.name)
    });

    return { microservice, permissions, createdRoles };

  } catch (error: any) {
    console.error('❌ Error completo al crear microservicio:', error);
    logger.error('Error al crear microservicio:', error);
    throw error;
  }
}

  // Obtener todos los microservicios
  async getAllMicroservices() {
    try {
      return await prisma.microservice.findMany({
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      logger.error('Error al obtener microservicios:', error);
      throw new Error('Error al obtener microservicios');
    }
  }

  // Obtener microservicio por ID
  async getMicroserviceById(id: number) {
    try {
      return await prisma.microservice.findUnique({
        where: { id }
      });
    } catch (error) {
      logger.error('Error al obtener microservicio:', error);
      return null;
    }
  }

  // Actualizar microservicio
  async updateMicroservice(id: number, data: any) {
    try {
      return await prisma.microservice.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          url: data.url,
          healthCheckUrl: data.healthEndpoint,
          version: data.version,
          isActive: data.isActive
        }
      });
    } catch (error: any) {
      logger.error('Error al actualizar microservicio:', error);
      throw error;
    }
  }

  // Eliminar microservicio
  async deleteMicroservice(id: number) {
    try {
      const microservice = await prisma.microservice.findUnique({
        where: { id }
      });

      if (!microservice) {
        throw new Error('Microservicio no encontrado');
      }

      // Eliminar microservicio
      await prisma.microservice.delete({ where: { id } });

      logger.info(`Microservicio eliminado: ${microservice.name}`, {
        microserviceId: id
      });

      return { success: true };

    } catch (error: any) {
      logger.error('Error al eliminar microservicio:', error);
      throw error;
    }
  }

  // Health check de un microservicio
  async performHealthCheck(id: number) {
    try {
      const microservice = await prisma.microservice.findUnique({
        where: { id }
      });

      if (!microservice) {
        throw new Error('Microservicio no encontrado');
      }

      // Simular health check (puedes implementar lógica real aquí)
      const isHealthy = true; // O hacer HTTP request real
      
      await prisma.microservice.update({
        where: { id },
        data: {
          isHealthy,
          lastHealthCheck: new Date()
        }
      });

      return {
        service: microservice.name,
        status: isHealthy ? 'healthy' : 'unhealthy',
        checkedAt: new Date()
      };

    } catch (error: any) {
      logger.error('Error en health check:', error);
      throw error;
    }
  }

  // Obtener microservicios con paginación
  async getMicroservices(params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}) {
    try {
      const { page = 1, limit = 10, search } = params;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [microservices, total] = await Promise.all([
        prisma.microservice.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.microservice.count({ where })
      ]);

      return {
        microservices,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };

    } catch (error) {
      logger.error('Error al obtener microservicios:', error);
      throw new Error('Error al obtener microservicios');
    }
  }
}