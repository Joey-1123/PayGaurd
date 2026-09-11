import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_gateway_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        auth = await client.post("/api/v1/gateway/authorize", json={"amount": 250.0, "currency": "USD"})
        assert auth.status_code == 201
        ref = auth.json()["reference"]

        status_resp = await client.get(f"/api/v1/gateway/status/{ref}")
        assert status_resp.status_code == 200
        assert status_resp.json()["status"] == "authorized"

        cap = await client.post(f"/api/v1/gateway/capture?reference={ref}")
        assert cap.status_code == 200
        assert cap.json()["status"] == "settled"


@pytest.mark.asyncio
async def test_unknown_route_is_404():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/v1/nope")
    assert resp.status_code == 404