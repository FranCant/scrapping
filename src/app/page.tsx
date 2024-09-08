"use client";
import axios from "axios";
import { useState } from "react";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);
    setError(null);

    try {
      // Solicitar los datos en formato JSON
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/scrapping`,
        {
          params: { url: inputValue },
        }
      );

      // Guardar los datos en el estado
      setData(response.data.data);
    } catch (err) {
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center flex-col justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
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
      {data.length > 0 && (
        <div className="mt-4">
          <h2>Results {data.length}</h2>
          <ul className="text-white flex flex-col gap-4">
            {data.map((item, index) => (
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
        </div>
      )}
    </div>
  );
}
