"""
Script to activate provider subscription for testing
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone, timedelta
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / 'backend' / '.env')

async def activate_provider_subscription():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Find provider user
    user = await db.users.find_one({"email": "cuidador@test.com"})
    if not user:
        print("Provider not found")
        return
    
    user_id = user["user_id"]
    print(f"Found provider: {user_id}")
    
    # Check existing subscription
    sub = await db.subscriptions.find_one({"user_id": user_id})
    
    if sub:
        print(f"Current subscription status: {sub.get('status')}")
        
        # Update to active
        result = await db.subscriptions.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "status": "active",
                    "start_date": datetime.now(timezone.utc),
                    "end_date": datetime.now(timezone.utc) + timedelta(days=30),
                    "plan_id": "plan_ucan_cuidador"
                }
            }
        )
        print(f"Updated subscription to active: {result.modified_count} document(s)")
    else:
        # Create new active subscription
        new_sub = {
            "subscription_id": f"sub_test_{user_id[:8]}",
            "user_id": user_id,
            "plan_id": "plan_ucan_cuidador",
            "status": "active",
            "start_date": datetime.now(timezone.utc),
            "end_date": datetime.now(timezone.utc) + timedelta(days=30),
            "auto_renew": False,
            "created_at": datetime.now(timezone.utc)
        }
        await db.subscriptions.insert_one(new_sub)
        print("Created new active subscription")
    
    # Verify
    sub = await db.subscriptions.find_one({"user_id": user_id}, {"_id": 0})
    print(f"Final subscription: {sub}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(activate_provider_subscription())
