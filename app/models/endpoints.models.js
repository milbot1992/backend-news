const { readFile } = require('fs.promises')
const path = require('path');

exports.fetchEndpoints = () => {
    const jsonFilePath = path.join(__dirname, '../../endpoints.json');
    
    return readFile(jsonFilePath, 'utf8')
    .then((endpointsData) => {
        const endpoints = JSON.parse(endpointsData)
        return endpoints
    })
}