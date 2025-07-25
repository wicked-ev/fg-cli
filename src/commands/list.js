import fs from 'fs';
import path from 'path';
import fg from 'fast-glob';
import chalk from 'chalk';



export async function listComps(fileType = 'jsx') {
    const files = await fg([`**/*.${fileType}`,'!node_modules/**', '!.git/**'], { dot: true });
    for(const file of files) {
        const fileName = path.basename(file);
        console.log(`${chalk.green(fileName)}:     -path: ${chalk.gray(file)}`);
    }    
} 
