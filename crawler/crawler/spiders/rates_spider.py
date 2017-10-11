import scrapy
import json

'''
class QuotesSpider(scrapy.Spider):
    name = "quotes"

    def start_requests(self):
        urls = [
            'http://quotes.toscrape.com/page/1/',
            'http://quotes.toscrape.com/page/2/',
        ]
        for url in urls:
            yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        page = response.url.split("/")[-2]
        filename = 'quotes-%s.html' % page
        with open(filename, 'wb') as f:
            f.write(response.body)
        self.log('Saved file %s' % filename)
'''
class RatesSpider(scrapy.Spider):
    # read json file 
    with open("../TED_Talks.json") as json_f:
        # get url array
        arr = []
        data = json.load(json_f)
        for i in data:
            arr.append(i["URL"])
        #print (arr[0:10])

    # 
    name = "rates"
    start_urls = [arr[0]]
    print(arr[0])
    def parse(self, response):
        '''
        page = response.url.split("/")[-1]
        filename = 'talk-%s.html' %page
        with open(filename, 'wb') as f:
            f.write(response.body)
        '''
        re = str(response.body)
        start = re.index('"ratings":') + 10
        end = re[start:].index("]")+1

        rates = json.loads(re[start:start+end])
        print(rates)
            