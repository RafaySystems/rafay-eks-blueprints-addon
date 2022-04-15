#!/usr/bin/env node

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as blueprints from '@aws-quickstart/eks-blueprints';

import * as rafayCluster from '@rafayoss/rafay-eks-blueprints-addon';


const passwordSecretName = "rafay-eks-blueprint-secret";
const clusterName = "rafay-eks-cluster-1";

let rafayConfig = {
    organizationName: "rafay-eks-org-1",
    email: "abc@example.com",
    firstName: "John",
    lastName: "Doe",
    password: "P@$$word",
    //passwordSecret: passwordSecretName,
    clusterName: clusterName,
    blueprintName: "minimal"
 } as rafayCluster.RafayConfig

const app = new cdk.App();

// AddOns for the cluster.
const addOns: Array<blueprints.ClusterAddOn> = [
    new blueprints.addons.CalicoAddOn,
    new blueprints.addons.MetricsServerAddOn,
    new blueprints.addons.ClusterAutoScalerAddOn,
    new blueprints.addons.ContainerInsightsAddOn,
    new blueprints.addons.AwsLoadBalancerControllerAddOn(),
    new blueprints.addons.VpcCniAddOn(),
    new blueprints.addons.CoreDnsAddOn(),
    new blueprints.addons.KubeProxyAddOn(),
    new blueprints.addons.XrayAddOn(),
    new rafayCluster.RafayClusterAddOn(rafayConfig)
];

const account = '<AWS_ACCOUNT_ID>'
const region = '<AWS_REGION>'
const props = { env: { account, region } }
new blueprints.EksBlueprint(app, { id: clusterName, addOns}, props)