---
title: "AWS Multi-AZ Multi-Region Network using VPC Peering: A 3-Region, 9-Node EC2 Deployment Guide"
date: 2025-04-25
lastmod: 2026-04-18
author: "Satyam Thakur"
description: "A hands-on walkthrough to deploy a secure and scalable 9-EC2 private network across 3 AWS regions and Availability Zones using custom VPCs and VPC Peering."
slug: "aws-multi-az-multi-region-network"
tags:
	- AWS
	- VPC
	- VPC Peering
	- EC2
	- Cloud Networking
	- Multi-Region
categories:
	- Cloud
	- Networking
draft: false
canonical_url: "https://medium.com/@satyam.th3/aws-multi-az-multi-region-network-using-vpc-peering-a-3-region-9-node-ec2-deployment-guide-86dc4b801572"
---

<!-- # AWS Multi-AZ Multi-Region Network using VPC Peering: A 3-Region, 9-Node EC2 Deployment Guide -->

In today's cloud-native era, building fault-tolerant, distributed infrastructures is more than a best practice, it's a necessity. This article dives into a hands-on walkthrough of deploying a secure and scalable **9-EC2 private network** spanning three **AWS regions** and **Availability Zones (AZs)** using **custom VPCs and VPC Peering**.

Let's get started.

## Objective

Create a private network architecture that simulates a real-world, distributed cloud environment using:

- **3 Regions:** `us-east-1`, `us-east-2`, `us-west-2`
- **9 EC2 Instances:** One in each AZ across three regions
- **3 Custom VPCs:** With defined CIDR ranges and peering across regions

## Step 1: VPC Creation Across Regions

A **VPC (Virtual Private Cloud)** in AWS is a private, isolated network where you can launch and manage resources like EC2 instances securely, controlling IP ranges, subnets, and routing. It's like having your own private data center in the cloud.

For each region, create one VPC with three public subnets, one per AZ.

### Network Architecture

