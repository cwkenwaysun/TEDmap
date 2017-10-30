"""Preprocess tags per video and create their node description"""

import csv
import random #import shuffle
import json

if __name__ == '__main__':
		
	#print("check all tags...")
	center = 10;

	with open('data_WO_TEDtag.json') as jsonfile:
		print("Load json file...")
		data = json.load(jsonfile)
		print('Total amount of tags:',len(data))

		tagmap = dict()
		i = 0
		for tag in data.keys():
			tagmap[i] = tag;
			i +=1
		
		Range = len(data)
		group = dict()
		preSet = set()
		centers = set()

		loop = 0
		while loop < 300 :
			"""
			if loop != 0:
				sameElemt = centers & preSet
				if len(sameElemt)==10 :
					break
				else:
					preSet = centers
			"""		
			#randomly choose ten numbers
			if loop == 0:		
				centers = random.sample(data.keys(), 10)
			#print(centers)

			#clustering
			cluster = dict()
			cluster_totalD = dict()
			for c in centers:
				cluster[c] = set()
				cluster_totalD[c] = 0
				#cluster[c].add("cars")
			
			for tag in data.keys():
				min_d = float("inf")
				group = ""
				for c in centers:
					if tag == c:
						min_d = 0
						group = c
						break

					temp_d = 0
					c_map = data[c]
					if tag in c_map.keys():
						temp_d = c_map[tag]
						if temp_d < min_d:
							min_d = 1.0/temp_d
							group = c

				if min_d == float("inf"):
					min_d = 100
					group = random.sample(centers, 1)[0]

				#print(group)	
				#assignGroup = cluster[group]	
				cluster[group].add(tag)
				cluster_totalD[group] += min_d	
			#end of tag clustering
			
			Error = 0.0
			for c in centers:
				Error+=cluster_totalD[c]

			#print(loop,'Error:',Error)
			if Error < 6300:

				nodeGroup = dict()
				i = 1
				for c in centers:
					clusterSet = cluster[c]
					for tag in clusterSet:
						nodeGroupc[tag] = i
					i+=1	
				print('write JSON....')	
				with open('group_TEDtag.json', 'w') as outfile:
					json.dump(nodeGroup, outfile)
				break
						
			loop+=1
			#update centers
			preSet = set(centers)
			updateCenter = set()
			for c in centers:
				groupSet = cluster[c]
				newCenterD = float("inf")
				newCenter = ""
				for elmt1 in groupSet:
					temp_d = 0
					elmt1_map = data[elmt1]
					for elmt2 in groupSet:
						if elmt2 == elmt1:
							continue
						if elmt2 in elmt1_map.keys():
							temp_d += 1.0/elmt1_map[elmt2]
						else:
							temp_d += 100
					if temp_d < newCenterD:
						newCenter = elmt1				

				updateCenter.add(newCenter)

			centers = updateCenter	

		print(centers)	

		#break;
		#nodelist = list();

	

	

