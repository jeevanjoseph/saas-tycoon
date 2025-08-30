#!/bin/sh

# EXPORT CDAAS_USER=your-username
# EXPORT CDAAS_PASS=your-password

docker pull mongo:7
docker tag mongo:7 ghcr.io/jeevanjoseph/saas-tycoon-db:latest

docker tag ghcr.io/jeevanjoseph/saas-tycoon-db:latest artifactory-phx-prod.cdaas.oraclecloud.com/docker-spectra-platform-dev/ossp-demo-apps/saas-tycoon/saas-tycoon-db:latest
docker tag ghcr.io/jeevanjoseph/saas-tycoon-server:latest artifactory-phx-prod.cdaas.oraclecloud.com/docker-spectra-platform-dev/ossp-demo-apps/saas-tycoon/saas-tycoon-server:latest
docker tag ghcr.io/jeevanjoseph/saas-tycoon-client:latest artifactory-phx-prod.cdaas.oraclecloud.com/docker-spectra-platform-dev/ossp-demo-apps/saas-tycoon/saas-tycoon-client:latest

docker push artifactory-phx-prod.cdaas.oraclecloud.com/docker-spectra-platform
docker push artifactory-phx-prod.cdaas.oraclecloud.com/docker-spectra-platform-dev/ossp-demo-apps/saas-tycoon/saas-tycoon-server:latest
docker push artifactory-phx-prod.cdaas.oraclecloud.com/docker-spectra-platform-dev/ossp-demo-apps/saas-tycoon/saas-tycoon-db:latest

helm package ../helm

curl --verbose --fail -s -u "${CDAAS_USER}:${CDAAS_PASS}" -X PUT --upload-file saas-tycoon-0.1.0.tgz https://artifactory-master.cdaas.oraclecloud.com/artifactory/generic-spectra-platform-dev/ossp/ossp-demo-apps/saas-tycoon/saas-tycoon-0.1.0.tgz


ossp-cli create workload-deployment --fleet ossp-demo --env ossp-demos saas-tycoon -f ../ossp/wkld-deploy-saas-tycoon.yaml