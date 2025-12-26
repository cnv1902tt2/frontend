import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/* Search page - Tìm kiếm hướng dẫn với simple text search */
const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load markdown files
  useEffect(() => {
    const loadDocs = async () => {
      try {
        setLoading(true);
        
        const [cauTrucRes, huongDanRes] = await Promise.all([
          fetch(process.env.PUBLIC_URL + '/data/cautrucduan.md').then(r => r.ok ? r.text() : Promise.reject('File not found')),
          fetch(process.env.PUBLIC_URL + '/data/huondanchinhsuacode.md').then(r => r.ok ? r.text() : Promise.reject('File not found'))
        ]);

        setDocs([
          {
            id: 'huongdan',
            title: 'Hướng dẫn chỉnh sửa & phát hành',
            url: '/admin/guide',
            body: huongDanRes
          },
          {
            id: 'cautrucduan',
            title: 'Cấu trúc dự án SimpleBIM',
            url: '/admin/structure',
            body: cauTrucRes
          }
        ]);
        setError(null);
      } catch (err) {
        console.error('Error loading docs:', err);
        setError('Không thể tải tài liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    loadDocs();
  }, []);

  // Simple text search when query changes
  useEffect(() => {
    if (!docs.length || !query.trim()) {
      setResults([]);
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    const hits = [];

    docs.forEach(doc => {
      const bodyLower = doc.body.toLowerCase();
      const titleLower = doc.title.toLowerCase();
      
      // Count occurrences
      let count = 0;
      let pos = bodyLower.indexOf(searchTerm);
      let firstMatch = pos;
      
      while (pos !== -1) {
        count++;
        pos = bodyLower.indexOf(searchTerm, pos + 1);
      }
      
      // Also check title
      if (titleLower.includes(searchTerm)) {
        count += 10; // Boost title matches
      }

      if (count > 0) {
        hits.push({
          doc,
          count,
          firstMatch: firstMatch >= 0 ? firstMatch : 0
        });
      }
    });

    // Sort by match count
    hits.sort((a, b) => b.count - a.count);
    setResults(hits.slice(0, 10));
  }, [query, docs]);

  // Create snippet with highlighted matches
  const createSnippet = (text, searchTerm) => {
    if (!searchTerm.trim()) return text.slice(0, 200) + '...';
    
    const lowerText = text.toLowerCase();
    const lowerSearch = searchTerm.toLowerCase().trim();
    const firstIndex = lowerText.indexOf(lowerSearch);
    
    // Get context around first match
    let start = Math.max(0, firstIndex - 80);
    let end = Math.min(text.length, firstIndex + 200);
    
    // Adjust to word boundaries
    if (start > 0) {
      const spaceIndex = text.indexOf(' ', start);
      if (spaceIndex > 0 && spaceIndex < start + 20) {
        start = spaceIndex + 1;
      }
    }
    
    let snippet = text.slice(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';
    
    // Highlight all occurrences of the search term (case insensitive)
    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    snippet = snippet.replace(regex, '<mark>$1</mark>');
    
    return snippet;
  };

  // Escape special regex characters
  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  return (
    <>
      {/* Clean white background styles */}
      <style>{`
        .result { 
          padding: 14px; 
          border-bottom: 1px solid #e5e7eb; 
        }
        .result:last-child { 
          border-bottom: none; 
        }
        .result:hover {
          background-color: #f9fafb;
        }
        mark { 
          background: #fef3c7; 
          padding: 1px 4px; 
          border-radius: 4px; 
        }
      `}</style>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h1 className="h3 mb-0" style={{color: '#1f2937', fontWeight: '700'}}>Tìm kiếm hướng dẫn</h1>
        <Link className="btn btn-outline-secondary" to="/dashboard" style={{borderRadius: '6px'}}>
          &larr; Quay về trang chủ
        </Link>
      </div>

      {/* Search box */}
      <div className="card mb-3" style={{borderRadius: '8px', border: '1px solid #e5e7eb'}}>
        <div className="card-body">
          <h2 className="h5" style={{color: '#1f2937', fontWeight: '600'}}>Tìm kiếm toàn bộ tài liệu</h2>
          <p style={{color: '#6b7280', marginBottom: '14px'}}>Gõ từ khóa (ví dụ: "ConfuserEx", "Ribbon", "Obfuscate", "ForceVersion", "Rebuild", "GitHub Release", "UpdateService"). Kết quả hiển thị từ cả hai tài liệu.</p>
          <input 
            type="text" 
            className="form-control form-control-lg" 
            placeholder="Nhập từ khóa..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{borderRadius: '6px', border: '1px solid #d1d5db'}}
          />
        </div>
      </div>

      {/* Results */}
      <div className="card" style={{borderRadius: '8px', border: '1px solid #e5e7eb'}}>
        <div className="card-body">
          {loading && (
            <p style={{color: '#6b7280', marginBottom: 0}}>Đang tải tài liệu...</p>
          )}

          {error && (
            <p style={{color: '#ef4444', marginBottom: 0}}>{error}</p>
          )}

          {!loading && !error && !query.trim() && (
            <p style={{color: '#9ca3af', marginBottom: 0}}>Nhập từ khóa để bắt đầu tìm kiếm.</p>
          )}

          {!loading && !error && query.trim() && results.length === 0 && (
            <p style={{color: '#f59e0b', marginBottom: 0}}>Không tìm thấy kết quả.</p>
          )}

          {results.map((hit, idx) => {
            const snippet = createSnippet(hit.doc.body, query);
            const urlWithQuery = `${hit.doc.url}?highlight=${encodeURIComponent(query.trim())}`;
            return (
              <div key={idx} className="result">
                <Link to={urlWithQuery} className="h6 d-block mb-1" style={{textDecoration: 'none', color: '#3b82f6', fontWeight: '600'}}>
                  {hit.doc.title}
                </Link>
                <p 
                  style={{color: '#6b7280', marginBottom: 0, fontSize: '0.9375rem', lineHeight: '1.6'}} 
                  dangerouslySetInnerHTML={{ __html: snippet }}
                />
                <small style={{color: '#9ca3af', marginTop: '4px', display: 'block'}}>
                  {hit.count >= 10 ? `${hit.count - 10}+ kết quả` : `${hit.count} kết quả`}
                </small>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Search;
