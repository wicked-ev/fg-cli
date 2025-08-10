import fg from "fast-glob";
import fs from "fs";
import { confirm, select, text } from "@clack/prompts";
import { success, error, info, warning } from './log.js';
import path from "path";
import babelParser from "@babel/parser";
import traverse from "@babel/traverse";
import { generate } from "@babel/generator";
import * as t from "@babel/types";
import prettier from "prettier";



export async function addRoute(routerName, routePath, component) {
  //checking if routerName is valid JSX file
  if (routerName) {
    let [isJSXFile, router] = await isValidJSXFile(routerName);
    //if routerName is JSX file we check if it is valid router then we parse and add the route
    if (isJSXFile) {
      if (isValidRouter(router)) {
        //insert new route
        await insertRouteJSXElement(router, routePath, component);
        success(`route ${routePath} has been added to ${routerName}`);
        process.exit(1);
      } else {
        console.log(
        error(`jsx file named ${routerName} is not valid router`) 
        );
        process.exit(0);
      }
    } else {
      const confirmRouterSearch = await confirm({
        message: `No .jsx file named ${routerName} in This directory, would you like to search for viable router's in this directory?`,
      });
      if (confirmRouterSearch) {
        handleRouterSearch(routePath, component);
      } else {
        warning("Operation canceled");
        process.exit(0);
      }
    }
  }
}

async function handleRouterSearch(routePath, component) {
  const routers = await scanForRouters();
  const options = [];
  if (routers) {
    for (const router of routers) {
      options.push({ value: router, label: path.basename(router) });
    }
    const selectedRouter = await select({
      message: "Select Components",
      options: [...options],
      maxItems: 5,
    });

    if (selectedRouter) {
      await insertRouteJSXElement(selectedRouter, routePath, component);
    } else {
      warning("Operation canceled");
      process.exit(0);
    }
  } else {
    error("No viable router files found");
    process.exit(1);
  }
}
async function isValidJSXFile(fileName) {
  let isJSXFile = false;
  let filePath;
  const files = await fg([`**/*.jsx`, "!node_modules/**", "!.git/   **"], {
    dot: true,
  });
  for (const file of files) {
    const baseName = path.basename(file);
    if (fileName == path.parse(baseName).name) {
      isJSXFile = true;
      filePath = path.join(process.cwd(), file);
      return [isJSXFile, filePath];
    }
  }
  return [false, null];
}
async function scanForRouters() {
  const files = await fg([`**/*.jsx`, "!node_modules/**", "!.git/**"], {
    dot: true,
  });

  const routers = [];
  for (const file of files) {
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
    throw new Error(`error reading ${filePath}: ${error.message}`);
  }
}

function writeFileContent(filePath, content) {
  try {
    fs.writeFileSync(filePath, content);
    return true;
  } catch (error) {
    throw new Error(`error writing to ${filePath}: ${error.message}`);
  }
}

function isValidRouter(filePath) {
  const sourceCode = readFileContent(filePath).toString();
  if (!sourceCode) return false;

  let isRouter = false;
  const ast = getAST(sourceCode);

  traverse.default(ast, {
    JSXElement(path) {
      const tag = path.node.openingElement.name;
      // console.log(JSON.stringify(tag, null, 2));
      if (
        t.isJSXIdentifier(tag) &&
        (tag.name === "Route" ||
          tag.name === "BrowserRoute" ||
          tag.name === "Routes")
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

function checkForBaseRoute(path, t) {
  const baseRoute = path.node.children.find(
    (child) =>
      t.isJSXElement(child) &&
      child.openingElement.name.name === "Route" &&
      child.openingElement.attributes.some(
        (attr) =>
          t.isJSXAttribute(attr) &&
          attr.name.name === "path" &&
          attr.value.type === "StringLiteral" &&
          attr.value.value === "/"
      )
  );
  return baseRoute;
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
          // Check for Base Route Tag Child of <Routes>
          const baseRoute = checkForBaseRoute(path, t);
          if (baseRoute) {
            // Check if element self closing if yes add closing tag
            if (baseRoute.openingElement.selfClosing) {
              baseRoute.openingElement.selfClosing = false;
              baseRoute.closingElement = t.jsxClosingElement(
                t.jSXIdentifier("Route")
              );
            }
            baseRoute.children = baseRoute.children || [];
            baseRoute.children.push(
              createJSXRouteElement(routePath, component)
            );
            inserted = true;
            path.stop();
          } else {
            // Insert new Route as a child of <Routes>
            const newRoute = createJSXRouteElement(routePath, component);
            path.node.children.push(newRoute);
            inserted = true;
            // Stop traversal after insertion
            path.stop();
          }
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
  const updatedCode = generate(ast, {
    compact: false,
    concise: false,
    retainLines: false,
    decoratorsBeforeExport: true,
    jsescOption: { minimal: true },
  }).code;


  const formattedCode = await prettier.format(updatedCode, {
    parser: "babel-ts",
    semi: true,
    singleQuote: true,
    tabWidth: 2,
  });

  writeFileContent(router,formattedCode);
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
