/*
    Module: server
    Implements HTTP Server having functionalities:
    1. Serve static content for application
    2. Handle following API endpoints:
        - /register , register user to the app
        - /login    , login user to the app
*/
const http = require('http')
const url = require('url')
const fs = require('fs')

const staticContentDirPath = './static'
const defaultPage = '/index.html'
const HTTPHeaderContentTypeMap = {'html':'text/html', 'css':'text/css', 'js':'text/javascript'}
const serverPort = 3000
const serverHostname = '127.0.0.1'

// in-memory key-value store for storing user data(credentials)
// format: {"username":"password"}
const userData = {}

// callback is for event "request", EventListener = http.Server
const server = http.createServer((req, res) => {
    let parsedURL = url.parse(req.url)
    let pathname = parsedURL.pathname

    // URI with prefix /api/ are considered as API requests
    if (pathname.startsWith('/api/'))
    {
        handleAPIRequest(req, res, pathname)
        return;
    }
    // URI of the form /* are considered as static content request
    serveStaticContent(req, res, pathname)
})

function serveStaticContent(req, res, path)
{
    let parsedURL = url.parse(req.url)
    if (path == '/')
    {
        res.writeHead(301, {
            Location: 'http://'+serverHostname+':'+serverPort+defaultPage
          }).end();
        return;
    }
    let resourcePath = staticContentDirPath + (path != '/' ? path : defaultPage)
    let extension = resourcePath.split('.').pop()
    console.log('[INFO] :: %s:%d Requested static resource: %s', req.socket.remoteAddress, req.socket.remotePort, resourcePath)
    res.writeHead(200, { 'content-type': HTTPHeaderContentTypeMap.hasOwnProperty(extension) ? HTTPHeaderContentTypeMap[extension] :
     'text/plain' })
    fs.createReadStream(resourcePath).pipe(res)
}

// API handler
/*
    Message format: json
    API:
    1. endpoint: /register, method: POST
    Description: Register user to the app.
    Request message: {"username": "string", "password": "string"}
    
    Response Status codes:
    200 - success
    405 - user already registered
    404 - client error
    
    2. endpoint: /login, method: POST
    Description: Login user to the app.
    Request message: {"username": "string", "password": "string"}

    Response Status codes:
    200 - success
    401 - invalid credentials
    404 - no such user
*/
function handleAPIRequest(req, res, path)
{
    let endpoint = path.substring(5)
    let requestBody = ''
    
    if (req.method == 'GET')
    {
        res.statusCode = 200
        res.end()
    }
    else if (req.method == 'POST')
    {
        if (endpoint == 'register')
        {
            console.log('[DBG] :: %s:%d requested /register endpoint', req.socket.remoteAddress, req.socket.remotePort)
            req.on('data', (data) => {
                requestBody += data
                console.log('[DEBUG] :: ', requestBody, typeof requestBody, requestBody.length)
            })
            req.on('end',(data) => {
                requestJson = JSON.parse(requestBody)
                if (!(requestJson['username'] in userData))
                {
                    userData[requestJson['username']] = requestJson['password']
                    console.log('[INFO] :: Registered new User = ', requestJson['username'])
                    res.statusCode = 200
                    res.end()
                }
                else 
                {
                    res.statusCode = 405 // not allowed to register
                    res.end()
                    console.log('[ERROR] :: Already registered User = ', requestJson['username'])
                }
                
            })
            req.on('error', (data) =>{
                res.statusCode = 404
                res.end()
            })
        }
        else if (endpoint == 'login')
        {
            console.log('[DBG] :: %s:%d requested /login endpoint', req.socket.remoteAddress, req.socket.remotePort)
            req.on('data', (data) => {
                requestBody += data
                console.log('[DEBUG] ::', requestBody, typeof requestBody, requestBody.length)
            })
            req.on('end',(data) => {
                requestJson = JSON.parse(requestBody)
                if (!(requestJson['username'] in userData))
                {
                    res.statusCode = 404 // no such user / user not found
                    res.end()    
                    console.log('[ERROR] :: No such User = ', requestJson['username'])
                }
                else
                {
                    if (requestJson['password'] == userData[requestJson['username']])
                    {
                        res.statusCode = 200
                        res.end()    
                        console.log('[INFO] :: Logged in User = ', requestJson['username'])
                    }
                    else
                    {
                        res.statusCode = 401
                        res.end()
                        console.log('[ERROR] :: Login failed for User = ', requestJson['username'])
                    }
                }
            })
            req.on('error', (data) =>{
                res.statusCode = 404
                res.end()
            })
        }
    }    
}

// callback is for event "connection", EventListener = http.Server
server.on('connection', (socket) => {
    console.log('[INFO] :: Accepted connection %s:%d', socket.remoteAddress, socket.remotePort)
})

// callback is for event "listening", EventListener = net.Server(http.Server)
server.listen(serverPort, serverHostname, () => {
    console.log('[INFO] :: Server started listening on %s:%d', server.address().address, server.address().port)
})
