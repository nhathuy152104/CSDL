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
    def get_by_filter(data):
        conn = get_connection()
        cursor = conn.cursor()

        region = data.get("region")
        min_salary = data.get("min_salary")
        max_salary = data.get("max_salary")
        skill_ids = data.get("skills_id", [])

        # Tạo placeholder cho IN clause
        skill_placeholders = ','.join(['%s'] * len(skill_ids))
        
        query = f"""
            SELECT DISTINCT jb.*
            FROM jobs AS jb
            JOIN job_skills AS js ON jb.job_id = js.job_id
            JOIN region AS rg ON jb.region_id = rg.region_id
            WHERE js.skill_id IN ({skill_placeholders})
        """

        params = skill_ids

        if min_salary is not None:
            query += " AND jb.salary_min >= %s"
            params.append(min_salary)

        if max_salary is not None:
            query += " AND jb.salary_max <= %s"
            params.append(max_salary)

        if region:
            query += " AND rg.region_id = %s"
            params.append(region)

        cursor.execute(query, params)
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
    def get_by_skill(skill_ids):
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        placeholder = ",".join(["%s"] * len(skill_ids))  # tạo "%s,%s,%s"
        
        query = f"""
            SELECT jb.*
            FROM jobs AS jb
            JOIN job_skills AS js ON jb.job_id = js.job_id
            WHERE js.skill_id IN ({placeholder})
            GROUP BY jb.job_id
            HAVING COUNT(DISTINCT js.skill_id) = %s;
        """

        params = skill_ids + [len(skill_ids)]

        cursor.execute(query, params)
        result = cursor.fetchall()

        return result   

    @staticmethod
    def add(company_id, data):
        print(data)
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO jobs 
                (company_id, title, description, location, salary_min, salary_max, employment_type, expires_at, region_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) 
        """, (
            company_id,
            data["title"],
            data["description"],
            data["location"],
            data["salary_min"],
            data["salary_max"],
            data["employment"],
            data["expires_at"],
            data["region_id"]
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
