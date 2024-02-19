Test the cron
npx wrangler dev --test-scheduled
http://localhost:8787/__scheduled?cron=0+*+*+*+*

# RoomBalancer

This project integrates a Cloudflare Worker to enhance load balancing efficiency by directly leveraging Cloudflare's capabilities. It uses 302 redirects for temporary redirections and employs Cloudflare's Cache API for optimized content delivery.
Worker used to move the room balancer logic directly into cloudflare for improved performance

Workflow meet.aptero.co => Worker => if room type loadbalancer logic else just redirect (see pptx for more details)

## Getting Started

### Development

To start the development server:

```bash
npm run start
```

This command is configured to execute `wrangler dev`, setting up a local development server. Open a browser and visit http://localhost:8787/ to see the worker in action.

### Deployment

To publish your worker to Cloudflare:

```bash
npm run deploy
```
look at wrangler.toml for the configuration of the deployment
This command is set up to run `wrangler publish`, publishing your worker to Cloudflare.

## Documentation and Useful Links

- Cloudflare Workers: [Cloudflare Developers](https://developers.cloudflare.com/workers/)
- Redirects with Cloudflare Workers: [302 Redirect](https://developers.cloudflare.com/workers/examples/redirect/)
- 301 vs. 302 Redirects: [301 vs. 302 Redirect](https://rockcontent.com/blog/301-vs-302-redirect/)
- Using Cloudflare Workers Cache API: [Cache API](https://developers.cloudflare.com/workers/examples/cache-api/)

## Workflow Description

Requests to `meet.aptero.co` are processed by the Worker. Depending on the request type, load balancer logic is applied, or a redirection occurs. Refer to the PowerPoint presentation for a detailed description of the logic.

## Configuration

### Nginx Configuration Example

Below is an example Nginx configuration for setting up Cloudflare room balancing:

```nginx
location ~ "^/[0-9a-zA-Z]{7}/" {
    if ($http_x_room_balancer) {
        proxy_pass http://10.11.0.6;
        break;
    }
    proxy_set_header fetchhost $host;
    proxy_pass http://room-balancer.aptero.workers.dev;
}
```

### Worker Implementation Details

The Cloudflare Worker is implemented to manage request routing based on dynamic load balancing logic. It utilizes Durable Objects to manage state across requests. Here's a brief overview of the worker's functionality:

- **Room Balancing:** Dynamically routes users to the least loaded instance of a room to evenly distribute traffic.
- **Instance Management:** Keeps track of each room instance, including user count, to make informed routing decisions.
- **Dynamic Instance Creation:** Automatically creates new instances as needed based on load.

For more in-depth information on the implementation, refer to the Cloudflare Workers documentation and the examples linked above.

## Additional Resources

- Durable Objects: [Blog Post on Durable Objects](https://blog.cloudflare.com/durable-objects-easy-fast-correct-choose-three/)

## Debugging Your Worker

use that to be redirected http://127.0.0.1:8787/cvQqMeF/room

Debugging the Cloudflare Worker, especially its Durable Object (DO) operations, is essential for diagnosing and understanding the behavior of your application. You can initiate debugging operations directly through the URL by appending a `debug` query parameter with the specific command you wish to execute.

### How to Debug Durable Object Operations

Debugging is performed by appending the `debug` query parameter to your request URL. The available commands based on your provided code are:

- **Ping**: Verifies that the Durable Object is responsive.
    - Example: `http://127.0.0.1:8787/cvQqMeF/room?debug=ping`

- **Reset**: Resets the state within the Durable Object by clearing its storage.
    - Example: `http://127.0.0.1:8787/cvQqMeF/room?debug=reset`

- **Entry**: Retrieves specific room data from the Durable Object's storage.
    - To use this, you'll need to ensure the room ID is part of the path or handle it through internal logic since it's not directly specified through the debug parameter.
    - Example: `http://127.0.0.1:8787/cvQqMeF/room?debug=enty`

- **List**: Lists all data entries within the Durable Object's storage.
    - Example: `http://127.0.0.1:8787/cvQqMeF/room?debug=list`

- **Compute URL (Enter)**: Shows how the load balancing logic determines the routing for a request.
    - This operation is internally triggered and may not directly correspond to a simple `debug` parameter but is an essential part of the load balancing logic you might want to test indirectly through other debug operations.
    - Example: `http://127.0.0.1:8787/cvQqMeF/room?debug=COMPUTE_URL`

## Room Balancer Logic
https://alphahub.aptero.co/service/loadbalancer/meta?url=https%3A%2F%2Falphahub.aptero.co%2FzdBzwbV%2Fwowza-live-stream-test

## kwown Room Balancer Services
Armin /workspace/config/meet-aptero/microservice/load-balancer/
Pixis /workspace/config/apterodevhub/microservice/load-balancer/

## Notes

This README aims to provide a comprehensive guide for developing and deploying your Cloudflare Worker. It includes essential documentation links and instructions for both local development and deployment to Cloudflare.
