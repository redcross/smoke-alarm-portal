# How to update requests via API

Currently, on the `196-api-integration` branch, one endpoint has been
enabled: `[SERVER_ROOT]/admin/requests/status/[SERIAL_NUMBER]`.  That
endpoint allows an external service to update the status of a given
smoke alarm request (the request is determined by its serial number, as
given in the URL).


Here's an example `curl` call that updates the status of a request:

`$ curl -H "application/json" -H "Authorization:__SOME_TOKEN__" -X POST -d [SOME JSON] [SERVER_ROOT]/admin/requests/status/[SERIAL_NUMBER]`


The JSON data you send should look like this:

```
{
  "acceptance": true,
  "status": "completed"
}
```

(We take the serial number, which is unique, from the URL parameter.)

In the JSON: "acceptance" is a boolean that expresses whether or not the
external service is going to be tracking this request, the status is the
new status of the request (we expect values "new," "inprogress,"
"complete," or "canceled," though those aren't enforced on our side
yet).

The API token is passed in the Authorization header.

If your request is successful, you'll get back a request object like
this:

```
{
    "id":229,
    "name":"Test 12",
    "address":"This is a test",
    "sms_raw_address":null,
    "assigned_rc_region":"CHNI",
    "city":"Chicago",
    "state":"Illinois",
    "zip":"60601",
    "sms_raw_zip":null,
    "phone":"444-555-3534",
    "sms_raw_phone":null,
    "email":"",
    "source":"web",
    "serial":"CHNI-17-00068",
    "status":"completed",
    "external_tracking":true,
    "createdAt":"2016-10-03T19:40:20.691Z",
    "updatedAt":"2016-10-04T20:45:15.557Z",
    "selected_county":null
}
```

Otherwise you should get one of these errors:

```
{
    "error":
    {
        "errors":
            [{
                "code":"QUERY_PROBLEM",
                "message":"Sorry, we had a problem accepting this status change.  Please try again."
            }]
    }
}
```

Or:

```
{
    "error":
        {
            "errors":
                [{
                    "code":"ACCESS_DENIED",
                    "message":"Please pass a valid token to access this content."
                }]
        }
}
```

These errors follow the Google style guide, though the data response
doesn't yet.

This is all implemented on the [#196 branch in our
repo](https://github.com/redcross/smoke-alarm-portal/tree/196-api-integration).

