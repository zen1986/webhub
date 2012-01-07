import json 

data=[
	[1,123],
	[2,87],
	[3,64],
	[4,64],
	[5,64],
	[6,64],
	[7,64],
	[8,64],
	[9,64],
	[10,12]
]


f = open('frequency.txt', 'w')
f.write(json.dumps(data))
f.close()
