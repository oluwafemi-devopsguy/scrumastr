import MySQLdb


db = MySQLdb.connect("127.0.0.1", "username", "password", "database")

print "Connected to database successfully";