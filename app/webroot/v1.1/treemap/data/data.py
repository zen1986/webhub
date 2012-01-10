import time
import random as r
import datetime
import time
import math
import json

def save(path):
	f = open(path, 'w')
	f.write(json.dumps(data))
	f.close()

startHour = time.mktime(datetime.datetime(2011,11,28,11,0,0).timetuple())/3600/24


data = {}
data['name'] = 'all'
data['activities'] = ['A', 'B', 'C']
data['children']=[]
for i in range(31):
	curHour = startHour + i;
	node = {}
	node['name'] = i
	node['children']=[]
	k=0
	for a in data['activities']:
		if a=='A':
			act = r.random()*1000
		elif a=='B':
			act = r.random()*250
		elif a=='C':
			act = r.random()*50

		node['children'].append({'name':a, 'number': act})

	data['children'].append(node)

save('treemap.txt')
