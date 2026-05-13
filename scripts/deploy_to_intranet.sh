#!/bin/bash

# Configuration
REPO_URL="https://github.com/eriansantoy/pvz-devops-project"
APP_DIR="pvz-devops-project"
INTRANET_USER="ubuntu"
INTRANET_IP="10.0.138.50"
PEM_FILE="/home/ubuntu/llave.pem"
BACKEND_ENV="intranet-app/backend/.env"

echo "🌻 Starting Final Robust Deployment..."

# --- PHASE 1: BASTION DOCKER CHECK ---
if ! command -v docker &>/dev/null; then
    echo "Installing Docker on Bastion..."
    sudo apt-get update && sudo apt-get install -y docker.io docker-compose
fi

# --- PHASE 2: DOWNLOAD INSTALLERS ---
echo "Downloading Docker installers..."
rm -rf ./docker_installers && mkdir -p ./docker_installers
cd ./docker_installers
apt-get download docker.io containerd runc docker-compose-v2
cd ..

# --- PHASE 3: PREPARE APP & IMAGES ---
read -sp "Enter MySQL Root Password: " DB_PASS
echo ""

rm -rf $APP_DIR
git clone $REPO_URL

# Create .env
cat <<EOF >"$APP_DIR/$BACKEND_ENV"
DB_HOST=mysql-db-intranet
DB_USER=root
LOG_FILE_PATH=/app/logs/app.log
DB_PASSWORD=$DB_PASS
DB_NAME=pvz_db
DB_PORT=3306
PORT=8080
EOF

# Prevent Docker Compose from trying to pull from internet
sed -i '/image:/a \    pull_policy: never' "$APP_DIR/intranet-app/docker-compose.yml"

echo "Pulling and saving RAW images (using sudo to avoid permission errors)..."
sudo docker pull mysql:8.0
sudo docker pull node:20-alpine
sudo docker pull nginx:alpine

# Save as RAW tar files - this is the most compatible format
sudo docker save mysql:8.0 -o mysql_img.tar
sudo docker save node:20-alpine -o node_img.tar
sudo docker save nginx:alpine -o nginx_img.tar

# Give ownership back to ubuntu so scp can read them
sudo chown ubuntu:ubuntu *.tar

# --- NEW BUILD STEP ON BASTION ---
echo "Building dependencies on Bastion..."
cd "$APP_DIR/intranet-app/backend"
# We use docker to run npm install so the binaries match the container environment
sudo docker run --rm -v $(pwd):/app -w /app node:20-alpine npm install
cd ../../..

# --- PHASE 4: TRANSFER ---
echo "Compressing bundle (App + RAW tars + Installers)..."
tar -cvf full_deploy_bundle.tar $APP_DIR *.tar ./docker_installers

echo "Transferring to Intranet (this may take a minute due to image size)..."
scp -i $PEM_FILE full_deploy_bundle.tar $INTRANET_USER@$INTRANET_IP:/home/ubuntu/

# --- PHASE 5: REMOTE INSTALLATION ---
echo "🚀 Bootstrapping Intranet Server..."
ssh -i $PEM_FILE $INTRANET_USER@$INTRANET_IP <<'REMOTE_EOF'
    sudo rm -rf docker_installers pvz-devops-project
    tar -xvf full_deploy_bundle.tar
    
    echo "Installing Docker binaries..."
    sudo dpkg -i ./docker_installers/*.deb
    
    echo "Loading images (Raw Tar format)..."
    sudo docker load -i mysql_img.tar
    sudo docker load -i node_img.tar
    sudo docker load -i nginx_img.tar
    
    cd pvz-devops-project/intranet-app
    echo "Building local containers..."
    sudo docker compose build
    
    echo "🌻 DEPLOYMENT SUCCESSFUL!"
    echo "Run: cd ~/pvz-devops-project/intranet-app && sudo docker compose up -d"
REMOTE_EOF

# Cleanup
rm full_deploy_bundle.tar mysql_img.tar node_img.tar nginx_img.tar
rm -rf ./docker_installers
sudo rm -rf pvz_devops-project
