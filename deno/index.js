import express from 'npm:express';
import { scrapeData } from './scrapeData.js';
import { Redis } from "https://deno.land/x/upstash_redis@v1.14.0/mod.ts";
import "jsr:@std/dotenv/load";
import cors from 'npm:cors';
import { scrapeDataFast, getDownloadLink } from './scrapeDataFast.js';
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
            const redis = new Redis({
                url: Deno.env.get("UPSTASH_REDIS_REST_URL"),
                token: Deno.env.get("UPSTASH_REDIS_REST_TOKEN"),
            })
            let data = await redis.get(title);
            if (data == null || data == undefined) {
                const scrapedData = await scrapeData(title, parseInt(limit));
                console.log('successfull scrape');
                // Cache the result of the scrape, not the function
                await redis.set(title, scrapedData); // Converting to string if it's an object
                await redis.expire(title, 30);
                res.status(200).json(scrapedData);
            } else {
                console.log('taken from cache');
                res.status(200).json(data); // Parsing back to object if cached as string
            }
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
