"""Parse legal agreement DOCX files into clauses with cross-reference graph."""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import BinaryIO

from docx import Document

from .classifier import classify

# Matches headings like "ARTICLE 1", "ARTICLE-1", "ARTICLE 1A", "Section 2", "Clause 3.1"
HEADING_RE = re.compile(
    r"^\s*(ARTICLE|SECTION|CLAUSE|§)\s*[-–—]?\s*([0-9]+[A-Z]?(?:\.[0-9]+)*)\s*$",
    re.IGNORECASE,
)

# In-text references: "Article 3", "Articles 4 and 5", "Section 2.1", "§ 3", "Article 8"
REF_RE = re.compile(
    r"\b(?:article|articles|section|sections|clause|clauses|§)\s*"
    r"([0-9]+[A-Z]?(?:\.[0-9]+)*(?:\s*(?:,|and|&|to|-|–)\s*[0-9]+[A-Z]?(?:\.[0-9]+)*)*)",
    re.IGNORECASE,
)

# Pulls individual numbers out of a captured reference group (e.g. "4 and 5" -> ["4","5"])
NUM_RE = re.compile(r"[0-9]+[A-Z]?(?:\.[0-9]+)*", re.IGNORECASE)


@dataclass
class Clause:
    id: str               # canonical id e.g. "ART-3" or "ART-8A"
    kind: str             # ARTICLE / SECTION / CLAUSE
    number: str           # "3", "8A", "2.1"
    title: str            # heading line that follows the marker, e.g. "OBLIGATIONS OF THE PARTIES"
    text: str             # body paragraphs joined
    paragraphs: list[str] = field(default_factory=list)
    references: list[str] = field(default_factory=list)       # ids this clause points to
    referenced_by: list[str] = field(default_factory=list)    # ids that point at this clause
    category: str = "General"                                  # primary clause type
    categories: list[str] = field(default_factory=list)        # all matched types, best first
    category_scores: dict[str, int] = field(default_factory=dict)


def _canonical_id(kind: str, number: str) -> str:
    prefix = {"ARTICLE": "ART", "SECTION": "SEC", "CLAUSE": "CL", "§": "ART"}.get(
        kind.upper(), "ART"
    )
    return f"{prefix}-{number.upper()}"


def _extract_paragraphs(file: BinaryIO) -> list[str]:
    doc = Document(file)
    out: list[str] = []
    for p in doc.paragraphs:
        text = (p.text or "").strip()
        if text:
            out.append(text)
    return out


def _split_into_clauses(paragraphs: list[str]) -> list[Clause]:
    clauses: list[Clause] = []
    current: Clause | None = None
    preamble_done = False

    i = 0
    while i < len(paragraphs):
        para = paragraphs[i]
        m = HEADING_RE.match(para)
        if m:
            # Title is usually the next non-empty line (uppercase short heading).
            title = ""
            if i + 1 < len(paragraphs):
                nxt = paragraphs[i + 1]
                # If next paragraph also matches a heading marker, leave title empty.
                if not HEADING_RE.match(nxt) and len(nxt) < 120:
                    title = nxt
                    i += 1
            kind = m.group(1).upper()
            number = m.group(2).upper()
            current = Clause(
                id=_canonical_id(kind, number),
                kind="ARTICLE" if kind == "§" else kind,
                number=number,
                title=title,
                text="",
            )
            clauses.append(current)
            preamble_done = True
        else:
            if current is None and not preamble_done:
                # Skip preamble / recitals until first ARTICLE heading
                pass
            elif current is not None:
                current.paragraphs.append(para)
        i += 1

    for c in clauses:
        c.text = "\n".join(c.paragraphs)
    return clauses


def _find_refs_in_text(text: str) -> list[str]:
    """Return list of normalized number strings referenced in the text."""
    found: list[str] = []
    for m in REF_RE.finditer(text):
        group = m.group(1)
        for num_match in NUM_RE.finditer(group):
            found.append(num_match.group(0).upper())
    return found


def _build_reference_graph(clauses: list[Clause]) -> None:
    by_number = {c.number: c for c in clauses}
    for c in clauses:
        seen: set[str] = set()
        for raw_num in _find_refs_in_text(c.text):
            target = by_number.get(raw_num)
            if target is None or target.id == c.id or target.id in seen:
                continue
            seen.add(target.id)
            c.references.append(target.id)
            target.referenced_by.append(c.id)


def parse_agreement(file: BinaryIO, filename: str) -> dict:
    paragraphs = _extract_paragraphs(file)
    clauses = _split_into_clauses(paragraphs)
    _build_reference_graph(clauses)

    for c in clauses:
        result = classify(c.title, c.text)
        c.category = result.category
        c.categories = result.categories
        c.category_scores = result.scores

    title = paragraphs[0] if paragraphs else filename
    return {
        "filename": filename,
        "title": title,
        "clause_count": len(clauses),
        "clauses": [
            {
                "id": c.id,
                "kind": c.kind,
                "number": c.number,
                "title": c.title,
                "text": c.text,
                "references": c.references,
                "referenced_by": c.referenced_by,
                "category": c.category,
                "categories": c.categories,
                "category_scores": c.category_scores,
            }
            for c in clauses
        ],
    }
