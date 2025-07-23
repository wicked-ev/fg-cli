import path, { join } from 'path'
import fs from 'fs';
import { select } from '@clack/prompts';
// get the path were it was called for 
// search for comp dir -> should i make one than add to it? 
// if comp already exist 

export async function createComp (name, force = false, compType = 'jsx', ignoreDefault) {
    
    const compName = name[0].toUpperCase() + name.slice(1);
    let compContent = `import './styles/${compName}.css';

export default function ${compName}() {

    return (<></>);
}`; 

    //look for compe folder if found place compe there 
    //if not look for style folder if found place css sheet there 
    //if not just place them about in the same current dirctory     
    const currentPath = process.cwd();

    if (!ignoreDefault) {
        setupDefaultComponent(currentPath,compName,compType,compContent,force);

    } else {

        const srcDir = await select({
            message: 'create src directory', 
            options: [
                {value:false, label:'no'},
                {value:true, label:'yes'},
            ], 
        });
        const compDir = await select({
            message: 'create components directory', 
            options: [
                {value:false, label:'no'},
                {value:true, label:'yes'},
            ], 
        });
        
        const stylesDir = await select({
            message: 'create styles directory', 
            options: [
                {value:false, label:'no'},
                {value:true, label:'yes'},
            ], 
        });

        let compDirPath = [currentPath];
        let newCompPath = currentPath;
        let newCompStyle = currentPath;
        
        if (srcDir) {
            compDirPath.push('src');
        }
        if (compDir) {
            compDirPath.push('components');
            newCompPath = path.join(...compDirPath, `${compName}.${compType}`);
        }

        if (stylesDir) {
            compDirPath.push('styles');
            newCompStyle = path.join(...compDirPath, `${compName}.css`);
        } else {
            compContent = `import './${compName}.css';

export default function ${compName}() {

    return (<></>);
}`
        }
        
        compDirPath = path.join(...compDirPath);
        
        fs.mkdirSync(compDirPath, {recursive: true});
        
        const fileExists = fs.existsSync(newCompPath);
        const cssExists = fs.existsSync(newCompStyle);

        if (!fileExists || force) {
            fs.writeFileSync(newCompPath, compContent);
            console.log(`✅ ${fileExists ? 'Overwritten' : 'Created' } ${compName}`);
        } else {
             console.log(`⚠️  Component ${compName}.${compType} already exists!`);
        }

        if(!cssExists || force) {
            fs.writeFileSync(newCompStyle, '');
            console.log(`✅ ${cssExists ? 'Overwritten' : 'Created' } ${compName}`);
        } else {
            console.log(`⚠️  Style ${compName}.css already exists!`);
        }
    }
} 

function setupDefaultComponent(currentPath,compName,compType,compContent,force){
        
        const componentDir = path.join(currentPath, 'src', 'components');
        const stylesDir = path.join(componentDir, 'styles');
        const newCompPath = path.join(componentDir, `${compName}.${compType}`);
        const newCompStyle = path.join(stylesDir, `${compName}.css`);
    
        fs.mkdirSync(stylesDir, {recursive: true});
    
        const fileExists = fs.existsSync(newCompPath);
        const cssExists = fs.existsSync(newCompStyle);
    
        if (!fileExists || force) {
            fs.writeFileSync(newCompPath, compContent);
            console.log(`✅ ${fileExists ? 'Overwritten' : 'Created' } ${compName}`);
        } else {
            console.log(`⚠️  Component ${compName}.${compType} already exists!`);
        }
        
        if(!cssExists || force) {
            fs.writeFileSync(newCompStyle, '');
            console.log(`✅ ${cssExists ? 'Overwritten' : 'Created' } ${compName}`);
        } else {
            console.log(`⚠️  Style ${compName}.css already exists!`);
        }
}
/*
fg -c Task


*/