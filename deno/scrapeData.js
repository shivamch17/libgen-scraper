import axios from 'npm:axios';
import * as cheerio from 'npm:cheerio';
import { scrapeLinksLol, scrapeLinksPm } from './scraper1.js';

async function scrapePage(url) {
        const response = await axios.get(url);
        if (response.status === 200) {
            return cheerio.load(response.data);
        } else {
            throw new Error('Failed to retrieve the web page.');
        }
}

async function scrapeLibgenIs(title,limit){
    const url = `https://libgen.is/search.php?req=${encodeURIComponent(title)}&open=0&res=25&view=simple&phrase=1&column=def`;
    const $ = await scrapePage(url);
    const targetTable = $('body > table.c');
    if(targetTable<1) throw new Error('table not found');
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
            DownloadLinks: [],
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

    let ctr=(results.length<=limit)?results.length:limit+1;
    for (let i = 1; i < ctr; i++) {
        const data = await scrapeLinksLol(results[i].Mirror1);
        results[i]['Image'] = data.image;
        results[i]['DownloadLinks'] = data.links;
    }

    return results.slice(1, limit + 1);
}

async function scrapeLibgenLi(title,limit){
    const url=`http://libgen.li/index.php?req=${encodeURIComponent(title)}&columns%5B%5D=t&columns%5B%5D=a&columns%5B%5D=s&columns%5B%5D=y&columns%5B%5D=p&columns%5B%5D=i&objects%5B%5D=f&objects%5B%5D=e&objects%5B%5D=s&objects%5B%5D=a&objects%5B%5D=p&objects%5B%5D=w&topics%5B%5D=l&topics%5B%5D=c&topics%5B%5D=f&topics%5B%5D=a&topics%5B%5D=m&topics%5B%5D=r&topics%5B%5D=s&res=25&filesuns=all`;
    const $ = await scrapePage(url);
    const table= $('#tablelibgen');
    const tbody= table.find('tbody');
    const results = [];

    tbody.find('tr').each((index, row) => {
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
            DownloadLinks: [],
            Image: '',
        };

        tdElements.each((idx, td) => {
            switch (idx) {
                case 0:
                    rowData.Title = $(td).text();
                    break;
                case 1:
                    rowData.Author = $(td).text();
                    break;
                case 2:
                    rowData.Publisher = $(td).text();
                    break;
                case 3:
                    rowData.Year = $(td).text();
                    break;
                case 4:
                    rowData.Language = $(td).text();
                    break;
                case 5:
                    rowData.Pages = $(td).text();
                    break;
                case 6:
                    rowData.Size = $(td).text();
                    break;
                case 7:
                    rowData.Extension = $(td).text();
                    break;
            }
        });

        anchorElements.each((idx, anchor) => {
            const href = $(anchor).attr('href');
            if (href!==undefined && href.includes('libgen.pm')) {
                rowData.Mirror1 = href;
            }
            else if (href!==undefined && href.includes('file.php')) {
                rowData.Link = 'http://libgen.li'+href;
            }
        });

        results.push(rowData);
    });

    let ctr=(results.length<=limit)?results.length:limit;
    for (let i = 0; i < ctr; i++) {
            const data = await scrapeLinksPm(results[i].Mirror1);
            results[i]['Image'] = data.image;
            results[i]['DownloadLinks'] = data.links;
    }

    return results.slice(0, limit);
}

export async function scrapeData(title, limit) {
        try {
            const dataFromIs = await scrapeLibgenIs(title, limit);
            return dataFromIs;
        } catch (error) {
            console.error(error);
            const dataFromLi = await scrapeLibgenLi(title, limit);
            return dataFromLi;
        }
}
