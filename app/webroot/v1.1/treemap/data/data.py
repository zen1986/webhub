import random as r
import math
import json

def save(path):
	f = open(path, 'w')
	f.write(json.dumps(root.toObj()))
	f.close()

class Node: 
	def __init__(self, name, val, unique):
		self.name = name
		self.val = val
		self.unique = unique
		self.children = []

	def addChild(self, n):
		self.children.append(n)

	def getSum(self):
		# init child sum
		self.sum = 0
		# leave return value
		if len(self.children) == 0:
			return self.val
		# node return sum
		else:
			for c in self.children:
				self.sum += c.getSum()
		return self.sum

	def noChildren(self):
		return len(self.children)==0

	def toObj(self):
		if self.noChildren():
			return {'name':self.name, 'value':self.val, 'unique':self.unique}
		else:
			return {'name':self.name, 'value':self.val, 'unique':self.unique, 'children':map(lambda c: c.toObj(), self.children), 'sum':self.getSum()}

	def addLevel(self, arr):
		for i in range(len(arr)):
			self.addChild(Node(arr[i], int(r.random()**2 * 1000), r.randint(10, 100)))

comps = ['seven-7', 'cheer', 'challenger', 'epicenter', 'starbucks', 'ssi mobiles']
stores = ['south', 'north', 'east', 'west']
acts = ['Grab and Win', 'Snap and Win', 'Scan and Win']

# root
root = Node('root', 0, 0)


root.addLevel(comps)
map(lambda n: n.addLevel(stores), root.children)
map(lambda n: map(lambda c: c.addLevel(acts), n.children), root.children)

save('treemap.txt')
