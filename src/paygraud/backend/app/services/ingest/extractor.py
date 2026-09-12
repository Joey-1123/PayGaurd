"""Extract structured signals from raw inbound messages (SMS/news) for scoring."""

import re
from dataclasses import dataclass
from urllib.parse import unquote

URL_RE = re.compile(r"https?://[^\s]+")
BARE_DOMAIN_RE = re.compile(
    r"\b(?:[a-z0-9-]+\.)+(?:com|net|org|in|xyz|top|club|online|site|info|co|io|link|live|app)\b",
    re.IGNORECASE,
)
AMOUNT_RE = re.compile(r"(?:inr\s*|rs\.?\s*|₹\s*)([\d,]+(?:\.\d{1,2})?)", re.IGNORECASE)
UPI_SCHEME_RE = re.compile(r"upi://pay[^\s]*", re.IGNORECASE)
UPI_PARAM_RE = re.compile(r"(?:^|[?&])(pa|pn|am|tn)=([^&]+)", re.IGNORECASE)
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

    upi_match = UPI_SCHEME_RE.search(body)
    upi_params: dict[str, str] = {}
    if upi_match:
        upi_seg = upi_match.group(0)
        upi_params = {k.lower(): unquote(v) for k, v in UPI_PARAM_RE.findall(upi_seg)}
        if link is None:
            link = upi_seg
            domain = "upi"
    if link is None:
        bd = BARE_DOMAIN_RE.search(body)
        if bd:
            link = bd.group(0).strip(".")
            domain = _hostname(link)

    amount: float | None = None
    explicit = AMOUNT_RE.search(body)
    if explicit:
        amount = float(explicit.group(1).replace(",", ""))

    payee = None
    payee = upi_params.get("pa") or upi_params.get("pn")
    if payee is None:
        plain = PLAIN_UPI_RE.search(body)
        if plain:
            payee = plain.group(1)

    if upi_params.get("am"):
        try:
            amount = float(upi_params["am"].replace(",", ""))
        except ValueError:
            pass

    lowered = sender.lower()
    sender_looks_bank = any(brand in lowered for brand in BANK_BRANDS)

    return SignalFeatures(
        sender=sender,
        body=body,
        link=link,
        link_domain=domain,
        has_link=bool(link),
        amount=amount,
        payee_name=payee or ("unknown" if upi_match else None),
        sender_looks_bank=sender_looks_bank,
    )