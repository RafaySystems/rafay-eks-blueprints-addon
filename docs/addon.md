# Rafay AddOn for EKS Blueprints for CDK Reference Architecture

This Addon deploys Rafay’s Kubernetes Operations Platform (KOP) for Amazon Elastic Kubernetes Service (Amazon EKS) management and operations. With KOP, your platform and site-reliability engineering (SRE) teams can deploy, operate, and manage the lifecycle of Kubernetes clusters and containerized applications in both AWS Cloud and on-premises environments.

With the Rafay Kubernetes Operations Platform, enterprises use a single operations platform to manage the lifecycle of Amazon EKS clusters and containerized applications. You can speed up the deployment of new applications to production, reduce application downtimes, and reduce security and compliance risks associated with your infrastructure.

Rafay automates the deployment of containerized applications and enables access to Kubernetes clusters through a zero-trust connectivity model. A unified dashboard provides enterprise-grade capabilities, such as monitoring across AWS Regions, role-based access control, and governance.

## What does Rafay addon look like?

The addon itself is a typescript [package hosted in npm](https://www.npmjs.com/package/@rafaysystems/rafay-eks-blueprints-addon).

You can install it using `npm` and use it in your implementation of the EKS Blueprints for CDK .

## Prerequisites to use the Rafay addon for EKS EKS Blueprints for CDK:

- An email address which will be used to create your account on Rafay Platform
- Organization name which will be used to create your tenant
- First name
- Last name
- Name of the EKS Cluster
- Rafay Blueprint to be associated with the EKS Cluster
- Password (Optional) - If not specified, a random password will be generated and sent to the email
  - Password can also be specified as a defined secret in AWS Secret Manager ([get started here](https://aws.amazon.com/secrets-manager/)). The secret must contain the following key:
  
      - `password`: Password to be used when creating the account in Rafay.
      