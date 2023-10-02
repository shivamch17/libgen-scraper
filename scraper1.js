
const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeLinksLol(url) {
    const response = await axios.get(url);
    if (response.status === 200) {
        const $ = cheerio.load(response.data);
        const links = [];

        $('a').each((index, element) => {
            const href = $(element).attr('href');
            if (href && !href.startsWith('https://www')) {
          links.push(href);
            }
        });
        const image="http://library.lol"+$('img').attr('src');
        const resultObject = {
            image,
            links: links,
        };
        return resultObject;
    } else {
        throw new Error('Failed to retrieve the web page.');
    }
}

async function scrapeLinksPm(url) {
    const response = await axios.get(url);
    if (response.status === 200) {
        const $ = cheerio.load(response.data);
        const links = [];
        const table=$('#main');
        table.find('a').each((index, element) => {
            const href = $(element).attr('href');
            if (href && href.includes('get.php')) {
          links.push("https://libgen.pm/"+href);
            }
        });
        const image="https://libgen.pm"+table.find('img').attr('src');
        const resultObject = {
            image,
            links: links,
        };
        return resultObject;
    } else {
        throw new Error('Failed to retrieve the web page.');
    }
}

module.exports = {scrapeLinksLol, scrapeLinksPm }; 
