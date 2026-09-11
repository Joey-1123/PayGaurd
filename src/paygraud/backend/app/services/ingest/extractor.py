"""Extract structured signals from raw inbound messages (SMS/news) for scoring."""

import re
from dataclasses import dataclass

URL_RE = re.compile(r"https?://[^\s]+")
BARE_DOMAIN_RE = re.compile(
    r"\b(?:[a-z0-9-]+\.)+(?:com|net|org|in|xyz|top|club|online|site|info|co|io|link|live|app)\b",
    re.IGNORECASE,
)
AMOUNT_RE = re.compile(r"(?:inr\s*|rs\.?\s*|₹\s*)([\d,]+(?:\.\d{1,2})?)", re.IGNORECASE)
UPI_RE = re.compile(r"upi://pay\?pa=([^&]+)?.*?(?:&tn=([^&]*))?", re.IGNORECASE)
PLAIN_UPI_RE = re.compile(r"([\w.-]+@(?:upi|oksbi|ybl|paytm|ibl|axl|payu))", re.IGNORECASE)

KNOWN_LEGIT_SHORTCODES = {
    "ICICBK",
    "HDFCBK",
    "SBIINB",
    "AXISBK",
    "KOTAKB",
    "IDIBK",
    "BOIBK",
    "PAYTMPT",
    "VPAI",
    "ADBANKSMS",
}

BANK_BRANDS = [
    "icici", "hdfc", "sbi", "axis", "kotak", "bank", "paytm",
    "phonepe", "gpay", "google pay", "amex", "rupay", "visa", "mastercard",
]


@dataclass
class SignalFeatures:
    sender: str
    body: str
    link: str | None
    link_domain: str | None
    has_link: bool
    amount: float | None
    payee_name: str | None
    sender_looks_bank: bool


def _hostname(link: str) -> str | None:
    if "://" not in link:
        return link.strip().lower()
    try:
        from urllib.parse import urlparse

        return (urlparse(link).hostname or "").lower() or None
    except ValueError:
        return None


def extract_features(sender: str, body: str) -> SignalFeatures:
    link = None
    domain = None
    url_match = URL_RE.search(body)
    if url_match:
        link = url_match.group(0)
        domain = _hostname(link)
    else:
        bd = BARE_DOMAIN_RE.search(body)
        if bd:
            link = bd.group(0).strip(".")
            domain = _hostname(link)

    amount: float | None = None
    explicit = AMOUNT_RE.search(body)
    if explicit:
        amount = float(explicit.group(1).replace(",", ""))

    payee = None
    upi = UPI_RE.search(body)
    if upi and upi.group(1):
        payee = upi.group(1)
    elif upi and upi.group(2):
        payee = upi.group(2)
    else:
        plain = PLAIN_UPI_RE.search(body)
        if plain:
            payee = plain.group(1)

    lowered = sender.lower()
    sender_looks_bank = any(brand in lowered for brand in BANK_BRANDS)

    return SignalFeatures(
        sender=sender,
        body=body,
        link=link,
        link_domain=domain,
        has_link=bool(link),
        amount=amount,
        payee_name=payee or ("unknown" if upi else None),
        sender_looks_bank=sender_looks_bank,
    )