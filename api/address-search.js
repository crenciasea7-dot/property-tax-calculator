module.exports = async (req, res) => {
  const q = String(req.query?.q || '').trim();
  if (q.length < 2 || q.length > 100) return res.status(400).json({ error: '검색어는 2~100자로 입력해 주세요.' });
  const key = process.env.VWORLD_API_KEY;
  if (!key) return res.status(503).json({ error: '공식 주소 검색 서비스가 아직 설정되지 않았습니다.' });
  const params = new URLSearchParams({ service: 'search', request: 'search', version: '2.0', type: 'address', category: 'road', format: 'json', size: '10', query: q, key });
  try {
    const upstream = await fetch('https://api.vworld.kr/req/search?' + params, { headers: { Accept: 'application/json' } });
    const raw = await upstream.text();
    let body; try { body = JSON.parse(raw); } catch { throw new Error('upstream returned a non-JSON response'); }
    const items = body?.response?.result?.items || [];
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ items: items.map(item => ({ title: item.title || item.address?.road || item.address?.parcel || '', address: item.address?.road || item.address?.parcel || item.title || '', point: item.point || null })) });
  } catch (error) {
    return res.status(502).json({ error: '공식 주소 검색 서비스에 연결하지 못했습니다.' });
  }
};
