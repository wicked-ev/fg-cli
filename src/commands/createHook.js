import path from "path";
import { confirm } from "@clack/prompts";
import fs from 'fs';


const hookTemplate = (hookName) => {
   
    return `import { useState, useEffect } from 'react';
    
    export default function ${hookName}() {
        return 0;  
    }`;
}

function createHookFile(hookName, hookDir) {
  const filePath = path.join(hookDir, `${hookName}.js`);
  fs.writeFileSync(filePath, hookTemplate(hookName), 'utf-8');
}

export async function createHook(hookName, ignore) {
  const hook = "use" + hookName[0].toUpperCase() + hookName.slice(1);
  const hookDir = path.join(process.cwd(), "hooks");

  if (!fs.existsSync(hookDir)) {
    if (!ignore) {
      fs.mkdirSync(hookDir, { recursive: true });
      createHookFile(hook, hookDir);
    } else {
      const createHookDir = await confirm({
        message: "No hooks directory found. Create one?"
      });
      if (createHookDir) {
        fs.mkdirSync(hookDir, { recursive: true });
        createHookFile(hook, hookDir);
      } else {
        createHookFile(hook, process.cwd());
      }
    }
  } else {
    createHookFile(hook, hookDir);
  }
}
