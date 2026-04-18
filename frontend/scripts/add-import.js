import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const filePath = join(__dirname, '../../web/d2_prompt_selector.js');
const importStatement = 'import { app } from "../../scripts/app.js";\n';

const content = readFileSync(filePath, 'utf8');
writeFileSync(filePath, importStatement + content);
