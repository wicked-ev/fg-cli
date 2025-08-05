import fg from "fast-glob";
import fs from "fs";
import { confirm, select, text } from "@clack/prompts";
import path from "path";
import chalk from "chalk";
import babelParser from "@babel/parser";
import traverse from "@babel/traverse";
import { generate } from "@babel/generator";
import * as t from "@babel/types";

// import * as recast from "recast";
// import { namedTypes } from "ast-types";

export async function addRoute(routerName, routePath, component) {
  const currentPath = process.cwd();
  console.log("current path: " + currentPath);

  if (routerName) {
    const router = path.join(currentPath, `${routerName}.jsx`);
    if (fs.existsSync(router)) {
      if (isValidRouter(router)) {
        //insert new route
        insertRouteJSXElement(router, routePath, component);
      } else {
        console.log(
          chalk.red(`jsx file named ${routerName} is not valid router`)
        );
        process.exit(0);
      }
    } else {
      const confirmRouterSearch = await confirm({
        message: `No .jsx file named ${routerName} in This directory, would you like to search for vaible router in this directory`,
      });
      if (!confirmRouterSearch) {
        console.log(chalk.red("Operation canceled"));
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
  const sourceCode = readFileContent(filePath).toString();
  console.log("source Code ready");
  if (!sourceCode) return false;

  let isRouter = false;
  const ast = getAST(sourceCode);
  console.log("ast ready");

  traverse.default(ast, {
    JSXElement(path) {
      const tag = path.node.openingElement.name;
      // console.log(JSON.stringify(tag, null, 2));
      if (
        t.jsxIdentifier(tag.name, "Route") ||
        t.jsxIdentifier(tag.name, "BrowserRouter") ||
        t.jsxIdentifier(tag.name, "Routes")
      ) {
        isRouter = true;
      }
    },
  });

  return isRouter;
}

function getAST(sourceCode) {
  try {
    if (sourceCode) {
      const ast = babelParser.parse(sourceCode, {
        sourceType: "module",
        plugins: ["jsx"],
      });
      return ast;
    }
  } catch (error) {
    throw new Error("error parsing AST: " + error.message);
  }
}

async function insertRouteJSXElement(router, routePath, component) {
  const sourceCode = readFileContent(router).toString();
  const ast = getAST(sourceCode);
  let inserted = false;

  try {
    traverse.default(ast, {
      JSXElement(path) {
        const tag = path.node.openingElement.name;
        if (t.isJSXIdentifier(tag) && tag.name === "Routes") {
          // Insert new Route as a child of <Routes>
          const newRoute = createJSXRouteElement(routePath, component);
          path.node.children.push(newRoute);
          inserted = true;
          path.stop(); // Stop traversal after insertion
        }
      },
    });

    if (!inserted) {
      throw new Error("No <Routes> element found for route insertion.");
    }
  } catch (error) {
    throw new Error("Error inserting new Route: " + error.message);
  }

  // Update code and write to file
  const updatedCode = generate(ast).code;
  writeFileContent(router, updatedCode);
}

function createJSXRouteElement(routePath, component) {
  const route = t.jsxElement(
    t.jsxOpeningElement(
      t.jsxIdentifier("Route"),
      [
        t.jsxAttribute(t.jsxIdentifier("path"), t.stringLiteral(routePath)),
        t.jsxAttribute(
          t.jsxIdentifier("element"),
          t.jsxExpressionContainer(
            t.jsxElement(
              t.jsxOpeningElement(t.jsxIdentifier(component), [], true),
              null,
              [],
              true
            )
          )
        ),
      ],
      true
    ),
    null,
    [],
    true
  );

  return route;
}

function createJSXRoutes(routePath, component) {
  const routes = t.jsxElement(
    t.jsxOpeningElement(t.jsxIdentifier("Routes"), []),
    t.jsxClosingElement(t.jsxIdentifier("Routes")),
    [
      t.jsxElement(
        t.jsxOpeningElement(
          t.jsxIdentifier("Route"),
          [
            t.jsxAttribute(t.jsxIdentifier("path"), t.stringLiteral(routePath)),
            t.jsxAttribute(
              t.jsxIdentifier("element"),
              t.jsxExpressionContainer(
                t.jsxElement(
                  t.jsxOpeningElement(t.jsxIdentifier(component), [], true),
                  null,
                  [],
                  true
                )
              )
            ),
          ],
          true // self-closing
        ),
        null,
        [],
        true
      ),
    ]
  );

  return routes;
}
