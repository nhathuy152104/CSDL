# controller/Skill.py
from .mysqlconnector import get_connection

class Skill:
    def search_skills(query: str | None = None, limit: int = 100):
        conn = get_connection()
        try:
            cursor = conn.cursor(dictionary=True)
            if query:
                cursor.execute(
                    "SELECT skill_id, name FROM skills WHERE name LIKE %s ORDER BY name LIMIT %s",
                    (f"%{query}%", limit)
                )
            else:
                cursor.execute(
                    "SELECT skill_id, name FROM skills ORDER BY name LIMIT %s",
                    (limit,)
                )
            return cursor.fetchall()   # trả list[{"skill_id":..,"name":..}]
        finally:
            conn.close()
