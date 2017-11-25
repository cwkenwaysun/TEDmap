"""Preprocess tags per video and create their node description"""

import csv
import pandas as pd
import json

if __name__ == '__main__':
	print("Load json file...")
	json_data = json.load(open('data_clusters_v5.json'))
	cluster = dict()
	g_index = 0
	for key, g in json_data.items():
		cluster[g_index] = g
		g_index+=1

	tag2g = dict()
	for key, tags in cluster.items():
		#print(tags)
		for t in tags:
			tag2g[t] = key

	print("Load csv file...")
	csvfile = pd.read_csv('TEDTalks_byID.csv').to_dict("records")

	print("check all tags...")
	removeTag = ["science","technology","global issues"]

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
				for g, glist in cluster.items():
					if key in glist:
						nodelist.append({'tag':key, 'group':g})
						break
						
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
	
	#print(tagmapJSON)
	#
	
	#print(nodelist)
	#usedmap = dict()
	tagfreqlist = list();
	maxf = 0
	for key, con_dict in tagmap.items():	

		freq = 0
		for child, value in con_dict.items():
			freq+=value

		maxf = max(maxf,freq)

		tagfreqlist.append(
				{
					"tag": key,
					"frequency": freq,
					"groupid": tag2g[key]
				}
		)	

	tagfreqlist.sort(key = lambda x: (x["groupid"],x["tag"]))
	print(maxf)
	#with open('TEDtag_frequency.json', 'w') as outfile:
	#	json.dump(tagfreqlist, outfile)

	#nodelist = list();
		
	
	

	

