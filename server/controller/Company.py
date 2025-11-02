from .mysqlconnector import get_connection

class Company:
    @staticmethod
    def add(name: str, address: str = None, phone: str = None, **kwargs):
        """Add a new company to the database."""
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO companies (name, address, phone) VALUES (%s, %s, %s)",
                (name, address, phone)
            )
            conn.commit()
            return {"success": True, "message": "Company added successfully"}
        except Exception as e:
            conn.rollback()
            return {"success": False, "error": str(e)}
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def update(company_id: int, **data):
        """Update a company record."""
        if not data:
            return {"success": False, "error": "No data provided for update"}
        
        conn = get_connection()
        cursor = conn.cursor()
        try:
            # Build dynamic query
            fields = ", ".join(f"{key} = %s" for key in data.keys())
            values = list(data.values())
            values.append(company_id)
            
            cursor.execute(
                f"UPDATE companies SET {fields} WHERE company_id = %s",
                tuple(values)
            )
            conn.commit()
            return {"success": True, "message": "Company updated successfully"}
        except Exception as e:
            conn.rollback()
            return {"success": False, "error": str(e)}
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def get_by_id(company_id: int):
        """Fetch a company linked to a specific user."""
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute(
                "SELECT * from companies WHERE company_id = %s", (company_id, )
            )
            return cursor.fetchone()
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def get_all():
        """Return all companies."""
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM companies")
            return cursor.fetchall()
        finally:
            cursor.close()
            conn.close()
