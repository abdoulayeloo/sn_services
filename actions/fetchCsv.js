import { dataUrl } from "../src/app";

export function fetchCsv(dataUrl) {
  return new Promise((resolve, reject) => {
    Papa.parse(dataUrl, {
      download: true,
      header: true,
      complete: (res) => resolve(res.data),
      error: (err) => reject(err),
    });
  });
}
