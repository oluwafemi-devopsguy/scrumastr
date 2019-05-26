import MySQLdb


db = MySQLdb.connect("localhost", "root", "8iu7*IU&", "chat")

cursor = db.cursor()
sql ="UPDATE scrum_scrumgoal SET status=0 WHERE status=1 AND moveable = 1 AND visible = 1 AND project_id = 2 "

try:
	cursor.execute(sql)
	db.commit()
	print("inside try")
except Exception as e:
	db.rollback()
	print("inside except") 
	raise e

db.close()