# Agreement Reference Explorer

Upload a legal agreement (`.docx`), get back every clause with a
bidirectional cross-reference graph — what each clause **references** and
which clauses **reference it** — plus an automatic **classification** of each
clause by legal type (Obligations, Rights, Termination, Liability, …) so the
links between clauses are meaningful, not just structural.

```
┌──────────────────────────┐         ┌────────────────────────┐
│  React frontend (Vite)   │  POST   │  FastAPI backend       │
│  drag-and-drop .docx     │ ──────▶ │  python-docx parser    │
│  clause cards + chips    │ ◀────── │  /api/agreements/upload │
└──────────────────────────┘  JSON   └────────────────────────┘
```

## Repo layout

```
backend/    FastAPI service (Python 3.10+, python-docx)
frontend/   Vite + React + TypeScript + Tailwind
```

## Run locally

### 1. Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Verify: <http://localhost:8000/api/health> → `{"status":"ok"}`.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Open <http://localhost:3000>. The header shows a live **Backend reachable**
badge so you'll know immediately if the proxy isn't wired up.

If you're serving the frontend from somewhere other than the Vite dev server
(static build, remote preview, etc.), set the backend URL directly:
```bash
cp .env.example .env
# then edit .env:
# VITE_BACKEND_URL=http://localhost:8000
```

## How parsing works

1. `python-docx` reads every non-empty paragraph from the DOCX.
2. Headings matching `ARTICLE / SECTION / CLAUSE / §` followed by a number
   (`1`, `8A`, `2.1`) split the document into clauses; the next short line
   is captured as the clause title.
3. The body of each clause is scanned for inline references like
   *"Article 3"*, *"Articles 4 and 5"*, *"Section 2.1"* — each match links
   to a target clause, populating both `references` and `referenced_by` on
   the two sides.

## How classification works (`backend/app/classifier.py`)

Each clause is scored against a taxonomy of legal categories (Obligations,
Rights, Confidentiality, Intellectual Property, Termination, Liability &
Indemnity, Governing Law, Dispute Resolution, …). Every category is a set of
weighted keyword/phrase patterns.

- A match in the **clause heading** counts much more than a body match — the
  heading names the clause's intent. So *"OBLIGATIONS OF THE PARTIES"* is
  classified **Obligations** even though its body repeats "confidential" many
  times (that becomes a *secondary* tag instead).
- The highest-scoring title category is the **primary** `category`; other
  categories above a relative threshold are kept as secondary `categories`.
- It's rule-based and dependency-free, so it runs offline and every decision
  is explainable via the returned `category_scores`.

In the UI, each clause shows its classification chips (primary marked ★), and
a sidebar filter lets you isolate all clauses of a given type.

Verified against a real NDA — e.g. an Article 8 (Term) survival clause
listing *"Article 5, Articles 7, Article 11 (Entire Agreement) …"* produces
the correct outgoing references and the corresponding `referenced_by`
entries on Articles 5, 7, 11.

## API

`POST /api/agreements/upload` (multipart, field `file`, `.docx` only):
```json
{
  "filename": "NDA.docx",
  "title": "NON-DISCLOSURE & CONFIDENTIALITY AGREEMENT",
  "clause_count": 18,
  "clauses": [
    {
      "id": "ART-3",
      "kind": "ARTICLE",
      "number": "3",
      "title": "OBLIGATIONS OF THE PARTIES",
      "text": "...",
      "references": [],
      "referenced_by": ["ART-4"],
      "category": "Obligations",
      "categories": ["Obligations", "Confidentiality"],
      "category_scores": { "Confidentiality": 39, "Obligations": 30 }
    }
  ]
}
```
