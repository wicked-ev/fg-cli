import fg from 'fg';
import { autocomplete, confirm} from "@clack/prompts";
import path from 'path';
import chalk from 'chalk';
export async function addRoute() {
    // fg route routeName routeComp
    //     - check if comp exists 
    //         - if yes we have to import to the route export
    //             - i need to scan the directory for jsx file
    //                 - with exception for some directories (node modules, testing etc);
    //                 - or i can just list all the comps to select one
    //         - if no we have to let him know before adding that route
    
    const currentPath = process.cwd();
    const files = await fg([`**/*.${fileType}`,'!node_modules/**', '!.git/**'], { dot: true });
    
    const options = [{value:null, label: 'enter custom component name'}];
    
    if(files.length >= 1) {
        for (const file of files) {
            options.push({value:file, label: path.basename(file)})
        }
        const comp = await autocomplete(
            {
                message: 'Select Components',
                options: options,
                placeholder: 'Type to search...',
                maxItems: 5,
            });
    } else {
        const makeCustom = await confirm({
            message:'No .jsx files found. Do you want to specify a custom name?'
        })
        if(!makeCustom) {
            console.log(chalk.red("Operation canceled"));
            process.exit(1);
        }
        
    }
    


}