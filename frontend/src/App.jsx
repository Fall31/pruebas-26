import { useEffect, useState } from "react";
import { getCategoryName, isValidName } from "./catalog.js";

async function request(path, options) {
  const response = await fetch(path, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail ?? "No se pudo completar la solicitud");
  }

  return data;
}

function App() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [productName, setProductName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    request("/categorias")
      .then((loadedCategories) => {
        setCategories(loadedCategories);
        if (loadedCategories.length > 0) {
          setCategoryId(String(loadedCategories[0].id));
        }
      })
      .catch((cause) => setError(cause.message));
  }, []);

  async function handleCreateCategory(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!isValidName(categoryName)) {
      setError("El nombre de la categoría es obligatorio");
      return;
    }

    try {
      const category = await request(
        `/categorias?${new URLSearchParams({ nombre: categoryName.trim() })}`,
        { method: "POST" },
      );
      setCategories((current) => [...current, category]);
      setCategoryId(String(category.id));
      setCategoryName("");
      setMessage("Categoría creada");
    } catch (cause) {
      setError(cause.message);
    }
  }

  async function handleCreateProduct(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!isValidName(productName)) {
      setError("El nombre del producto es obligatorio");
      return;
    }
    if (!categoryId) {
      setError("Selecciona una categoría");
      return;
    }

    try {
      const product = await request(
        `/productos?${new URLSearchParams({
          nombre: productName.trim(),
          categoria_id: categoryId,
        })}`,
        { method: "POST" },
      );
      setProducts((current) => [...current, product]);
      setProductName("");
      setMessage("Producto creado");
    } catch (cause) {
      setError(cause.message);
    }
  }

  return (
    <main>
      <h1>Catálogo</h1>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      <section aria-labelledby="categories-heading">
        <h2 id="categories-heading">Categorías</h2>
        <form onSubmit={handleCreateCategory}>
          <label htmlFor="category-name">Nombre de la categoría</label>
          <input
            id="category-name"
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
          />
          <button type="submit">Crear categoría</button>
        </form>
        <ul aria-label="Lista de categorías">
          {categories.map((category) => (
            <li key={category.id}>
              {category.nombre} (ID: {category.id})
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="products-heading">
        <h2 id="products-heading">Productos</h2>
        <form onSubmit={handleCreateProduct}>
          <label htmlFor="product-name">Nombre del producto</label>
          <input
            id="product-name"
            value={productName}
            onChange={(event) => setProductName(event.target.value)}
          />
          <label htmlFor="product-category">Categoría del producto</label>
          <select
            id="product-category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nombre}
              </option>
            ))}
          </select>
          <button type="submit">Crear producto</button>
        </form>
        <ul aria-label="Lista de productos">
          {products.map((product) => (
            <li key={product.id}>
              {product.nombre} — {getCategoryName(categories, product.categoria_id)}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default App;
