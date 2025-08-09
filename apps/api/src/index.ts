import { createApp } from './app';
import { env } from './env';

const app = createApp();
app.listen(Number(env.API_PORT), () => {
  console.log(`API running on :${env.API_PORT}`);
});

export default app;

