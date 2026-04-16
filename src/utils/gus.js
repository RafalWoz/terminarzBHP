export async function fetchGusData(nip) {
  try {
    const url = `./regon_proxy.php?nip=${nip}`;
    
    const targetUrl = window.location.hostname === 'localhost' 
      ? `https://terminybhp.pl/regon_proxy.php?nip=${nip}` 
      : url;

    const response = await fetch(targetUrl);
    
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || `Błąd serwera (HTTP ${response.status})`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return result.data;
  } catch (error) {
    console.error('GUS Error:', error);
    throw new Error(error.message || 'Błąd połączenia z serwerem danych GUS');
  }
}
