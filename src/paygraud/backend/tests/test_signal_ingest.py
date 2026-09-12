import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.services.ingest.extractor import extract_features
from app.models_ai.signal_scorer import score_signal


# ---------- extractor / scorer (no DB) ----------

def test_legit_otp_is_low():
    f = extract_features("ICICBK", "OTP is 123456. Do not share.")
    r = score_signal(f)
    assert r.risk_level == "low"
    assert r.action == "ignore"
    assert "legit_otp" in r.flags


def test_phishing_sms_is_critical():
    body = "ICIC Bank: Your card is frozen. Verify now → icic-cardverif7.xyz"
    f = extract_features("ICIC Bank", body)
    r = score_signal(f)
    assert r.risk_level in ("high", "critical")
    assert r.action == "reject"
    assert "phishing_link" in r.flags
    assert "sender_spoof" in r.flags
    assert "urgency_social_engineering" in r.flags


def test_upi_request_is_high_or_critical():
    body = "Pay ₹25000 to lambda441@upi for Booking deposit"
    f = extract_features("ECOM-SMS", body)
    r = score_signal(f)
    assert r.risk_level in ("high", "critical")
    assert r.action == "reject"
    assert "suspicious_upi_request" in r.flags
    assert "elevated_amount" in r.flags


def test_unknown_link_below_phishy_path_is_medium_or_high():
    body = "Click http://randomsite.xyz/details to see your statement"
    f = extract_features("555888", body)
    r = score_signal(f)
    assert r.risk_level in ("medium", "high")
    assert "unverified_link" in r.flags


# ---------- API smoke (requires live Postgres + Redis) ----------

@pytest.mark.asyncio
async def test_signals_sms_smoke():
    """End-to-end signal ingest via API — auto-skipped when Postgres is unavailable."""
    import asyncpg  # noqa: PLC0415
    import os

    db_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://payguard:payguard@localhost:5433/payguard")
    # parse host:port from the URL
    after_at = db_url.split("@")[1].split("/")[0]
    db_host, _, db_port_str = after_at.partition(":")
    db_port = int(db_port_str) if db_port_str else 5432
    try:
        conn = await asyncpg.connect(host=db_host, port=db_port, user="payguard", password="payguard", database="payguard", timeout=2)
        await conn.close()
    except Exception:
        pytest.skip("Postgres not available — skipping DB-dependent integration test")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/api/v1/auth/register", json={"email":"sig@test.dev","password":"Passw0rd!","full_name":"Sig"})
        tok = await client.post("/api/v1/auth/login", data={"username":"sig@test.dev","password":"Passw0rd!"})
        headers = {"Authorization": f"Bearer {tok.json()['access_token']}"}

        resp = await client.post(
            "/api/v1/signals/sms",
            json={"sender":"ICIC Bank","body":"Your card is frozen. Verify now → icic-cardverif7.xyz"},
            headers=headers,
        )
        assert resp.status_code == 201, resp.text
        data = resp.json()
        assert data["action"] == "reject"
        assert data["risk_level"] in ("high", "critical")
        assert "phishing_link" in data["flags"]
        assert data["sender"] == "ICIC Bank"

        legit = await client.post(
            "/api/v1/signals/sms",
            json={"sender":"ICICBK","body":"OTP is 883421. Do not share."},
            headers=headers,
        )
        assert legit.status_code == 201, legit.text
        assert legit.json()["action"] == "ignore"