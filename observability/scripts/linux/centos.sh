#!/usr/bin/env bash

# Update AppStream metadata
sudo sudo sed -i 's/mirrorlist/#mirrorlist/g' /etc/yum.repos.d/CentOS-*
sudo sudo sed -i 's|#baseurl=http://mirror.centos.org|baseurl=http://vault.centos.org|g' /etc/yum.repos.d/CentOS-*
sudo sudo yum update -y

# Install sdkman
sudo yum install zip -y # Need to extract zip archive
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"

# Install java
sdk install java 20-amzn

# Install elasticsearch
sudo rpm --import https://packages.elastic.co/GPG-KEY-elasticsearch
sudo tee /etc/yum.repos.d/elastic.repo <<EOF
[elastic-8.x]
name=Elastic repository for 8.x packages
baseurl=https://artifacts.elastic.co/packages/8.x/yum
gpgcheck=1
gpgkey=https://artifacts.elastic.co/GPG-KEY-elasticsearch
enabled=1
autorefresh=1
type=rpm-md
EOF

sudo yum install elasticsearch -y
sudo systemctl daemon-reload
sudo systemctl enable elasticsearch.service
sudo systemctl start elasticsearch.service

# Install kibana
sudo yum install kibana -y
sudo /usr/share/elasticsearch/bin/elasticsearch-create-enrollment-token -s kibana
sudo /bin/systemctl daemon-reload
sudo /bin/systemctl enable kibana.service
sudo systemctl start kibana.service

# Install APM Server
sudo yum install apm-server -y
sudo /bin/systemctl daemon-reload
sudo /bin/systemctl enable apm-server.service
sudo systemctl start apm-server.service

# Install fluent bit
sudo tee /etc/yum.repos.d/fluent-bit.repo <<EOF
[fluent-bit]
name = Fluent Bit
baseurl = https://packages.fluentbit.io/centos/$releasever/
gpgcheck=1
gpgkey=https://packages.fluentbit.io/fluentbit.key
repo_gpgcheck=1
enabled=1
EOF

sudo yum install fluent-bit -y
sudo /bin/systemctl daemon-reload
sudo /bin/systemctl enable fluent-bit.service
sudo systemctl start fluent-bit
