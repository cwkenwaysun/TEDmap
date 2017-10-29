import scrapy
import json

data = None

class TedSpider(scrapy.Spider):
    # read json file 
    urls = []
    with open("TED_Talks.json") as json_f:
        # get url array
        data = json.load(json_f)
        for i, url in enumerate(data):
            if (i >=2500 and i < 2550):
                urls.append(url["newURL"])

    name = "ted"
    start_urls = urls
    print("@@@@" + str(len(urls)))
    def parse(self, response):
        '''
        page = response.url.split("/")[-1]
        filename = 'talk-%s.html' %page
        with open(filename, 'wb') as f:
            f.write(response.body)
        '''
        # rate
        re = str(response.body)
        start = re.index('"ratings":') + 10
        end = re[start:].index("]")+1
        rates = json.loads(re[start:start+end])
        # views
        for views in response.css('meta[itemprop=interactionCount]::attr(content)').extract():
            #print (views, response.url)
            with open("TED_Talks.json") as json_f:
                data = json.load(json_f) 
                for i in data:
                    if (i["newURL"] == response.url):
                        i["views"] = views
                        i["rates"] = rates
                        #print(i)
                        return i
            '''with open("result.json", "w") as jsonFile:
                json.dump(data, jsonFile)'''

            