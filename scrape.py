import re

from urllib.request import urlopen
from bs4 import BeautifulSoup

query = "bread"
url = "https://www.google.com/finance?noIL=1&q=" + query
web_page = urlopen(url)
soup = BeautifulSoup(web_page, 'html.parser')

mytds = soup.findAll("td", { "class" : "symbol" })
names = []
for td in mytds:
    ## 3 or 4 letter symbols
    result = re.search(r'[A-Z][A-Z][A-Z][A-Z]?', td.text)
    if(result != None):
        names.append(result.group())
print(names)