![Network topology showing 3 VPCs across 3 regions](https://cdn-images-1.medium.com/max/800/1*fcvF7p0IggzfD8pB-aoX5g.png)

*Figure: Network topology showing 3 VPCs across 3 regions*

### Subnet and Instance Mapping

![IPv4 Planning 3 VPCs across 3 regions](https://cdn-images-1.medium.com/max/800/1*3CJtZkYZtoJL70TtqK44vg.png)

*Figure: IPv4 Planning 3 VPCs across 3 regions*

### Create VPC-123 (Repeat for VPC-456 and VPC-789)

1. Navigate to: **VPC > Your VPCs > Create VPC**
2. Choose **VPC and more** for a streamlined setup
3. Configure the following:

- VPC Name: `VPC-123`
- IPv4 CIDR block: `10.0.1.0/24`
- Number of AZs: `3`
- Public Subnets: `3`
- NAT Gateways: `None` (optional if only private subnets)
- VPC Endpoints: `None` (optional, if required like S3 Gateway)

Repeat the same setup for VPC-456 (`10.0.2.0/24`, `us-east-2`) and VPC-789 (`10.0.3.0/24`, `us-west-2`).

![Screenshot of AWS Create VPC page](https://cdn-images-1.medium.com/max/1200/1*5GqfX0ZOpbnpd0YOum4Kcg.png)

![Screenshot of Your VPC Table](https://cdn-images-1.medium.com/max/1200/1*mvcuhwyUA_YXh0g3pv1bBA.png)

## Step 2: Establish VPC Peering Connections

To enable inter-region communication between EC2 instances, create peering connections between all three VPCs.

### How to Create Peering

Go to: **VPC > Peering connections > Create peering connection**

1. Name: `VPC-123-VPC-456`, `VPC-456-VPC-789`, etc.
2. Select VPC (Requester): e.g., `VPC-123`
3. Region: Another Region (e.g., `us-east-2`)
4. VPC ID (Accepter): e.g., `VPC-456`
5. Accept the connection manually from the target region

![Screenshot of AWS VPC Peering page](https://cdn-images-1.medium.com/max/1200/1*6igOkDjTjOVDNf692wyIsw.png)

### Confirm the Connection

After creating the peering connection, it must be **acknowledged from the Accepter VPC**:

Navigate to: **VPC > Peering connections list**

1. Locate the new connection with status **Pending Acceptance**
2. Select it and click **Accept Request**
3. Once accepted, the status will change to **Active**, confirming that the VPC Peering connection is successfully established.

![Screenshot of AWS VPC Peering Acceptance page](https://cdn-images-1.medium.com/max/1200/1*CsuaIehNat8Y73PHkbnXEQ.png)

![Screenshot of AWS VPC Peering Established page](https://cdn-images-1.medium.com/max/1200/1*zCnS4uZu2ehd7URQAsOMgw.png)

However, establishing a peering connection is not enough, **you must also configure subnet routing** so the VPCs can communicate. Let's cover that next.

## Step 3: Configure Routing Tables

Once peering is active, configure routing tables to connect the networks.

### Route Table Setup

Navigate to: **VPC > Route tables > Create route table**

![Screenshot of Create route table](https://cdn-images-1.medium.com/max/1200/1*gmGYfiWll-NDihvvUts2sA.png)

1. Associate the route table with corresponding subnets.

Go to: **VPC > Route Table > Corresponding Created Route > Edit Subnet Association**

This will add the subnet you want this routing table to be populated with. Note: Each subnet can be associated with only one Route Table at a time.

![Screenshot of associating Subnet to Route Table](https://cdn-images-1.medium.com/max/1200/1*h6ZzVDrVi-YX5uI0ZyFSnw.png)

![Screenshot of Subnet successfully added to RT](https://cdn-images-1.medium.com/max/1200/1*Ehzb4NY3YSdslf_BOn8EQA.png)

2. Add custom routes.

Go to: **VPC > Route Table > Corresponding Created Route > Edit routes**

Example for `VPC-123` (for establishing communication between VPCs in different regions):

- `10.0.1.0/24` -> Local
- `10.0.2.0/24` -> Peering Connection to `VPC-123`
- `10.0.3.0/24` -> Peering Connection to `VPC-456`

![Configuration of routes](https://cdn-images-1.medium.com/max/800/1*Tp9kkOQ9KcVZ3Y1c4OAgVw.png)

![Screenshot of route table entries](https://cdn-images-1.medium.com/max/1200/1*eO-OZuWe5tNzwu1ODCjnrA.png)

3. Repeat for other VPCs accordingly. Follow the below tables for reference:

![Routing table reference 1](https://cdn-images-1.medium.com/max/800/1*BbzR0p8zmtie9-Hxq7ETiA.png)

![Routing table reference 2](https://cdn-images-1.medium.com/max/800/1*CGR7DY7V1FM5YqcPD_eeyA.png)

**Note:**
The routes configured here are **static routes** and are **non-transitive**.
This means communication is only allowed between VPCs that are directly peered.
If VPC-123 is peered with VPC-456, and VPC-456 is peered with VPC-789, VPC-123 cannot automatically communicate with VPC-789 through VPC-456.
For additional communication paths, create separate VPC peering connections and manually update route tables to establish direct connectivity between each VPC pair.

## Step 4: Launch EC2 Instances

### Launch Process

1. Go to **EC2 > Launch Instance**
2. Choose AMI: Amazon Linux 2 or Ubuntu 22.04
3. Choose instance type: `c7a.xlarge` (or `t2.micro`)
4. Network settings:
- Select the corresponding VPC and subnet as defined in your architecture plan (refer to the Subnet and Instance Mapping table).

![Screenshot showing VPC selection, subnet mapping per AZ, and security group configurations during EC2 setup](https://cdn-images-1.medium.com/max/800/1*LfcuD8Cke8_x3bqJMMlVMg.png)

5. Key pair:
- Either create a new SSH key pair or use an existing one.
- Download and securely store the `.pem` file.

![Screenshot of key pair create](https://cdn-images-1.medium.com/max/1200/1*9choJnNHCbNpp27SjYslpA.png)

6. Launch 9 EC2 instances in total:
- 3 in each VPC, each placed in a different subnet corresponding to an Availability Zone.

![Table view from AWS Console summarizing launched instances with AMI, instance type, network/subnet ID, and private IP addresses](https://cdn-images-1.medium.com/max/1200/1*WfLCiEep2qGnQSr3rbMGEg.png)

## Step 5: Test Network Reachability

SSH into each EC2 instance using its public IP and test connectivity:

```bash
ping <Remote host Org4_IP>  # from Org1 to Org4
ping <Remote host Org7_IP>  # from Org1 to Org7
```

Make sure to use security groups to allow ICMP and SSH between subnets.

### Key Pair Creation (CLI or Console)

- Key Name: `Org1-key`
- File Format: `.pem`
- Type: RSA or ED25519

![Screenshot of terminal showing ping/ssh tests](https://cdn-images-1.medium.com/max/1200/1*MMQ7IeE6UsQaoD4emlEXkA.png)

You've now successfully:

- Created **3 VPCs** across **3 AWS regions**, each spanning **3 Availability Zones**.
- Deployed **9 EC2 instances** (one in each AZ).
- Established the **networks** and **tested connectivity** between instances.

This setup mirrors real-world architectures for **highly available** and **distributed systems**, ideal for applications such as **blockchain networks**, **enterprise systems**, and **global microservices**.

Stay tuned for more updates on deploying and orchestrating distributed applications across this multi-region, multi-AZ environment.

---

By [Satyam Thakur](https://medium.com/@satyam.th3)

Original publication date: April 25, 2025

Canonical source: [Medium](https://medium.com/@satyam.th3/aws-multi-az-multi-region-network-using-vpc-peering-a-3-region-9-node-ec2-deployment-guide-86dc4b801572)
