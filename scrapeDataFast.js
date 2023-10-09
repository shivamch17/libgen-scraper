const axios = require('axios');
const cheerio = require('cheerio');

const MAX_RETRIES = 5;

async function fetchDataWithRetries(url, maxRetries) {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            const response = await axios.get(url);
            return response;
        } catch (error) {
            console.error(`Error occurred: ${error.message}`);
            retries++;
            console.log(`Retrying... Attempt ${retries} of ${maxRetries}`);
        }
    }
    throw new Error(`Failed to fetch data after ${maxRetries} attempts.`);
}

async function getDownloadLink(url){
    const response = await fetchDataWithRetries(url, MAX_RETRIES);
    if (response.status === 200) {
        const $ = cheerio.load(response.data);
        const links = [];

        $('a').each((index, element) => {
            const href = $(element).attr('href');
            if (href && !href.startsWith('https://www')) {
          links.push(href);
            }
        });
        return links;
    } else {
        throw new Error('Failed to retrieve the web page.');
    }
}

const fetchSimpleData = async (title, limit) => {
    const url1 = `https://libgen.is/search.php?req=${encodeURIComponent(title)}&lg_topic=libgen&open=0&res=50&view=simple&phrase=1&column=def`;
    try {
        const response = await fetchDataWithRetries(url1, MAX_RETRIES);
        const $ = cheerio.load(response.data);
        const targetTable = $('body > table.c');
        if (targetTable < 1) throw new Error('table not found');
        const results = [];

        targetTable.find('tr').each((index, row) => {
            const tdElements = $(row).find('td');
            const anchorElements = $(row).find('a');

            const rowData = {
                ID: '',
                Author: '',
                Title: '',
                Link: '',
                Publisher: '',
                Year: '',
                Pages: '',
                Language: '',
                Size: '',
                Extension: '',
                Mirror1: '',
                Mirror2: '',
                Image: '',
            };

            tdElements.each((idx, td) => {
                switch (idx) {
                    case 0:
                        rowData.ID = $(td).text();
                        break;
                    case 1:
                        rowData.Author = $(td).text();
                        break;
                    case 2:
                        rowData.Title = $(td).text();
                        break;
                    case 3:
                        rowData.Publisher = $(td).text();
                        break;
                    case 4:
                        rowData.Year = $(td).text();
                        break;
                    case 5:
                        rowData.Pages = $(td).text();
                        break;
                    case 6:
                        rowData.Language = $(td).text();
                        break;
                    case 7:
                        rowData.Size = $(td).text();
                        break;
                    case 8:
                        rowData.Extension = $(td).text();
                        break;
                }
            });

            anchorElements.each((idx, anchor) => {
                const href = $(anchor).attr('href');

                if (href.includes('book/index.php')) {
                    rowData.Link = "http://libgen.is/" + href;
                } else if (href.includes('library.lol')) {
                    rowData.Mirror1 = href;
                } else if (href.includes('libgen.li')) {
                    rowData.Mirror2 = href;
                }
            });

            results.push(rowData);
        });

        return results.slice(1, limit + 1);
    } catch (error) {
        console.error('Error fetching or parsing data:', error);
        throw error;
    }
};

const fetchDetailedData = async (title, limit) => {
    const url2 = `https://libgen.is/search.php?req=${encodeURIComponent(title)}&lg_topic=libgen&open=0&res=50&view=detailed&phrase=1&column=def`;
    try {
        const response = await fetchDataWithRetries(url2, MAX_RETRIES);
        const $ = cheerio.load(response.data);
        const imgUrls = [];
        $('img[src*="/covers/"], img[src*="/img/"]').each((index, element) => {
            const imgUrl = $(element).attr('src');
            imgUrls.push("http://libgen.is"+imgUrl);
          });
          return imgUrls;
    } catch (error) {
        console.error('Error fetching or parsing data:', error);
        throw error;
    }
};

async function scrapeDataFast(title, limit) {
    try {
        const [simpleData, detailedData] = await Promise.all([fetchSimpleData(title, limit), fetchDetailedData(title, limit)]);

        const combinedData = simpleData.map((simpleItem, index) => {
            return {
                ...simpleItem,
                Image: detailedData[index] || null
            };
        });

        return combinedData;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

module.exports = { scrapeDataFast, getDownloadLink};