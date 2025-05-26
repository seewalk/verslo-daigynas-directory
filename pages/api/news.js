export default async function handler(req, res) {
  const API_KEY = process.env.NEWS_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'Missing API key' });

  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  const category = req.query.category || '';
  const fallbackKeywords = 'verslas OR "įmonė" OR "smulkus verslas" OR "juridinis adresas" OR "verslo registracija" OR "Lietuvos verslas" OR "startuoliai" OR "ekonomika" OR "verslo plėtra" OR "įmonių steigimas" OR "verslo tendencijos" OR "finansavimas" OR "investicijos" OR "VMI" OR "verslo aplinka" OR "investicinė aplinka" OR "eksporto rinka" OR "finansų technologijos" OR "darbo rinka" OR "inovacijos" OR "ekonomikos augimas" OR "verslo strategija" OR "rinkos analizė"';

  const query = encodeURIComponent(category || fallbackKeywords);

  const url = `https://newsapi.org/v2/everything?q=${query}&language=lt&sortBy=publishedAt&pageSize=${pageSize}&page=${page}&apiKey=${API_KEY}`;

  try {
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate');

    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`NewsAPI error (${response.status}):`, errorText);
      return res.status(response.status).json({ 
        error: `News API error: ${response.status}`,
        message: errorText
      });
    }

    const data = await response.json();
    const hasMore = data.totalResults > page * pageSize;

    return res.status(200).json({ 
      ...data,
      hasMore,
      currentPage: page,
      totalPages: Math.ceil((data.totalResults || 0) / pageSize)
    });
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).json({ error: 'Server error fetching news' });
  }
}