const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../web/d2_prompt_selector.js');
const importStatement = 'import { app } from "../../scripts/app.js";\n';

const content = fs.readFileSync(filePath, 'utf8');
fs.writeFileSync(filePath, importStatement + content);