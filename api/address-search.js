module.exports = async (req, res) => {
  const q = String(req.query?.q || '').trim();
  if (q.length < 2 || q.length > 100) return res.status(400).json({ error: '주소 또는 단지명을 2~100자로 입력해 주세요.' });
  const key = process.env.VWORLD_API_KEY;
  if (!key) return res.status(503).json({ error: 'VWORLD_API_KEY is not configured.' });
  const params = new URLSearchParams({ service: 'search', request: 'search', version: '2.0', type: 'road', crs: 'EPSG:4326', format: 'json', errorformat: 'json', size: '10', page: '1', query: q, key, domain: 'property-tax-verified.vercel.app' });
  try {
    const upstream = await fetch('http://api.vworld.kr/req/search?' + params);
    const body = await upstream.json();
    const items = body?.response?.result?.items || [];
    return res.status(200).json({ items: items.map((item) => ({ title: item.title || item.address?.road || item.address?.parcel || '', address: item.address?.road || item.address?.parcel || item.title || '', point: item.point || null })) });
  } catch { return res.status(502).json({ error: 'Official address search could not be reached.' }); }
};
