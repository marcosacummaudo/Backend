//import * as url from 'url';
import path from 'path';
import { Command } from 'commander';
import dotenv from 'dotenv';

const commandLine = new Command();
commandLine
    .option('--mode <mode>')
    .option('--port <port>')
    .option('--setup <number>')
commandLine.parse();
const clOptions = commandLine.opts();

const config = {
    SERVER: 'atlas',
    PORT: process.env.PORT || clOptions.port || 8080,
    APP_NAME: 'marcosacummaudo',
    //DIRNAME: url.fileURLToPath(new URL('.', import.meta.url)),
    DIRNAME: path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:\/)/, '$1')), // Win
    // UPLOAD_DIR: 'public/img'
    get UPLOAD_DIR() { return `${this.DIRNAME}/public/img` },
    SECRET: process.env.SECRET,
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_ID_REGEX: /^[a-fA-F0-9]{24}$/,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL
}

export default config;

