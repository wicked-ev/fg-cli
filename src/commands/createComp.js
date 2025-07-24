import path from "path";
import fs from "fs";
import { select } from "@clack/prompts";

export async function createComp(
  name,
  force = false,
  compType = "jsx",
  ignoreDefault
) {
  const compName = name[0].toUpperCase() + name.slice(1);
  let compContent = `import './styles/${compName}.css';

export default function ${compName}() {

    return (<></>);
}`;

  const currentPath = process.cwd();

  if (!ignoreDefault) {
    await setupDefaultComponent(
      currentPath,
      compName,
      compType,
      compContent,
      force
    );
  } else {
    await setupCustomComponent(
      currentPath,
      compName,
      compType,
      compContent,
      force
    );
  }
}

async function setupCustomComponent(
  currentPath,
  compName,
  compType,
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
  let newCompStyle = path.join(currentPath, `${compName}.css`);

  if (!compDir && !stylesDir) {
    const writeRoot = await select({
      message: "files are being create in root directory are you sure?",
      options: [
        { value: false, label: "no" },
        { value: true, label: "yes" },
      ],
    });
    if (!writeRoot) {
      console.log("operation Cancelled");
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
    newCompStyle = path.join(...compDirPath, `${compName}.css`);
  } else {
    compContent = `import './${compName}.css';

export default function ${compName}() {

    return (<></>);
}`;
  }
  console.log("compDirPath:" + compDirPath);
  console.log("compStyle:" + newCompStyle);
  console.log("compPath:" + newCompPath);
  compDirPath = path.join(...compDirPath);

  createCompFiles(
    compDirPath,
    newCompPath,
    newCompStyle,
    compName,
    compType,
    compContent,
    force
  );
}
async function setupDefaultComponent(
  currentPath,
  compName,
  compType,
  compContent,
  force
) {
  const componentDir = path.join(currentPath, "src", "components");
  const stylesDir = path.join(componentDir, "styles");
  const newCompPath = path.join(componentDir, `${compName}.${compType}`);
  const newCompStyle = path.join(stylesDir, `${compName}.css`);

  createCompFiles(
    stylesDir,
    newCompPath,
    newCompStyle,
    compName,
    compType,
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
  compContent,
  force
) {
  try {
    fs.mkdirSync(dirPath, { recursive: true });
  } catch (error) {
    console.error("❌ Failed to create directory:", error.message);
    process.exit(1);
  }

  try {
    const fileExists = fs.existsSync(newCompPath);
    const cssExists = fs.existsSync(newCompStyle);

    if (!fileExists || force) {
      fs.writeFileSync(newCompPath, compContent);
      console.log(`✅ ${fileExists ? "Overwritten" : "Created"} ${compName}`);
    } else {
      console.log(
        `⚠️  Component ${compName}.${compType} already exists! you can use --force or -f to overwrite`
      );
    }

    if (!cssExists || force) {
      fs.writeFileSync(newCompStyle, "");
      console.log(`✅ ${cssExists ? "Overwritten" : "Created"} ${compName}`);
    } else {
      console.log(
        `⚠️  Style ${compName}.css already exists!  you can use --force or -f to overwrite`
      );
    }
  } catch (error) {
    console.error("❌ Failed to write file:", error.message);
    process.exit(1);
  }
}