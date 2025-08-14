#!/usr/bin/env node
import { Command } from "commander";
import { createComp } from "../src/commands/createComp.js";
import { createHook } from "../src/commands/createHook.js";
import { listComps } from "../src/commands/listFiles.js";
import { addRoute } from "../src/commands/routes.js";

//todo: create hooks 
//todo: command that can look for JSX Element and changes its Identifier

async function main() {
  const program = new Command();
    program
      .name("fg")
      .description("CLI tool to help with react development")
      .version("0.0.1");

    program.
      command("cr <compName>")
      .description("creates react component template")
      .option("-t, --typescript","creates typescript component .tsx")
      .option("-f, --force", "force to overwrite if component with same name already exists")
      .option("-i, --ignore", "allows for custom creation of the component")
      .option("-s, --style <style>", "CSS style type: css | scss | module (default: css)")
      .action((compName, options) => {
        const styleMap = 
        {
          scss: "scss",
          css: "css",
          module: "module.css"
        }
        const cssType = styleMap[options.style] || "css";
        const type = options.typescript ? "tsx" : "jsx";
        createComp(compName, options.force, type, cssType, options.ignore);
      });
      
     program.command("hr <hookName>")
          .description("creates custom react hook template")
          .option("-i, --ignore", "ignores to check for hooks directory")
          .action((hookName, options) => {
            createHook(hookName, options.ignore);
          })
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

    // fg hr <name>
    program.parse();
}

main();
