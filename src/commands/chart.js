const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const { integrateAdvertisement } = require('../utils/advertisement');

module.exports = {
    name: 'chart',
    aliases: ['c'], // Alias für /c
    description: 'Generates a TradingView chart for a given symbol and timeframe using the TradingView widget.',
    usage: '/chart [symbol] [timeframe]',
    skipGlobalAd: true,
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        if (args.length === 0) {
            await bot.sendMessage(chatId, "Please provide a symbol (e.g., BTC) and optional timeframe (e.g., 5m, 1h, 1d). Example: /chart BTC 1W");
            return;
        }

        const timeframesMap = {
            '1m': '1', // 1 Minute
            '3m': '3', // 3 Minuten
            '5m': '5', // 5 Minuten
            '15m': '15', // 15 Minuten
            '30m': '30', // 30 Minuten
            '1h': '60', // 1 Stunde
            '2h': '120', // 2 Stunden
            '4h': '240', // 4 Stunden
            '1d': '1D', // 1 Tag
            '1w': '1W', // 1 Woche
            '1mth': '1M' // 1 Monat
        };

        let symbol = args[0].toUpperCase();
        const inputTimeframe = args[1]?.toLowerCase() || '1d'; // Standardmäßig 1D
        const timeframe = timeframesMap[inputTimeframe] || '1D'; // Überprüfe die Karte

        // Spezielle Behandlung für BTC
        if (symbol === 'BTC') {
            symbol = 'BINANCE:BTCUSDT'; // Hardcodierter Chart für BTC (Binance)
        } else if (!symbol.includes('USDT') && !symbol.includes('USD') && !symbol.includes('BTC')) {
            // Ergänze das Symbol, falls es unvollständig ist
            symbol = `${symbol}USDT`; // Standardmäßig USDT anhängen
        }

        const screenshotPath = path.join(__dirname, '..', 'temp', `${symbol}_${timeframe}_chart.png`);

        try {
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });

            const page = await browser.newPage();

            // Legt die Größe des Puppeteer-Viewports fest
            await page.setViewport({ width: 1200, height: 800 });

            // HTML-Inhalt für das TradingView-Widget
            const widgetHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>TradingView Chart</title>
                    <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
                    <style>
                        html, body {
                            margin: 0;
                            padding: 0;
                            width: 100%;
                            height: 100%;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            background-color: #ffffff;
                        }
                        #chart-container {
                            width: 1200px;
                            height: 800px;
                        }
                    </style>
                </head>
                <body>
                    <div id="chart-container"></div>
                    <script type="text/javascript">
                        const widget = new TradingView.widget({
                            "container_id": "chart-container",
                            "symbol": "${symbol}",
                            "interval": "${timeframe}",
                            "theme": "dark",
                            "style": "1",
                            "locale": "en",
                            "toolbar_bg": "#f1f3f6",
                            "enable_publishing": false,
                            "hide_legend": false,
                            "save_image": false,
                            "hide_side_toolbar": false,
                            "allow_symbol_change": false,
                            "details": true,
                            "hotlist": false,
                            "calendar": false,
                            "studies": [], // Volumen-Indikator ausblenden
                            "width": 1200,
                            "height": 800,
                            "timezone": "Etc/UTC"
                        });

                        widget.onChartReady(() => {
                            widget.chart().removeEntity(widget.chart().getStudyByName('Volume')); // Entfernt Volumen-Indikator
                        });
                    </script>
                </body>
                </html>
            `;

            // HTML-Inhalt laden
            await page.setContent(widgetHtml, { waitUntil: 'networkidle0' });

            // Wartezeit, damit der Chart vollständig geladen wird
            await new Promise(resolve => setTimeout(resolve, 15000)); // 15 Sekunden warten

            // Screenshot erstellen
            await page.screenshot({ path: screenshotPath, fullPage: false });
            await browser.close();

            const advertisement = integrateAdvertisement(""); // Werbung einfügen
            await bot.sendPhoto(chatId, screenshotPath, { caption: advertisement, parse_mode: 'HTML' });

            fs.unlinkSync(screenshotPath); // Temporäre Datei löschen
        } catch (error) {
            logger.error(`Error generating chart for symbol ${symbol}:`, error);
            await bot.sendMessage(chatId, "An error occurred while generating the chart. Please try again later.");
        }
    },
};
