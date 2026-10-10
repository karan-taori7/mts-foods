# Running MT's Foods on Kubernetes

What's deployed: Postgres, the REST API (`backend`, 2 replicas), a gRPC
service (`grpc`, 2 replicas, same image/codebase as `backend`, mirrors the
product catalog plus an order-status lookup), the React frontend (nginx,
2 replicas, proxies API routes to `backend`), and Prometheus + Grafana for
observability — Prometheus scrapes `backend`'s `/metrics`, Grafana comes
up with Prometheus pre-wired as a datasource.

## Local (k3d) — verified working

Everything below was actually run end-to-end against a local k3d cluster,
not just authored: 9 pods, all `Running`, zero restarts; REST, gRPC,
Prometheus scrape target, and the Grafana datasource all confirmed live.

### 1. Prerequisites

```bash
brew install k3d        # local Kubernetes on top of Docker
docker --version         # Docker Desktop must be running
kubectl version --client
```

### 2. Create the cluster

```bash
k3d cluster create mts-foods --servers 1 --agents 1 --wait
```

### 3. Build and import the images

k3d clusters don't share Docker Desktop's image cache automatically —
images have to be explicitly imported.

```bash
docker build -t mts-foods-backend:local .
docker build -t mts-foods-frontend:local ./frontend
k3d image import mts-foods-backend:local mts-foods-frontend:local -c mts-foods
```

Re-run both commands after any code change, then `kubectl rollout restart
deployment/backend -n mts-foods` (and `grpc`, `frontend` as needed) to pick
up the new image — `imagePullPolicy: IfNotPresent` means Kubernetes won't
re-pull on its own.

### 4. Secrets

Secrets are never committed. Generate the real one from your existing
`.env` (it overrides `DATABASE_URL` to point at the in-cluster Postgres
Service instead of your local one):

```bash
./k8s/create-secret.sh
```

See `secret.example.yaml` for the shape if you want to create it manually.

### 5. Deploy

```bash
kubectl apply -f k8s/01-configmap.yaml -f k8s/02-postgres.yaml \
  -f k8s/03-backend.yaml -f k8s/04-grpc.yaml -f k8s/05-frontend.yaml \
  -f k8s/06-prometheus.yaml -f k8s/07-grafana.yaml

kubectl -n mts-foods wait --for=condition=Ready pods --all --timeout=120s
kubectl -n mts-foods get pods
```

### 6. Access it

No Ingress is set up for local use — just port-forward:

```bash
kubectl -n mts-foods port-forward svc/frontend 8080:80 &     # http://localhost:8080
kubectl -n mts-foods port-forward svc/backend 8000:8000 &    # REST API + /metrics
kubectl -n mts-foods port-forward svc/grpc 50051:50051 &     # gRPC
kubectl -n mts-foods port-forward svc/prometheus 9090:9090 & # Prometheus UI
kubectl -n mts-foods port-forward svc/grafana 3000:3000 &    # Grafana (admin/admin — change this)
```

### 7. Tear down

```bash
kubectl delete namespace mts-foods   # removes everything but the cluster
k3d cluster delete mts-foods         # removes the cluster entirely
```

## Going to EKS (optional, costs real money)

The manifests are portable — the only real differences on EKS:

- **Cost callout**: the EKS *control plane* is **not** covered by AWS Free
  Tier — it's a flat ~$0.10/hr (~$73/month) regardless of usage. Only the
  *worker node* EC2 instances (e.g. `t3.micro`/`t2.micro`) are free-tier
  eligible. Don't leave an EKS cluster running unattended expecting it to
  be free.
- Push `mts-foods-backend` and `mts-foods-frontend` to a registry EKS can
  pull from (ECR), and change `image:` in the Deployments to the ECR URI
  instead of `:local` + `imagePullPolicy: IfNotPresent`.
- Swap the self-hosted Postgres Deployment for RDS Postgres in production
  — a single-replica stateful Postgres pod with no backup/failover story
  is fine for a demo, not for anything real.
- Add an Ingress (AWS Load Balancer Controller) or a `LoadBalancer`-type
  Service for `frontend` to get a real external URL instead of
  port-forwarding.
- `create-secret.sh` works unchanged against any cluster your `kubectl`
  context points at — just point `kubectl` at the EKS cluster first
  (`aws eks update-kubeconfig ...`).
