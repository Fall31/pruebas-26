import { expect, test } from "@playwright/test";
import { existsSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const databasePath = resolve("..", "app", "db.e2e.json");
const initialDatabase = {
  categorias: [{ id: 1, nombre: "Electrónica" }],
  productos: [{ id: 101, nombre: "Laptop", categoria_id: 1 }],
};

test.beforeEach(() => {
  writeFileSync(databasePath, JSON.stringify(initialDatabase, null, 2));
});

test.afterAll(() => {
  if (existsSync(databasePath)) {
    rmSync(databasePath);
  }
});

test("completa el ciclo de listar y crear una categoría", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("list", { name: "Lista de categorías" }).getByRole("listitem"))
    .toHaveCount(1);

  await page.getByLabel("Nombre de la categoría").fill("Jardinería");
  await page.getByRole("button", { name: "Crear categoría" }).click();

  await expect(page.getByRole("list", { name: "Lista de categorías" }))
    .toContainText("Jardinería");
  await expect(page.getByRole("status")).toHaveText("Categoría creada");
});

test("crea una categoría y luego un producto asociado", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Nombre de la categoría").fill("Hogar");
  await page.getByRole("button", { name: "Crear categoría" }).click();
  await expect(page.getByRole("status")).toHaveText("Categoría creada");

  await page.getByLabel("Nombre del producto").fill("Lámpara");
  await page.getByLabel("Categoría del producto").selectOption({ label: "Hogar" });
  await page.getByRole("button", { name: "Crear producto" }).click();

  await expect(page.getByRole("list", { name: "Lista de productos" }))
    .toContainText("Lámpara — Hogar");
  await expect(page.getByRole("status")).toHaveText("Producto creado");
});

test("muestra el error si la categoría desaparece antes de crear el producto", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByLabel("Categoría del producto"))
    .toHaveValue("1");

  writeFileSync(
    databasePath,
    JSON.stringify({ categorias: [], productos: initialDatabase.productos }, null, 2),
  );
  await page.getByLabel("Nombre del producto").fill("Producto huérfano");
  await page.getByRole("button", { name: "Crear producto" }).click();

  await expect(page.getByRole("alert")).toHaveText("Categoría no encontrada");
});
