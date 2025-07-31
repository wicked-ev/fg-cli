import fg from "fast-glob";
import fs from "fs";
import { confirm, select, text } from "@clack/prompts";
import path from "path";
import chalk from "chalk";
import babelParser from "@babel/parser";
import * as recast from "recast";

export async function addRoute(routerName, routePath, component) {
  const currentPath = process.cwd();
  console.log("current path: " + currentPath);

  if (routerName) {
    const router = path.join(currentPath, `${routerName}.jsx`);
    console.log("given router path: " + router);
    if (fs.existsSync(router)) {
      console.log("router exsits");
      if (isValidRouter(router)) {
        console.log("router is valid");
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

  const routers = await scanForRouters();

  const options = [];
  for (const r of routers) {
    console.log("route: " + r);
  }
  if (routers) {
    for (const router of routers) {
      options.push({ value: router, label: path.basename(router) });
    }
    const selectedRouter = await select({
      message: "Select Components",
      options: [...options],
      maxItems: 5,
    });
    //insert
    insertRouteJSXElement(selectedRouter, routePath, component);
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
    console.log("file jsx: " + file);
    if (isValidRouter(path.join(process.cwd(), file))) {
      routers.push(file);
    }
  }
  // console.log("routers found after scanning: " + routers);
  return routers;
}

function readFileContent(filePath) {
  try {
    const content = fs.readFileSync(filePath);
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
  console.log("source Code ready");
  if (!sourceCode) return false;

  let isRouter = false;
  const ast = getAST(sourceCode);
  console.log("ast ready");
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
  try {
    const ast = recast.parse(sourceCode, {
      parser: {
        parse(source) {
          return babelParser.parse(source, {
            sourceType: "module",
            plugins: ["jsx"],
          });
        },
      },
    });
    return ast;
  } catch (error) {
    console.error("error parsing AST: " + error.message);
  }
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
