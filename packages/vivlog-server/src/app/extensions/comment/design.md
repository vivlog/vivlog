# Comment Module Design

The comment module is a module that allows users to comment on a resource.

Resources can be anything, but the most common use case is to comment on a post.

## Nesting

Nesting comment is not supported. This is because it is not a common use case and it make the implementation more complex.

## Local Comment and Remote Comment

Local comment refers to a comment that is posted under a local resource. For example, a comment made on a post within the same website or application.

And the like, remote comment refers to one posted under a remote resource.

## Commenting on a Local Resource

The endpoint for commenting on a resource is `/api/comment/createComment`.

The request body should be a JSON object with the following properties:

- `resource` object
  - `uuid` string, the uuid of the resource
  - `type` string, the type of the resource, for example, `post`
- `content` string, the content of the comment
- `is_guest` boolean, whether the comment is posted by a guest
- `guest_info` object, optional, only required when `is_guest` is true
  - `name` string, the name of the guest
  - `email` string, the email of the guest
  - `website` string, optional, the website of the guest

Status code 200 will be returned if the comment is successfully created.

NOTE: if the site disabled guest comment, the request will be rejected if `is_guest` is true.

## Commenting on a Remote Resource

To comment on a remote resource, the agent api should be used.

The endpoint for commenting on a resource is `/agent?action=/api/comment/createComment`.

The request body should be a JSON object with the following properties:

- `payload` object, the payload of the request, has same properties as the request body of commenting on a local resource
- `agent_options` object, the options for the agent
  - `remote_site` string, for example, `example.com/x/site1`

Status code 200 will be returned if the comment is successfully created.

## Agent API

The agent api is a special api that allows the agent to perform actions on a remote site instead of the default server.

An outgoing [connection](https://todo) from local site to remote site is required to use the agent api. Onced a connection is established, the token signed by the remote site will be stored in the database along with the remote site's url.

## How it works

When a request is made to the agent api, the server will first check if the remote site has a connection to the local site. If not, the request will be rejected.

If the remote site has a connection to the local site, the server will use the token signed by the remote site to make a request to the remote site. For example, if the agent api is used to create a comment, the server will make a request to the remote site's `/api/comment/createComment` endpoint.

To create a comment, the remote endpoint need to know the author of the comment, but the author is not really exist on the remote site. So actually, the local site will attach a virtual author to the request body (as field `_agent`), and the virtual user middleware on the remote site will setup the virtual user.

There are three types of virtual user:

- `guest`, the virtual user is a guest, no virtual user
- `user`, the virtual user is a real user on the local site
- `system`, the virtual user represents the system of the local site, so higher permission is granted

The remote virtual user middleware will check the `_agent` field in the request body, and setup the virtual user according to the type of the virtual user.
