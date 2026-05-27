# Agreement Reference Extractor — Backend

FastAPI service that parses legal agreement `.docx` files into clauses and
computes a cross-reference graph (`references` and `referenced_by`).

## Run

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Endpoints

- `GET  /api/health` — liveness probe.
- `POST /api/agreements/upload` — multipart form upload, field name `file`,
  `.docx` only. Returns:

```json
{
  "filename": "NDAPrint.docx",
  "title": "NON-DISCLOSURE & CONFIDENTIALITY AGREEMENT",
  "clause_count": 15,
  "clauses": [
    {
      "id": "ART-3",
      "kind": "ARTICLE",
      "number": "3",
      "title": "OBLIGATIONS OF THE PARTIES",
      "text": "...",
      "references": [],
      "referenced_by": ["ART-4"]
    }
  ]
}
```

## How parsing works

1. Extract all non-empty paragraphs from the DOCX via `python-docx`.
2. Detect headings matching `ARTICLE / SECTION / CLAUSE / §` followed by a
   number (`1`, `8A`, `2.1`).
3. The next short line is taken as the clause title; remaining paragraphs
   until the next heading form the body.
4. Inside each body, scan for inline references (`Article 3`,
   `Articles 4 and 5`, `Section 2.1`, …) and link `references` →
   `referenced_by` between matching clause numbers.
