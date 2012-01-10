import json 
import random as r

data=[]

for i in range(500):
	d = [i+1, r.random()*1000]
	data.append(d) 

f = open('frequency.txt', 'w')
f.write(json.dumps(data))
f.close()
