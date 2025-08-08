#!/usr/bin/env node
import arg from "arg";
import { Command } from "commander";
import { createComp } from "../src/commands/createComp.js";
import { listComps } from "../src/commands/list.js";
import { addRoute } from "../src/commands/routes.js";
import playTest from "../utils/playTest.js";


//todo: maybe maaaaaybe change the commands here to use commander for better commands handling
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
      command("cr")
      .description("create react component")
      .option("-t","creates typescript component .tsx")
      .option("-f, --force", "force to overwrite if component with same name already exists")
      .option("-i, --ignore", "allows for custom creation of the component");

    program.
      command("arr")
        .description("adds route to react router if found")
    
    program.
      command("list")
        .description("list files based on extensions (default is .jsx")
        .option("-e, --ext", "specifies extension type")
        
  //fg cr compName -i 
  // const args = arg({
  //   "--create": String,
  //   "--force": Boolean,
  //   "--list": Boolean,
  //   "--ext": String,
  //   "--radd": String,
  //   "--rset": String,
  //   "--playtest": Boolean,
  //   "-l": "--list",
  //   "-c": "--create",
  //   "-t": Boolean,
  //   "-f": "--force",
  //   "--ignore": Boolean,
  //   "-i": "--ignore",
  // });

  // if (args["--create"]) {
  //   const compType = args["-t"] ? "tsx" : "jsx";
  //   createComp(args["--create"], args["--force"], compType, args["--ignore"]);
  // }
  // if (args["--list"]) {
  //   await listComps(args["--ext"]);
  // }

  // if (args["--radd"] && args["_"].length > 1) {
  //   console.log(args);
  //   const routePath = args["_"][0];
  //   let component = args["_"][1];
  //   component = component[0].toUpperCase() + component.slice(1);
  //   addRoute(args["--radd"], routePath, component);
  // }
  // if (args["--playtest"]) {
  //   playTest();
  // }
  /*
    fg -c Task
    fg route routeName routeComp
        - check if comp exists
            - if yes we have to import to the route export
                - i need to scan the directory for jsx
                    - or i can just list all the comps to select one
            - if no we have to let him know before adding that route
    fg list both jsx tsx
        - fileJSX -> path
*/
}

main();
