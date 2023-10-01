const express = require('express');
const {scrapeData}= require('./scrapeData'); 

const app = express();
const port = 3000; 
app.get('/scrape', async (req, res) => {
    let { url, limit, title } = req.query;
    if(!limit) limit = 5;
    if(!url && title) url = `https://libgen.is/search.php?req=${encodeURIComponent(title)}&open=3&res=100&view=simple&phrase=1&column=def`;
    try {
        const scrapedData = await scrapeData(url, parseInt(limit));
        res.json(scrapedData);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while scraping data.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
