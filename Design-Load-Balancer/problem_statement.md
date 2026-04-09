# Design a Load Balancer

---

## Problem Statement

Build a **Load Balancer** that efficiently distributes incoming client requests across multiple backend servers.

The system should behave like a **reverse proxy**, meaning:
- Clients only interact with the load balancer
- The load balancer forwards requests to backend servers transparently

Your goal is to ensure:
-  High performance
-  Scalability
-  Fault tolerance

---

##  Requirements

>  Feel free to extend these requirements based on your design decisions.

---

### 🔹 Core Requirements

- Accept incoming **TCP connections**
- Forward each request to a backend server
- Support **dynamic addition/removal** of backend servers
- Perform **health checks** on backend servers
- Avoid routing to unhealthy servers
- Support multiple **load balancing strategies**:
  - Round Robin
  - Least Connections
  - Random
- Expose **metrics**:
  - Active connections
  - Requests per server
  - Error rate
- Handle **high concurrency** (thousands → millions of connections)

---

###  System-Level Considerations

- Ensure **high availability** (no single point of failure)
- Support **horizontal scaling**
- Handle:
  - Backend server failures
  - Traffic spikes
- Optimize for **cost vs performance**
- Consider how **DNS** or external systems route traffic
- Think about multiple load balancers working together

---

###  Low-Level Considerations

- Ensure **thread safety**
- Prevent **race conditions**
- Avoid **deadlocks**
- Minimize **locking overhead**
- Handle **timeouts and retries**

---

##  Deliverables

---

###  Design Document

Create a document explaining:

-  System architecture
-  Request flow (Client → LB → Backend)
-  Load balancing algorithm
-  Health check mechanism
-  Failure handling
-  Bottlenecks & trade-offs
-  Scaling strategy

>  Keep it simple. Avoid over-engineering.

---

###  Prototype

Build a working load balancer with:

- Real request handling (TCP/HTTP)
- Traffic routing to backend servers
- Runtime controls:
  - Add/remove servers
  - View server health
  - Monitor metrics
  - Change strategy dynamically

>  No restart should be required for changes

---

### 💻 Suggested Tech Stack

| Component  | Options |
|-----------|--------|
| Language  | Go / Java / C++ / Node.js |
| Networking | Native sockets |
| Metrics   | Prometheus (optional) |

---

###  Important Notes

- System calls can be **blocking**
- Concurrency handling is **critical**
- Focus on **correctness first**, then optimize

---

##  Learning Outcome

By completing this, you will learn:

-  How load balancers work internally
-  Network programming basics
-  Concurrency & multi-threading
-  Scalable system design

---

## Bonus (Optional)

- Add a UI dashboard for metrics
- Implement weighted load balancing
- Add rate limiting

---

*Tip: A good system design is simple, scalable, and easy to reason about.*