import psycopg2
from psycopg2 import sql

# DB Config
DB_NAME = "vedax_db"
DB_USER = "vedax_user"
DB_PASS = "vedax123"
DB_HOST = "localhost"
DB_PORT = "5433"

try:
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        host=DB_HOST,
        port=DB_PORT
    )
    conn.autocommit = True
    cur = conn.cursor()

    # Drop all tables in public schema
    cur.execute("DROP SCHEMA public CASCADE;")
    cur.execute("CREATE SCHEMA public;")
    
    print("Successfully dropped all tables and recreated public schema.")
    
    cur.close()
    conn.close()

except Exception as e:
    print(f"Error: {e}")
