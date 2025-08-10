import path from "path";
import fs from "fs";
import { select } from "@clack/prompts";
import { success, error , warning, info } from './log.js';

export async function createComp(
  name,
  force = false,
  compType = "jsx",
  cssType,
  ignoreDefault
) {
  const compName = name[0].toUpperCase() + name.slice(1);
  let compContent = `import './styles/${compName}.${cssType}';

export default function ${compName}() {

    return (<></>);
}`;

  const currentPath = process.cwd();

  if (!ignoreDefault) {
    await setupDefaultComponent(
      currentPath,
      compName,
      compType,
      cssType,
      compContent,
      force
    );
  } else {
    await setupCustomComponent(
      currentPath,
      compName,
      compType,
      cssType,
      compContent,
      force
    );
  }
}

async function setupCustomComponent(
  currentPath,
  compName,
  compType,
  cssType,
  compContent,
  force
) {
  const srcDir = await select({
    message: "create src directory",
    options: [
      { value: false, label: "no" },
      { value: true, label: "yes" },
    ],
  });
  const compDir = await select({
    message: "create components directory",
    options: [
      { value: false, label: "no" },
      { value: true, label: "yes" },
    ],
  });

  const stylesDir = await select({
    message: "create styles directory",
    options: [
      { value: false, label: "no" },
      { value: true, label: "yes" },
    ],
  });

  let compDirPath = [currentPath];
  let newCompPath = path.join(currentPath, `${compName}.${compType}`);
  let newCompStyle = path.join(currentPath, `${compName}.${cssType}`);

  if (!compDir && !stylesDir) {
    const writeRoot = await select({
      message: "files are being create in root directory are you sure?",
      options: [
        { value: false, label: "no" },
        { value: true, label: "yes" },
      ],
    });
    if (!writeRoot) {
      warning("operation Cancelled");
      process.exit(0);
    }
  }
  if (srcDir) {
    compDirPath.push("src");
  }
  if (compDir) {
    compDirPath.push("components");
    newCompPath = path.join(...compDirPath, `${compName}.${compType}`);
  }

  if (stylesDir) {
    compDirPath.push("styles");
    newCompStyle = path.join(...compDirPath, `${compName}.${cssType}`);
  } else {
    compContent = `import './${compName}.${cssType}';

export default function ${compName}() {

    return (<></>);
}`;
  }
  info("compDirPath:" + compDirPath);
  info("compStyle:" + newCompStyle);
  info("compPath:" + newCompPath);
  compDirPath = path.join(...compDirPath);

  createCompFiles(
    compDirPath,
    newCompPath,
    newCompStyle,
    compName,
    compType,
    cssType,
    compContent,
    force
  );
}
async function setupDefaultComponent(
  currentPath,
  compName,
  compType,
  cssType,
  compContent,
  force
) {
  const componentDir = path.join(currentPath, "src", "components");
  const stylesDir = path.join(componentDir, "styles");
  const newCompPath = path.join(componentDir, `${compName}.${compType}`);
  const newCompStyle = path.join(stylesDir, `${compName}.${cssType}`);

  createCompFiles(
    stylesDir,
    newCompPath,
    newCompStyle,
    compName,
    compType,
    cssType,
    compContent,
    force
  );
}

function createCompFiles(
  dirPath,
  newCompPath,
  newCompStyle,
  compName,
  compType,
  cssType,
  compContent,
  force
) {
  try {
    fs.mkdirSync(dirPath, { recursive: true });
  } catch (err) {
    error("❌ Failed to create directory:", err.message);
    process.exit(0);
  }

  try {
    const fileExists = fs.existsSync(newCompPath);
    const cssExists = fs.existsSync(newCompStyle);

    if (!fileExists || force) {
      fs.writeFileSync(newCompPath, compContent);
      success(`${fileExists ? "Overwritten" : "Created"} ${compName}`);
    } else {
      warning(
        `Component ${compName}.${compType} already exists! you can use --force or -f to overwrite`
      );
    }

    if (!cssExists || force) {
      fs.writeFileSync(newCompStyle, "");
      success(`${cssExists ? "Overwritten" : "Created"} ${compName}`);
    } else {
      warning(
        `Style ${compName}.${cssType} already exists!  you can use --force or -f to overwrite`
      );
    }
  } catch (error) {
    error("Failed to write file:", error.message);
    process.exit(0);
  }
}