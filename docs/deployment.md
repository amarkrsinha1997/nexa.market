# Deployment Guide: Nexa Market on GCP Compute Engine (Non-Docker)

This guide provides step-by-step instructions and commands to deploy the Nexa Market repository on a new Google Cloud Platform (GCP) Compute Engine VM without using Docker.

## 1. VM Instance Preparation

- **OS**: Ubuntu 22.04 LTS (Recommended)
- **Machine Type**: e2-medium (Minimum for build process)
- **Firewall**: Allow HTTP (80) and HTTPS (443) traffic.

### Configure Firewall for Port 3000 (Testing Only)

To access the app directly on port 3000 before Nginx is ready:

1.  Go to **VPC Network** > **Firewall** in GCP Console.
2.  Click **Create Firewall Rule**.
3.  Fill the form as follows:
    - **Name**: `allow-port-3000`
    - **Network**: `default`
    - **Priority**: `1000`
    - **Direction of traffic**: `Ingress`
    - **Action on match**: `Allow`
    - **Targets**: `All instances in the network`
    - **Source filter**: `IPv4 ranges`
    - **Source IPv4 ranges**: `0.0.0.0/0` (Allows access from anywhere)
    - **Protocols and ports**: Select `Specified protocols and ports`, check `TCP`, and enter `3000`.
4.  Click **Create**.

> [!WARNING]
> Exposing port 3000 directly is only recommended for testing. In production, use Nginx as a reverse proxy (configured in Section 8).

## 2. DNS Setup

Before setting up SSL, you must point your domain to the VM's external IP address.

1.  Find your VM's **External IP address** in the GCP Compute Engine console.
2.  Go to your DNS provider (e.g., GoDaddy, Namecheap, Cloudflare).
3.  Add the following records:
    - **Type**: `A`
    - **Name**: `@` (or your root domain)
    - **Value**: `YOUR_VM_EXTERNAL_IP`
    - **TTL**: `Default` or `3600`
4.  (Optional) Add a `www` record:
    - **Type**: `CNAME`
    - **Name**: `www`
    - **Value**: `nexa.market`

