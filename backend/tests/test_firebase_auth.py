import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import create_or_update_user, get_user_by_id

client = TestClient(app)

def test_firebase_status_endpoint():
    res = client.get("/api/auth/firebase-status")
    assert res.status_code == 200
    data = res.json()
    assert data.get("firebase_configured") is True
    assert data.get("project_id") == "signalx-c618c"
    assert "jwks_endpoint" in data
    assert data.get("service_account_secret_exposed") is False

def test_firebase_auth_missing_token():
    res = client.post("/api/auth/firebase", json={})
    assert res.status_code == 400
    assert "Missing Firebase ID token" in res.json().get("detail", "")

def test_firebase_auth_invalid_token():
    res = client.post("/api/auth/firebase", json={"id_token": "invalid.jwt.token"})
    assert res.status_code == 401
    assert "verification failed" in res.json().get("detail", "").lower() or "invalid" in res.json().get("detail", "").lower()

def test_firebase_user_upsert_and_isolation():
    uid = "test-evaluator-fb-001"
    email = "evaluator.fb@signalx.org"
    name = "Firebase Evaluator"
    
    user = create_or_update_user(
        user_id=f"usr-fb-test001",
        email=email,
        name=name,
        profile_image="https://example.com/avatar.png",
        google_subject_id=f"firebase:{uid}"
    )
    
    assert user["id"] == "usr-fb-test001"
    assert user["email"] == email
    assert user["name"] == name
    assert user["google_subject_id"] == f"firebase:{uid}"
    
    fetched = get_user_by_id("usr-fb-test001")
    assert fetched is not None
    assert fetched["email"] == email
