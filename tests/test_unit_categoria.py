from unittest.mock import patch
from app.crud import create_categoria_db, create_producto_db
import json
# Datos simulados que el mock devolverá al CRUD
MOCK_DB_DATA = {
    "categorias": [{"id": 10, "nombre": "Inicial Mock"}],
    "productos": []
}
# La función de prueba no necesita argumentos de mock
def test_unit_create_categoria_logic():
    """
    Verifica que la lógica de create_categoria_db funcione usando context managers.
    """
    nombre_cat = "Unitaria Mock Test"
    
    # El orden no importa, y se asignan a las variables mock_load y mock_save
    with patch('app.crud._load_db', return_value=MOCK_DB_DATA.copy()) as mock_load, \
        patch('app.crud._save_db') as mock_save:
        
        # LLAMADA CLAVE: Se ejecuta el código de negocio,
        # el cual usará los mocks definidos arriba.
        resultado = create_categoria_db(nombre_cat)
        
        # 1. Verificar el resultado de la lógica
        assert resultado['nombre'] == nombre_cat
        assert resultado['id'] == 11 # Esperamos el siguiente ID
        
        # 2. Verificar que se intentó guardar los datos (usamos mock_save)
        mock_save.assert_called_once()
        
        # 3. Inspeccionar el objeto pasado al save_db
        data_guardada = mock_save.call_args[0][0]
        
        # 🚨 Imprime el contenido de la "DB" modificada
        print("\n--- Contenido de la DB Simulada que el código intentó guardar ---")
        print(json.dumps(data_guardada, indent=4))
        print("----------------------------------------------------------------")
        # 4. Verificar el contenido exacto
        assert any(c['nombre'] == nombre_cat for c in data_guardada['categorias'])
# Al salir del bloque 'with', los parches se eliminan automáticamente


def test_unit_create_producto_logic():
    db_inicial = {
        "categorias": [{"id": 3, "nombre": "Hogar"}],
        "productos": [{"id": 100, "nombre": "Producto existente", "categoria_id": 3}],
    }

    with patch('app.crud._load_db', return_value=db_inicial.copy()), \
            patch('app.crud._save_db') as mock_save:
        resultado = create_producto_db("Lámpara", 3)

    assert resultado == {"id": 101, "nombre": "Lámpara", "categoria_id": 3}
    mock_save.assert_called_once()
    assert resultado in mock_save.call_args[0][0]["productos"]


def test_unit_create_producto_rejects_missing_category():
    db_inicial = {"categorias": [], "productos": []}

    with patch('app.crud._load_db', return_value=db_inicial), \
            patch('app.crud._save_db') as mock_save:
        resultado = create_producto_db("Lámpara", 99)

    assert resultado == {"error": "Categoría no encontrada"}
    mock_save.assert_not_called()