import express from "express";
import axios from "axios";
export default class PDFApiService {
    public expressApp:express.Application;

    constructor() {
    }

    mountAPI() {
        let router = express.Router();

        let apiVersion = "1.1.0";//increment this each time you change the api and break the backward compatibility (semver)

        router.get('/api/version', (req, res) => {
            res.json(apiVersion);
        });

        router.get('/proxy/*', async (req, res) => {
            try {
                // The URL comes after '/proxy/', captured by '*'
                let url = req.params[0];

                // Validate URL (add your URL validation logic here)

                let response = await axios.get(url, { responseType: 'arraybuffer', maxContentLength: 10 * 1024 * 1024 });

                res.set('Content-Type', 'application/pdf');
                res.send(response.data);
            } catch (e) {
                console.error(e);
                res.status(500).json({ error: 'Error fetching the PDF file', details: e.message });
            }
        });

        router.get('/iframable/:url', async (req, res) => {
            try {
                let url = decodeURIComponent(req.params.url);
                // Validate URL (add your URL validation logic here)

                const response = await axios.get(url);
                let headers = response.headers;

                // Normalize header keys
                headers = Object.fromEntries(
                    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])
                );

                let xframeOptions = headers['x-frame-options'];

                if (!xframeOptions) {
                    return res.json(true);
                }

                // Handle multiple headers and check for values
                let options = Array.isArray(xframeOptions) ? xframeOptions : [xframeOptions];
                if (options.some(option => (""+option).toLowerCase() === 'deny' || (""+option).toLowerCase() === 'sameorigin')) {
                    return res.json(false);
                }

                res.json(true);
            } catch (e) {
                console.error(e);
                res.status(500).json({ error: e.message });
            }
        });


        this.expressApp.use('/', router);
    }

    start(expressApp: express.Application): void {
        this.expressApp = expressApp;
        this.mountAPI();
    }

}
