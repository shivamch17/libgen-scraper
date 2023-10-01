const axios = require('axios');
const cheerio = require('cheerio');
const scrapeLinks = require('./scraper1');

async function scrapePage(url) {
        const response = await axios.get(url);
        if (response.status === 200) {
            return cheerio.load(response.data);
        } else {
            throw new Error('Failed to retrieve the web page.');
        }
}

async function scrapeData(url, limit) {
        const $ = await scrapePage(url);
        const targetTable = $('body > table.c');
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
                DownloadLink1: '',
                DownloadLink2: '',
                DownloadLink3: '',
                DownloadLink4: '',
                Image: '',
            };

            tdElements.each((idx, td) => {
                // Assign values to the named properties
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

        let ctr=(results.length<=limit)?results.length:limit+1;
        for (let i = 1; i < ctr; i++) {
                const data = await scrapeLinks(results[i].Mirror1);
                results[i]['Image'] = data.image;
                for (let j = 0; j < Math.min(data.links.length, 4); j++) {
                    results[i][`DownloadLink${j + 1}`] = data.links[j];
                }
        }

        return results.slice(1, limit + 1);
}

module.exports = { scrapeData, scrapePage };
