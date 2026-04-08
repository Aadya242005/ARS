import sqlite3
import json


conn = sqlite3.connect('ars-backend/docs.db')
c = conn.cursor()
c.execute("SELECT COUNT(*) FROM chunks")
count = c.fetchone()[0]
print(f"Total chunks in DB: {count}")

c.execute("SELECT doc_name, chunk_text FROM chunks LIMIT 3")
rows = c.fetchall()
for row in rows:
    print(f"Doc: {row[0]}, Text: {row[1][:100]}...")

conn.close()