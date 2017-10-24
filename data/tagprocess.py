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
	tagset = set()
	tagmap = dict()
	nodelist = list();
	for row in csvfile:
		s = row['tags'].split(",")
		for i in range(len(s)):
			key = s[i]

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
				if j==i:
					continue
				child = s[j]
				if child in tempmap:
					tempmap[child] += 1
				else:
					tempmap[child] = 1	
				
	#print(tagmap['policy'])
	print(len(nodelist))
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
	
	#for i in range(len(linklist)):
	#	print(linklist[i])
	network = (
		{
			"nodes": nodelist,
			"links": linklist
		}
	)
	with open('network.json', 'w') as outfile:
		json.dump(network, outfile)

	#nodelist = list();	
	
	

	

