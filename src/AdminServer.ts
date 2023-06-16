import express, {
  Request,
  Response,
} from 'express';
import http from 'http';

import { client } from './main';
import { chainsMap } from './MarkovChain';

export function startAdminServer() {
    const app: express.Application = express();
    const httpServer: http.Server = http.createServer(app);
    app.set('view engine', 'ejs');
    app.use(express.static('public', {
        setHeaders: (res, path) => {
            if (path.endsWith('.css')) {
                res.setHeader('Content-Type', 'text/css');
            }
        }
    }));
    app.get('/', (req: Request, res: Response) => {
        const props = {
            client: client,
            guilds: client.guilds.cache,
            chains: chainsMap
        };
        /*client.guilds.cache.forEach(guild => {
        
        }) */
        res.render('admin', props);
    });

    //const PORT: number | string = process.env.PORT || 8080;
    const PORT = 8080;
    httpServer.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });

}

