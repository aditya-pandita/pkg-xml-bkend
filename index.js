const { exec } = require('child_process');

// Command to execute
const command = 'ls -l';

// Execute the command
exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error executing the command: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`Command execution error: ${stderr}`);
        return;
    }
    console.log(`Command output:\n${stdout}`);
});