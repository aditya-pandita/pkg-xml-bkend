/**
 * Will invoke cm cmds in a sequence to
 *  1. Set Auth token as env variable
 *  2. Authorize and make an alias for the auth. org
 *  3. Run the cmd to 1st delete any existing "package.xml" files under "sf-project" folder
 *  4. Run the cmd to generate the orgs whle package.xml fiel with the help of "sf" npm
 *  5. Successfully terminate the process and return with success
 */
const fs = require('fs');
const { exec } = require('child_process');

let auth_token = '';
let instance_url = '';

async function invokeCmdSequence(auth_token, instance_url) {

    const os = require('os');

    const platform = os.platform();
    let envVariableInitCmd = 'export';
    let envVariableRevokeCmd = 'unset SF_ACCESS_TOKEN';
    let envDelCmd = 'del';

    if (platform === 'darwin') {/** Mac OS */

        envVariableInitCmd = 'export';
        envVariableRevokeCmd = 'unset SF_ACCESS_TOKEN=';
    }
    else if (platform === 'win32') {/** Windows */

        envVariableInitCmd = 'set';
        envVariableRevokeCmd = 'set SF_ACCESS_TOKEN=';
        envDelCmd = 'del';
    }
    else if (platform === 'linux') {/** Linux */

        envVariableInitCmd = 'export';
        envVariableRevokeCmd = 'unset SF_ACCESS_TOKEN';
        envDelCmd = 'rm';
    }
    else {
        console.log('Unknown OS');
    }

    if(auth_token && instance_url) {
        execute('echo $SF_ACCESS_TOKEN');
        // genShell(envVariableInitCmd, auth_token);
        console.log('** process.env.SF_ACCESS_TOKEN  ->', process.env.SF_ACCESS_TOKEN);
        process.env.SF_ACCESS_TOKEN = auth_token;
        console.log('** process.env.SF_ACCESS_TOKEN  ->', process.env.SF_ACCESS_TOKEN);

        /**
         * 0. Delete Auth token as env variable
         */
        const deleteEnvAuthToken = envVariableRevokeCmd;
        execute(deleteEnvAuthToken);
        execute('echo $SF_ACCESS_TOKEN');

        /**
         * 1. Set Auth token as env variable
         */
        const setEnvAuthToken = envVariableInitCmd + ' SF_ACCESS_TOKEN=' + '\'' + auth_token  + '\'';
        execute(setEnvAuthToken);

        execute('echo $SF_ACCESS_TOKEN');

        /**
         * 2. Authorize and make an alias for the auth. org
         */
        const setAlias = 'sf org login access-token -r ' + instance_url + ' -a orgAlias';
        await execute(setAlias);

        /**
         * 3. Run the cmd to 1st delete any existing "package.xml" files under "sf-project" folder
         */
        const filePath = './sf-project/package.xml';
        // Check if the file exists
        if (fs.existsSync(filePath)) {
            const deletePkgXMlFile = envDelCmd + ' package.xml';
            await execute(`cd ${'./sf-project'} && ${deletePkgXMlFile}`);
        }

        /**
         * 4. Run the cmd to generate the orgs whle package.xml fiel with the help of "sf" npm
         */
        const genPkgXml = 'sf project generate manifest --from-org orgAlias';
        await execute(`cd ${'./sf-project'} && ${genPkgXml}`);

        console.log(`Finished execution`);

    }
}


/**
 *
 * Helper functions
 */

// Execute the command
function execute(command) {

    return new Promise((resolve, reject) => {

        exec(command, (error, stdout, stderr) => {
            if (error) {

                console.error(`Error executing the command: ${error.message}`);
                reject(error);
                // return;
            }
            if (stderr) {

                console.error(`Command execution error: ${stderr}`);
                reject(error);
                // return;
            }
            if(stdout) {

                resolve(stdout);
            }
            console.log(`Command output:  -------->\n${stdout}<--------------`);
        });
    });

}

function genShell(envVariableInitCmd, auth_token) {

    // Content of the shell script
    const shellScriptContent = `
    #!/bin/bash

    ${envVariableInitCmd} SF_ACCESS_TOKEN=\'${auth_token}\'
    `;

    // File path for the shell script
    const filePath = 'script.sh';

    // Write the content to the file
    fs.writeFile(filePath, shellScriptContent, (err) => {
    if (err) {
        console.error('Error writing shell script:', err);
    } else {
        console.log('Shell script created successfully.');
    }
    });
}

module.exports = {
    invokeCmdSequence: invokeCmdSequence
};
