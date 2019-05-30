import MySQLdb

db = MySQLdb.connect("ljdb", "root", "8iu7*IU&", "chatscrum")

cursor = db.cursor()

if db.is_connected():
    print ("connected to database.")

db.close()    
