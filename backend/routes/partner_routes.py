from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import uuid
from database import db

router = APIRouter(prefix="/partners", tags=["partners"])

class PartnerLeadCreate(BaseModel):
    partner_slug: str
    name: str
    email: str
    phone: str
    contact_type: Optional[str] = ""
    plan_interest: Optional[str] = ""

@router.post("/leads")
async def create_lead(data: PartnerLeadCreate):
    lead = {
        "lead_id": str(uuid.uuid4()),
        "partner_slug": data.partner_slug,
        "name": data.name,
        "email": data.email,
        "phone": data.phone,
        "contact_type": data.contact_type,
        "plan_interest": data.plan_interest,
        "status": "new",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.partner_leads.insert_one(lead)
    del lead["_id"]
    return lead

@router.get("/leads")
async def get_leads(partner_slug: Optional[str] = None):
    query = {}
    if partner_slug:
        query["partner_slug"] = partner_slug
    leads = await db.partner_leads.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
    return leads

@router.get("/leads/stats")
async def get_lead_stats():
    pipeline = [
        {"$group": {"_id": "$partner_slug", "total": {"$sum": 1}}},
    ]
    stats = await db.partner_leads.aggregate(pipeline).to_list(100)
    return {s["_id"]: s["total"] for s in stats}
