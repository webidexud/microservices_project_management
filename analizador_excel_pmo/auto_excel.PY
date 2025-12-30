from flask import Flask, render_template, request, send_file, jsonify
import pandas as pd
import threading
import os
import uuid
import time

app = Flask(__name__)

# Carpetas temporales
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['PROCESSED_FOLDER'] = 'processed'

# Crear carpetas si no existen
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['PROCESSED_FOLDER'], exist_ok=True)

# Diccionario global para guardar progreso
progress_data = {}

def limpiar_archivos_temporales():
    """Elimina todos los archivos previos en las carpetas temporales."""
    for folder in [app.config['UPLOAD_FOLDER'], app.config['PROCESSED_FOLDER']]:
        for f in os.listdir(folder):
            try:
                os.remove(os.path.join(folder, f))
            except:
                pass


def procesar_excel(task_id, filepath, output_path):
    """Procesa el Excel agrupando y genera un archivo temporal."""
    try:
        progress_data[task_id] = {"status": "Procesando", "progress": 10}

        # Leer Excel
        df = pd.read_excel(filepath, engine='openpyxl')
        progress_data[task_id]["progress"] = 30

        columnas_necesarias = [
            'RUBRO', 'VALOR_RP', 'VALOR_RP_ANULADO', 'VALOR_RP_ANULADO_PARCIAL'
        ]
        df = df[[col for col in columnas_necesarias if col in df.columns]]
        progress_data[task_id]["progress"] = 45

        def extraer_clave(rubro):
            partes = str(rubro).split('-')
            if len(partes) >= 7:
                return f"{partes[5]}-{partes[6]}"
            else:
                return rubro

        df['CLAVE_AGRUPACION'] = df['RUBRO'].apply(extraer_clave)

        df_agrupado = df.groupby('CLAVE_AGRUPACION', as_index=False).sum(numeric_only=True)
        rubros_ref = df.groupby('CLAVE_AGRUPACION')['RUBRO'].first().reset_index()
        df_agrupado = pd.merge(df_agrupado, rubros_ref, on='CLAVE_AGRUPACION', how='left')
        df_agrupado = df_agrupado[['RUBRO', 'CLAVE_AGRUPACION', 'VALOR_RP', 
                                   'VALOR_RP_ANULADO', 'VALOR_RP_ANULADO_PARCIAL']]
        progress_data[task_id]["progress"] = 65

        def generar_codigo(rubro):
            partes = str(rubro).split('-')
            if len(partes) >= 7:
                cod5, cod6 = partes[5], partes[6]
                if cod5 == '01':
                    return f"245301{cod6[:4]}"
                elif cod5 == '29':
                    return f"291090{cod6[:4]}"
            return "0"

        df_agrupado.insert(1, 'CODIGO_FINAL', df_agrupado['RUBRO'].apply(generar_codigo))
        df_agrupado['CODIGO_FINAL'] = pd.to_numeric(df_agrupado['CODIGO_FINAL'], errors='coerce').fillna(0).astype(int)
        progress_data[task_id]["progress"] = 80

        for col in ['VALOR_RP', 'VALOR_RP_ANULADO', 'VALOR_RP_ANULADO_PARCIAL']:
            if col not in df_agrupado.columns:
                df_agrupado[col] = 0

        df_agrupado['VALOR_RP_VERDADERO'] = (
            df_agrupado['VALOR_RP']
            - df_agrupado['VALOR_RP_ANULADO']
            - df_agrupado['VALOR_RP_ANULADO_PARCIAL']
        )
        progress_data[task_id]["progress"] = 90

        # Guardar archivo temporal
        with pd.ExcelWriter(output_path, engine='xlsxwriter') as writer:
            df_agrupado.to_excel(writer, index=False, sheet_name='Resultado')
            workbook = writer.book
            worksheet = writer.sheets['Resultado']

            formato_encabezado = workbook.add_format({'bold': True, 'bg_color': '#D9D9D9', 'align': 'center'})
            formato_contable = workbook.add_format({'num_format': '"$"#,##0.00_);[Red]("$"#,##0.00)', 'align': 'right'})
            formato_numero = workbook.add_format({'num_format': '0', 'align': 'right'})

            for col_num, col_name in enumerate(df_agrupado.columns):
                worksheet.write(0, col_num, col_name, formato_encabezado)
                if col_name == 'CODIGO_FINAL':
                    worksheet.set_column(col_num, col_num, 18, formato_numero)
                elif col_name in ['VALOR_RP', 'VALOR_RP_ANULADO', 'VALOR_RP_ANULADO_PARCIAL', 'VALOR_RP_VERDADERO']:
                    worksheet.set_column(col_num, col_num, 18, formato_contable)
                else:
                    worksheet.set_column(col_num, col_num, 25)

        progress_data[task_id] = {"status": "Completado", "progress": 100, "filename": os.path.basename(output_path)}

    except Exception as e:
        progress_data[task_id] = {"status": f"Error: {str(e)}", "progress": 100}


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/upload', methods=['POST'])
def upload():
    file = request.files['file']
    if not file or file.filename == '':
        return "No se seleccionó ningún archivo."

    if not file.filename.endswith('.xlsx'):
        return "Formato no permitido. Solo archivos .xlsx"

    # Limpiar cualquier archivo previo
    limpiar_archivos_temporales()

    task_id = str(uuid.uuid4())
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], "temp.xlsx")
    output_path = os.path.join(app.config['PROCESSED_FOLDER'], "resultado.xlsx")

    file.save(filepath)
    thread = threading.Thread(target=procesar_excel, args=(task_id, filepath, output_path))
    thread.start()

    return render_template('procesando.html', task_id=task_id)


@app.route('/progress/<task_id>')
def progress(task_id):
    return jsonify(progress_data.get(task_id, {"status": "Desconocido", "progress": 0}))


@app.route('/download/<filename>')
def download(filename):
    filepath = os.path.join(app.config['PROCESSED_FOLDER'], filename)
    if os.path.exists(filepath):
        # Descargar y eliminar después de un pequeño retraso
        def eliminar_despues():
            time.sleep(3)
            try:
                limpiar_archivos_temporales()
            except:
                pass

        threading.Thread(target=eliminar_despues).start()
        return send_file(filepath, as_attachment=True)
    return "Archivo no encontrado."


if __name__ == '__main__':
    app.run(debug=True, threaded=True, host="0.0.0.0")
