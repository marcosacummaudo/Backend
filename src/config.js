import * as url from 'url';

const config = {
    PORT: 8080,
    DIRNAME: url.fileURLToPath(new URL('.', import.meta.url)),
    // UPLOAD_DIR: 'public/img'
    get UPLOAD_DIR() { return `${this.DIRNAME}/public/img` },
    MONGODB_URI: 'mongodb+srv://marcosacummaudo:CoderBackend2024@clustercoder.xi4oip9.mongodb.net/ecommerce'
}

export default config;