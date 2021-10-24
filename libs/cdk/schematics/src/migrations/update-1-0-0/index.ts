import { chain, Rule, Tree } from '@angular-devkit/schematics';
import { findNodes } from '@schematics/angular/utility/ast-utils';
import * as ts from 'typescript';

import { createRemoveChange } from '@rx-angular/tools/generators/changes';
import { formatFiles } from '@rx-angular/tools/generators/format-files';
import { insert, insertImport } from '@rx-angular/tools/generators/insert';
import { visitTSSourceFiles } from '@rx-angular/tools/generators/visitors';

const renames: Record<string, string | [string, string]> = {
  RxCoalescingOptions: '@rx-angular/cdk/coalescing',
  coalescingObj: '@rx-angular/cdk/coalescing',
  coalesceWith: '@rx-angular/cdk/coalescing',
  coalescingManager: '@rx-angular/cdk/coalescing',
  CoalescingManager: '@rx-angular/cdk/coalescing',
  coerceObservable: '@rx-angular/cdk/coercing',
  coerceObservableWith: '@rx-angular/cdk/coercing',
  coerceDistinctObservable: '@rx-angular/cdk/coercing',
  coerceDistinctWith: '@rx-angular/cdk/coercing',
  coerceAllFactory: '@rx-angular/cdk/coercing',
  cancelCallback: '@rx-angular/cdk/internals/scheduler',
  scheduleCallback: '@rx-angular/cdk/internals/scheduler',
  forceFrameRate: '@rx-angular/cdk/internals/scheduler',
  PriorityLevel: '@rx-angular/cdk/internals/scheduler',
  RxStrategyProvider: '@rx-angular/cdk/render-strategies',
  ScheduleOnStrategyOptions: '@rx-angular/cdk/render-strategies',
  RX_CONCURRENT_STRATEGIES: '@rx-angular/cdk/render-strategies',
  RxConcurrentStrategies: '@rx-angular/cdk/render-strategies',
  RX_NATIVE_STRATEGIES: '@rx-angular/cdk/render-strategies',
  RxNativeStrategies: '@rx-angular/cdk/render-strategies',
  onStrategy: '@rx-angular/cdk/render-strategies',
  strategyHandling: '@rx-angular/cdk/render-strategies',
  RxStrategies: '@rx-angular/cdk/render-strategies',
  RxStrategyNames: '@rx-angular/cdk/render-strategies',
  RxDefaultStrategyNames: '@rx-angular/cdk/render-strategies',
  RxConcurrentStrategyNames: '@rx-angular/cdk/render-strategies',
  RxNativeStrategyNames: '@rx-angular/cdk/render-strategies',
  RxCustomStrategyCredentials: '@rx-angular/cdk/render-strategies',
  RxStrategyCredentials: '@rx-angular/cdk/render-strategies',
  RxRenderBehavior: '@rx-angular/cdk/render-strategies',
  RxRenderWork: '@rx-angular/cdk/render-strategies',
  RX_ANGULAR_CONFIG: '@rx-angular/cdk/render-strategies',
  RxAngularConfig: '@rx-angular/cdk/render-strategies',
  ObservableAccumulation: '@rx-angular/cdk/state',
  ObservableMap: '@rx-angular/cdk/state',
  accumulateObservables: '@rx-angular/cdk/state',
  templateHandling: '@rx-angular/cdk/template',
  RxBaseTemplateNames: '@rx-angular/cdk/template',
  RxRenderAware: '@rx-angular/cdk/template',
  RxViewContext: '@rx-angular/cdk/template',
  rxBaseTemplateNames: '@rx-angular/cdk/template',
  RxTemplateManager: '@rx-angular/cdk/template',
  createTemplateManager: '@rx-angular/cdk/template',
  RxNotificationTemplateNameMap: '@rx-angular/cdk/template',
  RxListManager: '@rx-angular/cdk/template',
  createListTemplateManager: '@rx-angular/cdk/template',
  RxListViewComputedContext: '@rx-angular/cdk/template',
  RxDefaultListViewContext: '@rx-angular/cdk/template',
  RxListViewContext: '@rx-angular/cdk/template',
  RxNotificationKind: '@rx-angular/cdk/notifications',
  RxNotification: '@rx-angular/cdk/notifications',
  RxCompleteNotification: '@rx-angular/cdk/notifications',
  RxErrorNotification: '@rx-angular/cdk/notifications',
  RxNextNotification: '@rx-angular/cdk/notifications',
  RxNotificationValue: '@rx-angular/cdk/notifications',
  RxSuspenseNotification: '@rx-angular/cdk/notifications',
  toRxErrorNotification: '@rx-angular/cdk/notifications',
  toRxSuspenseNotification: '@rx-angular/cdk/notifications',
  toRxCompleteNotification: '@rx-angular/cdk/notifications',
  templateTriggerHandling: '@rx-angular/cdk/notifications',
  rxMaterialize: '@rx-angular/cdk/notifications',
  createTemplateNotifier: '@rx-angular/cdk/notifications',
  getZoneUnPatchedApi: '@rx-angular/cdk/zone-less',
  Promise: '@rx-angular/cdk/zone-less',
  requestAnimationFrame: '@rx-angular/cdk/zone-less',
  cancelAnimationFrame: '@rx-angular/cdk/zone-less',
  setInterval: '@rx-angular/cdk/zone-less',
  clearInterval: '@rx-angular/cdk/zone-less',
  setTimeout: '@rx-angular/cdk/zone-less',
  clearTimeout: '@rx-angular/cdk/zone-less',
  unpatchAddEventListener: '@rx-angular/cdk/zone-less',
  interval: '@rx-angular/cdk/zone-less',
  timer: '@rx-angular/cdk/zone-less',
  fromEvent: '@rx-angular/cdk/zone-less',
  asyncScheduler: '@rx-angular/cdk/zone-less',
  asapScheduler: '@rx-angular/cdk/zone-less',
  queueScheduler: '@rx-angular/cdk/zone-less',
  animationFrameScheduler: '@rx-angular/cdk/zone-less',
  focusEvents: '@rx-angular/cdk/zone-configurations',
  mouseEvents: '@rx-angular/cdk/zone-configurations',
  wheelEvents: '@rx-angular/cdk/zone-configurations',
  inputEvents: '@rx-angular/cdk/zone-configurations',
  formControlsEvents: '@rx-angular/cdk/zone-configurations',
  keyboardEvents: '@rx-angular/cdk/zone-configurations',
  vrEvents: '@rx-angular/cdk/zone-configurations',
  mSGestureEvents: '@rx-angular/cdk/zone-configurations',
  printEvents: '@rx-angular/cdk/zone-configurations',
  networkEvents: '@rx-angular/cdk/zone-configurations',
  audioEvents: '@rx-angular/cdk/zone-configurations',
  compositionEvents: '@rx-angular/cdk/zone-configurations',
  touchEvents: '@rx-angular/cdk/zone-configurations',
  globalEvents: '@rx-angular/cdk/zone-configurations',
  websocketEvents: '@rx-angular/cdk/zone-configurations',
  xhrEvents: '@rx-angular/cdk/zone-configurations',
  windowEvents: '@rx-angular/cdk/zone-configurations',
  allEvents: '@rx-angular/cdk/zone-configurations',
  EventTarget: '@rx-angular/cdk/zone-configurations',
  RxZoneFlagsHelperFunctions: '@rx-angular/cdk/zone-configurations',
  RxZoneGlobalConfigurations: '@rx-angular/cdk/zone-configurations',
  RxZoneTestConfigurations: '@rx-angular/cdk/zone-configurations',
  RxZoneRuntimeConfigurations: '@rx-angular/cdk/zone-configurations',
  zoneConfig: '@rx-angular/cdk/zone-configurations'
};

