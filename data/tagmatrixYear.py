"""Preprocess tags per video and create their node description"""
"""save con-occurence between tags each year"""
import csv
import pandas as pd
import json

if __name__ == '__main__':
	print("Load group file...")
	json_data = json.load(open('data_clusters_v6.json'))
	cluster = dict()
	g_index = 0
	for key, g in json_data.items():
		cluster[g_index] = g
		g_index+=1
		
    print(g_index)
	print("Load json file...")
	videos = json.load(open('TED_Talks.json'))

	print("check all tags...")
	removeTag = ["science","technology","global issues"]

	yearmap = dict()
	for i in range(2001,2017)
		yearmap[i] = dict()

	MAX = 0	
	tagset = set()
	tagmap = dict()
	nodelist = list();
	for row in videos:
		year = int(row['date'].split("-")[0])
		thisymap = yearmap[year]

		s = row['tags'].split(",")
		for i in range(len(s)):
			key = s[i].strip().lower()

			if key.startswith('ted') or key=="" or key in removeTag:
				continue

			if key not in tagset:
				for g, glist in cluster.items():
					if key in glist:
						nodelist.append({'tag':key, 'group':g})
						break
						
			tagset.add(key)

			if key in tagmap:
				tempmap = tagmap[key]
				tempYmap = yearmap[year][key]
			else:
				tempmap = dict()
				tagmap[key] = tempmap
				for i in range(2001,2017)
					yearmap[i][key] = dict()
				tempYmap = yearmap[year][key]	


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

				if child in tempYmap:
					tempYmap[child] += 1
				else:
					tempYmap[child] = 1		

	print("MAX",MAX);	
	print(len(nodelist))
	
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
	with open('network_per_year.json', 'w') as outfile:
		json.dump(network, outfile)

	#nodelist = list();
		
	
	

	

