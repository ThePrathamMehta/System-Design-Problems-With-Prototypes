Design a Load Balancer

<!--ts-->
Design a Load Balancer
Problem Statement
Requirements
Core Requirements
System-Level Considerations
Low-Level Considerations
Deliverables
Design Document
Prototype
Suggested Tech Stack
Important Notes
Learning Outcome
<!--te-->
Problem Statement

Build a Load Balancer that distributes incoming client requests across multiple backend servers efficiently and reliably.

The system should act as a reverse proxy, meaning clients interact only with the load balancer, and it forwards requests to backend services transparently.

Your load balancer should be capable of handling high traffic, intelligently routing requests, and ensuring that no single backend server becomes a bottleneck or point of failure.

Requirements
Core Requirements
Accept incoming TCP connections from clients
Forward each request to one of the available backend servers
Support dynamic registration and deregistration of backend servers
Continuously check health of backend servers and avoid routing to unhealthy ones
Implement pluggable load balancing strategies, such as:
Round Robin
Least Connections
Random Selection
Expose basic metrics like:
Active connections
Requests per server
Failed requests
Handle high concurrency (thousands to millions of connections)
System-Level Considerations
Ensure high availability (no single point of failure)
Design for horizontal scalability
Define behavior during:
Server failures
Sudden traffic spikes
Optimize for cost vs performance trade-offs
Think about how DNS or external systems will route traffic to your load balancer
Consider how multiple load balancers could work together (optional but valuable)
Low-Level Considerations
Ensure thread-safe operations when handling shared state (like connection counters)
Avoid race conditions when updating backend server status
Minimize locking overhead to maintain high throughput
Prevent deadlocks in concurrent environments
Handle timeouts and retries gracefully
Deliverables
Design Document

Create a detailed design document that includes:

System architecture and components
Request flow (client → load balancer → backend)
Load balancing algorithm design
Health check mechanism
Failure handling strategy
Bottlenecks and trade-offs
Scaling approach

Keep the design simple, practical, and realistic. Avoid unnecessary complexity—focus on clarity and correctness.

Prototype

Build a working prototype of the load balancer with the following features:

Accepts real TCP/HTTP requests
Routes traffic to backend servers
Allows:
Adding/removing servers at runtime
Viewing server health status
Monitoring basic metrics
Switching load balancing strategy dynamically
Changes should apply without restarting the system
Suggested Tech Stack
Component	Options
Language	Go, Java, C++, Node.js (with worker threads)
Networking	Native sockets / net libraries
Metrics	Prometheus (optional)
Important Notes
Be mindful that network calls are blocking by default
Efficient concurrency handling is critical
Focus on correctness first, then optimize for performance
Learning Outcome

By completing this problem, you will gain:

Deep understanding of how load balancers work internally
Experience with network programming and TCP handling
Hands-on practice with concurrency and multi-threading
Insight into scalable system design principles

If you want, I can also:

Review your load balancer code
Add real interview-style constraints
Or 
convert this into a GitHub-ready README with diagrams 