import random as r
import math
import json

def save(path):
	f = open(path, 'w')
	f.write(json.dumps(root.toObj()))
	f.close()

class Node: 
	def __init__(self, name, val):
		self.name = name
		self.val = val
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
			return {'name':self.name, 'value':self.val}
		else:
			return {'name':self.name, 'value':self.val, 'children':map(lambda c: c.toObj(), self.children), 'sum':self.getSum()}

	def addLevel(self, arr):
		for i in range(len(arr)):
			self.addChild(Node(arr[i], r.randint(10, 100)))

comps = ['seven-7', 'cheer']
stores = ['s1','s2']
acts = ['A', 'B', 'C']

# root
root = Node('root', 0)


root.addLevel(comps)
map(lambda n: n.addLevel(stores), root.children)
map(lambda n: map(lambda c: c.addLevel(acts), n.children), root.children)

save('treemap.txt')
