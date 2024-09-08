import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

export async function GET(req: NextRequest) {
  const urlParams = req.nextUrl.searchParams.get("url");

  if (!urlParams) {
    return NextResponse.json({
      error: "URL parameter is missing",
      status: 400,
    });
  }

  // Reemplaza con tu propia API Key
  const apiKey = "8e7eeb199e46d97955e1f4d55bab99c1";
  const scraperApiUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${urlParams}`;

  try {
    // Realizar la solicitud a Scraper API
    const response = await axios.get(scraperApiUrl);
    const html = response.data;

    // Cargar el HTML con cheerio
    const $ = cheerio.load(html);

    // Extraer datos de todos los productos del DOM de la página
    const products = $(".js-product-miniature-wrapper, .item-area")
      .map((_, product) => {
        const title =
          $(product).find(".product-title, .product-name").text().trim() || "";
        const reference =
          $(product)
            .find(".product-reference, .old-price .price")
            .text()
            .trim() || "";
        const price =
          $(product)
            .find(".product-price-and-shipping span, .special-price .price")
            .text()
            .trim() || "";
        return { title, reference, price };
      })
      .get();

    // Responder con los datos JSON
    return NextResponse.json({
      message: "Data successfully scraped",
      data: products,
    });
  } catch (error) {
    console.error("Error scraping the site:", error.message);
    return NextResponse.json({
      error: error.message || "Error scraping the site",
      status: 500,
    });
  }
}
