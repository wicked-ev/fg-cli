import path from "path";
import { confirm } from "@clack/prompts";
import fs from 'fs';



export async function createHook(hookName,ignore) {
    //first check if name is valid 
    let hook = "use" +  hookName[0].toUpperCase() + name.slice(1);
    const currentPath = process.cwd();
    //use fast glob too look for the directory
    //or this works ? 
    const hookDir = path.join(currentPath,"hooks");
    if (!fs.existsSync(hook)) {
        const createHookDir = await confirm({
            message: "no hooks directory was found. would you like to create one with your hook in it?"
        }); 

        if (createHookDir) {
            // do it here 
        } else {
            const createWithNoDir = await confirm({
                message: "create hook in this directory"
            })

            if(createWithNoDir) {
                //handel it here
            }
        }
    }
    //check for hook directory
        //if yes create there
        //if no ask user if we should create one 
            //add --ignore option to create the hook without the hook directory

}