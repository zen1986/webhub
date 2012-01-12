import json 
import random as r

data=[]

for i in range(5):
	d = [i+1, r.randint(100, 1000)]
	data.append(d) 

f = open('adv.txt', 'w')
f.write(json.dumps(data))
f.close()
