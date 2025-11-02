from .mysqlconnector import get_connection

class Favourite:
    @staticmethod
    def add_favourite(user_id, book_id):
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO Favourite (UserID, BookID) VALUES (%s, %s)",
            (user_id, book_id)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return True

    @staticmethod
    def remove_favourite(user_id, book_id):
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM Favourite WHERE UserID=%s AND BookID=%s",
            (user_id, book_id)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return True

    @staticmethod
    def get_favourites(user_id):
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT 
                b.BookID,
                b.Title,
                b.Author,
                b.Year,
                b.CoverUrl,
                b.Quantity,
                b.Rating,
                b.Remaining,
                g.name AS Genre,
                f.UserID
            FROM Favourite f
            JOIN Book b ON f.BookID = b.BookID
            LEFT JOIN Genre g ON b.GenreID = g.id
            WHERE f.UserID = %s
            """,
            (user_id,)
        )
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return data
