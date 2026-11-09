import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App.jsx";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("catalog API integration", () => {
  it("creates and displays a category returned by the API", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse({ id: 1, nombre: "Hogar" }));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<App />);
    await user.type(await screen.findByLabelText("Nombre de la categoría"), "Hogar");
    await user.click(screen.getByRole("button", { name: "Crear categoría" }));

    expect(await screen.findByText("Hogar (ID: 1)")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/categorias?nombre=Hogar",
      { method: "POST" },
    );
  });

  it("creates a product for an existing category and displays it", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse([{ id: 1, nombre: "Hogar" }]))
      .mockResolvedValueOnce(jsonResponse({
        id: 101,
        nombre: "Lámpara",
        categoria_id: 1,
      }));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<App />);
    await user.type(await screen.findByLabelText("Nombre del producto"), "Lámpara");
    await user.selectOptions(screen.getByLabelText("Categoría del producto"), "1");
    await user.click(screen.getByRole("button", { name: "Crear producto" }));

    expect(await screen.findByText("Lámpara — Hogar")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/productos?nombre=L%C3%A1mpara&categoria_id=1",
      { method: "POST" },
    );
  });

  it("shows the API error when the selected category no longer exists", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse([{ id: 1, nombre: "Hogar" }]))
      .mockResolvedValueOnce(jsonResponse(
        { detail: "Categoría no encontrada" },
        404,
      ));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<App />);
    await user.type(await screen.findByLabelText("Nombre del producto"), "Lámpara");
    await user.selectOptions(screen.getByLabelText("Categoría del producto"), "1");
    await user.click(screen.getByRole("button", { name: "Crear producto" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Categoría no encontrada",
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });
});
