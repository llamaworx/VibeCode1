"""Rule-based clause classifier.

Assigns each clause one or more legal categories (obligations, rights,
termination, liability, …) by scoring keyword/phrase hits against the clause
title and body. Title hits are weighted more heavily than body hits because
the heading is the strongest signal of clause intent.

This is deliberately heuristic and dependency-free so it runs offline and its
decisions are fully explainable (every match contributes a visible score).
"""
from __future__ import annotations

import re
from dataclasses import dataclass

# Each category is a list of (pattern, weight). Patterns are matched
# case-insensitively as whole-ish phrases. Higher weight = stronger signal.
TAXONOMY: dict[str, list[tuple[str, int]]] = {
    "Definitions": [
        (r"shall mean", 3), (r"\bdefinition", 3), (r"\bdefined\b", 2),
        (r"interpretation", 2), (r"means\b", 1),
    ],
    "Obligations": [
        (r"\bshall\b", 1), (r"undertakes?", 3), (r"obligations?", 3),
        (r"covenants?", 2), (r"\bmust\b", 2), (r"responsible for", 2),
        (r"agrees? to", 1), (r"duty", 2),
    ],
    "Rights": [
        (r"\bright\b", 2), (r"\brights\b", 2), (r"entitled", 3),
        (r"\btitle\b", 2), (r"ownership", 2), (r"may use", 1),
        (r"license", 2), (r"permitted to", 1),
    ],
    "Confidentiality": [
        (r"confidential", 3), (r"non-disclosure", 3), (r"proprietary", 2),
        (r"\bsecret", 2), (r"need to know", 1),
    ],
    "Intellectual Property": [
        (r"intellectual property", 4), (r"\bip\b", 2), (r"copyright", 3),
        (r"patent", 3), (r"trademark", 3), (r"derivative work", 2),
    ],
    "Termination": [
        (r"terminat", 3), (r"expir", 2), (r"term of the agreement", 3),
        (r"remain in effect", 2), (r"survive", 2),
    ],
    "Liability & Indemnity": [
        (r"liabilit", 3), (r"\bliable\b", 3), (r"indemnif", 3),
        (r"hold .{0,20}harmless", 3), (r"damages", 2), (r"breach", 1),
    ],
    "Exceptions": [
        (r"exception", 3), (r"shall not apply", 3), (r"does not apply", 2),
        (r"\bexcept\b", 1),
    ],
    "Governing Law": [
        (r"governing law", 4), (r"governed by .{0,20}laws", 3),
        (r"jurisdiction", 2), (r"laws of", 1),
    ],
    "Dispute Resolution": [
        (r"dispute", 3), (r"arbitrat", 3), (r"mediat", 2),
        (r"litigation", 2), (r"competent court", 1),
    ],
    "Assignment & Modification": [
        (r"assign", 3), (r"\btransfer\b", 2), (r"modification", 2),
        (r"amendment", 2), (r"waiver", 1),
    ],
    "Notices": [
        (r"\bnotice", 3), (r"notify", 2), (r"in writing to", 1),
        (r"communications?", 2),
    ],
    "Entire Agreement": [
        (r"entire agreement", 4), (r"supersede", 3),
        (r"complete and exclusive", 2),
    ],
    "Waiver": [
        (r"\bwaiver\b", 3), (r"\bwaive", 3), (r"failure to exercise", 2),
    ],
    "Severability": [
        (r"severab", 4), (r"invalid", 2), (r"unenforceable", 3),
        (r"illegal", 1),
    ],
    "Representations & Warranties": [
        (r"represent", 3), (r"warrant", 3), (r"\bwarrant(y|ies)\b", 3),
        (r"non-infringing", 2),
    ],
    "Counterparts": [
        (r"counterpart", 4), (r"one or more counterparts", 2),
    ],
    "Payment & Fees": [
        (r"\bpayment", 3), (r"\bfees?\b", 2), (r"invoice", 3),
        (r"compensation", 2), (r"consideration", 1),
    ],
    "Force Majeure": [
        (r"force majeure", 4), (r"act of god", 2), (r"beyond .{0,20}control", 1),
    ],
    "Compliance & Export": [
        (r"export control", 4), (r"compliance", 2), (r"comply with", 2),
        (r"regulator", 2), (r"classified information", 3),
        (r"military security", 2),
    ],
    "Return of Information": [
        (r"return .{0,30}(information|materials?|documents?)", 3),
        (r"destroy", 2), (r"return or destroy", 3),
    ],
    "Purpose & Scope": [
        (r"purpose of (this|the) agreement", 4), (r"scope", 2),
        (r"\bpurpose\b", 1),
    ],
}

# Compile once.
_COMPILED: dict[str, list[tuple[re.Pattern[str], int]]] = {
    cat: [(re.compile(p, re.IGNORECASE), w) for p, w in rules]
    for cat, rules in TAXONOMY.items()
}

TITLE_MULTIPLIER = 3  # a hit in the title counts this many times a body hit


@dataclass
class Classification:
    category: str               # primary (highest-scoring) category
    categories: list[str]       # all categories above threshold, best first
    scores: dict[str, int]      # category -> score, for transparency


def classify(title: str, text: str) -> Classification:
    scores: dict[str, int] = {}
    title_scores: dict[str, int] = {}
    for cat, rules in _COMPILED.items():
        score = 0
        title_score = 0
        for pattern, weight in rules:
            if title and pattern.search(title):
                title_score += weight
                score += weight * TITLE_MULTIPLIER
            score += weight * len(pattern.findall(text or ""))
        if score > 0:
            scores[cat] = score
        if title_score > 0:
            title_scores[cat] = title_score

    if not scores:
        return Classification(category="General", categories=["General"], scores={})

    ranked = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)

    # The heading names the clause type, so if any category matches the title,
    # the highest-scoring title match is the primary category. Body-only
    # signals (e.g. a clause whose body happens to mention "confidential" a
    # lot) only ever become secondary tags.
    if title_scores:
        primary = max(title_scores.items(), key=lambda kv: kv[1])[0]
    else:
        primary = ranked[0][0]

    top_score = scores[primary]
    threshold = max(2, top_score * 0.4)
    categories = [primary]
    for cat, sc in ranked:
        if cat != primary and sc >= threshold:
            categories.append(cat)

    return Classification(
        category=primary,
        categories=categories,
        scores=dict(ranked),
    )
