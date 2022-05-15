import express from 'express';
import 'dotenv/config';
import path from 'path';
import {fileURLToPath} from 'url';
import { allowedNodeEnvironmentFlags } from 'process';

// Create the Express app and set the port number.
const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', express.static('client'));

app.get('/instructions', async (request, response) => {
  response.sendFile(path.join(__dirname,'..', 'client', 'tutorial.html'));
});

// This matches all routes that are not defined.
app.all('*', async (request, response) => {
  response.status(404).send(`Not found: ${request.path}`);
});

// Start the server.
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
