/**
 * Will invoke cm cmds in a sequence to
 *  1. Set Auth token as env variable
 *  2. Authorize and make an alias for the auth. org
 *  3. Run the cmd to 1st delete any existing "package.xml" files under "sf-project" folder
 *  4. Run the cmd to generate the orgs whle package.xml fiel with the help of "sf" npm
 *  5. Successfully terminate the process and return with success
 */
const { exec } = require('child_process');

let auth_token = '';
let instance_url = '';

function invokeCmdSequence(auth_token, instance_url) {

    if(auth_token && instance_url) {

        /**
         * 0. Delete Auth token as env variable
         */
        const deleteEnvAuthToken = 'unset SF_ACCESS_TOKEN';
        execute(deleteEnvAuthToken);

        /**
         * 1. Set Auth token as env variable
         */
        const setEnvAuthToken = 'export SF_ACCESS_TOKEN=' + '\'' + auth_token  + '\'';
        execute(setEnvAuthToken);


        /**
         * 2. Authorize and make an alias for the auth. org
         */
        const setAlias = 'sf org login access-token -r ' + instance_url + ' -a orgAlias';
        execute(setAlias);

        /**
         * 3. Run the cmd to 1st delete any existing "package.xml" files under "sf-project" folder
         */
        const deletePkgXMlFile = 'del package.xml';
        execute(deletePkgXMlFile);

        /**
         * 4. Run the cmd to generate the orgs whle package.xml fiel with the help of "sf" npm
         */
        const genPkgXml = 'sf project generate manifest --from-org orgAlias ./sf-project/';
        execute(genPkgXml);
    }
}


/**
 *
 * Helper functions
 */

// Execute the command
function execute(command) {

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
}
