from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import uuid
from database import db
from auth import get_current_user, require_admin

router = APIRouter(prefix="/quick-menu", tags=["quick-menu"])

DEFAULT_ITEMS = [
    {"name": "SeniorClub", "icon": "Users", "url": "/seniorclub", "order": 0},
    {"name": "SeniorPodcast", "icon": "Mic", "url": "/podcast", "order": 1},
    {"name": "Actualidad Senior", "icon": "Newspaper", "url": "/blog", "order": 2},
    {"name": "Editorial", "icon": "BookOpen", "url": "/editorial", "order": 3},
]


class QuickMenuItemCreate(BaseModel):
    name: str
    icon: str = "Link"
    url: str
    order: int = 0
    active: bool = True
    custom_icon_url: Optional[str] = ""


class QuickMenuItemUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    url: Optional[str] = None
    order: Optional[int] = None
    active: Optional[bool] = None
    custom_icon_url: Optional[str] = None


async def _seed_defaults_if_empty():
    count = await db.quick_menu_items.count_documents({})
    if count == 0:
        now = datetime.now(timezone.utc).isoformat()
        docs = [{
            "item_id": str(uuid.uuid4()),
            "name": d["name"],
            "icon": d["icon"],
            "url": d["url"],
            "order": d["order"],
            "active": True,
            "custom_icon_url": "",
            "created_at": now,
            "updated_at": now,
        } for d in DEFAULT_ITEMS]
        await db.quick_menu_items.insert_many(docs)


@router.get("")
async def list_public_items():
    await _seed_defaults_if_empty()
    items = await db.quick_menu_items.find({"active": True}, {"_id": 0}).sort("order", 1).to_list(100)
    return items


@router.get("/admin")
async def list_admin_items(request: Request):
    user = await get_current_user(request, db)
    await require_admin(user)
    await _seed_defaults_if_empty()
    items = await db.quick_menu_items.find({}, {"_id": 0}).sort("order", 1).to_list(200)
    return items


@router.post("/admin")
async def create_item(data: QuickMenuItemCreate, request: Request):
    user = await get_current_user(request, db)
    await require_admin(user)
    now = datetime.now(timezone.utc).isoformat()
    item = {
        "item_id": str(uuid.uuid4()),
        "name": data.name,
        "icon": data.icon or "Link",
        "url": data.url,
        "order": data.order,
        "active": data.active,
        "custom_icon_url": data.custom_icon_url or "",
        "created_at": now,
        "updated_at": now,
    }
    await db.quick_menu_items.insert_one(item)
    item.pop("_id", None)
    return item


@router.put("/admin/{item_id}")
async def update_item(item_id: str, data: QuickMenuItemUpdate, request: Request):
    user = await get_current_user(request, db)
    await require_admin(user)
    update = {k: v for k, v in data.dict().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="Nada que actualizar")
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.quick_menu_items.update_one({"item_id": item_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    item = await db.quick_menu_items.find_one({"item_id": item_id}, {"_id": 0})
    return item


@router.delete("/admin/{item_id}")
async def delete_item(item_id: str, request: Request):
    user = await get_current_user(request, db)
    await require_admin(user)
    result = await db.quick_menu_items.delete_one({"item_id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    return {"status": "deleted"}
