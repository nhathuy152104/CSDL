# mysqlconnector.py
import mysql.connector

def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Huy12345678@",  
        database="job_portal"
    )
