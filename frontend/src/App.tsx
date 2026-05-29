import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface Clause {
  id: string;
  kind: string;
  number: string;
  title: string;
  text: string;
  references: string[];
  referenced_by: string[];
  category: string;
  categories: string[];
  category_scores: Record<string, number>;
}

interface ParsedAgreement {
  filename: string;
  title: string;
  clause_count: number;
  clauses: Clause[];
}

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL ?? '').replace(/\/$/, '');
const UPLOAD_URL = `${BACKEND_URL}/api/agreements/upload`;
const HEALTH_URL = `${BACKEND_URL}/api/health`;

function clausePrefix(kind: string) {
  if (kind === 'CLAUSE') return 'Cl.';
  return '§';
}

function clauseLabel(c: Clause) {
  return `${clausePrefix(c.kind)}${c.number} ${c.title}`.trim();
}

// Deterministic chip colors per category so the same type always looks the
// same across clauses and the legend.
const CATEGORY_PALETTE = [
  'bg-rose-100 text-rose-800 border-rose-200',
  'bg-orange-100 text-orange-800 border-orange-200',
  'bg-amber-100 text-amber-800 border-amber-200',
  'bg-lime-100 text-lime-800 border-lime-200',
  'bg-emerald-100 text-emerald-800 border-emerald-200',
  'bg-teal-100 text-teal-800 border-teal-200',
  'bg-cyan-100 text-cyan-800 border-cyan-200',
  'bg-sky-100 text-sky-800 border-sky-200',
  'bg-indigo-100 text-indigo-800 border-indigo-200',
  'bg-violet-100 text-violet-800 border-violet-200',
  'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
  'bg-pink-100 text-pink-800 border-pink-200',
];

function categoryColor(category: string) {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  }
  return CATEGORY_PALETTE[hash % CATEGORY_PALETTE.length];
}

