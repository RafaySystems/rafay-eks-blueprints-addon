import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as blueprint from '../lib/eks-blueprint-stack';




test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new blueprint.StarterConstruct(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});