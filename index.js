const express = require('express');
const { scrapeData } = require('./scrapeData');
const cors = require('cors');
const { scrapeDataFast, getDownloadLink } = require('./scrapeDataFast');
const app = express();
const port = 3001;
app.use(cors());

app.get('/', async (req, res) => {
    res.status(200).send('Server running 🚀');
});

app.get('/cron', async (req, res) => {
    console.log('cron boi');
    res.status(200).send('Thanks buddy for keeping me alive...');
});


app.get('/scrape', async (req, res) => {
    let { limit, title } = req.query;
    if (!title) res.send("title is required");
    else if (limit && limit > 50) res.send("max limit is 50");
    else {
        if (!limit) limit = 5;
        try {
            const scrapedData = await scrapeData(title, parseInt(limit));
            console.log('successfull scrape');
            res.status(200).json(scrapedData);
        } catch (error) {
            console.log('un-successfull scrape');
            console.log(error);
            res.status(500).json({ error: 'An error occurred while scraping data.' });
        }
    }
});

app.get('/scrape-fast', async (req, res) => {
    let { limit, title } = req.query;
    if (!title) res.send("title is required");
    else if (limit && limit > 50) res.send("max limit is 50");
    else {
        if (!limit) limit = 5;
        try {
            const scrapedData = await scrapeDataFast(title, parseInt(limit));
            console.log('successfull scrape');
            res.status(200).json(scrapedData);
        } catch (error) {
            console.log('un-successfull scrape');
            console.log(error);
            res.status(500).json({ error: 'An error occurred while scraping data.' });
        }
    }
});

app.get('/get-link', async (req, res) => {
    let { url } = req.query;
    if (!url) res.send("url is required");
    else {
        try {
            const DownloadLinks = await getDownloadLink(url);
            console.log('successfull');
            res.status(200).json(DownloadLinks);
        } catch (error) {
            console.log('un-successfull');
            console.log(error);
            res.status(500).json({ error: 'An error occurred while scraping data.' });
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
