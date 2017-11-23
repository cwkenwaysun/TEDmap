"""Preprocess tags per video and create their node description"""

import csv
import random 
import json

if __name__ == '__main__':
		
	#print("check all tags...")
	center = 10;
	max_d = 200
	def calD(d):
		return 100 -d

	with open('data_WO_TEDtag_v3.json') as jsonfile:
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
		shuffle = True
		while loop < 1000:
			
			if loop != 0 and shuffle==False:
				sameElemt = centers & preSet
				if len(sameElemt)==center :
					print('centers are fixed!')
					break
				else:
					preSet = centers
					#print(preSet)		
			#randomly choose ten numbers
			if shuffle:		
				centers = random.sample(data.keys(), center)
			shuffle = False
			print("before:")
			print(centers)

			#clustering
			cluster = dict()
			cluster_totalD = dict()
			for c in centers:
				#cluster[c] = set()
				cluster[c] = list()
				cluster_totalD[c] = 0
				#cluster[c].add("cars")
			cluster["other"] = list()

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
						temp_d = calD(c_map[tag])
						#temp_d = 10.0/c_map[tag]
						if temp_d < min_d:
							min_d = temp_d
							group = c

				if min_d == float("inf"):
					#min_d = max_d
					#group = random.sample(centers, 1)[0]
					cluster["other"].append(tag)

				else:	
					cluster[group].append(tag)
					cluster_totalD[group] += min_d	
			#end of tag clustering
			
			Error = 0.0
			for c in centers:
				Error+=cluster_totalD[c]

			print(loop,'Error:',Error)
			print(len(cluster["other"]))

			#if len(cluster["unassigned"]) <13 and Error<200:
			#	break	
			"""
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
			"""	
			loop+=1
			
			if len(cluster["other"]) > 25:
				shuffle = True
				continue			
				

			
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
							temp_d = calD(elmt1_map[elmt2])
							#temp_d += 1.0/elmt1_map[elmt2]
						else:
							temp_d += max_d
					if temp_d < newCenterD:
						newCenter = elmt1
						newCenterD = temp_d				

				updateCenter.add(newCenter)

			centers = updateCenter
			print("after:")
			print(centers)
	

		#print(centers)
		

		print("write groups...")
		with open('data_clusters_v5.json', 'w') as outfile:
			json.dump(cluster, outfile)
				

		#break;
		#nodelist = list();

	

	

