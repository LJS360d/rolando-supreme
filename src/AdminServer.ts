import express, {
  Request,
  Response,
} from 'express';
import http from 'http';

import { DataRetriever } from './DataRetriever';
import { client } from './main';
import { chainsMap } from './MarkovChain';

export function startAdminServer() {
    const startTime = Date.now();
    const app: express.Application = express();
    const httpServer: http.Server = http.createServer(app);
    app.use(express.static('public'));
    app.set('view engine', 'ejs');

    app.get('/', (req: Request, res: Response) => {
        const props = {
            client: client,
            guilds: client.guilds.cache,
            chains: chainsMap,
            startTime: startTime,
            version: process.env.npm_package_version,
            fetchStatus: DataRetriever.fetchStatus
        };
        res.render('admin', props);
    });


    //const PORT: number | string = process.env.PORT || 8080;
    const PORT: number = 8080;
    httpServer.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });

}

