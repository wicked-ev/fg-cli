import fg from "fg";
import fs from "fs";
import { autocomplete, confirm } from "@clack/prompts";
import path from "path";
import chalk from "chalk";
import bableParser from "@babel/parser";
import * as recast from "recast";
export async function addRoute(routerName, routePath, component) {
  // fg route routeName routeCompe

  const currentPath = process.cwd();
  if (routerName) {
    const router = path.join(currentPath, `${routerName}.jsx`);
    if (fs.existsSync(router)) {
      if (isValidRouter(filePath)) {
        //insert new route
      } else {
        console.log(
          chalk.red(`jsx file named ${routerName} is not valid router`),
        );
        process.exit(0);
      }
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

  const routers = scanForRouters();

  if (routers) {
    for (const router of routers) {
      options.push({ value: router, label: path.basename(router) });
    }
    const selectedRouter = await autocomplete({
      message: "Select Components",
      options: options,
      placeholder: "Type to search...",
      maxItems: 5,
    });
    //insert
  } else {
    console.log(chalk.red("No viable router files found"));
    process.exit(1);
  }
}

async function scanForRouters() {
  const files = await fg([`**/*.jsx`, "!node_modules/**", "!.git/**"], {
    dot: true,
  });

  const routers = [];
  for (const file of files) {
    if (isValidRouter(file)) {
      routers.push(file);
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
  const isRouter = false;

  const ast = getAST(sourceCode);

  recast.types.visit(ast, {
    visitJSXElement(path) {
      const openEl = path.node.openingElement;
      const tagName = path.openingElement.name.name;
      const n = recast.types.namedTypes;
      if (
        tagName == "Routes" ||
        tagName == "BrowserRouter" ||
        tagName == "Route"
      ) {
        isRouter = true;
      }
    },
  });

  return isRouter;
}

function getAST(sourceCode) {
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
  return ast;
}

function insertRoutJSXElement(router, routePath, component) {
  //first look for route with path / if not
  // look for Routes Element to insert if not
  // look for BrowserRouter Element and create Routes Element inside it then insert your route
}

// const route = builder.jsxElement(
//   builder.jsxOpeningElement(builder.jsxIdentifier("Route")),
//   [
//     builder.jsxAttribute(builder.jsxIdentifier("path"), builder.literal()),
//     builder.jsxAttribute(builder.jsxIdentifier("comp")),
//   ],
// );