export default function (): Rule {
  return chain([
    (tree: Tree) => {
      visitTSSourceFiles(tree, (sourceFile) => {
        /* Collect RxAngular imports. */
        const imports = sourceFile.statements
          .filter(ts.isImportDeclaration)
          .filter(
            ({ moduleSpecifier }) =>
              moduleSpecifier.getText(sourceFile) ===
                `'@rx-angular/cdk'` ||
              moduleSpecifier.getText(sourceFile) === `"@rx-angular/cdk"`
          );

        if (imports.length === 0) {
          return;
        }

        /* Remove old imports. */
        const removeChanges = findImportSpecifiers(sourceFile, imports).map(
          ({ importDeclaration }) => {
            return createRemoveChange(
              sourceFile,
              importDeclaration,
              importDeclaration.getStart(),
              importDeclaration.getFullText()
            );
          }
        );

        /* Insert new imports. */
        const insertChanges = findImportSpecifiers(sourceFile, imports).map(
          ({ importSpecifier }) => {
            const rename = renames[importSpecifier];
            return insertImport(
              sourceFile,
              sourceFile.fileName,
              typeof rename === 'string' ? importSpecifier : rename[0],
              typeof rename === 'string' ? rename : rename[1]
            );
          }
        );

        insert(tree, sourceFile.fileName, [...insertChanges, ...removeChanges]);
      });
    },
    formatFiles()
  ]);
}

function findImportSpecifiers(
  sourceFile: ts.SourceFile,
  imports: ts.ImportDeclaration[]
) {
  return imports.flatMap((importDeclaration) => {
    const importSpecifiers = findNodes(
      importDeclaration,
      ts.SyntaxKind.ImportSpecifier
    );

    return importSpecifiers.map((importSpecifier) => ({
      importDeclaration,
      importSpecifier: importSpecifier.getText(sourceFile),
    }));
  });
}
