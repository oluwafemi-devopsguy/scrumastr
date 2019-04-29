from django.conf import settings

def my_context(context):
	return {'FRONTEND_URL':settings.FRONTEND}
	
