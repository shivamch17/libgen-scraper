const express = require('express');
const {scrapeData}= require('./scrapeData'); 
const cors = require('cors');
const app = express();
const port = 3000; 
app.use(cors());

app.get('/cron', async(req, res) => {
    console.log('cron boi');
    res.status(200).send('Thanks buddy for keeping me alive...');
});

app.get('/scrape', async (req, res) => {
    let { limit, title } = req.query;
    if(!title) res.send("title is required");
    if(!limit) limit = 5;
    try {
        const scrapedData = await scrapeData(title, parseInt(limit));
        console.log('successfull scrape');
        res.status(200).json(scrapedData);
    } catch (error) {
        console.log('un-successfull scrape');
        console.log(error);
        res.status(500).json({ error: 'An error occurred while scraping data.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
