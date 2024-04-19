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

    try {
        const os = require('os');

        const platform = os.platform();
        let envVariableInitCmd = 'export';
        let envVariableRevokeCmd = 'unset SF_ACCESS_TOKEN';
        let envDelCmd = 'del';

        if (platform === 'darwin') {/** Mac OS */

            envVariableInitCmd = 'export';
            envVariableRevokeCmd = 'unset SF_ACCESS_TOKEN=';
            envDelCmd = 'rm';
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
            console.log('** Platform :           ', platform);
        }

        console.log('** Platform :           ', platform);

        if(auth_token && instance_url) {
            execute('echo $SF_ACCESS_TOKEN');
            // genShell(envVariableInitCmd, auth_token);
            console.log('** process.env.SF_ACCESS_TOKEN  ->', process.env.SF_ACCESS_TOKEN);
            process.env.SF_ACCESS_TOKEN = auth_token;
            console.log('** process.env.SF_ACCESS_TOKEN  ->', process.env.SF_ACCESS_TOKEN);

            /**
             * 0. Delete Auth token as env variable
             */
            console.log(`** Start: Delete existing Access Token`);
            const deleteEnvAuthToken = envVariableRevokeCmd;
            execute(deleteEnvAuthToken);
            execute('echo $SF_ACCESS_TOKEN');
            console.log(`** Finish: Delete existing Access Token`);

            /**
             * 1. Set Auth token as env variable
             */
            console.log(`** Start: Setting Auth Token as env variable`);
            const setEnvAuthToken = envVariableInitCmd + ' SF_ACCESS_TOKEN=' + '\'' + auth_token  + '\'';
            execute(setEnvAuthToken);
            execute('echo $SF_ACCESS_TOKEN');
            console.log(`** Finish: Setting Auth Token as env variable`);

            /**
             * 2. Authorize and make an alias for the auth. org
             */
            console.log(`** Start: Set Alias for the Org`);
            const setAlias = 'sf org login access-token -r ' + instance_url + ' -a orgAlias';
            await execute(setAlias);
            console.log(`** Finish: Set Alias for the Org`);

            /**
             * 3. Run the cmd to 1st delete any existing "package.xml" files under "sf-project" folder
             */
            console.log(`** Start: Delete existing Package.xml file`);
            const filePath = './sf-project/package.xml';
            // Check if the file exists
            if (fs.existsSync(filePath)) {
                const deletePkgXMlFile = envDelCmd + ' package.xml';
                await execute(`cd ${'./sf-project'} && ${deletePkgXMlFile}`);
            }
            console.log(`** Finish: Delete existing Package.xml file`);

            /**
             * 4. Run the cmd to generate the orgs whle package.xml fiel with the help of "sf" npm
             */
            console.log(`** Start: Retrieving Package.xml`);
            const genPkgXml = 'sf project generate manifest --from-org orgAlias';
            await execute(`cd ${'./sf-project'} && ${genPkgXml}`);
            console.log(`** Finish: Retrieving Package.xml file`);

            console.log(`Finished execution`);

        }
    }
    catch(error) {

        console.error('** Error occurred:', error);
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
