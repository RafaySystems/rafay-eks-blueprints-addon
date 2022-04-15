# Using the Rafay Addon in your EKS Blueprints for CDK

Before you can use the Rafay Addon in your EKS Blueprints for CDK implementation, please follow the instructions in the [AWS Quickstart Repo](https://github.com/aws-quickstart/quickstart-ssp-amazon-eks) to initialize your CDK project and include the `cdk-eks-blueprint` dependency.

Add the `@rafayoss/rafay-eks-blueprints-addon` package to your project and save it in your `package.json` file by running the following command:

```shell
npm install @rafayoss/rafay-eks-blueprints-addon
```

Import the addon in your `bin/<your-main-file>.ts` file, create a `rafayConfig` object and use that to create a new `RafayClusterAddOn` object, which you'll add to the array of AddOns to include in your cluster:

```typescript
import * as rafayCluster from '@rafayoss/rafay-eks-blueprints-addon';

let rafayConfig = {
    organizationName: "<Name of the Organization to be used when creating in Rafay>",
    email: "<Email to be used when creating account in Rafay>",
    firstName: "<Your First Name>",
    lastName: "<Your First Name>",
    password: "<Optional password, if not specified, a random password will be generated>",
    passwordSecret: "<Optional secret name where password is stored in the secrets manager",
    clusterName: "<Name of the cluster to be created in Rafay>"
    blueprintName: "<Name of the Rafay blueprint to be associated with cluster. It can be default or minimal>"
 } as rafayCluster.RafayConfig

const RafayCluster = new rafayCluster.RafayClusterAddOn(rafayConfig)


const app = new cdk.App();

// AddOns for the cluster.
const addOns: Array<blueprints.ClusterAddOn> = [
    new blueprints.addons.ArgoCDAddOn,
    new blueprints.addons.CalicoAddOn,
    new blueprints.addons.ClusterAutoScalerAddOn,
    new blueprints.addons.ContainerInsightsAddOn,
    new blueprints.addons.AwsLoadBalancerControllerAddOn(),
    new blueprints.addons.VpcCniAddOn(),
    new blueprints.addons.CoreDnsAddOn(),
    new blueprints.addons.KubeProxyAddOn(),
    new blueprints.addons.XrayAddOn(),
    RafayCluster // Add the instance of the AddOn to the array of cluster AddOns you wish to install
];
```
This is all you need to do to have Rafay automatically installed as part of your EKS Blueprints for CDK.
