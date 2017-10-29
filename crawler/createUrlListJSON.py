import pandas
import json
import requests
import time

j=0
data = None
with open("./TED_Talks.json") as json_f:
    data = json.load(json_f)
    for i in data:
        if j >= 1676 and j <= 1680: #1676-1680
            response = requests.head(i["URL"], allow_redirects=True)
            while response.status_code != 200:
                time.sleep(1)
                response = requests.head(i["URL"], allow_redirects=True) 
            i["newURL"] = response.url
            print(str(i["id"]) +  " get: " + i["newURL"] + " " + str(response.status_code))
        j += 1
with open('./TED_Talks.json', 'w') as outfile:
    json.dump(data, outfile)
