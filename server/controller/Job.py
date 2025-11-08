from .mysqlconnector import get_connection
from datetime import datetime

class Job:
    @staticmethod
    def get_all(location=None):
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        sql = """
            SELECT 
                j.job_id,
                j.company_id,
                j.title,
                j.description,
                j.location,
                j.salary_min,
                j.salary_max,
                j.employment_type,
                j.posted_at,
                j.expires_at
            FROM jobs j
        """
        params = ()
        if location:
            sql += " WHERE j.location=%s"
            params = (location,)
        sql += " ORDER BY j.posted_at DESC"
        cursor.execute(sql, params)
        result = cursor.fetchall()
        cursor.close()
        conn.close()
        return result
    
    def get_by_company(company_id):
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        sql = """
            SELECT 
                j.job_id,
                j.company_id,
                j.title,
                j.description,
                j.location,
                j.salary_min,
                j.salary_max,
                j.employment_type,
                j.posted_at,
                j.expires_at
            FROM jobs j
            WHERE company_id = %s
        """
        params = (company_id, )
        sql += " ORDER BY j.posted_at DESC"
        cursor.execute(sql, params)
        result = cursor.fetchall()
        cursor.close()
        conn.close()
        return result
    @staticmethod
    def get_by_id(job_id):
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                j.job_id,
                j.company_id,
                j.title,
                j.description,
                j.location,
                j.salary_min,
                j.salary_max,
                j.employment_type,
                j.posted_at,
                j.expires_at
            FROM jobs j
            WHERE j.job_id=%s
        """, (job_id,))
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return result

    @staticmethod
    def add(company_id, data):
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO jobs 
                (company_id, title, description, location, salary_min, salary_max, employment_type, expires_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s) 
        """, (
            company_id,
            data["title"],
            data["description"],
            data["location"],
            data["salary_min"],
            data["salary_max"],
            data["employment"],
            data["expires_at"]
        ))
        conn.commit()

        job_id = cursor.lastrowid
        for skill in data["skills"]:
            print(skill)
            skill_id, level = skill["skill_id"], skill["level"]
            cursor.execute("""INSERT INTO job_skills
                           (job_id, skill_id, required_level)
                           VALUES (%s, %s, %s)""", (job_id,skill_id, level))
            conn.commit()
        cursor.close()
        conn.close()
        return {"success: True"}

    @staticmethod
    def update(job_id, company_id, title, description, requirements=None, location=None,
               salary=None, employment_type=None, deadline=None):
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE Job
            SET company_id=%s,
                title=%s,
                description=%s,
                requirements=%s,
                location=%s,
                salary=%s,
                employment_type=%s,
                deadline=%s
            WHERE job_id=%s
        """, (
            company_id,
            title,
            description,
            requirements,
            location,
            salary,
            employment_type,
            deadline,
            job_id
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return True

    @staticmethod
    def delete(job_id):
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM jobs WHERE job_id=%s", (job_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return True
    def apply_job(job_id: int, user_id: int):
        """
        Trả về (ok: bool, created: bool)
        - created=True khi INSERT mới
        - created=False khi đã tồn tại (đụng UNIQUE KEY)
        """
        conn = get_connection()
        try:
            print("Trying")
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO applications (job_id, user_id)
                    VALUES (%s, %s)
                """, (job_id, user_id))
                created = (cursor.rowcount == 1)
            conn.commit()
            cursor.close()
            conn.close()
            return True, created
        except Exception:
            conn.rollback()
            return False, False
        finally:
            conn.close()