export default function App() {
  const [agreement, setAgreement] = useState<ParsedAgreement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [backendUp, setBackendUp] = useState<'checking' | 'up' | 'down'>(
    'checking',
  );
  const clauseRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    let cancelled = false;
    fetch(HEALTH_URL)
      .then((r) => (r.ok ? 'up' : 'down'))
      .catch(() => 'down')
      .then((s) => {
        if (!cancelled) setBackendUp(s as 'up' | 'down');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const upload = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    setAgreement(null);
    setActiveId(null);
    try {
      const form = new FormData();
      form.append('file', file);
      let res: Response;
      try {
        res = await fetch(UPLOAD_URL, { method: 'POST', body: form });
      } catch (netErr: any) {
        throw new Error(
          `Network error reaching ${UPLOAD_URL}. Is the Python backend ` +
            `running on ${BACKEND_URL || 'localhost:8000'}? ` +
            `(${netErr?.message ?? 'fetch failed'})`,
        );
      }
      if (!res.ok) {
        const ct = res.headers.get('content-type') ?? '';
        let detail = res.statusText;
        if (ct.includes('application/json')) {
          const j = await res.json().catch(() => null);
          if (j?.detail) detail = j.detail;
        }
        if (res.status === 404) {
          throw new Error(
            `404 from ${UPLOAD_URL}. Likely the request didn't reach FastAPI ` +
              `— restart 'npm run dev' after vite.config.ts changes, or set ` +
              `VITE_BACKEND_URL=http://localhost:8000 in .env to bypass the proxy.`,
          );
        }
        throw new Error(`Upload failed (${res.status}): ${detail}`);
      }
      setAgreement(await res.json());
    } catch (e: any) {
      setError(e?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
    },
    maxFiles: 1,
    onDrop: (files) => files[0] && upload(files[0]),
  });

  const byId = useMemo(() => {
    const m: Record<string, Clause> = {};
    agreement?.clauses.forEach((c) => (m[c.id] = c));
    return m;
  }, [agreement]);

  // Primary-category breakdown for the filter bar (category -> clause count).
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    agreement?.clauses.forEach((c) => {
      counts[c.category] = (counts[c.category] ?? 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [agreement]);

  const visibleClauses = useMemo(() => {
    if (!agreement) return [];
    if (!categoryFilter) return agreement.clauses;
    return agreement.clauses.filter((c) =>
      c.categories.includes(categoryFilter),
    );
  }, [agreement, categoryFilter]);

  const scrollTo = (id: string) => {
    setActiveId(id);
    clauseRefs.current[id]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Agreement Reference Explorer
        </h1>
        <p className="text-slate-600 mb-3">
          Upload a legal agreement (.docx). The backend extracts every clause
          and maps which clauses reference which.
        </p>
        <BackendBadge status={backendUp} />
      </header>

      <div
        {...getRootProps()}
        className={`mb-8 border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-brand-500 bg-brand-50'
            : 'border-slate-300 hover:border-brand-500 hover:bg-white/60'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-3xl mb-2">📄</div>
        {loading ? (
          <p className="text-slate-600">Parsing document…</p>
        ) : isDragActive ? (
          <p className="font-medium">Drop the .docx here…</p>
        ) : (
          <p className="font-medium">
            Drag &amp; drop a <code>.docx</code> agreement, or click to choose
          </p>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
          <div className="font-semibold mb-1">Could not parse document</div>
          <div className="text-sm">{error}</div>
        </div>
      )}

      {agreement && (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <aside className="lg:sticky lg:top-6 self-start rounded-2xl bg-white/80 backdrop-blur border p-4 max-h-[80vh] overflow-y-auto">
            <div className="text-sm text-slate-500 mb-1 truncate">
              📎 {agreement.filename}
            </div>
            <h2 className="font-bold mb-3 leading-snug">{agreement.title}</h2>
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
              {agreement.clause_count} clauses
            </div>

            <div className="text-xs uppercase tracking-wide text-slate-500 mb-2 mt-4">
              Filter by classification
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              <button
                onClick={() => setCategoryFilter(null)}
                className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                  categoryFilter === null
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                All ({agreement.clause_count})
              </button>
              {categoryCounts.map(([cat, count]) => (
                <button
                  key={cat}
                  onClick={() =>
                    setCategoryFilter(categoryFilter === cat ? null : cat)
                  }
                  className={`text-xs px-2 py-1 rounded-full border transition-all ${categoryColor(
                    cat,
                  )} ${
                    categoryFilter === cat
                      ? 'ring-2 ring-offset-1 ring-slate-400'
                      : 'opacity-90 hover:opacity-100'
                  }`}
                >
                  {cat} ({count})
                </button>
              ))}
            </div>

            <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
              Clauses
            </div>
            <ul className="space-y-1">
              {agreement.clauses.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => scrollTo(c.id)}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors ${
                      activeId === c.id
                        ? 'bg-brand-100 text-brand-700 font-semibold'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-mono text-xs text-slate-500 mr-2">
                      {c.id}
                    </span>
                    {c.title || '(untitled)'}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section className="space-y-4">
            {categoryFilter && (
              <div className="text-sm text-slate-600 flex items-center gap-2">
                Showing <strong>{visibleClauses.length}</strong> clause(s) tagged
                <span
                  className={`px-2 py-0.5 rounded-full border text-xs ${categoryColor(
                    categoryFilter,
                  )}`}
                >
                  {categoryFilter}
                </span>
                <button
                  onClick={() => setCategoryFilter(null)}
                  className="text-brand-600 hover:underline"
                >
                  clear
                </button>
              </div>
            )}
            {visibleClauses.map((c) => (
              <div
                key={c.id}
                ref={(el) => (clauseRefs.current[c.id] = el)}
                className={`rounded-2xl bg-white border p-5 transition-shadow ${
                  activeId === c.id
                    ? 'border-brand-500 shadow-lg'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-baseline gap-2 mb-3">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {c.id}
                  </span>
                  <h3 className="text-lg font-bold">
                    {c.title || '(untitled clause)'}
                  </h3>
                  <span className="ml-auto text-xs uppercase tracking-wide text-slate-400">
                    {c.kind} {c.number}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-xs uppercase tracking-wide text-slate-500">
                    Classification:
                  </span>
                  {c.categories.map((cat, idx) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      title={
                        idx === 0
                          ? 'Primary clause type'
                          : 'Secondary classification'
                      }
                      className={`text-xs px-2 py-1 rounded-full border transition-all ${categoryColor(
                        cat,
                      )} ${idx === 0 ? 'font-semibold' : 'opacity-80'}`}
                    >
                      {cat}
                      {idx === 0 && c.categories.length > 1 ? ' ★' : ''}
                    </button>
                  ))}
                </div>

                {(c.references.length > 0 || c.referenced_by.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <RefRow
                      label="References"
                      ids={c.references}
                      byId={byId}
                      onClick={scrollTo}
                      tone="indigo"
                    />
                    <RefRow
                      label="Referenced by"
                      ids={c.referenced_by}
                      byId={byId}
                      onClick={scrollTo}
                      tone="amber"
                    />
                  </div>
                )}

                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {c.text}
                </p>
              </div>
            ))}
          </section>
        </div>
      )}
    </div>
  );
}

function BackendBadge({ status }: { status: 'checking' | 'up' | 'down' }) {
  const url = BACKEND_URL || '(via Vite proxy)';
  if (status === 'checking') {
    return (
      <div className="inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
        ⏳ Checking backend… <span className="font-mono">{url}</span>
      </div>
    );
  }
  if (status === 'up') {
    return (
      <div className="inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
        ✓ Backend reachable{' '}
        <span className="font-mono opacity-70">{url}</span>
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
      ✗ Backend not reachable at <span className="font-mono">{url}</span>. Start
      uvicorn on :8000, or set <code>VITE_BACKEND_URL</code>.
    </div>
  );
}

function RefRow({
  label,
  ids,
  byId,
  onClick,
  tone,
}: {
  label: string;
  ids: string[];
  byId: Record<string, Clause>;
  onClick: (id: string) => void;
  tone: 'indigo' | 'amber';
}) {
  const toneCls =
    tone === 'indigo'
      ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200'
      : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200';
  return (
    <div className="rounded-xl border bg-slate-50/60 p-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500 mb-2">
        {label}
        <span className="ml-auto font-mono text-slate-400">{ids.length}</span>
      </div>
      {ids.length === 0 ? (
        <div className="text-xs text-slate-400 italic">none</div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {ids.map((id) => {
            const t = byId[id];
            return (
              <button
                key={id}
                onClick={() => onClick(id)}
                title={t ? clauseLabel(t) : id}
                className={`text-xs px-2 py-1 rounded-full border transition-colors ${toneCls}`}
              >
                {t ? clauseLabel(t) : id}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
