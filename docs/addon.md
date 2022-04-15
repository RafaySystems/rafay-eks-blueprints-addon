# Rafay AddOn for EKS Blueprints for CDK Reference Architecture

This Addon deploys Rafay’s Kubernetes Operations Platform (KOP) for Amazon Elastic Kubernetes Service (Amazon EKS) management and operations. With KOP, your platform and site-reliability engineering (SRE) teams can deploy, operate, and manage the lifecycle of Kubernetes clusters and containerized applications in both AWS Cloud and on-premises environments.

With the Rafay Kubernetes Operations Platform, enterprises use a single operations platform to manage the lifecycle of Amazon EKS clusters and containerized applications. You can speed up the deployment of new applications to production, reduce application downtimes, and reduce security and compliance risks associated with your infrastructure.

Rafay automates the deployment of containerized applications and enables access to Kubernetes clusters through a zero-trust connectivity model. A unified dashboard provides enterprise-grade capabilities, such as monitoring across AWS Regions, role-based access control, and governance.

## What does Rafay addon look like?

The addon itself is a typescript [package hosted in npm](https://www.npmjs.com/settings/weaveworksoss/packages).

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
      
The addon Lifecycle has two stages which are managed by the addon itself:

1. **Deploy**: During this stage the addon installs Weave GitOps core components of which you can learn more [here](https://docs.gitops.weave.works/docs/intro#features).
2. **Post deploy**: Once the Core components are in place then a Weave GitOps `application` will be defined pointing to your specific `bootstrap` repository. Weave GitOps `applications` make your workloads deployable and can include any number of other `applications` pointing to different repositories and allow for `helm` or `kustomize` workload declaration. 

To learn more about apps and targets in the context of Weave GitOps read [GitOps Automation Configuration](https://docs.gitops.weave.works/docs/gitops-automation).