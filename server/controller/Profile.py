from .mysqlconnector import get_connection

class Profile:
    def get_profile_user(user_id):
        try:
            conn = get_connection()
            cursor = conn.cursor(dictionary = True)
            cursor.execute("""
                SELECT 
                    user_id,
                    full_name,
                    email,
                    phone
                FROM users
                WHERE user_id = %s
            """, (user_id,))

            row = cursor.fetchone()
            return {"success": True, "profile" : row}
        except Exception as e:
            return {"success": False, "Exception": e}
    def update_profile_user(data, user_id):
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE users SET
            full_name = %s, phone = %s
            WHERE user_id = %s
        """, (data["full_name"], data["phone"], user_id))
        conn.commit()
        conn.close()
        return {"success": True}
    def get_mine_skill(user_id):
        conn = get_connection()
        try:
            with conn.cursor(dictionary=True) as cur:
                cur.execute("""
                    SELECT s.skill_id, s.name, us.level, us.years_exp
                    FROM user_skills us
                    JOIN skills s ON s.skill_id = us.skill_id
                    WHERE us.user_id = %s
                    ORDER BY s.name
                """, (user_id,))
                return cur.fetchall()
        finally:
            conn.close()    
    def add_skill_user(data):
        conn = get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT 1 FROM skills WHERE skill_id=%s", (data["skill_id"],))
                if not cur.fetchone():
                    return {"success": False}

                cur.execute("""
                    INSERT INTO user_skills(user_id, skill_id, level, years_exp)
                    VALUES(%s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE level=VALUES(level), years_exp=VALUES(years_exp)
                """, (data["user_id"], data["skill_id"], data["level"], data["years_exp"]))
            conn.commit()
            return {"ok": True}
        finally:
            conn.close()
    def remove_skill_user(user_id, skill_id):
        conn = get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM user_skills WHERE user_id=%s AND skill_id=%s", (user_id, skill_id))
            conn.commit()
            return {"success": True}
        finally:
            conn.close()
    


