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

totalPerson = 100 
totalDay = 30 
totalEntries = 10000

def randAttr(ids):
	return int(ids[int(rand(len(ids)))])

def probability(day, rep):
	dayOfWeek = day%7
	posOfDay = day*1.0/totalDay
	return (math.sin(10*math.pi*posOfDay-0.5)*0.3+0.5) * rep * weekDayProb[dayOfWeek]
	
def getType():
	return info['aid'].keys()[r.randint(0, 2)]

def rand(divisor=11, magnifier=100000): 
	ret = int(r.random()*magnifier)%divisor
	return ret


def generateEntries(info):
	sids = info['sid'].keys()
	cids = info['cid'].keys()
	aids = info['aid'].keys()
	pids = range(totalPerson)
	days = range(totalDay)

	entryNum=0

	startDay = int(startTime)/3600 # in hour
	while entryNum<totalEntries:
		day=int(rand(totalDay))
		prob = probability(day, 1) 
		chance = rand(1000)/1000.0
		if prob > chance:
			hour = int(r.random()*10000)%8
			curTime = startDay+24*day+hour
			entry = [curTime, int(pids[int(rand(totalPerson))]), randAttr(cids), randAttr(sids),randAttr(aids), int(getType()), int(r.random()*1000)] 
			data['raw'].append(entry)
			entryNum+=1

def save(path):
	f = open(path, 'w')
	f.write(json.dumps(data))
	f.close()

# for the company
info = {
		"cid": {"1": "seven 7"},
		"sid": {"1": "Jurong East Mall", "2":"tampanies", "3":"Clementi"},
		"aid": {"1": "Snap and win", "2":"Scan and drink", "3": "Slip and gain"},
		"type": {"0": "collection", "1": "redemption"}
		}

generateEntries(info)
data['info'] = info
save('company.txt')


data['raw']=[]
#for the store
info = {
		"cid": {"1": "seven 7"},
		"sid": {"1": "Jurong East Mall"},
		"aid": {"1": "Snap and win", "2":"Scan and drink", "3": "Slip and gain"},
		"type": {"0": "collection", "1": "redemption"}
		}

generateEntries(info)
data['info'] = info

save('store.txt')

