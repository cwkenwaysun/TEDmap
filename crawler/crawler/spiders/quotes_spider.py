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
class QuotesSpider(scrapy.Spider):
    # read json file 
    with open("../TED_Talks.json") as json_f:
        # get url array
        arr = []
        data = json.load(json_f)
        for i in data:
            arr.append(i["URL"])
        #print (arr[0:10])

    # 
    name = "quotes"
    start_urls = [arr[0]]
    def parse(self, response):
        '''
        page = response.url.split("/")[-1]
        filename = 'talk-%s.html' %page
        with open(filename, 'wb') as f:
            f.write(response.body)
        '''
        for views in response.css('meta[itemprop=interactionCount]::attr(content)').extract():
            print (views, response.url)
            