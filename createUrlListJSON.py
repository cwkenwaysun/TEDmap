import pandas
import json
import requests
import time

csv = pandas.read_csv("./TED_Talks.csv").to_dict("record")
for i in csv:
    #print(i["URL"])
    response = requests.head(i["URL"], allow_redirects=True)
    while response.status_code != 200:
        time.sleep(1)
        response = requests.head(i["URL"], allow_redirects=True) 
    i["newURL"] = response.url
    print("get: " + i["newURL"] + " " + str(response.status_code))
with open('TED_Talks.json', 'w') as outfile:
    json.dump(csv, outfile)
