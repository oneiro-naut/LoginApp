/*
    Application client implemented using XHR(AJAX).
    XHR is used to make API/HTTP requests without having to reload the page.
    It can be done both synchronously and asynchronously.
    
    There are other easier ways to do API/HTTPRequests: 
    1. jQuery, an external library, wrapper around XHR to make it more convenient
    2. fetch API, part of standard Browser/Web API, replacement for AJAX/XHR
    3. Axios, an external library, promise based library which can be used on either backend(node) or frontend(browser) 
*/

function doLogin(form)
{
    var username = form.elements["username"].value;
    var password = form.elements["password"].value;
    
    // json object sent in the request
    var requestObj = {"username": username, "password" : password}
    
    // create XHR(ie httpClient) object
    var http = new XMLHttpRequest();
    var url = 'http://127.0.0.1:3000/api/login';
    http.open('POST', url, true);

    // Send the proper header information along with the request
    http.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
    
    // callback for event: "readystatechange"
    http.onreadystatechange = function() 
    {
        if (http.readyState == XMLHttpRequest.DONE)
        {
            if (http.status == 200)
            {
                console.log('[INFO] :: User login successful!');
                alert('Logged in successfully.')
            }
            else if (http.status == 401)
            {
                console.error('[INFO] :: Invalid credentials!')
                alert('Invalid credentials!')
            }
            else if (http.status == 404)
            {
                console.error('[INFO] :: User not registered.')
                alert('User not registered!')
            }
        }
    }

    // send HTTP request
    http.send(JSON.stringify(requestObj));
    //return false;
}

function doRegister(form)
{
    var username = form.elements["username"].value;
    var password = form.elements["password"].value;
    var requestObj = {"username": username, "password" : password}
    
    // create XHR(ie httpClient) object
    var http = new XMLHttpRequest();
    var url = 'http://127.0.0.1:3000/api/register';
    http.open('POST', url, true);
    
    http.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
    http.onreadystatechange = function()
    {
        if (http.readyState == XMLHttpRequest.DONE)
        {
            if (http.status == 200)
            {
                console.log('[INFO] :: User registration successful!');
                alert('Registered successfully.')
            }
            else if (http.status == 405)
            {
                console.error('[INFO] :: User already registered!')
            }
            else if (http.status == 404)
            {
                console.error('[XHR] Unknown error. Possibly request couldn\'t be sent properly.')
            }
        }
    }
    http.send(JSON.stringify(requestObj));
    //return false;
}
