const API_BASE = "/api/geocode";

let geocodeCache = {};

export async function reverseGeocode(lat, lng) {
  const key = `${lat},${lng}`;
  if (geocodeCache[key]) return geocodeCache[key];

  const params = new URLSearchParams({ lat, lon: lng });
  const res = await fetch(`${API_BASE}/reverse?${params}`);
  if (!res.ok) throw new Error("Reverse geocode failed");

  const data = await res.json();
  const addr = data.address || {};
  const result = {
    displayName: data.display_name || "",
    city: addr.city || addr.town || addr.village || addr.county || "",
    state: addr.state || "",
    pincode: addr.postcode || "",
    country: addr.country || "",
    street: addr.road || "",
    houseNumber: addr.house_number || "",
    suburb: addr.suburb || "",
    lat: parseFloat(data.lat),
    lng: parseFloat(data.lon),
  };
  geocodeCache[key] = result;
  return result;
}

export async function searchLocations(query) {
  if (!query || query.length < 3) return [];

  const params = new URLSearchParams({ q: query, limit: 6 });
  const res = await fetch(`${API_BASE}/search?${params}`);
  if (!res.ok) throw new Error("Location search failed");

  const results = await res.json();
  return results.map((item) => {
    const addr = item.address || {};
    return {
      displayName: item.display_name || "",
      city: addr.city || addr.town || addr.village || addr.county || "",
      state: addr.state || "",
      pincode: addr.postcode || "",
      street: addr.road || addr.pedestrian || addr.street || "",
      houseNumber: addr.house_number || "",
      suburb: addr.suburb || addr.neighbourhood || "",
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    };
  });
}

export function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000, ...options }
    );
  });
}
