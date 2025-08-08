#!/usr/bin/env node
import { Command } from "commander";
import { createComp } from "../src/commands/createComp.js";
import { listComps } from "../src/commands/list.js";
import { addRoute } from "../src/commands/routes.js";


//done: maybe maaaaaybe change the commands here to use commander for better commands handling
//todo: polish add route better then consider releasing? 
//todo: help command
//todo: command that can look for JSX Element and changes its Identifier

async function main() {
  const program = new Command();
    program.
      name("fg")
      .description("CLI tool to help with react development")
      .version("0.0.1");

    program.
      command("cr <compName>")
      .description("creates react component")
      .option("-t, --typescript","creates typescript component .tsx")
      .option("-f, --force", "force to overwrite if component with same name already exists")
      .option("-i, --ignore", "allows for custom creation of the component")
      .action((compName, option) => {
        const type = option.typescript ? "tsx" : "jsx";
        createComp(compName, option.force,type, option.ignore);
      });

    program.
      command("arr <router> <path> <component>")
        .description("adds route to react router if found")
        .action((router, path, component) => {
          addRoute(router, path, component);
        });
  
    program.
      command("list")
        .description("list files based on extensions (default is .jsx)")
        .option("-e, --ext <ext>", "specifies extension type")
        .action((option) => {
          listComps(option.ext);
        });

    program.parse();
}

main();
