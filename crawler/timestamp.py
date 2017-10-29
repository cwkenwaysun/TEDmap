import json
from datetime import date, datetime

data = None
with open("./TED_Talks.json") as json_f:
    data = json.load(json_f)
    for i in data:
        d = i["date_published"]
        if d.find("/") == 4:
            i["date"] = str(datetime.strptime(d, "%Y/%m/%d").date())
        else:
            i["date"] = str(datetime.strptime(d, "%m/%d/%y").date())
        print(i["id"], i["date"])

with open('./TED_Talks.json', 'w') as outfile:
    json.dump(data, outfile)