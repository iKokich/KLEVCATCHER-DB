import psycopg2

conn = psycopg2.connect("postgresql://postgres:523678@localhost:5432/OPEN_CTI")
cur = conn.cursor()
cur.execute("ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar TEXT")
conn.commit()
print("Migration completed: avatar column added to user_profiles")
conn.close()
