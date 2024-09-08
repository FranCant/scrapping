import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function GET(req: NextRequest) {
  const urlParams = req.nextUrl.searchParams.get("url");

  let browser;
  try {
    // Lanzar una instancia de Puppeteer
    browser = await puppeteer.launch({
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(urlParams ?? "", {
      waitUntil: "networkidle2",
    });

    // Extraer datos de todos los productos del DOM de la página
    const products = await page.evaluate(() => {
      const productElements = document.querySelectorAll(
        ".js-product-miniature-wrapper"
      );

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

      return productData;
    });

    // Cerrar el navegador
    await browser.close();

    // Responder con los datos JSON
    return NextResponse.json({
      message: "Data successfully scraped",
      data: products,
    });
  } catch (error) {
    if (browser) await browser.close();
    console.error("Error scraping the site:", error.message);

    return NextResponse.json({
      error: error.message || "Error scraping the site",
      status: 500,
    });
  }
}
