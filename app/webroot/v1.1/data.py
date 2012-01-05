import time
import random as r
import datetime
import time
import math
import json

data={}
data['fields']=['time', 'uid', 'cid', 'sid', 'aid', 'type', 'points']
data['raw']=[]
# assume day start at a monday 11am from morning, and 8 subsequent hours are considered
startTime = time.mktime(datetime.datetime(2011,11,28,11,0,0).timetuple())

weekDayProb = [0.3,0.2,0.2,0.4,0.7,0.8,0.8]

def probability(day, rep):
	dayOfWeek = day%7
	posOfDay = day*1.0/totalDay
	return (math.sin(10*math.pi*posOfDay-0.5)*0.3+0.5) * rep * weekDayProb[dayOfWeek]
	
def getType():
	return info['aid'].keys()[r.randint(0, 2)]

totalPerson = 100 
totalDay = 30 

def generateEntries():
	for pid in range(totalPerson):
		startDay = int(startTime)/3600 # in hour
		for day in range(totalDay):
			for sid in info['sid'].keys():
				for cid in info['cid'].keys():
					prob = probability(day, 1) 
					for aid in  info['aid'].keys():
						if prob > r.random():
							hour = r.randint(0,7)
							curTime = startDay+24*day+hour
							entry = [curTime, pid, int(cid), int(sid), int(aid), int(getType()), int(r.random()*1000)] 
							data['raw'].append(entry)

# for the company
info = {
		"cid": {"1": "seven 7"},
		"sid": {"1": "Jurong East Mall", "2":"tampanies", "3":"Clementi"},
		"aid": {"1": "Snap and win", "2":"Scan and drink", "3": "Slip and gain"},
		"type": {"0": "collection", "1": "redemption"}
		}

generateEntries()
data['info'] = info

f = open('company.txt', 'w')
f.write(json.dumps(data))
f.close()


#for the store
info = {
		"cid": {"1": "seven 7"},
		"sid": {"1": "Jurong East Mall"},
		"aid": {"1": "Snap and win", "2":"Scan and drink", "3": "Slip and gain"},
		"type": {"0": "collection", "1": "redemption"}
		}

generateEntries()
data['info'] = info

f = open('store.txt', 'w')
f.write(json.dumps(data))
f.close()

info = {
		"cid": {"1": "seven 7", "2":"epicenter", "3":"amazon"},
		"sid": {"1": "Jurong East Mall", "2":"tampanies", "3":"Clementi", "4":"Jurong West", "5":"Bishan", "6":"Java", "7":"C++", "8":"Chinese", "9":"Japanese", "10":"C#", "11":"Actionscript", "12":"Oracle"},
		"aid": {"1": "Snap and win", "2":"Scan and drink", "3": "Slip and gain"},
		"type": {"0": "collection", "1": "redemption"}
		}

