from diagrams import Cluster, Diagram, Edge
from diagrams.custom import Custom
from diagrams.elastic.elasticsearch import ElasticSearch
from diagrams.elastic.elasticsearch import Kibana
from diagrams.elastic.observability import APM
from diagrams.onprem.aggregator import Fluentd
from diagrams.onprem.client import Users
from diagrams.onprem.database import (MySQL, MongoDB)
from diagrams.onprem.inmemory import Redis
from diagrams.onprem.network import Nginx
from diagrams.programming.framework import Vue
from diagrams.programming.language import NodeJS
from diagrams.saas.cdn import Cloudflare
from diagrams.saas.chat import Telegram

with Diagram(name="High Level Design Architecture with On Premise",
             show=False,
             direction="TB"
             ):
    # Users
    users = Users("users")

    # Cloudflare
    cloudflare = Cloudflare("cloudflare")

    # Onesignal
    pushNotification = Custom("push notification",
                              "../assets/onesignal_icon.png")

    # Client side
    client = Custom("webapp","../assets/nuxt.png")
    client >> Edge(color="darkgreen") << cloudflare

    client >> Edge(color="darkred") << pushNotification

    # MongoDB
    mongodb = MongoDB("mongodb")

    # Ingress
    ingress = Nginx("ingress")

    # Cache
    cache = Redis("cache")

    # Database
    database = MySQL("database")

    with Cluster("monitoring"):
        metrics = APM("apm")

        # Fluentd as log collector
        logCollector = Fluentd("log collector")

        # Elasticsearch as log storage
        logStorage = ElasticSearch("log storage")

        components = [
            metrics, logCollector, logStorage
        ]

        metrics >> Edge(color="darkorange", style="dashed") >> logStorage
        logCollector >> Edge(color="darkorange", style="dashed") >> logStorage
        logStorage << Edge(color="firebrick", style="dashed") << Kibana(
            "visualization")

    # Chat service
    with Cluster("chat server"):
        chatService = NodeJS("chat")
        chatService >> Edge(color="brown") >> mongodb

    # Service cluster
    with Cluster("api server"):
        services = [
            NodeJS("service"),
        ]
        users >> client >> Edge(color="darkgreen") << ingress \
        >> Edge(color="darkgreen") << services
        services >> Edge(color="darkgreen") >> cloudflare
        services >> Edge(color="brown") >> chatService
        services >> Edge(color="brown") >> cache
        services >> Edge(color="brown") >> database
        services << Edge(color="darkorange", style="dashed") << logCollector
        services >> Edge(color="darkorange", style="dashed") >> metrics
        services >> Edge(color="darkred") >> pushNotification

    # Worker cluster
    with Cluster("worker server"):
        workers = [
            NodeJS("worker"),
        ]
        workers >> Edge(color="brown") >> cache
        workers >> Edge(color="brown") >> database
        workers << Edge(color="darkorange", style="dashed") << logCollector
        workers >> Edge(color="darkorange", style="dashed") >> metrics
        workers >> Edge(color="darkred") >> pushNotification
