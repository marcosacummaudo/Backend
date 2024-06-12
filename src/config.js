//import * as url from 'url';
import path from 'path';

const config = {
    SERVER: 'atlas',
    PORT: 8080,
    APP_NAME: 'marcosacummaudo',
    //DIRNAME: url.fileURLToPath(new URL('.', import.meta.url)),
    DIRNAME: path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:\/)/, '$1')), // Win
    // UPLOAD_DIR: 'public/img'
    get UPLOAD_DIR() { return `${this.DIRNAME}/public/img` },
    SECRET: 'coder_53160_marcos',
    MONGODB_URI: 'mongodb+srv://marcosacummaudo:CoderBackend2024@clustercoder.xi4oip9.mongodb.net/ecommerce',
    MONGODB_ID_REGEX: /^[a-fA-F0-9]{24}$/,
    GITHUB_CLIENT_ID: 'Iv23lic9aBPwbZMleq8i',
    GITHUB_CLIENT_SECRET: 'abca3685cb4ae8a2ce8654b0522958c7582ccc13',
    GITHUB_CALLBACK_URL: 'http://localhost:8080/api/sessions/ghlogincallback'


}

export default config;

