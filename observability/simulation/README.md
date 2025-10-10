# Local Setting

This module allows you to simulate virtual machine to testing configuration

## Prerequisites

- `vagrant`
- `virtual box`

### Getting Started

**Note** Ip address of virtual machine is pre-configured `192.168.50.4`. You can change the IP
address
by change these lines below in `Vagrantfile`

```text
config.vm.network "private_network", ip: "x.x.x.x"
```

To start the virtual machine

```shell
vagrant up
```

To access the virtual machine

```shell
vagrant ssh
```

To clean up data and destroy the virtual machine

```shell
vagrant destroy
```
