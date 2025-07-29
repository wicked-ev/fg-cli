import fg from "fg";
import fs from "fs";
import { autocomplete, confirm } from "@clack/prompts";
import path from "path";
import chalk from "chalk";
import babelParser from "@babel/parser";
import * as recast from "recast";
export async function addRoute(routerName, routePath, component) {

  const currentPath = process.cwd();
  if (routerName) {
    const router = path.join(currentPath, `${routerName}.jsx`);
    if (fs.existsSync(router)) {
      if (isValidRouter(router)) {
        //insert new route
        insertRouteJSXElement(router, routePath, component);
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
  const options = [];
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
    const content = fs.readFileSync(filePath, options, callback);
    return content;
  } catch (error) {
    console.error(`error reading ${filePath}: ${error.message}`);
  }
}

function writeFileContent(filePath, content) {
  try {
    fs.writeFileSync(filePath, content);
    return true;
  } catch (error) {
    console.error(`error writing to ${filePath}: ${error.message}`);
  }
}

function isValidRouter(filePath) {
  const sourceCode = readFileContent(filePath);
  if(!sourceCode) return false;
  
  let isRouter = false;
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
        return false;
      }
      this.traverse(path);
    },
  });

  return isRouter;
}

function getAST(sourceCode) {
  const ast = recast.parse(sourceCode, {
    parser: {
      parse(code) {
        return babelParser.parse(code, {
          sourceType: "module",
          plugins: ["jsx"],
        });
      },
    },
  });
  return ast;
}

async function insertRouteJSXElement(router, routePath, component) {
  const sourceCode = readFileContent(router);
  const ast = getAST(sourceCode);
  recast.types.visit(ast, {
    visitJSXElement(path) {
      const element = path.node.openingElement;
      const elementName = path.node.name.name;
      const namedTypes = recast.types.namedTypes;
      const b = recast.types.builders;
      if (element && elementName == "Route") {
        const attributes = element.attributes;
        for (const attr of attributes) {
          if (
            namedTypes.JSXAttribute.check(attr) &&
            attr.name.name == "path" &&
            attr.value.type == "Literal" &&
            attr.value.value == "/"
          ) {
            const newRoute = createJSXRouteElement(routePath, component);

            insertElement(path, newRoute);

            return false;
          } else if (
            namedTypes.JSXAttribute.check(attr) &&
            attr.name.name == "Routes"
          ) {
            //insert route
            const newRoute = createJSXRouteElement(routePath, component);
            insertElement(path, newRoute);
            return false;
          } else if (
            namedTypes.JSXAttribute.check(value) &&
            attr.name.name == "BrowserRouter"
          ) {
            //insert Routes than route
            const routes = createJSXRoutes(routePath, component);
            insertElement(path, routes);
            return false;
          }
          this.traverse(path);
        }
      }
    },
  });
  const updateCode = recast.print(ast).code;
  writeFileContent(router, updateCode);
  //first look for route with path / if not
  // look for Routes Element to insert if not
  // look for BrowserRouter Element and create Routes Element inside it then insert your route
}

function insertElement(path, element) {
  path.node.children.push(b.jsxText("\n "), element, b.jsxText("\n "));
}
function createJSXRouteElement(routePath, component) {
  const builder = recast.types.builders;
  const newRoute = builder.jsxElement(
    builder.jsxOpeningElement(
      builder.jsxIdentifier("Route"),
      [
        builder.jsxAttribute(
          builder.jsxIdentifier("path"),
          builder.literal(routePath),
        ),
        builder.jsxAttribute(
          builder.jsxIdentifier("element"),
          builder.literal(component),
        ),
      ],
      true,
    ),
  );
  return newRoute;
}

function createJSXRoutes(routePath, component) {
  const builder = recast.types.builders;
  const newElement = builder.jsxElement(
    builder.jsxOpeningElement(builder.jsxIdentifier("Routes"), []),
    builder.jsxClosingElement(builder.jsxIdentifier("Routes")),
    [
      builder.jsxElement(
        builder.jsxOpeningElement(
          builder.jsxIdentifier("Route"),
          [
            builder.jsxAttribute(
              builder.jsxIdentifier("path"),
              builder.literal(routePath),
            ),
            builder.jsxAttribute(
              builder.jsxIdentifier("element"),
              builder.literal(component),
            ),
          ],
          true,
        ),
      ),
    ],
  );
  return newElement;
}
// const route = builder.jsxElement(
//   builder.jsxOpeningElement(builder.jsxIdentifier("Route")),
//   [
//     builder.jsxAttribute(builder.jsxIdentifier("path"), builder.literal()),
//     builder.jsxAttribute(builder.jsxIdentifier("comp")),
//   ],
// );
