const fs = require('fs');

router.pst('/get-file', () => {

    const filePath = '../../sf-project/package.xml';
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }
    else {

        // Stream the file as response
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        res.status(200).json({

        });
    }
});