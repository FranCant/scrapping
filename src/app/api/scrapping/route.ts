import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const urlParams = req.nextUrl.searchParams.get("url");

  let browser;
  try {
    // Lanzar una instancia de Puppeteer
    browser = await puppeteer.launch({
      headless: true, // Cambia a false si quieres ver la interacción en el navegador
    });

    const page = await browser.newPage();
    await page.goto(urlParams ?? "", {
      waitUntil: "networkidle2", // Esperar hasta que la página haya terminado de cargar
    });

    // Extraer datos de todos los productos del DOM de la página
    const products = await page.evaluate(() => {
      const productElements = document.querySelectorAll(
        ".js-product-miniature-wrapper"
      ); // Seleccionar todos los contenedores de producto

      // Recorrer todos los productos y extraer la información
      const productData = Array.from(productElements).map((product) => {
        const title = product
          .querySelector(".product-title")
          ?.textContent?.trim();
        const reference = product
          .querySelector(".product-reference")
          ?.textContent?.trim();
        const price = product
          .querySelector(".product-price-and-shipping span")
          ?.textContent?.trim();

        return { title, reference, price };
      });

      return productData; // Devolver un array con todos los productos
    });

    // Cerrar el navegador
    await browser.close();

    // Crear el contenido CSV
    const csvHeader = "Title,Reference,Price\n";
    const csvRows = products
      .map(
        (product) =>
          `"${product.title?.replace(
            /"/g,
            '""'
          )}", "${product.reference?.replace(
            /"/g,
            '""'
          )}", "${product.price?.replace(/"/g, '""')}"`
      )
      .join("\n");

    const csvContent = csvHeader + csvRows;

    // Guardar los productos en un archivo CSV
    const csvPath = path.join(process.cwd(), "/src/assets", "products.csv"); // Ruta donde se guardará el CSV
    fs.writeFileSync(csvPath, csvContent);

    console.log("CSV file was written successfully");

    // Responder al cliente con la ruta del archivo CSV
    return NextResponse.json({
      message: "Datos obtenidos y guardados en CSV exitosamente",
      status: 200,
      data: products,
      csvPath: "/public/products.csv", // Ruta pública del CSV
    });
  } catch (error) {
    if (browser) await browser.close(); // Asegurarse de cerrar el navegador en caso de error
    console.error("Error scraping the site:", error.message);

    return NextResponse.json({
      error: error.message || "Error scraping the site",
      status: 500,
    });
  }
}
