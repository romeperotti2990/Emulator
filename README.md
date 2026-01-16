## To run:

1. `docker build -t react-emulator .`
2. `docker run -p 3001:3001 react-emulator`
3. `node server.js`
4. Go to localhost:3001

## Swarm Deployment

To deploy and manage the stack:

1. Deploy the stack: `docker stack deploy -c docker-compose.yaml emulator`
2. Scale the first service to 7 replicas: `docker service scale emulator_web1=7`
3. Remove the stack and delete containers: `docker stack rm emulator`