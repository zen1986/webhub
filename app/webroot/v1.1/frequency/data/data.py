import json 
import random as r

data=[]

for i in range(50):
	d = [i, r.random()*1000]
	data.append(d) 

f = open('frequency.txt', 'w')
f.write(json.dumps(data))
f.close()
