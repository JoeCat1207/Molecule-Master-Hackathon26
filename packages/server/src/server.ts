import express from 'express';
import cors from 'cors';
import { router } from './routes/index.js';

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Molecule Master API running on http://localhost:${PORT}`);
});
