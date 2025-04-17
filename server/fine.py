import os
from dotenv import load_dotenv
import httpx
import json
from typing import Dict, List, Any, Optional, Union

load_dotenv()

class FineTable:
    def __init__(self, table_name: str, fine_endpoint: str):
        self.table_name = table_name
        self.fine_endpoint = fine_endpoint
        self.filters = []
        self.order_by = None
        self.order_direction = None

    async def select(self, *fields):
        self.fields = fields if fields else ["*"]
        return self

    async def eq(self, field: str, value: Any):
        self.filters.append({"type": "eq", "field": field, "value": value})
        return self

    async def in_(self, field: str, values: List[Any]):
        self.filters.append({"type": "in", "field": field, "value": values})
        return self

    async def order(self, field: str, options: Dict[str, bool] = None):
        self.order_by = field
        if options and "ascending" in options:
            self.order_direction = "asc" if options["ascending"] else "desc"
        return self

    async def first(self) -> Optional[Dict[str, Any]]:
        result = await self._execute_query()
        return result[0] if result and len(result) > 0 else None

    async def _execute_query(self) -> List[Dict[str, Any]]:
        url = f"{self.fine_endpoint}/data/{self.table_name}"
        
        query = {
            "select": self.fields,
            "filters": self.filters
        }
        
        if self.order_by:
            query["orderBy"] = {
                "field": self.order_by,
                "direction": self.order_direction or "asc"
            }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=query)
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"Error querying Fine.dev: {response.text}")

class Fine:
    def __init__(self):
        self.fine_endpoint = os.getenv("VITE_FINE_ENDPOINT", "https://platform.fine.dev/customer-cautious-staff-loyal-similar-pan")
    
    def table(self, table_name: str) -> FineTable:
        return FineTable(table_name, self.fine_endpoint)

# Create a singleton instance
table = Fine().table