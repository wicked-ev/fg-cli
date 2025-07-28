#!/usr/bin/env node
import arg from "arg";
import { createComp } from "../src/commands/createComp.js";
import { listComps } from "../src/commands/list.js";

async function main() {
  const args = arg({
    "--create": String,
    "--force": Boolean,
    "--list": Boolean,
    "--ext": String,
    "--radd": String,
    "--rset": String,
    "-l": "--list",
    "-c": "--create",
    "-t": Boolean,
    "-f": "--force",
    "--ignore": Boolean,
    "-i": "--ignore",
  });

  if (args["--create"]) {
    const compType = args["-t"] ? "tsx" : "jsx";
    createComp(args["--create"], args["--force"], compType, args["--ignore"]);

    
  }
  if (args["--list"]) {
    await listComps(args["--ext"]);
  }
  /*
    fg -c Task
    fg route routeName routeComp
        - check if comp exists 
            - if yes we have to import to the route export
                - i need to scan the directory for jsx file
                    - with exception for some directories (node modules, testing etc);
                    - or i can just list all the comps to select one
            - if no we have to let him know before adding that route
    fg list both jsx tsx 
        - fileJSX -> path      
*/
}

main();
