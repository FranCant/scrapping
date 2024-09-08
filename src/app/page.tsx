"use client";
import axios from "axios";
import { useState } from "react";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [data, setData] = useState<any>(null); // Cambiado a `any` para tipos flexibles
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csvPath, setCsvPath] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevenir la recarga de la página

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/scrapping`,
        {
          params: {
            url: inputValue,
          },
        }
      );
      setData(response?.data?.data);
      setCsvPath(response?.data?.csvPath); // Guardar la ruta del CSV
    } catch (err) {
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center flex-col justify-items-center min-h-screen pb-10 gap-4 sm:p-14 font-[family-name:var(--font-geist-sans)]">
      <h1>Scraping</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="url"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            URL
          </label>
          <div className="relative mt-2 rounded-md shadow-sm">
            <input
              id="url"
              name="url"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Introduce URL"
              className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md"
        >
          Scrape Data
        </button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {data && (
        <div className="mt-4">
          <h2>Results {data.length}</h2>
          <ul className="text-white flex flex-col gap-4">
            {data.length > 0 &&
              data?.map((item: any, index: number) => (
                <li
                  key={index}
                  className="flex items-center gap-4 rounded-md bg-gray-800 p-4"
                >
                  <strong>Title:</strong> {item.title} <br />
                  <strong>Reference:</strong> {item.reference} <br />
                  <strong>Price:</strong> {item.price}
                </li>
              ))}
          </ul>
          {csvPath && (
            <div className="mt-4">
              <a
                href={csvPath}
                download="products.csv"
                className="bg-green-600 text-white px-4 py-2 rounded-md"
              >
                Download CSV
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
