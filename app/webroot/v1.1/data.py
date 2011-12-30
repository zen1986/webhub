import time
import random as r

now = time.time() # in seconds
now_in_hour = int(now / 3600)

# reputation determine the no. of entries
# level determine the points

companies = [	{'companyId':1, 'name':'7-eleven',	'store':1, 'reputation':.7, 'level':2, 'region':'east'}, 		\
		{'companyId':2, 'name':'challenger', 	'store':1, 'reputation':.5, 'level':5, 'region':'west'}, 		\
		{'companyId':3, 'name':'acer', 		'store':1, 'reputation':.6, 'level':8, 'region':'north'}, 		\
		{'companyId':4, 'name':'starbuck', 	'store':1, 'reputation':.9, 'level':2, 'region':'west'}, 		\
		{'companyId':5, 'name':'iStudio', 	'store':1, 'reputation': 1, 'level':10,'region':'east'}, 		\
		{'companyId':6, 'name':'kopitiam', 	'store':1, 'reputation':.3, 'level':1, 'region':'south'}, 		\
		{'companyId':7, 'name':'yummy', 	'store':1, 'reputation':.3, 'level':1, 'region':'south'}, 		\
		{'companyId':8, 'name':'basil', 	'store':1, 'reputation':.3, 'level':1, 'region':'east'}, 		\
		{'companyId':9, 'name':'thai express', 	'store':1, 'reputation':.3, 'level':1, 'region':'east'}, 		\
		{'companyId':10,'name':'old chang khee','store':1, 'reputation':.3, 'level':1, 'region':'east'},	 	\
		{'companyId':11,'name':'soul garden', 	'store':1, 'reputation':.3, 'level':1, 'region':'east'}, 		\
		{'companyId':12,'name':'cheers', 	'store':1, 'reputation':.3, 'level':1, 'region':'east'}, 		\
		{'companyId':13,'name':'fair price', 	'store':1, 'reputation':.3, 'level':1, 'region':'north'}, 		\
		{'companyId':14,'name':'macdonald', 	'store':1, 'reputation':.3, 'level':1, 'region':'east'}, 		\
		{'companyId':15,'name':'coffee bean', 	'store':1, 'reputation':.3, 'level':1, 'region':'east'}, 		\
		{'companyId':16,'name':'hangten', 	'store':1, 'reputation':.3, 'level':1, 'region':'east'}, 		\
		{'companyId':17,'name':'c & k', 	'store':1, 'reputation':.3, 'level':1, 'region':'north'}, 		\
		{'companyId':18,'name':'c2000', 	'store':1, 'reputation':.3, 'level':1, 'region':'west'}, 		\
		{'companyId':19,'name':'cathay', 	'store':1, 'reputation':.3, 'level':1, 'region':'south'}, 		\
		{'companyId':20,'name':'pool paradise',	'store':1, 'reputation':.3, 'level':1, 'region':'south'},		\
		{'companyId':21,'name':'s-11', 		'store':1, 'reputation':.3, 'level':1, 'region':'west'}]

data = {'fields':['personId', 'storeId', 'companyId', 'time', 'redemption', 'collection']}
data['raw']=[]
data['info']=companies
import datetime
import time
import math
# assume day start at a monday 11am from morning, and 8 subsequent hours are considered
startTime = time.mktime(datetime.datetime(2011,11,28,11,0,0).timetuple())

weekDayProb = [0.3,0.2,0.2,0.4,0.7,0.8,0.8]

def probability(day, rep):
	dayOfWeek = day%7
	posOfDay = day*1.0/totalDay
	return (math.sin(10*math.pi*posOfDay-0.5)*0.3+0.5) * rep * weekDayProb[dayOfWeek]
	
totalPerson = 10
totalDay = 100
	
for person in range(totalPerson):
	startDay = int(startTime)/3600 # in hour
	for day in range(totalDay):
		for company in companies:
			cid = company['companyId']
			prob = probability(day,company['reputation']) 
			for store in range(company['store']):
				if prob > r.random():
					hour = r.randint(0,7)
					curTime = startDay+24*day+hour
					if r.random()>0.3:
						p1=r.random() * company['level'] * 100
						p2=0
					else :
						p1=0
						p2=20
					entry = [person, store, cid, curTime, int(p1), int(p2)]
					data['raw'].append(entry)
				else:
					continue
		# print datetime.datetime.fromtimestamp((startDay+24*day)*3600)
import json

f = open('data.txt', 'w')
f.write(json.dumps(data))
f.close()
