from .mysqlconnector import get_connection
from werkzeug.security import generate_password_hash, check_password_hash

class User:
    @staticmethod
    def get_all():
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT user_id, name, email, role, created_at FROM users")
        result = cursor.fetchall()
        cursor.close()
        conn.close()
        return result

    @staticmethod
    def check_login(email, password):
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT user_id, password_hash, role, full_name FROM users WHERE email = %s",
            (email,)
        )
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        # 🔐 Verify password
        if user and check_password_hash(user["password_hash"], password):
            return user["user_id"], user["role"]
        return None

    @staticmethod
    def register(data):
        conn = get_connection()
        cursor = conn.cursor()

        # 🔎 Check if email exists
        cursor.execute("SELECT 1 FROM users WHERE email = %s", (data["email"],))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return {"success": False, "error": "Email already exists"}

        # 🔐 Hash password
        hashed_pw = generate_password_hash(data["password"])

        # 🧩 Insert user
        cursor.execute(
            "INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (%s, %s, %s, %s, %s)",
            (data["fullname"], data["email"], data["phone"], hashed_pw, data["role"])
        )
        conn.commit()
        cursor.close()
        conn.close()
        return {"success": True, "message": "User created successfully"}

    @staticmethod
    def delete(user_id):
        try:
            user_id = int(user_id)
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("DELETE FROM users WHERE user_id = %s", (user_id,))
            conn.commit()
            cursor.close()
            conn.close()
            return {"success": True}
        except Exception as e:
            print("Error deleting user:", e)
            return {"success": False, "error": str(e)}
    def add_skill(data):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("INSERT INTO user_skills(user_id, skill_id, level, years_exp) VALUES (%s, %s, %s, %s)")
            conn.commit()
            cursor.close()
            conn.close()
            return {"success": True}
        except Exception as e:
            print("Error deleting user:", e)
            return {"success": False, "error": str(e)}