#!/bin/sh

echo "🚀 Iniciando backend..."
echo "⏳ Esperando base de datos..."
sleep 10

echo "⚙️ Verificando estado de la base de datos..."

# Verificamos si ya hay tablas (DB inicializada)
HAS_USERS_TABLE=$(npx prisma db execute --stdin <<EOF | grep -o '[0-9]\+'
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'users';
EOF
)

HAS_USERS_TABLE=${HAS_USERS_TABLE:-0}

if [ "$HAS_USERS_TABLE" -eq 0 ]; then
  echo "⚠️ Base de datos vacía. Creando esquema inicial..."
  npx prisma db push
  echo "🌱 Ejecutando seed inicial..."
  npx prisma db seed
else
  echo "✅ Base de datos existente. Aplicando migraciones..."
  npx prisma migrate deploy
fi

echo "✅ Backend listo!"
exec "$@"