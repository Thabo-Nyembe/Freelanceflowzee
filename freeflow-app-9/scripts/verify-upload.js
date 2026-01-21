
const fs = require('fs');
const path = require('path');

// Create a dummy file to upload
const testFilePath = path.join(__dirname, 'test-upload.txt');
fs.writeFileSync(testFilePath, 'This is a test file for Files Hub verification.');

async function verifyUpload() {
    const FormData = (await import('formdata-node')).FormData;
    const { fileFromPath } = await import('formdata-node/file-from-path');
    const fetch = (await import('node-fetch')).default;

    const form = new FormData();
    form.append('files', await fileFromPath(testFilePath));
    form.append('folderId', ''); // Root folder

    console.log('Attempting upload to http://localhost:9323/api/files-hub...');

    try {
        const response = await fetch('http://localhost:9323/api/files-hub', {
            method: 'POST',
            body: form,
            // Note: node-fetch / formdata-node handles boundaries automatically
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Upload successful!');
            console.log('Response:', JSON.stringify(data, null, 2));
        } else {
            console.error('Upload failed with status:', response.status);
            const text = await response.text();
            console.error('Response:', text);
        }
    } catch (error) {
        console.error('Error during upload verification:', error.message);
    } finally {
        // Cleanup
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
        }
    }
}

verifyUpload();
