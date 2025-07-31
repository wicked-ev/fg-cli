#!/usr/bin/env node
import arg from "arg";
import { createComp } from "../src/commands/createComp.js";
import { listComps } from "../src/commands/list.js";
import { addRoute } from "../src/commands/routes.js";

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

  if (args["--radd"] && args["_"].length > 1) {
    console.log(args);
    const routePath = args["_"][0];
    let component = args["_"][1];
    component = component[0].toUpperCase() + component.slice(1);
    addRoute(args["--radd"], routePath, component);
  }
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
