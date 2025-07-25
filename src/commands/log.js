import chalk from 'chalk';

export const success = msg => console.log(chalk.green(`✔ ${msg}`));
export const error = msg => console.log(chalk.red(`✖ ${msg}`));
export const warning = msg => console.log(chalk.yellow(`⚠ ${msg}`));
export const info = msg => console.log(chalk.cyan(`ℹ ${msg}`));
