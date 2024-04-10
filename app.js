const express = require('express');
const app = express();
const fs = require('fs');
const sfcli = require('./sf-cli-cmds.js');

app.use(
    (req, res, next) => {

        // res.status(200).json(
        //     {
        //         message: "Acknowledged"
        //     }
        // )
        console.log('** req', req);

        console.log('** req.query.auth_token', req.query.auth_token);
        console.log('** req.query.instance_url', req.query.instance_url);
        if(req.query && req.query.auth_token && req.query.instance_url) {



            sfcli.invokeCmdSequence(req.query.auth_token, req.query.instance_url).then(
                () => {
                    const filePath = './sf-project/package.xml';
                    // Check if the file exists
                    if (!fs.existsSync(filePath)) {
                        return res.status(404).json({ error: 'File not found' });
                    }
                    else {

                        // Stream the file as response
                        const fileStream = fs.createReadStream(filePath);
                        fileStream.pipe(res);

                        // res.status(200).json({

                        // });
                    }
                });


        }
        else {
            return res.status(404).json({ error: 'query: [auth_token, instance_url] not specified' });
        }

    }
);

module.exports = app;