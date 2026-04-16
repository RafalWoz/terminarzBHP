export async function fetchGusData(nip) {
  try {
    // Relative path to the proxy. In dev mode (vite), we might need an absolute path 
    // or proxy config, but for simplicity we assume the same origin on production.
    const url = `./regon_proxy.php?nip=${nip}`;
    
    // In dev, handle relative path
    const targetUrl = window.location.hostname === 'localhost' 
      ? `https://terminybhp.pl/regon_proxy.php?nip=${nip}` // Fallback to live proxy during dev
      : url;

    const response = await fetch(targetUrl);
    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return result.data;
  } catch (error) {
    console.error('GUS Error:', error);
    throw error;
  }
}
