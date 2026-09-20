from fastapi import APIRouter, HTTPException, Query
from ..database import list_cases, get_case, delete_case, get_dashboard_stats

router = APIRouter()

@router.get("/cases")
def get_all_cases(user_id: str = Query(None)):
    return list_cases(user_id=user_id)

@router.get("/cases/{case_id}")
def get_single_case(case_id: str):
    c = get_case(case_id)
    if not c:
        raise HTTPException(404, f"Case {case_id} not found")
    return c

@router.delete("/cases/{case_id}")
def remove_case(case_id: str):
    c = get_case(case_id)
    if not c:
        raise HTTPException(404, f"Case {case_id} not found")
    delete_case(case_id)
    return {"status": "deleted", "case_id": case_id}

@router.get("/dashboard/stats")
def get_stats():
    return get_dashboard_stats()