> [!NOTE]
> DNS changes can take a few minutes to several hours to propagate. You can check the status using `dig nexa.market` or sites like [whatsmydns.net](https://whatsmydns.net).

## 2. System Dependencies

Connect to your VM via SSH and run the following commands:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Essential Tools
sudo apt install -y git curl build-essential libpq-dev vim

# Install Node.js (using NVM)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Install PostgreSQL natively
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
```

## 3. Database Setup

Create the database and user manually:

```bash
# Switch to the postgres user
sudo -i -u postgres

# Create a database user with CREATEDB privilege (needed for Prisma migrations)
# Replace 'nexa_password' with a strong password
psql -c "CREATE USER nexa_user WITH PASSWORD 'nexa_password' CREATEDB;"

# Create the application database (use double quotes for names with dots)
psql -c 'CREATE DATABASE "nexa.market" OWNER nexa_user;'

# Exit the postgres user session
exit
```

## 4. Application Setup

```bash
# Clone the repository
git clone https://github.com/your-username/nexa.market.git
cd nexa.market

# Install dependencies
npm install

# Setup Environment Variables
cp .env.sample .env
```

Edit the `.env` file to point to your local PostgreSQL instance.

> [!IMPORTANT]
> Use port **5432** for native PostgreSQL (not 5433, which is used in the local Docker setup).

Update the `DATABASE_URL` in `.env`:
```
DATABASE_URL="postgresql://nexa_user:nexa_password@localhost:5432/nexa.market"
```

```bash
vim .env
```

## 5. Database Initialization (Prisma)

```bash
# Generate Prisma Client
npm run db:generate

# Deploy migrations to the database
npm run db:migrate:deploy
```

## 6. Build and Process Management

```bash
# Install PM2 globally
npm install -g pm2

# Build the application
npm run build

# Start the application with PM2
pm2 start npm --name "nexa-market" -- start

# OR start with watch mode (auto-restart on file changes)
pm2 start npm --name "nexa-market" --watch -- start

# Setup PM2 to start on boot
pm2 startup
pm2 save
```

## 7. Reverse Proxy & SSL (Nginx)

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/nexa-market
```

Add the following configuration:

```nginx
server {
    server_name nexa.market;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the configuration and restart Nginx:

```bash
sudo ln -sf /etc/nginx/sites-available/nexa-market /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

```bash
sudo certbot --nginx -d nexa.market
```

## 9. Running Multiple Applications (Virtual Hosts)

Since DNS records (A records) only point to an IP address and not a port, Nginx acts as a "Reverse Proxy" to route traffic to different applications based on the **domain name**.

### How it works
- You point multiple domains or subdomains (e.g., `app1.nexa.market`, `app2.nexa.market`) to the same server IP.
- Nginx listens on port 80/443 for all incoming traffic.
- Nginx reads the `Host` header in the request to see which domain was requested.
- It then forwards (proxies) the request to the correct internal port (e.g., 3000, 3001, etc.).

### Example Configuration for Two Apps

1. **App 1** running on port `3000` (domain: `nexa.market`)
2. **App 2** running on port `3001` (domain: `admin.nexa.market`)

Create separate config files for each app:

**`/etc/nginx/sites-available/app1`**:
```nginx
server {
    server_name nexa.market;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**`/etc/nginx/sites-available/app2`**:
```nginx
server {
    server_name admin.nexa.market;
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Steps to Add a New App
1.  **DNS**: Add an `A` record for the new (sub)domain pointing to the server IP.
2.  **PM2**: Start your new app on a different port (e.g., `PORT=3001 pm2 start ...`).
3.  **Nginx**: Create a new config in `/etc/nginx/sites-available/`.
4.  **Enable**: Link it to `sites-enabled` and restart Nginx.
5.  **SSL**: Run `sudo certbot --nginx` to secure the new domain.

## 11. Remote Database Connection

To connect to the PostgreSQL database on your VM from a local machine (e.g., using DBeaver, TablePlus, or `psql`), use one of the following methods.

### Method A: SSH Tunneling (Recommended & Secure)

SSH tunneling allows you to securely access the database without exposing the PostgreSQL port to the public internet.

1.  **Open an SSH Tunnel** from your local terminal:
    ```bash
    ssh -L 5434:localhost:5432 user@YOUR_VM_EXTERNAL_IP
    ```
    *   `5434`: The local port you will connect to.
    *   `localhost:5432`: The target database address and port *relative to the VM*.
    *   `user@YOUR_VM_EXTERNAL_IP`: Your VM SSH login details.

2.  **Connect using your DB Client**:
    - **Host**: `localhost`
    - **Port**: `5434`
    - **Database**: `nexa.market`
    - **User**: `nexa_user`
    - **Password**: `nexa_password`

---

### Method B: Direct Connection (Not Recommended)

Exposing your database port directly is less secure. Only use this if SSH tunneling is not possible.

1.  **Configure GCP Firewall**:
    - Go to **VPC Network** > **Firewall**.
    - Create a rule to allow TCP port `5432` from your local IP address.

2.  **Configure PostgreSQL to Listen on All Interfaces**:
    Edit `/etc/postgresql/14/main/postgresql.conf` (replace `14` with your version):
    ```bash
    sudo vim /etc/postgresql/14/main/postgresql.conf
    ```
    Find `#listen_addresses = 'localhost'` and change it to:
    ```
    listen_addresses = '*'
    ```

3.  **Allow Remote Access in pg_hba.conf**:
    Edit `/etc/postgresql/14/main/pg_hba.conf`:
    ```bash
    sudo vim /etc/postgresql/14/main/pg_hba.conf
    ```
    Add this line at the end:
    ```
    host    "nexa.market"    nexa_user    0.0.0.0/0    md5
    ```
    *(Note: Replace `0.0.0.0/0` with your specific local IP for better security).*

4.  **Restart PostgreSQL**:
    ```bash
    sudo systemctl restart postgresql
    ```

5.  **Connect using your DB Client**:
    - **Host**: `YOUR_VM_EXTERNAL_IP`
    - **Port**: `5432`
    - **Database**: `nexa.market`
    - **User**: `nexa_user`
    - **Password**: `nexa_password`

## 12. Useful Commands

| Action | Command |
| :--- | :--- |
| View Logs | `pm2 logs nexa-market` |
| Restart App | `pm2 restart nexa-market` |
| Stop App | `pm2 stop nexa-market` |
| Delete Process | `pm2 delete nexa-market` |
| List All Processes | `pm2 list` |
| Stop by ID | `pm2 stop 0` (replace 0 with process id) |
| Delete by ID | `pm2 delete 0` (replace 0 with process id) |
| PostgreSQL Status | `sudo systemctl status postgresql` |
| Access PSQL | `sudo -u postgres psql` |
| Build App | `npm run build` |

## 13. Common Database Management Tasks

To perform these tasks, first connect to your PostgreSQL database using `psql`:
```bash
# Access PSQL as the app user
sudo -u postgres psql -d "nexa_db"
```

### 1. Find a User by Email
To find a user's ID and current role using their email address:
```sql
SELECT id, email, role, "isOnboardingCompleted" 
FROM "User" 
WHERE email = 'amarkrsinha1997@gmail.com';
```

### 2. Promote a User to ADMIN
Once you have the user's `id` (UUID), you can promote them to the ADMIN role:
```sql
UPDATE "User" 
SET role = 'ADMIN' 
WHERE id = 'paste-user-uuid-here';
```

### 3. List All Admin Users
To see a list of all users with administrative privileges:
```sql
SELECT id, email, name 
FROM "User" 
WHERE role = 'ADMIN';
```

### 4. Search for Users (Fuzzy Email Search)
If you only know part of the email:
```sql
SELECT id, email, role 
FROM "User" 
WHERE email LIKE '%gmail.com%';
```
