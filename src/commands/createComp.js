import path from 'path'
import fs from 'fs';
// get the path were it was called for 
// serach for comp dir -> should i make one than add to it? 
// if comp already exsit  

export function createComp (name, force = false, compType = 'jsx') {
    
    const compName = name[0].toUpperCase() + name.slice(1);
    const compContent = `import './styles/${compName}.css';

export default function ${compName}() {

    return (<></>);
}`

    
    const currentPath = process.cwd();
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