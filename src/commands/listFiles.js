import path from 'path';
import fg from 'fast-glob';
import chalk from 'chalk';
import { info } from './log.js';


export async function listComps(inputSearch,filesType = ['jsx']) {
    const fastGlobFilter = filesType.map(type => `**/*.${type}`);
    fastGlobFilter.push('!node_modules/**', '!.git/**');

    let files = await fg(fastGlobFilter, { dot: true });
    
    if (inputSearch) {
        const terms = inputSearch.toLowerCase().split(/\s+/).filter(Boolean);
        files = files.filter(file => {
            const fileName = path.basename(file).toLowerCase();
            return terms.every(term => fileName.includes(term));
        });
    }

    info(`results ${files.length} found...`);
    if (files.length === 0) return;

    for(const file of files) {
        const fileName = path.basename(file);
        console.log(`${chalk.green(fileName)}:     -path: ${chalk.gray(file)}`);
    }    
} 
