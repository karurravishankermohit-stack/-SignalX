from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class SessionResponse(BaseModel):
    session_id: str
    case_id: str
    filename: str
    format: str
    data_source: str
    status: str
    metadata: Dict[str, Any] = {}
    results: Dict[str, Any] = {}
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class IQConfig(BaseModel):
    sample_rate: float
    dtype: str = "float32"
    arrangement: str = "interleaved"
    center_freq_hz: Optional[float] = None
