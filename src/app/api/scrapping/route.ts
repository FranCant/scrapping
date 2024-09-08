import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import fs from "fs";
import path from "path";

const SCRAPER_API_KEY = "8e7eeb199e46d97955e1f4d55bab99c1"; // Tu API Key de ScraperAPI

export async function GET(req: NextRequest) {
  const urlParams = req.nextUrl.searchParams.get("url");

  try {
    if (!urlParams) {
      return NextResponse.json({
        message: "No URL provided",
        status: 400,
      });
    }

    // Realizar la solicitud a ScraperAPI
    const response = await axios.get(`http://api.scraperapi.com`, {
      params: {
        api_key: SCRAPER_API_KEY,
        url: urlParams,
      },
    });

    const html = response.data;

    // Extraer datos de todos los productos del HTML de la página
    const productData = extractProductData(html);

    // Crear el contenido CSV
    const csvHeader = "Title,Reference,Price\n";
    const csvRows = productData
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
      data: productData,
      csvPath: "/products.csv", // Ruta pública del CSV
    });
  } catch (error) {
    console.error("Error scraping the site:", error.message);

    return NextResponse.json({
      error: error.message || "Error scraping the site",
      status: 500,
    });
  }
}

// Función para extraer datos del HTML
function extractProductData(html: string) {
  // Aquí deberías usar una librería para parsear el HTML, como `cheerio`
  // Instala cheerio si no lo tienes: npm install cheerio
  const cheerio = require("cheerio");
  const $ = cheerio.load(html);

  const products = $(".js-product-miniature-wrapper")
    .map((index, element) => {
      const title = $(element).find(".product-title").text().trim();
      const reference = $(element).find(".product-reference").text().trim();
      const price = $(element)
        .find(".product-price-and-shipping span")
        .text()
        .trim();

      return { title, reference, price };
    })
    .get();

  return products;
}
