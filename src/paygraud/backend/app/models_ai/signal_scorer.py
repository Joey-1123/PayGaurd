"""Deterministic scorer for inbound messages. Reuses rule-engine signals and adds
SMS-specific phishing-link / sender-spoof flags. Always available, never fails."""

import re
import time
from dataclasses import dataclass

from app.agents.orchestrator import level_from_score
from app.models_ai.rule_engine import IMPERSONATION_PATTERNS, SUSPICIOUS_KEYWORDS
from app.services.ingest.extractor import KNOWN_LEGIT_SHORTCODES, SignalFeatures

KNOWN_LEGIT_DOMAINS = {
    "icicibank.com",
    "hdfcbank.com",
    "onlinesbi.sbi",
    "sbi.co.in",
    "axisbank.com",
    "kotak.com",
    "paytm.com",
    "phonepe.com",
    "rupay.co.in",
    "sbimail",
}

SUSPICIOUS_PATH_TOKENS = ["verify", "verif", "confirm", "update", "renew", "reset", "security", "login", "kyc", "campaign"]
OTP_CODE_RE = re.compile(r"\b\d{4,6}\b")


@dataclass
class SignalResult:
    risk_score: float
    risk_level: str
    action: str
    flags: list[str]
    explanation: str


def action_for_level(level: str) -> str:
    return {"low": "ignore", "medium": "alert", "high": "reject", "critical": "reject"}[level]


def _is_legit_otp(features: SignalFeatures) -> bool:
    if features.has_link or features.amount:
        return False
    lowered = features.body.lower()
    if "otp" not in lowered:
        return False
    if not OTP_CODE_RE.search(lowered):
        return False
    return features.sender in KNOWN_LEGIT_SHORTCODES


def _link_is_phishy(features: SignalFeatures) -> bool:
    if not features.link_domain:
        return False
    if features.link_domain in KNOWN_LEGIT_DOMAINS:
        return False
    haystack = ((features.link_domain or "") + " " + (features.link or "")).lower()
    return any(token in haystack for token in SUSPICIOUS_PATH_TOKENS)


def score_signal(features: SignalFeatures) -> SignalResult:
    start = time.perf_counter()
    if _is_legit_otp(features):
        return SignalResult(
            risk_score=0.0, risk_level="low", action="ignore", flags=["legit_otp"],
            explanation="OTP from a known bank shortcode with no link or payment request.",
        )

    score = 0.0
    flags: list[str] = []

    urgency_hits = sum(1 for k in SUSPICIOUS_KEYWORDS if k in features.body.lower())
    if urgency_hits:
        score += min(35, 12 * urgency_hits)
        flags.append("urgency_social_engineering")

    if any(p in features.body.lower() for p in IMPERSONATION_PATTERNS):
        score += 25
        flags.append("possible_impersonation")

    if features.sender_looks_bank and features.sender not in KNOWN_LEGIT_SHORTCODES:
        score += 25
        flags.append("sender_spoof")

    if features.has_link and features.link_domain:
        if _link_is_phishy(features):
            score += 30
            flags.append("phishing_link")
        elif features.link_domain not in KNOWN_LEGIT_DOMAINS:
            score += 20
            flags.append("unverified_link")
            if not features.sender_looks_bank:
                score += 15
                flags.append("unsolicited_link")

    if features.amount:
        if features.amount >= 100000:
            score += 40
            flags.append("high_amount")
        elif features.amount >= 25000:
            score += 25
            flags.append("elevated_amount")
    if features.payee_name and features.amount:
        score += 25
        flags.append("suspicious_upi_request")
        if not features.sender_looks_bank:
            score += 15
            flags.append("non_bank_payment_request")
    elif features.payee_name:
        score += 10
        flags.append("unknown_upi_payee")

    score = min(100.0, score or 0.0)
    level = level_from_score(score).value
    explanation = f"Flagged: {', '.join(flags) or 'no risk signals'}." if flags else "No risk signals detected."
    return SignalResult(
        risk_score=round(score, 1),
        risk_level=level,
        action=action_for_level(level),
        flags=flags,
        explanation=explanation,
    )