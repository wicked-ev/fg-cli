import fg from "fg";
import fs from "fs";
import { autocomplete, confirm } from "@clack/prompts";
import path from "path";
import chalk from "chalk";
import bableParser from "@babel/parser";
import * as recast from "recast";
export async function addRoute(routerName) {
  // fg route routeName routeComp
  //     - check if comp exists
  //         - if yes we have to import to the route export
  //             - i need to scan the directory for jsx file
  //                 - with exception for some directories (node modules, testing etc);
  //                 - or i can just list all the comps to select one
  //         - if no we have to let him know before adding that route

  const currentPath = process.cwd();

  if (routerName) {
    const router = path.join(currentPath, `${routerName}.jsx`);
    if (fs.existsSync(router)) {
    } else {
      const confirmRouterSearch = await confirm({
        message: `No .jsx file named ${routerName} in This directory, would you like to search for vaible router in this directory`,
      });
      if (!confirmRouterSearch) {
        console.log(chalk.red("Operation cancled"));
        process.exit(0);
      }
    }
  }
  const files = await fg([`**/*.jsx`, "!node_modules/**", "!.git/**"], {
    dot: true,
  });

  const options = [{ value: null, label: "custom file name" }];

  if (files.length >= 1) {
    for (const file of files) {
      options.push({ value: file, label: path.basename(file) });
    }
    const router = await autocomplete({
      message: "Select Components",
      options: options,
      placeholder: "Type to search...",
      maxItems: 5,
    });
  } else {
    const makeCustom = await confirm({
      message: "No .jsx files found. Do you want to specify a custom name?",
    });
    if (!makeCustom) {
      console.log(chalk.red("Operation canceled"));
      process.exit(1);
    }
  }
}

async function scanForRouters() {
  const files = await fg([`**/*.jsx`, "!node_modules/**", "!.git/**"], {
    dot: true,
  });

  if (!files) return files;

  const routers = [];
  for (const file of files) {
    if (isValidRouter(file)) {
      routers.push(files);
    }
  }
  return routers;
}

function readFileContent(filePath) {
  try {
    const content = fs.readFile(filePath, options, callback);
    return content;
  } catch (error) {
    console.error(`error reading ${filePath}: ${error.message}`);
  }
}
function isValidRouter(filePath) {
  const sourceCode = readFileContent(filePath);
  const ast = recast.parse(sourceCode, {
    parser: {
      parse(code) {
        return bableParser.parse(code, {
          sourceType: "module",
          plugins: ["jsx"],
        });
      },
    },
  });

  const builder = recast.types.builders;
  recast.types.visit(ast, {
    visitJSXElement(path) {
      const openEl = path.node.openingElement;
      const tagName = path.openingElement.name.name;
      const n = recast.types.namedTypes;
      if (tagName == "Route") {
        const attributes = openEl.attributes;
        for (const attribute of attributes) {
          if (
            attribute.name.name === "path" &&
            n.JSXAttribute.check(attribute) &&
            attribute.value.type === "Literal" &&
            attribute.value.value === "/"
          ) {
          }
        }
      }
    },
  });
}
