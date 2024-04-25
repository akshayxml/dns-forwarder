# DNS-Forwarder

A simple DNS Forwarder that can resolve the IP address for a host either from it’s local cache, or by forwarding the request to an authoritative nameserver.

## Table of Contents

- [DNS Forwarder](#dns-forwarder)
- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)

## Introduction


The DNS Forwarder is a lightweight utility designed to streamline DNS resolution by efficiently retrieving IP addresses for hosts. It operates as a simple DNS forwarding service, utilizing a local cache for quick lookups and seamlessly forwarding unresolved queries to authoritative nameservers. This project is based on [John Crickett's coding challenge #44](https://codingchallenges.substack.com/p/coding-challenge-44-dns-forwarder).

## Installation

This project can be easily deployed using Docker. Follow the steps below to install and run the project using Docker:

### Prerequisites
Before you begin, ensure that you have Docker installed on your machine. If you haven't installed Docker yet, you can download and install it from the [official Docker website](https://www.docker.com/).

#### Installation Steps
1. Clone the Repository: Clone the project repository to your local machine using the following command:

        git clone https://github.com/AkshayViru/dns-forwarder.git

2. Navigate to the Project Directory: Change into the project directory:

        cd dns-forwarder
    
3. Build the Docker Image: Build the Docker image using the provided Dockerfile. Run the following command in the project directory:

        docker build -t dns-forwarder .

4. Run the Docker Container: Once the Docker image is built successfully, you can run the Docker container using the following command:
    
        docker run -d -p 1053:1053/udp dns-forwarder

# Usage

- Send a request to DNS Forwarder and you should see a response like so:

        % dig @0.0.0.0 -p 1053 www.google.com

        ; <<>> DiG 9.10.6 <<>> @127.0.0.1 -p 1053 www.google.com
        ; (1 server found)
        ;; global options: +cmd
        ;; Got answer:
        ;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 43712
        ;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1
        
        ;; OPT PSEUDOSECTION:
        ; EDNS: version: 0, flags:; udp: 512
        ;; QUESTION SECTION:
        ;www.google.com.                        IN      A
        
        ;; ANSWER SECTION:
        www.google.com.         118     IN      A       142.250.179.228
        
        ;; Query time: 11 msec
        ;; SERVER: 127.0.0.1#1053(127.0.0.1)
        ;; WHEN: Wed Jan 10 18:09:54 GMT 2024
        ;; MSG SIZE  rcvd: 59
- Retrying a request before the time-to-live (TTL) provided by authoritative nameserver can offer faster response retrieval, benefiting from the cached response in the DNS Forwarder.
- To use any port other than 1053, update PORT value in the dockerfile and in the 4th step of Installation instructions above.
