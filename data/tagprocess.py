"""Preprocess tags per video and create their node description"""

import csv
import pandas as pd
import json

if __name__ == '__main__':
	print("Load csv file...")
	
	csvfile = pd.read_csv('TEDTalks_byID.csv').to_dict("records")
	#with open('TED_Talks_by_ID.csv','rU') as csvfile:
	#	readCSV = pandas.reader(csvfile, delimiter=',')
	#	
	print("check all tags...")
	removeTag = ["science","technology"]

	MAX = 0	
	tagset = set()
	tagmap = dict()
	nodelist = list();
	for row in csvfile:
		s = row['tags'].split(",")
		for i in range(len(s)):
			key = s[i].strip().lower()

			if key.startswith('ted') or key=="" or key in removeTag:
				continue

			if key not in tagset:
				nodelist.append({'tag':key, 'group':1})
			tagset.add(key)

			if key in tagmap:
				tempmap = tagmap[key]
			else:
				tempmap = dict()
				tagmap[key] = tempmap
			#print (tempmap)

			for j in range(len(s)):
				child = s[j].strip().lower()

				if j==i or child.startswith('ted') or child=="" or child in removeTag:
					continue

				if child in tempmap:
					tempmap[child] += 1
					if tempmap[child] > MAX:
						MAX = tempmap[child]
				else:
					tempmap[child] = 1	
	
	#tagmapJSON = json.dumps(tagmap['cars'],indent = 4,separators=(',', ': '))			
	with open('data_WO_TEDtag_v2.json', 'w') as outfile:
		json.dump(tagmap, outfile)

	print("MAX",MAX);	
	print(len(nodelist))
	
	#print(tagmapJSON)
	#
	
	#print(nodelist)
	usedmap = dict()
	linklist = list();

	for key, con_dict in tagmap.items():
		if key in usedmap:
			usedset = usedmap[key]
		else:
			usedset = set()
			usedmap[key] = usedset	

		for child, value in con_dict.items():
			if child in usedset:
				continue
			if child in usedmap and key in usedmap[child]:
				continue

			usedset.add(child)
			linklist.append(
				{
					"source": key,
					"target": child,
					"value": value
				}
			)

	linklist.sort(key = lambda x: x["value"])

	print(len(linklist))

	network = (
		{
			"nodes": nodelist,
			"links": linklist
		}
	)
	with open('network_WO_TEDtag_v2.json', 'w') as outfile:
		json.dump(network, outfile)

	#nodelist = list();
		
	
	

	

