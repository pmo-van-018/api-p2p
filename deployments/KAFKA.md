# Kafka Installation

Use kafka as bridge between our services.

## Table of Contents
- [Kafka Installation](#kafka-installation)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
    - [Step 1: Install Java 17](#step-1-install-java-17)
    - [Step 2: Download Kafka](#step-2-download-kafka)
    - [Step 3: Setup Kafka Systemd Unit Files](#step-3-setup-kafka-systemd-unit-files)
    - [Step 4: Reload the systemd daemon to apply changes.](#step-4-reload-the-systemd-daemon-to-apply-changes)
    - [Step 5: Start Kafka Server](#step-5-start-kafka-server)
    - [Step 6: Install Kafka UI](#step-6-install-kafka-ui)
  - [Testing](#testing)
    - [Creating Topics in Apache Kafka](#creating-topics-in-apache-kafka)
    - [Apache Kafka Producer and Consumer](#apache-kafka-producer-and-consumer)
  - [Kafka Event Documentation](#kafka-event-documentation)
    - [1. Completed Order Event](#1-completed-order-event)


## Prerequisites

- [Java 17+](#)
- [Kafka](https://kafka.apache.org/quickstart)

## Installation

### Step 1: Install Java 17

```bash
sudo dnf install java-17-openjdk wget vim 
```

### Step 2: Download Kafka

```bash
wget https://downloads.apache.org/kafka/3.7.0/kafka_2.12-3.7.0.tgz
```

```bash
tar -xzf kafka_2.12-3.7.0.tgz
```

```bash
mv kafka_2.12-3.7.0 /opt/kafka_2.12-3.7.0
```

### Step 3: Setup Kafka Systemd Unit Files

Create a systemd unit file for Zookeeper

```bash
sudo vim /etc/systemd/system/zookeeper.service
```

```conf
[Unit]
Description=Apache Zookeeper server
Documentation=http://zookeeper.apache.org
Requires=network.target remote-fs.target
After=network.target remote-fs.target

[Service]
Type=simple
ExecStart=/usr/bin/bash /opt/kafka_2.12-3.7.0/bin/zookeeper-server-start.sh /opt/kafka_2.12-3.7.0/config/zookeeper.properties
ExecStop=/usr/bin/bash /opt/kafka_2.12-3.7.0/bin/zookeeper-server-stop.sh
Restart=on-abnormal

[Install]
WantedBy=multi-user.target
```

Create a systemd unit file for Kafka

```bash
vim /etc/systemd/system/kafka.service
```

```conf
[Unit]
Description=Apache Kafka Server
Documentation=http://kafka.apache.org/documentation.html
Requires=zookeeper.service

[Service]
Type=simple
ExecStart=/usr/bin/bash /opt/kafka_2.12-3.7.0/bin/kafka-server-start.sh /opt/kafka_2.12-3.7.0/config/server.properties
ExecStop=/usr/bin/bash /opt/kafka_2.12-3.7.0/bin/kafka-server-stop.sh

[Install]
WantedBy=multi-user.target
```

### Step 4: Reload the systemd daemon to apply changes.

```bash
systemctl daemon-reload
```

### Step 5: Start Kafka Server

Start Zookeeper

```bash
sudo systemctl start zookeeper
sudo systemctl status zookeeper
```

Start Kafka

```bash
sudo systemctl start kafka
sudo systemctl status kafka
```

### Step 6: Install Kafka UI

```bash
mkdir kafka-ui

cd kafka-ui

wget https://github.com/provectus/kafka-ui/releases/download/v0.7.2/kafka-ui-api-v0.7.2.jar

```


Config Kafka UI

```bash
vim application.yaml
```

```yaml
kafka:
  clusters:
    -
      name: local
      bootstrapServers: localhost:9092
```

Config Kafka UI Service

```bash
vim /etc/systemd/system/kafkaui.service
```

```conf
[Unit]
Description=Kafka Web UI
Requires=network.target remote-fs.target
After=network.target remote-fs.target

[Service]
Type=simple
ExecStart=/usr/bin/java -Dspring.config.additional-location=/root/kafka-ui/application.yaml -jar /root/kafka-ui/kafka-ui-api-v0.7.2.jar
Restart=on-abnormal

[Install]
WantedBy=multi-user.target
```

Reload the systemd daemon to apply changes.

```bash
systemctl daemon-reload
```

Start Kafka UI

```bash
sudo systemctl start kafkaui
sudo systemctl status kafkaui
```

## Testing

### Creating Topics in Apache Kafka

```bash
cd /opt/kafka_2.12-3.7.0

bin/kafka-topics.sh --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1 --topic testTopic
```

### Apache Kafka Producer and Consumer
Producer

```bash
bin/kafka-console-producer.sh --broker-list localhost:9092 --topic testTopic
```

Consumer

```bash
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic testTopic --from-beginning
```


## Kafka Event Documentation

### 1. Completed Order Event

Completed Order Event will follow struct bellow

  - `orderId`: Order's Reference ID
  - `asset`: Asset's Information
    - `name`: Asset's Name
    - `symbol`: Asset's Symbol
    - `network`: Asset's Network
  - `type`: Order's Type
    - `BUY`: Buy Order
    - `SELL`: Sell Order
  - `amountCrypto`: Amount of Crypto that user want to buy/sell
  - `amountVND`: Amount of VND that user want to buy/sell
  - `rate`: Rate of Crypto with VND
  - `account`: User's Bank Account Information
    - `bankHolder`: Bank Account Holder's Name
    - `bankNumber`: Bank Account Number
    - `bankName`: Bank's Name
    - `bankBranch`: Bank's Branch
  - `createdAt`: Order's Created Time
  - `completedAt`: Order's Completed Time
  - `sentAt`: Order's Sent Time that event was sent to Kafka 


Addition Information is added in the header of the message
  - `event-type`: What type of event
    - `ORDER_COMPLETED`: Order Completed Event

Example:
```json
{
  "orderId":"17188866142572084068"
  "asset":{
    "name":"KDG"
    "symbol":"KDG"
    "network":"KDONG"
  }
  "type":"SELL"
  "amountCrypto":70
  "amountVND":1578220
  "rate":22546
  "account":{
    "bankHolder":"FGFGDFGFDGFD"
    "bankNumber":"2342342"
    "bankName":"vietcombank"
    "bankBranch":"fdgfdgfdgfdfd"
  }
  "createdAt":"2024-06-20T12:30:14.261Z"
  "completedAt":"2024-06-20T12:30:53.975Z"
  "sentAt":"2024-06-20T12:30:54.103Z"
}
```