#!/usr/bin/env node
import arg from 'arg';
import { createComp } from '../src/commands/createComp.js';

async function main() {
    const args = arg({
        '--create': String,
        '--force': Boolean,
        '-c': '--create',
        '-t': Boolean,
        '-f': '--force',
        '--ignore': Boolean, 
        '-i': '--ignore'
    });
    
    if (args['--create']) {
        const compType = args['-t'] ? 'tsx' : 'jsx';
        createComp(args['--create'], args['--force'], compType, args['--ignore']);
    }
    
    // console.log("hello world testing!");
    // console.log(args);
}

main();