from .mysqlconnector import get_connection

class Application:
    def get_candidate_list(job_id):
        conn = get_connection()
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                SELECT 
                    a.application_id AS id,
                    us.email,
                    us.full_name,
                    us.phone,
                    a.status,
                    a.cv_path,
                    JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'skill_id', sk.skill_id,
                        'name', sk.name
                    )
                ) AS skills
                FROM applications AS a
                JOIN users AS us 
                    ON a.user_id = us.user_id
                LEFT JOIN user_skills AS us_sk 
                    ON us.user_id = us_sk.user_id
                LEFT JOIN skills AS sk 
                    ON us_sk.skill_id = sk.skill_id
                WHERE a.job_id = %s
                GROUP BY 
                    a.application_id, us.user_id, us.email, us.full_name, us.phone, a.status, a.cv_path
            """, (job_id,))
            result = cursor.fetchall()
            return {"success": True, "result": result}
        finally:
            try:
                cursor.close()
            except:
                pass
            try:
                conn.close()
            except:
                pass

    def get_application_list(user_id):
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
                SELECT a.application_id, jb.job_id, jb.title, jb.description, jb.location, cp.name
                FROM applications as a
                JOIN jobs as jb on a.job_id = jb.job_id
                JOIN companies as cp on jb.company_id = cp.company_id
                WHERE a.user_id = %s
        """, (user_id, ))
        result = cursor.fetchall()
        return {"success": True, "result": result}
    def action_application(action: str, application_id: int):
        conn = get_connection()
        cursor = conn.cursor()

        status_map = {
            "accept": "interview",
            "reject": "rejected",
        }

        action_key = action.lower()
        status = status_map.get(action_key)

        cursor.execute(
            """
            UPDATE applications
            SET status = %s
            WHERE application_id = %s
            """,
            (status, application_id),
        )
        conn.commit()
        return {"success": True}
    def apply_job(job_id: int, user_id: int, cv_path: str = None):
        """
        Create an application record and store the CV path.
        Assumes `applications` table has a column named `cv_path` (varchar/text).
        If your schema uses a different column name (e.g. `cover_letter`), change the column below.
        """
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO applications (job_id, user_id, cv_path)
                    VALUES (%s, %s, %s)
                """, (job_id, user_id, cv_path))
                created = (cursor.rowcount == 1)
                created_id = cursor.lastrowid if created else None

            conn.commit()
            return True, created_id
        except Exception as e:
            try:
                conn.rollback()
            except:
                pass
            return False, False
        finally:
            try:
                conn.close()
            except:
                pass
    def delete(application_id):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("DELETE FROM applications WHERE application_id = %s", (application_id, ));
            conn.commit()
            cursor.close()
            conn.close()
            return {"success": True}
        except Exception as e:
            return {"success": False, "error": e}

