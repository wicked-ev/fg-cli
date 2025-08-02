import fg from "fast-glob";
import fs from "fs";
import { confirm, select, text } from "@clack/prompts";
import path from "path";
import chalk from "chalk";
import babelParser from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
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
  const sourceCode = readFileContent(filePath);
  console.log("source Code ready");
  if (!sourceCode) return false;

  let isRouter = false;
  const ast = getAST(sourceCode);
  console.log("ast ready");
  
  traverse(ast, {
    jsxElement(path) {
      const tag = path.node.openingElement; 
      if(t.jsxIdentifier(tag.name, {name: "Route"}) || t.jsxIdentifier(tag.name, {name: "BrowserRouter"}) || t.jsxIdentifier(tag.name, { name: "Routes"})) {
        isRouter = true;
      }
    }
  });

  return isRouter;
}

function getAST(sourceCode) {
  try {
    const ast = babelParser.parse(sourceCode, {
      sourceType: "module",
      plugins: ["jsx"],
    });
    // const ast = recast.parse(sourceCode, {
    //   parser: {
    //     parse(source) {
    //       return babelParser.parse(source, {
    //         sourceType: "module",
    //         plugins: ["jsx"],
    //       });
    //     },
    //   },
    // });
    return ast;
  } catch (error) {
    throw new Error("error parsing AST: " + error.message);
  }
}

async function insertRouteJSXElement(router, routePath, component) {
  const sourceCode = readFileContent(router);
  const ast = getAST(sourceCode);
  traverse.default(ast, {
    JSXElement(path) {
      const tag = path.node.openingElement;
      if (t.isJSXIdentifier(tag.name, {name: "Route"})) {
        for (const attr of tag.attributes) {
          if (
            attr.type == "JSXAttribute" &&
            attr.name.name == "path" &&
            attr.value.type == "StringLiteral" &&
            attr.value.value == "/"
          ) {
            const newRoute = createJSXRouteElement(routePath,component);
            path.insertAfter(newRoute);
          }
        }
      } else if (t.isJSXIdentifier(tag.name, {name: "Routes"})) {
        const newRoute = createJSXRouteElement(routePath, component);
        path.insertAfter(newRoute)
      } else if (t.isJSXIdentifier(tag.name, {name: "BrowserRouter"})) {
        const routes = createJSXRoutes(routePath, component);
        path.insertAfter(routes);
      }
     },
  });

  // recast.types.visit(ast, {
  //   visitJSXElement(path) {
  //     const element = path.node.openingElement;
  //     const elementName = path.node.name.name;
  //     const namedTypes = recast.types.namedTypes;
  //     const b = recast.types.builders;
  //     if (element && elementName == "Route") {
  //       const attributes = element.attributes;
  //       for (const attr of attributes) {
  //         if (
  //           namedTypes.JSXAttribute.check(attr) &&
  //           attr.name.name == "path" &&
  //           attr.value.type == "Literal" &&
  //           attr.value.value == "/"
  //         ) {
  //           const newRoute = createJSXRouteElement(routePath, component);

  //           insertElement(path, newRoute);

  //           return false;
  //         } else if (
  //           namedTypes.JSXAttribute.check(attr) &&
  //           attr.name.name == "Routes"
  //         ) {
  //           //insert route
  //           const newRoute = createJSXRouteElement(routePath, component);
  //           insertElement(path, newRoute);
  //           return false;
  //         } else if (
  //           namedTypes.JSXAttribute.check(value) &&
  //           attr.name.name == "BrowserRouter"
  //         ) {
  //           //insert Routes than route
  //           const routes = createJSXRoutes(routePath, component);
  //           insertElement(path, routes);
  //           return false;
  //         }
  //         this.traverse(path);
  //       }
  //     }
  //   },
  // });
  const updateCode = generate(ast).code;
  writeFileContent(router, updateCode);
  //first look for route with path / if not
  // look for Routes Element to insert if not
  // look for BrowserRouter Element and create Routes Element inside it then insert your route
}

function insertElement(path, element) {
  path.node.children.push(b.jsxText("\n "), element, b.jsxText("\n "));
}
function createJSXRouteElement(routePath, component) {
  const route = t.jsxElement(
    t.jsxOpeningElement(
      t.jsxIdentifier("Route"),
      [
        t.jsxAttribute(
          t.jsxIdentifier("path"), 
          t.stringLiteral(routePath)
        ),
        t.jsxAttribute(t.jsxIdentifier("element"),
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

  // const builder = recast.types.builders;
  // const newRoute = builder.jsxElement(
  //   builder.jsxOpeningElement(
  //     builder.jsxIdentifier("Route"),
  //     [
  //       builder.jsxAttribute(
  //         builder.jsxIdentifier("path"),
  //         builder.literal(routePath),
  //       ),
  //       builder.jsxAttribute(
  //         builder.jsxIdentifier("element"),
  //         builder.literal(component),
  //       ),
  //     ],
  //     true,
  //   ),
  // );
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

  // const builder = recast.types.builders;
  // const newElement = builder.jsxElement(
  //   builder.jsxOpeningElement(builder.jsxIdentifier("Routes"), []),
  //   builder.jsxClosingElement(builder.jsxIdentifier("Routes")),
  //   [
  //     builder.jsxElement(
  //       builder.jsxOpeningElement(
  //         builder.jsxIdentifier("Route"),
  //         [
  //           builder.jsxAttribute(
  //             builder.jsxIdentifier("path"),
  //             builder.literal(routePath)
  //           ),
  //           builder.jsxAttribute(
  //             builder.jsxIdentifier("element"),
  //             builder.literal(component)
  //           ),
  //         ],
  //         true
  //       )
  //     ),
  //   ]
  // );
  return routes;
}
// const route = builder.jsxElement(
//   builder.jsxOpeningElement(builder.jsxIdentifier("Route")),
//   [
//     builder.jsxAttribute(builder.jsxIdentifier("path"), builder.literal()),
//     builder.jsxAttribute(builder.jsxIdentifier("comp")),
//   ],
// );
