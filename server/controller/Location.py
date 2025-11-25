from .mysqlconnector import get_connection

class Location:
    def search_locations(query: str | None = None, limit: int = 100):
        conn = get_connection()
        try:
            cursor = conn.cursor(dictionary=True)
            if query:
                cursor.execute(
                    "SELECT region_id, name FROM region WHERE name LIKE %s ORDER BY name LIMIT %s",
                    (f"%{query}%", limit)
                )
            else:
                cursor.execute(
                    "SELECT region_id, name FROM region ORDER BY name LIMIT %s",
                    (limit,)
                )
            return cursor.fetchall()   
        finally:
            conn.close()
